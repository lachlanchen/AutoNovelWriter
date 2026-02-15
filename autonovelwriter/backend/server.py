#!/usr/bin/env python3

import argparse
import json
import os
import subprocess
import time
import uuid
from pathlib import Path

import tornado.escape
import tornado.ioloop
import tornado.locks
import tornado.web
import tornado.websocket
import tornado.gen


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
        "pipeline_script": runtime_root / "state" / "pipeline.script",
        "chat_jsonl": runtime_root / "state" / "chat.jsonl",
        "inbox_state_json": runtime_root / "state" / "inbox_state.json",
        "runner_state_json": runtime_root / "state" / "runner_state.json",
        "task_status_json": runtime_root / "state" / "task_status.json",
        "tasks_json": runtime_root / "tasks" / "tasks.json",
        "runner_log": runtime_root / "logs" / "runner.log",
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
            "enabled": False,
            "sdk": "codex",
            "model": os.environ.get("AUTONOVELWRITER_MODEL", ""),
            "vision_model": os.environ.get("AUTONOVELWRITER_VISION_MODEL", ""),
            "codex_cli_path": os.environ.get("AUTONOVELWRITER_CODEX_CLI_PATH", ""),
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


def is_codex_gate_enabled() -> bool:
    return os.environ.get("AUTONOVELWRITER_ENABLE_CODEX", "").strip() in ("1", "true", "yes", "on")


def get_agent_settings(paths: dict) -> dict:
    # Read from persisted settings to avoid relying on in-memory settings object.
    obj = _load_json(Path(paths["settings_json"]), {})
    if isinstance(obj, dict) and isinstance(obj.get("agent"), dict):
        return obj["agent"]
    return {}


def run_codex_stub(paths: dict, args: list[str], timeout_s: float = 3.0) -> dict:
    agent = get_agent_settings(paths)
    enabled = bool(agent.get("enabled", False))
    sdk = agent.get("sdk", "")
    if sdk != "codex" or not enabled or not is_codex_gate_enabled():
        return {"ok": False, "disabled": True, "reason": "codex_disabled_or_not_selected"}

    cli = (agent.get("codex_cli_path") or "").strip() or "codex"
    try:
        cp = subprocess.run(
            [cli, *args],
            capture_output=True,
            text=True,
            timeout=timeout_s,
            check=False,
        )
    except Exception as e:
        return {"ok": False, "error": "spawn_failed", "detail": str(e), "cli": cli, "args": args}

    return {
        "ok": cp.returncode == 0,
        "cli": cli,
        "args": args,
        "returncode": cp.returncode,
        "stdout": (cp.stdout or "")[-4000:],
        "stderr": (cp.stderr or "")[-4000:],
    }


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

PIPELINE_SCRIPT_HEADER = "# AutoNovelWriter pipeline script v1\n"


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


def render_pipeline_script(pipeline: dict) -> str:
    # Shell-ish, line-based format:
    #   STEP <type>
    #   DISABLED <type>
    lines = [PIPELINE_SCRIPT_HEADER.rstrip("\n")]
    blocks = pipeline.get("blocks") if isinstance(pipeline, dict) else None
    if not isinstance(blocks, list):
        blocks = default_pipeline()["blocks"]
    for b in blocks:
        if not isinstance(b, dict):
            continue
        t = b.get("type")
        if not isinstance(t, str) or not t:
            continue
        enabled = bool(b.get("enabled", True))
        lines.append(("STEP " if enabled else "DISABLED ") + t)
    return "\n".join(lines) + "\n"


def parse_pipeline_script(script: str) -> dict:
    pipeline, _warnings = parse_pipeline_script_with_warnings(script)
    return pipeline


def parse_pipeline_script_with_warnings(script: str) -> tuple[dict, list]:
    blocks = []
    warnings = []
    allowed = set(PIPELINE_BLOCK_TYPES)
    for ln, raw in enumerate((script or "").splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            warnings.append({"line": ln, "error": "too_few_tokens", "text": raw})
            continue
        verb = parts[0].upper()
        t = parts[1].strip()
        if verb not in ("STEP", "DISABLED"):
            warnings.append({"line": ln, "error": "unknown_verb", "text": raw})
            continue
        if t not in allowed:
            warnings.append({"line": ln, "error": "unknown_type", "text": raw})
            continue
        enabled = verb == "STEP"
        blocks.append({"id": t, "type": t, "enabled": enabled})
    if not blocks:
        # Default pipeline keeps the app usable, but still return warnings so the UI can show them.
        return default_pipeline(), warnings
    return {"blocks": blocks}, warnings


def load_pipeline_script(paths: dict) -> str:
    p = Path(paths["pipeline_script"])
    if not p.exists():
        return render_pipeline_script(default_pipeline())
    try:
        return p.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return render_pipeline_script(default_pipeline())


def save_pipeline_script(paths: dict, script: str) -> None:
    p = Path(paths["pipeline_script"])
    _safe_mkdir(p.parent)
    p.write_text(script, encoding="utf-8", errors="replace")


def _load_json(p: Path, default):
    try:
        if not p.exists():
            return default
        obj = json.loads(p.read_text(encoding="utf-8"))
        return obj
    except Exception:
        return default


def _save_json(p: Path, obj) -> None:
    _safe_mkdir(p.parent)
    p.write_text(json.dumps(obj, indent=2, sort_keys=True) + "\n", encoding="utf-8")


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
        # Canonical artifact is the script; JSON is derived.
        script = load_pipeline_script(self._paths)
        pipeline, warnings = parse_pipeline_script_with_warnings(script)
        save_pipeline(self._paths, pipeline)
        self.write_json({"ok": True, "script": script, "pipeline": pipeline, "warnings": warnings})

    def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)

        if not isinstance(body, dict):
            return self.write_json({"ok": False, "error": "expected_object"}, status=400)

        if isinstance(body.get("script"), str):
            script = body.get("script", "")
            pipeline, warnings = parse_pipeline_script_with_warnings(script)
            # Reject if script produced no blocks (probably invalid).
            if not pipeline.get("blocks"):
                return self.write_json({"ok": False, "error": "invalid_script"}, status=400)
            save_pipeline_script(self._paths, script)
            save_pipeline(self._paths, pipeline)
            return self.write_json({"ok": True, "script": script, "pipeline": pipeline, "warnings": warnings})

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
        script = render_pipeline_script(pipeline)
        save_pipeline_script(self._paths, script)
        self.write_json({"ok": True, "script": script, "pipeline": pipeline, "warnings": []})


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


class Runner:
    def __init__(self, paths: dict, hub: WebSocketHub):
        self._paths = paths
        self._hub = hub
        self._lock = tornado.locks.Lock()
        self._status = "idle"  # idle|running|paused|stopping
        self._stop = False
        self._paused = False
        self._task_id = None
        self._block = None
        self._loop_active = False
        self._codex_stub_ran = False

        # Safe restart behavior: if previous run was 'running', come up paused.
        state = _load_json(Path(paths["runner_state_json"]), {})
        if isinstance(state, dict) and state.get("status") == "running":
            self._status = "paused"
            self._paused = True
        elif isinstance(state, dict) and isinstance(state.get("status"), str):
            self._status = state.get("status")
            self._paused = self._status == "paused"

        self._save_state()

    def _save_state(self) -> None:
        _save_json(
            Path(self._paths["runner_state_json"]),
            {
                "status": self._status,
                "ts_ms": _now_ms(),
                "task_id": self._task_id,
                "block": self._block,
            },
        )

    def _emit_status(self) -> None:
        self._hub.broadcast(
            {
                "type": "run_status",
                "ts_ms": _now_ms(),
                "status": self._status,
                "task_id": self._task_id,
                "block": self._block,
            }
        )

    def status(self) -> dict:
        return {
            "status": self._status,
            "task_id": self._task_id,
            "block": self._block,
        }

    def _load_tasks(self) -> list:
        p = Path(self._paths["tasks_json"])
        tasks = _load_json(p, [])
        if not isinstance(tasks, list):
            tasks = []
        if not tasks:
            # Seed a minimal task list so the runner has something to do.
            tasks = [
                {
                    "id": "task_001",
                    "title": "Seed task",
                    "payload": {},
                }
            ]
            _save_json(p, tasks)
        return tasks

    def _load_task_status(self) -> dict:
        p = Path(self._paths["task_status_json"])
        st = _load_json(p, {})
        if not isinstance(st, dict):
            return {}
        return st

    def _save_task_status(self, st: dict) -> None:
        _save_json(Path(self._paths["task_status_json"]), st)

    def _log(self, line: str) -> None:
        p = Path(self._paths["runner_log"])
        _safe_mkdir(p.parent)
        with p.open("a", encoding="utf-8") as f:
            f.write(line.rstrip("\n") + "\n")
        self._hub.broadcast({"type": "log", "ts_ms": _now_ms(), "line": line.rstrip("\n")})

    def _maybe_run_codex_stub_once(self) -> None:
        if self._codex_stub_ran:
            return
        self._codex_stub_ran = True
        res = run_codex_stub(self._paths, ["--version"], timeout_s=2.0)
        if res.get("disabled"):
            # Only log the disabled note if the user actually asked for codex in settings.
            agent = get_agent_settings(self._paths)
            if agent.get("sdk") == "codex" and bool(agent.get("enabled", False)):
                self._log("[codex] disabled (set AUTONOVELWRITER_ENABLE_CODEX=1 to allow subprocess)")
            return
        if not res.get("ok"):
            self._log(f"[codex] stub failed: {json.dumps(res)}")
            return
        out = (res.get("stdout") or "").strip() or (res.get("stderr") or "").strip()
        self._log(f"[codex] stub ok: {out}")

    async def start(self) -> dict:
        async with self._lock:
            if self._status in ("running",):
                return self.status()
            self._stop = False
            self._paused = False
            self._status = "running"
            self._save_state()
            self._emit_status()
            await self._ensure_loop()
            return self.status()

    async def pause(self) -> dict:
        async with self._lock:
            if self._status != "running":
                return self.status()
            self._paused = True
            self._status = "paused"
            self._save_state()
            self._emit_status()
            return self.status()

    async def resume(self) -> dict:
        async with self._lock:
            if self._status != "paused":
                return self.status()
            self._paused = False
            self._status = "running"
            self._save_state()
            self._emit_status()
            await self._ensure_loop()
            return self.status()

    async def stop(self) -> dict:
        async with self._lock:
            self._stop = True
            if self._status in ("idle",):
                return self.status()
            self._status = "stopping"
            self._save_state()
            self._emit_status()
            return self.status()

    async def _ensure_loop(self) -> None:
        # Prevent overlapping run loops from rapid start/resume calls.
        if self._loop_active:
            return
        self._loop_active = True
        tornado.ioloop.IOLoop.current().spawn_callback(self._run_loop)

    async def _run_loop(self) -> None:
        try:
            # Ensure only one run loop is active at a time.
            async with self._lock:
                if self._status != "running":
                    return

            while True:
                async with self._lock:
                    if self._stop:
                        self._status = "idle"
                        self._task_id = None
                        self._block = None
                        self._save_state()
                        self._emit_status()
                        return
                    if self._paused or self._status != "running":
                        self._save_state()
                        self._emit_status()
                        return

                script = load_pipeline_script(self._paths)
                pipeline = parse_pipeline_script(script)
                blocks = [b for b in pipeline.get("blocks", []) if isinstance(b, dict) and b.get("enabled", True)]

                tasks = self._load_tasks()
                st = self._load_task_status()

                next_task = None
                for t in tasks:
                    tid = t.get("id")
                    if not isinstance(tid, str) or not tid:
                        continue
                    status = st.get(tid, {}).get("status", "pending")
                    if status in ("pending", "queued"):
                        next_task = tid
                        break

                if not next_task:
                    async with self._lock:
                        self._status = "idle"
                        self._task_id = None
                        self._block = None
                        self._save_state()
                        self._emit_status()
                    return

                async with self._lock:
                    self._task_id = next_task
                    self._block = None
                    self._save_state()
                    self._emit_status()

                st.setdefault(next_task, {})
                st[next_task].update({"status": "running", "ts_ms": _now_ms()})
                self._save_task_status(st)
                self._hub.broadcast(
                    {"type": "task_status", "ts_ms": _now_ms(), "task_id": next_task, "status": "running"}
                )

                # Optional, gated codex subprocess stub (does not run by default).
                self._maybe_run_codex_stub_once()

                for b in blocks:
                    async with self._lock:
                        if self._stop:
                            break
                        if self._paused:
                            break
                        self._block = b.get("type")
                        self._save_state()
                        self._emit_status()

                    self._log(f"[runner] task={next_task} block={self._block} start")
                    # Stub work unit (cooperative cancellation point).
                    yield tornado.gen.sleep(0.25)
                    self._log(f"[runner] task={next_task} block={self._block} done")

                async with self._lock:
                    if self._stop:
                        self._status = "idle"
                        self._task_id = None
                        self._block = None
                        self._save_state()
                        self._emit_status()
                        return
                    if self._paused:
                        self._status = "paused"
                        self._save_state()
                        self._emit_status()
                        return

                st[next_task].update({"status": "done", "ts_ms": _now_ms()})
                self._save_task_status(st)
                self._hub.broadcast(
                    {"type": "task_status", "ts_ms": _now_ms(), "task_id": next_task, "status": "done"}
                )
        finally:
            async with self._lock:
                self._loop_active = False


class RunStartHandler(BaseHandler):
    def initialize(self, runner: Runner):
        self._runner = runner

    async def post(self):
        st = await self._runner.start()
        self.write_json({"ok": True, "status": st})


class RunPauseHandler(BaseHandler):
    def initialize(self, runner: Runner):
        self._runner = runner

    async def post(self):
        st = await self._runner.pause()
        self.write_json({"ok": True, "status": st})


class RunResumeHandler(BaseHandler):
    def initialize(self, runner: Runner):
        self._runner = runner

    async def post(self):
        st = await self._runner.resume()
        self.write_json({"ok": True, "status": st})


class RunStopHandler(BaseHandler):
    def initialize(self, runner: Runner):
        self._runner = runner

    async def post(self):
        st = await self._runner.stop()
        self.write_json({"ok": True, "status": st})


class RunStatusHandler(BaseHandler):
    def initialize(self, runner: Runner):
        self._runner = runner

    def get(self):
        self.write_json({"ok": True, "status": self._runner.status()})


class AgentTestHandler(BaseHandler):
    def initialize(self, paths: dict):
        self._paths = paths

    def post(self):
        # Gated: will only attempt subprocess if settings + env allow it.
        res = run_codex_stub(self._paths, ["--version"], timeout_s=2.0)
        if res.get("disabled"):
            return self.write_json({"ok": False, "disabled": True, "reason": res.get("reason")}, status=403)
        return self.write_json({"ok": bool(res.get("ok")), "result": res}, status=200 if res.get("ok") else 500)


def make_app(paths: dict, settings: dict, debug: bool) -> tornado.web.Application:
    hub = WebSocketHub()
    chat_store = ChatStore(Path(paths["chat_jsonl"]))
    runner = Runner(paths, hub=hub)

    handlers = [
        (r"/api/health", HealthHandler),
        (r"/api/settings", SettingsHandler, {"paths": paths, "settings": settings}),
        (r"/api/pipeline", PipelineHandler, {"paths": paths}),
        (r"/api/chat/history", ChatHistoryHandler, {"chat_store": chat_store}),
        (r"/api/chat/send", ChatSendHandler, {"paths": paths, "chat_store": chat_store, "hub": hub}),
        (r"/api/run/start", RunStartHandler, {"runner": runner}),
        (r"/api/run/pause", RunPauseHandler, {"runner": runner}),
        (r"/api/run/resume", RunResumeHandler, {"runner": runner}),
        (r"/api/run/stop", RunStopHandler, {"runner": runner}),
        (r"/api/run/status", RunStatusHandler, {"runner": runner}),
        (r"/api/agent/test", AgentTestHandler, {"paths": paths}),
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
    app.anw_runner = runner
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
    # Ensure canonical pipeline script exists.
    if not Path(paths["pipeline_script"]).exists():
        save_pipeline_script(paths, render_pipeline_script(default_pipeline()))
    app.listen(args.port, address=args.host)

    print(f"[autonovelwriter] listening on http://{args.host}:{args.port}")
    # Inbox poller (folder-based interruption).
    poller = InboxPoller(paths, chat_store=app.anw_chat_store, hub=app.anw_hub, poll_ms=750)
    poller.start()
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
