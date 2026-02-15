#!/usr/bin/env python3

import argparse
import json
import os
import time
import uuid
from pathlib import Path

import tornado.escape
import tornado.ioloop
import tornado.locks
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
        "chat_jsonl": runtime_root / "state" / "chat.jsonl",
        "inbox_state_json": runtime_root / "state" / "inbox_state.json",
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


# Maps to the block types listed in docs/autonovelwriter_spec.md.
PIPELINE_BLOCK_TYPES = [
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
    "update_readme",
    "commit_push",
]


def default_pipeline() -> dict:
    return {"blocks": [{"id": t, "type": t, "enabled": True} for t in PIPELINE_BLOCK_TYPES]}


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
        if len(blocks) > 200:
            return self.write_json({"ok": False, "error": "too_many_blocks"}, status=400)

        cleaned = []
        allowed = set(PIPELINE_BLOCK_TYPES)
        for i, b in enumerate(blocks):
            if not isinstance(b, dict):
                return self.write_json({"ok": False, "error": f"block_{i}_not_object"}, status=400)
            t = b.get("type")
            if not isinstance(t, str) or not t:
                return self.write_json({"ok": False, "error": f"block_{i}_missing_type"}, status=400)
            if t not in allowed:
                return self.write_json({"ok": False, "error": f"block_{i}_unknown_type"}, status=400)
            bid = b.get("id")
            if not isinstance(bid, str) or not bid:
                bid = t
            enabled = b.get("enabled", True)
            enabled = bool(enabled)
            cleaned.append({"id": bid, "type": t, "enabled": enabled})

        pipeline = {"blocks": cleaned}
        save_pipeline(self._paths, pipeline)
        self.write_json({"ok": True, "pipeline": pipeline})


class ChatStore:
    def __init__(self, chat_jsonl: Path, max_in_memory: int = 500):
        self._chat_jsonl = Path(chat_jsonl)
        self._max_in_memory = max_in_memory
        self._messages = []
        self._lock = tornado.locks.Lock()

    async def load_tail(self, limit: int = 200) -> None:
        # Best-effort: load existing jsonl history tail into memory (bounded).
        p = self._chat_jsonl
        if not p.exists():
            return
        try:
            max_bytes = 2_000_000
            with p.open("rb") as f:
                f.seek(0, os.SEEK_END)
                size = f.tell()
                start = max(0, size - max_bytes)
                f.seek(start, os.SEEK_SET)
                chunk = f.read()
            text = chunk.decode("utf-8", errors="replace")
            lines = text.splitlines()
        except Exception:
            return
        msgs = []
        for line in lines[-max(limit, self._max_in_memory) :]:
            try:
                obj = json.loads(line)
            except Exception:
                continue
            if isinstance(obj, dict):
                msgs.append(obj)
        self._messages = msgs[-self._max_in_memory :]

    async def append(self, msg: dict) -> None:
        async with self._lock:
            _safe_mkdir(self._chat_jsonl.parent)
            with self._chat_jsonl.open("a", encoding="utf-8") as f:
                f.write(json.dumps(msg, sort_keys=True) + "\n")
            self._messages.append(msg)
            if len(self._messages) > self._max_in_memory:
                self._messages = self._messages[-self._max_in_memory :]

    async def tail(self, limit: int = 200) -> list:
        async with self._lock:
            return list(self._messages[-limit:])


def _read_text_file(p: Path, max_bytes: int = 512_000) -> str:
    try:
        data = p.read_bytes()
    except Exception:
        return ""
    if len(data) > max_bytes:
        data = data[:max_bytes]
    return data.decode("utf-8", errors="replace")


class InboxPoller:
    def __init__(self, paths: dict, chat_store: ChatStore, hub: "WebSocketHub", poll_ms: int = 750):
        self._paths = paths
        self._chat_store = chat_store
        self._hub = hub
        self._poll_ms = poll_ms
        self._processed = set()
        self._cb = tornado.ioloop.PeriodicCallback(self._tick, poll_ms)

    def start(self) -> None:
        self._load_state()
        self._cb.start()

    def stop(self) -> None:
        self._cb.stop()

    def _load_state(self) -> None:
        p = Path(self._paths["inbox_state_json"])
        if not p.exists():
            return
        try:
            obj = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return
        if isinstance(obj, dict) and isinstance(obj.get("processed"), list):
            self._processed = set(str(x) for x in obj["processed"])

    def _save_state(self) -> None:
        p = Path(self._paths["inbox_state_json"])
        _safe_mkdir(p.parent)
        # Persist a bounded set to avoid unbounded growth.
        processed = sorted(self._processed)[-2000:]
        p.write_text(json.dumps({"processed": processed}, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    async def _tick(self) -> None:
        inbox = Path(self._paths["io_inbox"])
        try:
            entries = list(inbox.iterdir())
        except Exception:
            return

        candidates = []
        now = time.time()
        for e in entries:
            if not e.is_file():
                continue
            if e.suffix.lower() not in (".txt", ".md"):
                continue
            try:
                st = e.stat()
                mtime = st.st_mtime
                # Simple “still being written” heuristic: ignore files modified very recently.
                if (now - mtime) < 1.0:
                    continue
                sig = f"{e.name}|{st.st_mtime_ns}|{st.st_size}"
            except Exception:
                mtime = 0
                sig = f"{e.name}|0|0"
            if sig in self._processed:
                continue
            candidates.append((mtime, e, sig))

        if not candidates:
            return

        # Process oldest-first for stable ordering.
        candidates.sort(key=lambda t: t[0])

        for _, p, sig in candidates[:25]:
            text = _read_text_file(p)
            if not text.strip():
                self._processed.add(sig)
                continue

            msg = {
                "id": str(uuid.uuid4()),
                "ts_ms": _now_ms(),
                "role": "user",
                "source": "inbox",
                "filename": p.name,
                "text": text,
            }
            await self._chat_store.append(msg)
            self._hub.broadcast({"type": "chat", "ts_ms": _now_ms(), "message": msg})
            self._processed.add(sig)

        self._save_state()


def write_outbox_message(paths: dict, text: str) -> dict:
    outbox = Path(paths["io_outbox"])
    _safe_mkdir(outbox)
    ts = time.strftime("%Y%m%d_%H%M%S")
    fname = f"chat_{ts}_{uuid.uuid4().hex[:8]}.txt"
    p = outbox / fname
    p.write_text(text + ("\n" if not text.endswith("\n") else ""), encoding="utf-8", errors="replace")
    return {"filename": fname, "path": str(p)}


class ChatHistoryHandler(BaseHandler):
    def initialize(self, chat_store: ChatStore):
        self._chat_store = chat_store

    async def get(self):
        limit = int(self.get_argument("limit", "200"))
        limit = max(1, min(500, limit))
        msgs = await self._chat_store.tail(limit=limit)
        self.write_json({"ok": True, "messages": msgs})


class ChatSendHandler(BaseHandler):
    def initialize(self, paths: dict, chat_store: ChatStore, hub: "WebSocketHub"):
        self._paths = paths
        self._chat_store = chat_store
        self._hub = hub

    async def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)

        if not isinstance(body, dict):
            return self.write_json({"ok": False, "error": "expected_object"}, status=400)

        text = body.get("text", "")
        if not isinstance(text, str) or not text.strip():
            return self.write_json({"ok": False, "error": "missing_text"}, status=400)
        if len(text) > 50_000:
            return self.write_json({"ok": False, "error": "text_too_long"}, status=400)

        out = write_outbox_message(self._paths, text.strip())
        msg = {
            "id": str(uuid.uuid4()),
            "ts_ms": _now_ms(),
            "role": "user",
            "source": "ui",
            "text": text.strip(),
            "outbox": out,
        }
        await self._chat_store.append(msg)
        self._hub.broadcast({"type": "chat", "ts_ms": _now_ms(), "message": msg})
        self._hub.broadcast({"type": "outbox_written", "ts_ms": _now_ms(), "outbox": out})

        self.write_json({"ok": True, "message": msg, "outbox": out})


class EventsWebSocket(tornado.websocket.WebSocketHandler):
    def initialize(self, hub, paths: dict, chat_store: ChatStore):
        self._hub = hub
        self._paths = paths
        self._chat_store = chat_store
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
        # Minimal protocol:
        # - incoming {type:"chat", text:"..."} => append to history, write to outbox, broadcast to all.
        # - otherwise echo for debugging.
        try:
            obj = tornado.escape.json_decode(message)
        except Exception:
            obj = {"type": "message", "text": str(message)}

        if isinstance(obj, dict) and obj.get("type") == "chat" and isinstance(obj.get("text"), str):
            text = obj.get("text", "").strip()
            if text:
                out = write_outbox_message(self._paths, text)
                msg = {
                    "id": str(uuid.uuid4()),
                    "ts_ms": _now_ms(),
                    "role": "user",
                    "source": "ui",
                    "client_id": self._client_id,
                    "text": text,
                    "outbox": out,
                }
                # Fire-and-forget append; WS handler is sync in signature.
                tornado.ioloop.IOLoop.current().spawn_callback(self._chat_store.append, msg)
                self._hub.broadcast({"type": "chat", "ts_ms": _now_ms(), "message": msg})
                self._hub.broadcast({"type": "outbox_written", "ts_ms": _now_ms(), "outbox": out})
                return

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
    chat_store = ChatStore(Path(paths["chat_jsonl"]))

    handlers = [
        (r"/api/health", HealthHandler),
        (r"/api/settings", SettingsHandler, {"paths": paths, "settings": settings}),
        (r"/api/pipeline", PipelineHandler, {"paths": paths}),
        (r"/api/chat/history", ChatHistoryHandler, {"chat_store": chat_store}),
        (r"/api/chat/send", ChatSendHandler, {"paths": paths, "chat_store": chat_store, "hub": hub}),
        (r"/ws", EventsWebSocket, {"hub": hub, "paths": paths, "chat_store": chat_store}),
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

    app = tornado.web.Application(handlers, debug=debug)
    # Attach for setup in main() (poller startup, etc).
    app.anw_hub = hub
    app.anw_chat_store = chat_store
    return app


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
    # Load chat tail before listening.
    tornado.ioloop.IOLoop.current().run_sync(lambda: app.anw_chat_store.load_tail(limit=200))
    app.listen(args.port, address=args.host)

    print(f"[autonovelwriter] listening on http://{args.host}:{args.port}")
    # Inbox poller (folder-based interruption).
    poller = InboxPoller(paths, chat_store=app.anw_chat_store, hub=app.anw_hub, poll_ms=750)
    poller.start()
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
