#!/usr/bin/env python3

import argparse
import json
import os
import time
import uuid
from pathlib import Path

import tornado.escape
import tornado.ioloop
import tornado.web
import tornado.websocket


def _now_ms() -> int:
    return int(time.time() * 1000)


def _safe_mkdir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def resolve_paths() -> dict:
    backend_dir = Path(__file__).resolve().parent
    app_root = backend_dir.parent  # autonovelwriter/

    runtime_root = Path(os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT", str(app_root / "runtime")))
    pwa_root = Path(os.environ.get("AUTONOVELWRITER_PWA_ROOT", str(app_root / "pwa")))

    # Defaults required by spec.
    paths = {
        "app_root": app_root,
        "runtime_root": runtime_root,
        "pwa_root": pwa_root,
        "io_inbox": runtime_root / "io" / "inbox",
        "io_outbox": runtime_root / "io" / "outbox",
        "tasks": runtime_root / "tasks",
        "logs": runtime_root / "logs",
        "state": runtime_root / "state",
        "settings_json": runtime_root / "state" / "settings.json",
        "pipeline_json": runtime_root / "state" / "pipeline.json",
    }
    return paths


def ensure_runtime_dirs(paths: dict) -> None:
    _safe_mkdir(Path(paths["io_inbox"]))
    _safe_mkdir(Path(paths["io_outbox"]))
    _safe_mkdir(Path(paths["tasks"]))
    _safe_mkdir(Path(paths["logs"]))
    _safe_mkdir(Path(paths["state"]))


def default_settings(paths: dict, host: str, port: int) -> dict:
    return {
        "server": {"host": host, "port": port},
        "paths": {
            "runtime_root": str(paths["runtime_root"]),
            "io_inbox": str(paths["io_inbox"]),
            "io_outbox": str(paths["io_outbox"]),
            "tasks": str(paths["tasks"]),
            "logs": str(paths["logs"]),
            "state": str(paths["state"]),
        },
        "agent": {
            "sdk": "codex",
            "model": os.environ.get("AUTONOVELWRITER_MODEL", ""),
            "vision_model": os.environ.get("AUTONOVELWRITER_VISION_MODEL", ""),
        },
    }


def load_settings(paths: dict, host: str, port: int) -> dict:
    settings = default_settings(paths, host, port)

    p = Path(paths["settings_json"])
    if not p.exists():
        return settings

    try:
        on_disk = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return settings

    if isinstance(on_disk, dict):
        # Shallow merge is enough for now.
        settings.update(on_disk)
    return settings


def save_settings(paths: dict, settings: dict) -> None:
    p = Path(paths["settings_json"])
    _safe_mkdir(p.parent)
    p.write_text(json.dumps(settings, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def default_pipeline() -> dict:
    # Maps to the block types listed in docs/autonovelwriter_spec.md.
    types = [
        "plan",
        "write",
        "critique_story",
        "fix_story",
        "critique_tone",
        "fix_tone",
        "critique_dialogue",
        "fix_dialogue",
        "critique_character",
        "fix_character",
        "summary",
        "log",
        "commit_push",
    ]
    return {"blocks": [{"id": t, "type": t, "enabled": True} for t in types]}


def load_pipeline(paths: dict) -> dict:
    p = Path(paths["pipeline_json"])
    if not p.exists():
        return default_pipeline()
    try:
        obj = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return default_pipeline()
    if not isinstance(obj, dict):
        return default_pipeline()
    blocks = obj.get("blocks")
    if not isinstance(blocks, list):
        return default_pipeline()
    return {"blocks": blocks}


def save_pipeline(paths: dict, pipeline: dict) -> None:
    p = Path(paths["pipeline_json"])
    _safe_mkdir(p.parent)
    p.write_text(json.dumps(pipeline, indent=2, sort_keys=True) + "\n", encoding="utf-8")


class BaseHandler(tornado.web.RequestHandler):
    def set_default_headers(self) -> None:
        # Dev-friendly CORS so the PWA can be served on another port.
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        self.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def options(self, *args, **kwargs):
        self.set_status(204)
        self.finish()

    def write_json(self, obj: dict, status: int = 200) -> None:
        self.set_status(status)
        self.set_header("Content-Type", "application/json; charset=utf-8")
        self.finish(json.dumps(obj))


class HealthHandler(BaseHandler):
    def get(self):
        self.write_json(
            {
                "ok": True,
                "service": "autonovelwriter-backend",
                "ts_ms": _now_ms(),
            }
        )


class SettingsHandler(BaseHandler):
    def initialize(self, paths: dict, settings: dict):
        self._paths = paths
        self._settings = settings

    def get(self):
        self.write_json({"ok": True, "settings": self._settings})

    def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)

        if not isinstance(body, dict):
            return self.write_json({"ok": False, "error": "expected_object"}, status=400)

        # Minimal: allow replacing top-level keys; deeper validation comes later.
        for k in ("paths", "agent"):
            if k in body and isinstance(body[k], dict):
                self._settings[k] = body[k]

        save_settings(self._paths, self._settings)
        self.write_json({"ok": True, "settings": self._settings})


class PipelineHandler(BaseHandler):
    def initialize(self, paths: dict):
        self._paths = paths

    def get(self):
        pipeline = load_pipeline(self._paths)
        self.write_json({"ok": True, "pipeline": pipeline})

    def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)

        if not isinstance(body, dict):
            return self.write_json({"ok": False, "error": "expected_object"}, status=400)

        blocks = body.get("blocks")
        if not isinstance(blocks, list):
            return self.write_json({"ok": False, "error": "expected_blocks_list"}, status=400)

        cleaned = []
        for i, b in enumerate(blocks):
            if not isinstance(b, dict):
                return self.write_json({"ok": False, "error": f"block_{i}_not_object"}, status=400)
            t = b.get("type")
            if not isinstance(t, str) or not t:
                return self.write_json({"ok": False, "error": f"block_{i}_missing_type"}, status=400)
            bid = b.get("id")
            if not isinstance(bid, str) or not bid:
                bid = t
            enabled = b.get("enabled", True)
            enabled = bool(enabled)
            cleaned.append({"id": bid, "type": t, "enabled": enabled})

        pipeline = {"blocks": cleaned}
        save_pipeline(self._paths, pipeline)
        self.write_json({"ok": True, "pipeline": pipeline})


class EventsWebSocket(tornado.websocket.WebSocketHandler):
    def initialize(self, hub):
        self._hub = hub
        self._client_id = None

    def check_origin(self, origin: str) -> bool:
        # Dev-friendly; can be tightened later.
        return True

    def open(self):
        self._client_id = str(uuid.uuid4())
        self._hub.add(self)
        self.write_message(
            json.dumps(
                {
                    "type": "hello",
                    "ts_ms": _now_ms(),
                    "client_id": self._client_id,
                }
            )
        )

    def on_message(self, message):
        # Minimal echo for debugging.
        try:
            obj = tornado.escape.json_decode(message)
        except Exception:
            obj = {"type": "message", "text": str(message)}
        self._hub.broadcast({"type": "echo", "ts_ms": _now_ms(), "from": self._client_id, "data": obj})

    def on_close(self):
        self._hub.remove(self)


class WebSocketHub:
    def __init__(self):
        self._clients = set()

    def add(self, ws: EventsWebSocket) -> None:
        self._clients.add(ws)

    def remove(self, ws: EventsWebSocket) -> None:
        self._clients.discard(ws)

    def broadcast(self, event: dict) -> None:
        payload = json.dumps(event)
        dead = []
        for ws in list(self._clients):
            try:
                ws.write_message(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._clients.discard(ws)


def make_app(paths: dict, settings: dict, debug: bool) -> tornado.web.Application:
    hub = WebSocketHub()

    handlers = [
        (r"/api/health", HealthHandler),
        (r"/api/settings", SettingsHandler, {"paths": paths, "settings": settings}),
        (r"/api/pipeline", PipelineHandler, {"paths": paths}),
        (r"/ws", EventsWebSocket, {"hub": hub}),
    ]

    pwa_root = Path(paths["pwa_root"])
    if pwa_root.exists() and pwa_root.is_dir():
        handlers.extend(
            [
                (
                    r"/(.*)",
                    tornado.web.StaticFileHandler,
                    {"path": str(pwa_root), "default_filename": "index.html"},
                ),
            ]
        )

    return tornado.web.Application(handlers, debug=debug)


def main() -> None:
    parser = argparse.ArgumentParser(description="AutoNovelWriter Tornado backend")
    parser.add_argument("--host", default=os.environ.get("AUTONOVELWRITER_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("AUTONOVELWRITER_PORT", "8787")))
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()

    paths = resolve_paths()
    ensure_runtime_dirs(paths)

    settings = load_settings(paths, host=args.host, port=args.port)

    app = make_app(paths, settings, debug=args.debug)
    app.listen(args.port, address=args.host)

    print(f"[autonovelwriter] listening on http://{args.host}:{args.port}")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
