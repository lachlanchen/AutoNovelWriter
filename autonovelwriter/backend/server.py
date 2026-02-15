#!/usr/bin/env python3

import argparse
import hashlib
import json
import os
import subprocess
import time
import uuid
from datetime import datetime
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
        "pipeline_ast_json": runtime_root / "state" / "pipeline_ast.json",
        "chat_jsonl": runtime_root / "state" / "chat.jsonl",
        "inbox_state_json": runtime_root / "state" / "inbox_state.json",
        "runner_state_json": runtime_root / "state" / "runner_state.json",
        "task_status_json": runtime_root / "state" / "task_status.json",
        "tasks_json": runtime_root / "tasks" / "tasks.json",
        "runner_log": runtime_root / "logs" / "runner.log",
        "projects_root": runtime_root / "projects",
        "active_project_json": runtime_root / "state" / "active_project.json",
    }
    return paths


def ensure_runtime_dirs(paths: dict) -> None:
    _safe_mkdir(Path(paths["io_inbox"]))
    _safe_mkdir(Path(paths["io_outbox"]))
    _safe_mkdir(Path(paths["tasks"]))
    _safe_mkdir(Path(paths["tasks"]) / "batches")
    _safe_mkdir(Path(paths["logs"]))
    _safe_mkdir(Path(paths["state"]))
    _safe_mkdir(Path(paths["projects_root"]))


def _is_safe_project_id(s: str) -> bool:
    if not isinstance(s, str):
        return False
    s = s.strip()
    if not s:
        return False
    if len(s) > 64:
        return False
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_")
    return all(ch in allowed for ch in s)


def _ensure_project_dirs(paths: dict, project_id: str) -> dict:
    pid = project_id.strip()
    root = Path(paths["projects_root"]) / pid
    materials = root / "materials"
    interactions = root / "interactions"
    outputs = root / "outputs"
    state = root / "state"
    _safe_mkdir(materials)
    _safe_mkdir(interactions)
    _safe_mkdir(outputs)
    _safe_mkdir(state)
    return {
        "project_id": pid,
        "project_root": root,
        "materials_root": materials,
        "interactions_root": interactions,
        "outputs_root": outputs,
        "state_root": state,
    }


def load_active_project(paths: dict) -> str:
    p = Path(paths["active_project_json"])
    try:
        obj = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        obj = {}
    pid = obj.get("project_id") if isinstance(obj, dict) else None
    if not isinstance(pid, str) or not _is_safe_project_id(pid):
        pid = "default"
    _ensure_project_dirs(paths, pid)
    # Best-effort: persist back if missing/invalid.
    save_active_project(paths, pid)
    return pid


def save_active_project(paths: dict, project_id: str) -> None:
    pid = project_id.strip() if isinstance(project_id, str) else ""
    if not _is_safe_project_id(pid):
        pid = "default"
    p = Path(paths["active_project_json"])
    _safe_mkdir(p.parent)
    p.write_text(json.dumps({"project_id": pid}, indent=2, sort_keys=True) + "\n", encoding="utf-8")


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
            "projects_root": str(paths["projects_root"]),
        },
        # Novel-writing preferences are separate from UI language (PWA i18n).
        "novel": {
            "language": "en",
            "tone": "neutral",
            "target_length_words": 80000,
            "pov": "third_limited",
            "tense": "past",
            "chapter_count_target": 12,
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
    if sdk != "codex":
        return {"ok": False, "disabled": True, "reason": "agent_sdk_not_codex"}
    if not enabled:
        return {"ok": False, "disabled": True, "reason": "agent_disabled"}
    if not is_codex_gate_enabled():
        return {"ok": False, "disabled": True, "reason": "env_gate_disabled"}

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
    "meta_tasks_generate",
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

PIPELINE_SCRIPT_HEADER_V1 = "# AutoNovelWriter pipeline script v1\n"
PIPELINE_SCRIPT_HEADER_V2 = "# AutoNovelWriter pipeline script v2\n"


def _sha256_hex(text: str) -> str:
    return hashlib.sha256((text or "").encode("utf-8", errors="replace")).hexdigest()


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


def _ast_step(step_type: str, enabled: bool) -> dict:
    return {"kind": "step", "type": step_type, "enabled": bool(enabled)}


def _ast_loop(repeat: int, children: list) -> dict:
    return {"kind": "loop", "repeat": int(repeat), "children": children}


def _ast_round(repeat: int, children: list) -> dict:
    return {"kind": "round", "repeat": int(repeat), "children": children}


def _ast_foreach_task(children: list) -> dict:
    return {"kind": "foreach_task", "children": children}


def _ast_root(children: list) -> dict:
    return {"kind": "root", "version": 2, "children": children}


def _flatten_ast_steps(ast: dict) -> list:
    out = []

    def walk(node):
        if not isinstance(node, dict):
            return
        k = node.get("kind")
        if k == "step":
            t = node.get("type")
            if isinstance(t, str) and t:
                out.append({"id": t, "type": t, "enabled": bool(node.get("enabled", True))})
            return
        if k in ("loop", "round", "foreach_task"):
            kids = node.get("children")
            if isinstance(kids, list):
                for c in kids:
                    walk(c)

    if isinstance(ast, dict) and ast.get("kind") == "root":
        kids = ast.get("children", [])
        if isinstance(kids, list):
            for c in kids:
                walk(c)
    return out


def _ast_has_loop(ast: dict) -> bool:
    def walk(node) -> bool:
        if not isinstance(node, dict):
            return False
        k = node.get("kind")
        if k in ("loop", "round", "foreach_task"):
            return True
        kids = node.get("children")
        if isinstance(kids, list):
            for c in kids:
                if walk(c):
                    return True
        return False

    return walk(ast)


def render_pipeline_script(pipeline: dict) -> str:
    # Render from the derived JSON "blocks" list (no nesting). This keeps the
    # rest of the codebase stable; v2 nesting is handled by render_pipeline_script_from_ast().
    lines = [PIPELINE_SCRIPT_HEADER_V1.rstrip("\n")]
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


def render_pipeline_script_from_ast(ast: dict) -> str:
    header = PIPELINE_SCRIPT_HEADER_V2 if _ast_has_loop(ast) else PIPELINE_SCRIPT_HEADER_V1
    lines = [header.rstrip("\n")]

    def emit(node: dict, level: int) -> None:
        if not isinstance(node, dict):
            return
        k = node.get("kind")
        indent = "  " * level
        if k == "step":
            t = node.get("type")
            if not isinstance(t, str) or not t:
                return
            enabled = bool(node.get("enabled", True))
            lines.append(indent + ("STEP " if enabled else "DISABLED ") + t)
            return
        if k == "loop":
            repeat = node.get("repeat")
            try:
                repeat_i = int(repeat)
            except Exception:
                return
            lines.append(indent + f"LOOP {repeat_i}")
            kids = node.get("children")
            if isinstance(kids, list):
                for c in kids:
                    emit(c, level + 1)
            return
        if k == "round":
            repeat = node.get("repeat")
            try:
                repeat_i = int(repeat)
            except Exception:
                return
            lines.append(indent + f"ROUND {repeat_i}")
            kids = node.get("children")
            if isinstance(kids, list):
                for c in kids:
                    emit(c, level + 1)
            return
        if k == "foreach_task":
            lines.append(indent + "FOREACH_TASK")
            kids = node.get("children")
            if isinstance(kids, list):
                for c in kids:
                    emit(c, level + 1)
            return

    if isinstance(ast, dict) and ast.get("kind") == "root":
        kids = ast.get("children", [])
        if isinstance(kids, list):
            for c in kids:
                emit(c, 0)

    return "\n".join(lines) + "\n"


def parse_pipeline_script(script: str) -> dict:
    pipeline, _ast, _warnings, _errors = parse_pipeline_script_v2(script)
    return pipeline


def parse_pipeline_script_with_warnings(script: str) -> tuple[dict, list]:
    pipeline, _ast, warnings, _errors = parse_pipeline_script_v2(script)
    return pipeline, warnings


def flatten_enabled_steps_from_script_v2(script: str) -> tuple[list[str], list, list]:
    """
    Returns (enabled_step_types, warnings, errors) using the canonical v2 parser/AST.
    LOOP repeat counts are ignored for now; order is deterministic AST preorder.
    """
    pipeline, _ast, warnings, errors = parse_pipeline_script_v2(script)
    blocks = pipeline.get("blocks") if isinstance(pipeline, dict) else None
    if not isinstance(blocks, list):
        return [], warnings, errors
    enabled = []
    for b in blocks:
        if not isinstance(b, dict):
            continue
        if not bool(b.get("enabled", True)):
            continue
        t = b.get("type")
        if isinstance(t, str) and t:
            enabled.append(t)
    return enabled, warnings, errors


def parse_pipeline_script_v2(script: str) -> tuple[dict, dict, list, list]:
    # v2 supports:
    # - STEP <type>
    # - DISABLED <type>
    # - LOOP <n> with 2-space indentation of children
    #
    # Returns:
    # - pipeline (flat list, for backward compatibility)
    # - pipeline_ast (nested)
    # - warnings (non-fatal)
    # - errors (fatal)
    allowed = set(PIPELINE_BLOCK_TYPES)
    warnings = []
    errors = []

    root_children = []
    # stack frames: (expected_level, children_list, container_kind, container_line)
    stack = [(0, root_children, None, None)]

    def current_level() -> int:
        return stack[-1][0]

    def close_frames_to(level: int) -> None:
        nonlocal stack
        while stack and level < stack[-1][0]:
            expected, kids, kind, line_no = stack[-1]
            if line_no is not None and not kids:
                if kind == "loop":
                    errors.append({"line": line_no, "code": "loop_empty", "text": "LOOP"})
                elif kind == "round":
                    errors.append({"line": line_no, "code": "round_empty", "text": "ROUND"})
                elif kind == "foreach_task":
                    errors.append({"line": line_no, "code": "foreach_task_empty", "text": "FOREACH_TASK"})
            stack.pop()

    def leading_spaces(raw: str) -> tuple[int, bool]:
        n = 0
        for ch in raw:
            if ch == "\t":
                return n, True
            if ch == " ":
                n += 1
                continue
            break
        return n, False

    for ln, raw in enumerate((script or "").splitlines(), start=1):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue

        sp, has_tab = leading_spaces(raw)
        if has_tab:
            errors.append({"line": ln, "code": "tab_indent_not_allowed", "text": raw})
            continue
        if sp % 2 != 0:
            errors.append({"line": ln, "code": "bad_indent_not_multiple_of_2", "text": raw})
            continue
        lvl = sp // 2

        # Bring stack to the right container for this indentation.
        close_frames_to(lvl)
        if lvl > current_level():
            # Indent jumped deeper than the current open container expects.
            errors.append({"line": ln, "code": "indent_jump", "text": raw})
            continue

        line = raw.strip()
        parts = line.split()
        verb = parts[0].upper() if parts else ""

        if verb == "LOOP":
            if len(parts) < 2:
                errors.append({"line": ln, "code": "loop_missing_repeat", "text": raw})
                continue
            try:
                repeat = int(parts[1])
            except Exception:
                errors.append({"line": ln, "code": "loop_repeat_not_int", "text": raw})
                continue
            if repeat <= 0 or repeat > 10_000:
                errors.append({"line": ln, "code": "loop_repeat_out_of_range", "text": raw})
                continue

            loop_children = []
            loop_node = _ast_loop(repeat=repeat, children=loop_children)
            stack[-1][1].append(loop_node)
            # Push a new frame for children at next indent level.
            stack.append((lvl + 1, loop_children, "loop", ln))
            continue

        if verb == "ROUND":
            if len(parts) < 2:
                errors.append({"line": ln, "code": "round_missing_repeat", "text": raw})
                continue
            try:
                repeat = int(parts[1])
            except Exception:
                errors.append({"line": ln, "code": "round_repeat_not_int", "text": raw})
                continue
            if repeat <= 0 or repeat > 10_000:
                errors.append({"line": ln, "code": "round_repeat_out_of_range", "text": raw})
                continue

            round_children = []
            round_node = _ast_round(repeat=repeat, children=round_children)
            stack[-1][1].append(round_node)
            stack.append((lvl + 1, round_children, "round", ln))
            continue

        if verb == "FOREACH_TASK":
            if len(parts) != 1:
                warnings.append({"line": ln, "code": "too_many_tokens", "text": raw})
            foreach_children = []
            foreach_node = _ast_foreach_task(children=foreach_children)
            stack[-1][1].append(foreach_node)
            stack.append((lvl + 1, foreach_children, "foreach_task", ln))
            continue

        if verb in ("STEP", "DISABLED"):
            if len(parts) < 2:
                warnings.append({"line": ln, "code": "too_few_tokens", "text": raw})
                continue
            t = parts[1].strip()
            if t not in allowed:
                warnings.append({"line": ln, "code": "unknown_type", "text": raw})
                continue
            enabled = verb == "STEP"
            stack[-1][1].append(_ast_step(t, enabled))
            continue

        # Unknown verbs are non-fatal but must never be silent.
        warnings.append({"line": ln, "code": "unknown_verb", "text": raw})

    # Close remaining frames to catch empty loops.
    close_frames_to(0)

    ast = _ast_root(root_children)
    flat_blocks = _flatten_ast_steps(ast)
    if not flat_blocks:
        # Keep the app usable even with an empty/garbled script.
        flat_blocks = default_pipeline()["blocks"]
        ast = _ast_root([_ast_step(b["type"], bool(b.get("enabled", True))) for b in flat_blocks])

    pipeline = {"blocks": flat_blocks}
    return pipeline, ast, warnings, errors


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


def save_pipeline_ast(paths: dict, pipeline_ast: dict) -> None:
    p = Path(paths["pipeline_ast_json"])
    _safe_mkdir(p.parent)
    p.write_text(json.dumps(pipeline_ast, indent=2, sort_keys=True) + "\n", encoding="utf-8")


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

    def _reload_from_disk(self) -> None:
        # Keep disk as source of truth so POST doesn't clobber out-of-band edits.
        server = self._settings.get("server") if isinstance(self._settings, dict) else {}
        host = (
            server.get("host", os.environ.get("AUTONOVELWRITER_HOST", "127.0.0.1"))
            if isinstance(server, dict)
            else "127.0.0.1"
        )
        port = (
            server.get("port", int(os.environ.get("AUTONOVELWRITER_PORT", "8787")))
            if isinstance(server, dict)
            else int(os.environ.get("AUTONOVELWRITER_PORT", "8787"))
        )
        self._settings = load_settings(self._paths, host=host, port=int(port))

    def get(self):
        # Prefer disk as source of truth so UI always sees persisted values.
        self._reload_from_disk()
        self.write_json({"ok": True, "settings": self._settings})

    def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)

        if not isinstance(body, dict):
            return self.write_json({"ok": False, "error": "expected_object"}, status=400)

        self._reload_from_disk()

        # Minimal: allow replacing top-level keys; deeper validation comes later.
        for k in ("paths", "agent", "novel"):
            if k in body and isinstance(body[k], dict):
                # Shallow merge into existing dict to avoid losing unknown keys.
                cur = self._settings.get(k)
                if not isinstance(cur, dict):
                    cur = {}
                cur.update(body[k])
                self._settings[k] = cur

        save_settings(self._paths, self._settings)
        self.write_json({"ok": True, "settings": self._settings})


class PipelineHandler(BaseHandler):
    def initialize(self, paths: dict, hub: "WebSocketHub"):
        self._paths = paths
        self._hub = hub

    def get(self):
        # Canonical artifact is the script; JSON is derived.
        script = load_pipeline_script(self._paths)
        pipeline, pipeline_ast, warnings, errors = parse_pipeline_script_v2(script)
        save_pipeline(self._paths, pipeline)
        save_pipeline_ast(self._paths, pipeline_ast)
        self.write_json(
            {
                "ok": True,
                "script": script,
                "pipeline": pipeline,
                "pipeline_ast": pipeline_ast,
                "warnings": warnings,
                "errors": errors,
            }
        )

    def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)

        if not isinstance(body, dict):
            return self.write_json({"ok": False, "error": "expected_object"}, status=400)

        if isinstance(body.get("script"), str):
            incoming = body.get("script", "")
            pipeline, pipeline_ast, warnings, errors = parse_pipeline_script_v2(incoming)
            if errors:
                return self.write_json({"ok": False, "warnings": warnings, "errors": errors}, status=400)

            canonical = render_pipeline_script_from_ast(pipeline_ast)
            save_pipeline_script(self._paths, canonical)
            save_pipeline(self._paths, pipeline)
            save_pipeline_ast(self._paths, pipeline_ast)
            script_hash = _sha256_hex(canonical)
            self._hub.broadcast(
                {
                    "type": "pipeline_updated",
                    "ts_ms": _now_ms(),
                    "script": canonical,
                    "script_hash": script_hash,
                    "warnings": warnings,
                }
            )
            return self.write_json(
                {
                    "ok": True,
                    "script": canonical,
                    "script_hash": script_hash,
                    "pipeline": pipeline,
                    "pipeline_ast": pipeline_ast,
                    "warnings": warnings,
                    "errors": [],
                }
            )

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
        # Convert to a v2 AST with only steps (no nesting).
        pipeline_ast = _ast_root([_ast_step(b["type"], bool(b.get("enabled", True))) for b in cleaned])
        canonical = render_pipeline_script_from_ast(pipeline_ast)
        save_pipeline_script(self._paths, canonical)
        save_pipeline(self._paths, pipeline)
        save_pipeline_ast(self._paths, pipeline_ast)
        script_hash = _sha256_hex(canonical)
        self._hub.broadcast(
            {"type": "pipeline_updated", "ts_ms": _now_ms(), "script": canonical, "script_hash": script_hash, "warnings": []}
        )
        self.write_json(
            {
                "ok": True,
                "script": canonical,
                "script_hash": script_hash,
                "pipeline": pipeline,
                "pipeline_ast": pipeline_ast,
                "warnings": [],
                "errors": [],
            }
        )


class PipelineValidateHandler(BaseHandler):
    def initialize(self, paths: dict):
        self._paths = paths

    def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)

        if not isinstance(body, dict) or not isinstance(body.get("script"), str):
            return self.write_json({"ok": False, "error": "expected_script"}, status=400)

        script = body.get("script", "")
        pipeline, pipeline_ast, warnings, errors = parse_pipeline_script_v2(script)
        canonical = render_pipeline_script_from_ast(pipeline_ast) if not errors else ""
        canonical_hash = _sha256_hex(canonical) if canonical else ""
        return self.write_json(
            {
                "ok": not bool(errors),
                "script": script,
                "canonical": canonical,
                "canonical_hash": canonical_hash,
                "pipeline": pipeline,
                "pipeline_ast": pipeline_ast,
                "warnings": warnings,
                "errors": errors,
            },
            status=200 if not errors else 400,
        )


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


def _read_jsonl_tail(p: Path, limit: int = 50, max_bytes: int = 1_000_000) -> list[dict]:
    if not p.exists():
        return []
    try:
        with p.open("rb") as f:
            f.seek(0, os.SEEK_END)
            size = f.tell()
            start = max(0, size - max_bytes)
            f.seek(start, os.SEEK_SET)
            chunk = f.read()
        text = chunk.decode("utf-8", errors="replace")
    except Exception:
        return []
    objs = []
    for line in text.splitlines()[-max(1, limit * 3) :]:
        try:
            obj = json.loads(line)
        except Exception:
            continue
        if isinstance(obj, dict):
            objs.append(obj)
    return objs[-limit:]


def _parse_created_utc_to_ms(s: str) -> int:
    """
    Best-effort parse for timestamps like '2026-02-15T23:15:34Z'.
    Returns 0 on failure.
    """
    if not isinstance(s, str) or not s:
        return 0
    t = s.strip()
    if t.endswith("Z"):
        t = t[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(t)
        return int(dt.timestamp() * 1000)
    except Exception:
        return 0


def list_task_batches(paths: dict, limit: int = 500, project_id: str | None = None) -> list[dict]:
    """
    Index batches under runtime/tasks/batches. Best-effort: prefers manifest.json.
    Returns newest-first.
    """
    out = []
    try:
        lim = int(limit)
    except Exception:
        lim = 500
    lim = max(1, min(2000, lim))

    batches_root = Path(paths["tasks"]) / "batches"
    _safe_mkdir(batches_root)

    try:
        entries = [p for p in batches_root.iterdir() if p.is_dir()]
    except Exception:
        entries = []

    want_pid = project_id.strip() if isinstance(project_id, str) else ""
    for d in entries:
        batch_id = d.name
        manifest_path = d / "manifest.json"
        tasks_jsonl_path = d / "tasks.jsonl"
        created_utc = ""
        task_count = None
        tasks_jsonl = ""
        extra = {}
        errors = []

        if manifest_path.exists():
            try:
                manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            except Exception as e:
                manifest = None
                errors.append(f"manifest_read_failed:{e}")
            if isinstance(manifest, dict):
                created_utc = manifest.get("created_utc") if isinstance(manifest.get("created_utc"), str) else ""
                try:
                    task_count = int(manifest.get("task_count")) if manifest.get("task_count") is not None else None
                except Exception:
                    task_count = None
                outputs = manifest.get("outputs") if isinstance(manifest.get("outputs"), dict) else {}
                tj = outputs.get("tasks_jsonl") if isinstance(outputs.get("tasks_jsonl"), str) else ""
                if tj:
                    tasks_jsonl = tj
                for k in ("project_id", "task_id", "block", "batch_id"):
                    if k in manifest:
                        extra[k] = manifest.get(k)

        # Fallbacks when manifest is missing/bad.
        if not created_utc:
            try:
                st = d.stat()
                created_utc = datetime.utcfromtimestamp(st.st_mtime).isoformat(timespec="seconds") + "Z"
            except Exception:
                created_utc = ""
        if not tasks_jsonl:
            if tasks_jsonl_path.exists():
                tasks_jsonl = str(tasks_jsonl_path)
        if task_count is None and tasks_jsonl and Path(tasks_jsonl).exists():
            # Best-effort count: only read reasonably small files.
            try:
                if Path(tasks_jsonl).stat().st_size > 10_000_000:
                    task_count = None
                    raise RuntimeError("tasks_jsonl_too_large_to_count")
                n = 0
                with Path(tasks_jsonl).open("rb") as f:
                    for _ in f:
                        n += 1
                        if n > 100_000:
                            break
                task_count = n
            except Exception:
                task_count = None

        created_ms = _parse_created_utc_to_ms(created_utc)
        try:
            mtime_ms = int(d.stat().st_mtime * 1000)
        except Exception:
            mtime_ms = 0
        if not created_ms:
            created_ms = mtime_ms

        rec = {
            "batch_id": extra.get("batch_id") if isinstance(extra.get("batch_id"), str) and extra.get("batch_id") else batch_id,
            "batch_dir": str(d),
            "tasks_jsonl": tasks_jsonl,
            "task_count": int(task_count) if isinstance(task_count, int) and task_count >= 0 else None,
            "created_utc": created_utc,
            "manifest_path": str(manifest_path) if manifest_path.exists() else "",
            "mtime_ms": mtime_ms,
            "_sort_ms": created_ms,
        }
        for k in ("project_id", "task_id", "block"):
            if isinstance(extra.get(k), str) and extra.get(k):
                rec[k] = extra.get(k)
        if errors:
            rec["errors"] = errors
        if want_pid:
            if rec.get("project_id") == want_pid:
                out.append(rec)
        else:
            out.append(rec)

    out.sort(key=lambda r: int(r.get("_sort_ms") or 0), reverse=True)
    if len(out) > lim:
        out = out[:lim]
    for r in out:
        r.pop("_sort_ms", None)
    return out


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
        # Run-session scoped: cache generated batches by execution key (e.g. per-round global id).
        self._meta_tasks_batch = {}
        self._cursor = None

        # Safe restart behavior: if previous run was 'running', come up paused.
        state = _load_json(Path(paths["runner_state_json"]), {})
        if isinstance(state, dict) and state.get("status") == "running":
            self._status = "paused"
            self._paused = True
        elif isinstance(state, dict) and isinstance(state.get("status"), str):
            self._status = state.get("status")
            self._paused = self._status == "paused"
        if isinstance(state, dict) and isinstance(state.get("cursor"), dict):
            self._cursor = state.get("cursor")

        self._save_state()

    def _active_project_dirs(self) -> dict:
        pid = load_active_project(self._paths)
        return _ensure_project_dirs(self._paths, pid)

    def _load_novel_settings(self) -> dict:
        obj = _load_json(Path(self._paths["settings_json"]), {})
        if isinstance(obj, dict) and isinstance(obj.get("novel"), dict):
            return obj.get("novel") or {}
        return {}

    def _write_draft_stub(self, task_id: str, block_type: str, st: dict) -> dict:
        # Idempotency: if already done and file exists, skip.
        blocks = st.get(task_id, {}).get("blocks", {})
        if isinstance(blocks, dict):
            b = blocks.get(block_type, {})
            if isinstance(b, dict) and b.get("status") == "done":
                paths = b.get("output_paths") or b.get("outputs") or []
                if isinstance(paths, list) and paths:
                    p0 = paths[0]
                    if isinstance(p0, str) and p0 and Path(p0).exists():
                        self._log(f"[output] skipped (already exists): {p0}")
                        return {"ok": True, "skipped": True, "path": p0}

        d = self._active_project_dirs()
        outputs_root = Path(d["outputs_root"])
        _safe_mkdir(outputs_root)

        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        suffix = uuid.uuid4().hex[:8]
        fname = f"draft_{task_id}_{ts}_{suffix}.md"
        out_path = outputs_root / fname
        rel_path = None
        try:
            rel_path = str(out_path.relative_to(Path(d["project_root"])))
        except Exception:
            rel_path = f"outputs/{fname}"

        novel = self._load_novel_settings()
        header = [
            f"# Draft ({task_id})",
            "",
            f"- created_utc: {datetime.utcnow().isoformat(timespec='seconds')}Z",
            f"- project_id: {d.get('project_id')}",
            f"- block: {block_type}",
            "",
            "## Novel Settings (from settings.novel.*)",
            f"- language: {novel.get('language', 'en')}",
            f"- tone: {novel.get('tone', 'neutral')}",
            f"- target_length_words: {novel.get('target_length_words', 80000)}",
            f"- pov: {novel.get('pov', 'third_limited')}",
            f"- tense: {novel.get('tense', 'past')}",
            f"- chapter_count_target: {novel.get('chapter_count_target', 12)}",
            "",
            "## Placeholder Content",
            "",
            "This is a stub draft generated by the runner. Replace with real generation later.",
            "",
        ]
        try:
            out_path.write_text("\n".join(header), encoding="utf-8", errors="replace")
        except Exception as e:
            st.setdefault(task_id, {})
            cur = st[task_id]
            if not isinstance(cur, dict):
                st[task_id] = {}
                cur = st[task_id]
            cur.setdefault("blocks", {})
            if not isinstance(cur.get("blocks"), dict):
                cur["blocks"] = {}
            cur["blocks"][block_type] = {
                "status": "error",
                "ts_ms": _now_ms(),
                "error": "write_failed",
                "detail": str(e),
                "project_rel_path": rel_path,
            }
            self._log(f"[output] write failed: {rel_path}: {e}")
            return {"ok": False, "error": "write_failed", "detail": str(e), "project_rel_path": rel_path}

        # Update persistent task status with per-block outputs.
        st.setdefault(task_id, {})
        cur = st[task_id]
        if not isinstance(cur, dict):
            st[task_id] = {}
            cur = st[task_id]
        cur.setdefault("blocks", {})
        if not isinstance(cur.get("blocks"), dict):
            cur["blocks"] = {}
        cur["blocks"][block_type] = {
            "status": "done",
            "ts_ms": _now_ms(),
            "output_paths": [str(out_path)],
            "project_rel_path": rel_path,
        }

        evt = {
            "type": "output_created",
            "ts_ms": _now_ms(),
            "project_id": d.get("project_id"),
            "task_id": task_id,
            "block": block_type,
            "path": str(out_path),
            "project_rel_path": rel_path,
        }
        self._hub.broadcast(evt)
        self._log(f"[output] created: {out_path}")
        return {"ok": True, "path": str(out_path), "project_rel_path": rel_path}

    def _write_tasks_batch_stub(self, task_id: str, block_type: str, st: dict) -> dict:
        # Run-session idempotency: if we already created a batch for this execution key, reuse it.
        if isinstance(self._meta_tasks_batch, dict) and task_id in self._meta_tasks_batch:
            rec = self._meta_tasks_batch.get(task_id) or {}
            out_paths = rec.get("output_paths")
            if isinstance(out_paths, list) and out_paths and all(isinstance(p, str) and p and Path(p).exists() for p in out_paths):
                st.setdefault(task_id, {})
                cur = st[task_id]
                if not isinstance(cur, dict):
                    st[task_id] = {}
                    cur = st[task_id]
                cur.setdefault("blocks", {})
                if not isinstance(cur.get("blocks"), dict):
                    cur["blocks"] = {}
                cur["blocks"][block_type] = {
                    "status": "done",
                    "ts_ms": _now_ms(),
                    "output_paths": list(out_paths),
                    "batch_id": rec.get("batch_id"),
                    "batch_dir": rec.get("batch_dir"),
                    "task_count": rec.get("task_count"),
                    "skipped": True,
                }
                self._log(f"[tasks] reused batch: {rec.get('batch_dir')} for task={task_id}")
                return {
                    "ok": True,
                    "skipped": True,
                    "batch_dir": rec.get("batch_dir"),
                    "tasks_jsonl": rec.get("tasks_jsonl"),
                    "task_count": rec.get("task_count"),
                    "output_paths": list(out_paths),
                }

        # Idempotency: if already done and outputs exist, skip.
        blocks = st.get(task_id, {}).get("blocks", {})
        if isinstance(blocks, dict):
            b = blocks.get(block_type, {})
            if isinstance(b, dict) and b.get("status") == "done":
                paths = b.get("output_paths") or b.get("outputs") or []
                if isinstance(paths, list) and paths:
                    ok = True
                    for pp in paths:
                        if not isinstance(pp, str) or not pp or not Path(pp).exists():
                            ok = False
                            break
                    if ok:
                        self._log(f"[tasks] skipped (already exists): {paths[0]}")
                        return {"ok": True, "skipped": True, "output_paths": paths}

        d = self._active_project_dirs()
        project_id = d.get("project_id") or "default"

        batches_root = Path(self._paths["tasks"]) / "batches"
        _safe_mkdir(batches_root)
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        batch_id = f"batch_{ts}_{uuid.uuid4().hex[:8]}"
        batch_dir = batches_root / batch_id
        _safe_mkdir(batch_dir)

        tasks_jsonl = batch_dir / "tasks.jsonl"
        manifest_json = batch_dir / "manifest.json"

        # Derive lightweight context (best-effort) from materials + recent chat.
        materials_root = Path(d["materials_root"])
        mats = []
        try:
            for p in sorted(materials_root.glob("**/*")):
                if not p.is_file():
                    continue
                try:
                    st0 = p.stat()
                    mats.append({"path": str(p.relative_to(materials_root)), "bytes": int(st0.st_size)})
                except Exception:
                    mats.append({"path": str(p), "bytes": None})
                if len(mats) >= 20:
                    break
        except Exception:
            mats = []

        chat_tail = _read_jsonl_tail(Path(self._paths["chat_jsonl"]), limit=40)
        user_msgs = []
        for m in chat_tail:
            if m.get("role") == "user" and isinstance(m.get("text"), str) and m.get("text").strip():
                user_msgs.append(m.get("text").strip())
        user_msgs = user_msgs[-10:]

        # Stub tasks: keep schema simple (JSONL objects).
        stub = [
            {
                "id": f"{task_id}_t001",
                "title": "Plan next steps (stub)",
                "kind": "plan",
                "notes": "Generated by meta_tasks_generate stub.",
            },
            {
                "id": f"{task_id}_t002",
                "title": "Write draft/revision (stub)",
                "kind": "write",
                "notes": "Generated by meta_tasks_generate stub.",
            },
            {
                "id": f"{task_id}_t003",
                "title": "Summarize and log (stub)",
                "kind": "summary",
                "notes": "Generated by meta_tasks_generate stub.",
            },
        ]
        # Include minimal context in each task so the batch is self-describing.
        ctx = {
            "project_id": project_id,
            "materials": mats,
            "recent_user_messages": user_msgs,
        }
        for t in stub:
            t["context"] = ctx

        try:
            with tasks_jsonl.open("w", encoding="utf-8") as f:
                for obj in stub:
                    f.write(json.dumps(obj, ensure_ascii=True, sort_keys=True) + "\n")
            manifest = {
                "batch_id": batch_id,
                "created_utc": datetime.utcnow().isoformat(timespec="seconds") + "Z",
                "project_id": project_id,
                "task_id": task_id,
                "block": block_type,
                "task_count": len(stub),
                "outputs": {
                    "tasks_jsonl": str(tasks_jsonl),
                },
                "sources": {
                    "materials_root": str(materials_root),
                    "materials_count": len(mats),
                    "chat_jsonl": str(self._paths["chat_jsonl"]),
                    "recent_user_messages_count": len(user_msgs),
                },
            }
            manifest_json.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        except Exception as e:
            st.setdefault(task_id, {})
            cur = st[task_id]
            if not isinstance(cur, dict):
                st[task_id] = {}
                cur = st[task_id]
            cur.setdefault("blocks", {})
            if not isinstance(cur.get("blocks"), dict):
                cur["blocks"] = {}
            cur["blocks"][block_type] = {
                "status": "error",
                "ts_ms": _now_ms(),
                "error": "write_failed",
                "detail": str(e),
                "batch_dir": str(batch_dir),
            }
            self._log(f"[tasks] write failed: {batch_dir}: {e}")
            return {"ok": False, "error": "write_failed", "detail": str(e), "batch_dir": str(batch_dir)}

        st.setdefault(task_id, {})
        cur = st[task_id]
        if not isinstance(cur, dict):
            st[task_id] = {}
            cur = st[task_id]
        cur.setdefault("blocks", {})
        if not isinstance(cur.get("blocks"), dict):
            cur["blocks"] = {}
        cur["blocks"][block_type] = {
            "status": "done",
            "ts_ms": _now_ms(),
            "output_paths": [str(tasks_jsonl), str(manifest_json)],
            "batch_id": batch_id,
            "batch_dir": str(batch_dir),
            "task_count": len(stub),
        }

        # If tasks.json is still the seeded placeholder, promote generated tasks so the runner can pick them up.
        cur_tasks = _load_json(Path(self._paths["tasks_json"]), [])
        if self._is_seed_tasks(cur_tasks):
            promoted = [{"id": t.get("id"), "title": t.get("title"), "payload": {"kind": t.get("kind")}} for t in stub]
            _save_json(Path(self._paths["tasks_json"]), promoted)
            self._log(f"[tasks] promoted batch into tasks.json (count={len(promoted)})")

        evt = {
            "type": "tasks_batch_created",
            "ts_ms": _now_ms(),
            "project_id": project_id,
            "task_id": task_id,
            "block": block_type,
            "batch_id": batch_id,
            "batch_dir": str(batch_dir),
            "tasks_jsonl": str(tasks_jsonl),
            "task_count": len(stub),
        }
        self._hub.broadcast(evt)
        self._log(f"[tasks] created batch: {batch_dir} count={len(stub)}")
        self._meta_tasks_batch[task_id] = {
            "batch_id": batch_id,
            "batch_dir": str(batch_dir),
            "tasks_jsonl": str(tasks_jsonl),
            "task_count": len(stub),
            "output_paths": [str(tasks_jsonl), str(manifest_json)],
        }
        return {"ok": True, "batch_dir": str(batch_dir), "tasks_jsonl": str(tasks_jsonl), "task_count": len(stub)}

    def _cursor_context(self) -> dict:
        cur = self._cursor if isinstance(self._cursor, dict) else None
        if not cur:
            return {}
        pending = cur.get("pending")
        if not isinstance(pending, dict):
            pending = None
        stack = cur.get("stack")
        if not isinstance(stack, list) or not stack:
            return {}
        round_f = None
        foreach_f = None
        for f in stack:
            if not isinstance(f, dict):
                continue
            if f.get("kind") == "round":
                round_f = f
            elif f.get("kind") == "foreach_task":
                foreach_f = f
        out = {
            "pipeline_hash": cur.get("pipeline_hash"),
            "phase": "foreach" if foreach_f else "global",
        }
        if round_f:
            out["round_index"] = int(round_f.get("repeat_i") or 0)
            out["round_repeat_total"] = int(round_f.get("repeat_total") or 1)
        # Expose a stable-ish pointer for debug/telemetry.
        # If we have a pending step, report its node path (not a container frame path).
        if pending and isinstance(pending.get("node_path"), list):
            out["ast_path"] = pending.get("node_path")
            out["child_i"] = pending.get("child_i")
        else:
            top = stack[-1] if isinstance(stack[-1], dict) else {}
            out["ast_path"] = top.get("path")
            out["child_i"] = top.get("child_i")
        return out

    def _save_state(self) -> None:
        cursor = self._cursor if isinstance(self._cursor, dict) else None
        _save_json(
            Path(self._paths["runner_state_json"]),
            {
                "status": self._status,
                "ts_ms": _now_ms(),
                "task_id": self._task_id,
                "block": self._block,
                "cursor": cursor,
            },
        )

    def _emit_status(self) -> None:
        ctx = self._cursor_context()
        self._hub.broadcast(
            {
                "type": "run_status",
                "ts_ms": _now_ms(),
                "status": self._status,
                "task_id": self._task_id,
                "block": self._block,
                **ctx,
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

    @staticmethod
    def _is_seed_tasks(tasks: list) -> bool:
        if not isinstance(tasks, list) or len(tasks) != 1:
            return False
        t = tasks[0]
        if not isinstance(t, dict):
            return False
        return t.get("id") == "task_001" and t.get("title") == "Seed task"

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

    def _pipeline_hash(self, script: str) -> str:
        return _sha256_hex(script or "")

    def _node_by_path(self, ast: dict, path: list) -> dict | None:
        node = ast
        if not isinstance(node, dict):
            return None
        for idx in path or []:
            if not isinstance(idx, int):
                return None
            kids = node.get("children")
            if not isinstance(kids, list) or idx < 0 or idx >= len(kids):
                return None
            node = kids[idx]
            if not isinstance(node, dict):
                return None
        return node

    def _frame_children(self, ast: dict, frame: dict) -> list:
        kind = frame.get("kind")
        if kind == "root":
            node = ast
        else:
            node = self._node_by_path(ast, frame.get("path") or [])
        kids = node.get("children") if isinstance(node, dict) else None
        return kids if isinstance(kids, list) else []

    def _init_cursor(self, pipeline_hash: str) -> dict:
        return {"pipeline_hash": pipeline_hash, "stack": [{"kind": "root", "path": [], "child_i": 0}]}

    def _round_from_stack(self, stack: list) -> dict | None:
        out = None
        for f in stack:
            if isinstance(f, dict) and f.get("kind") == "round":
                out = f
        return out

    def _foreach_from_stack(self, stack: list) -> dict | None:
        out = None
        for f in stack:
            if isinstance(f, dict) and f.get("kind") == "foreach_task":
                out = f
        return out

    def _global_exec_task_id(self, stack: list) -> str:
        rf = self._round_from_stack(stack)
        if rf:
            ri = int(rf.get("repeat_i") or 0) + 1
            rt = int(rf.get("repeat_total") or 1)
            return f"__global_round_{ri}_of_{rt}"
        return "__global__"

    def _task_mark_running(self, task_id: str, st: dict, ctx: dict | None = None, block: str | None = None) -> None:
        st.setdefault(task_id, {})
        if not isinstance(st.get(task_id), dict):
            st[task_id] = {}
        cur = st[task_id]
        if cur.get("status") in ("running", "error"):
            return
        cur.update({"status": "running", "ts_ms": _now_ms()})
        self._save_task_status(st)
        extra = {}
        if isinstance(self._cursor, dict) and isinstance(self._cursor.get("pipeline_hash"), str):
            extra["pipeline_hash"] = self._cursor.get("pipeline_hash")
        if isinstance(ctx, dict):
            for k in ("phase", "round_index", "round_repeat_total"):
                if k in ctx:
                    extra[k] = ctx.get(k)
        if isinstance(block, str) and block:
            extra["block"] = block
        self._hub.broadcast({"type": "task_status", "ts_ms": _now_ms(), "task_id": task_id, "status": "running", **extra})

    def _task_mark_done(self, task_id: str, st: dict, ctx: dict | None = None) -> None:
        st.setdefault(task_id, {})
        if not isinstance(st.get(task_id), dict):
            st[task_id] = {}
        cur = st[task_id]
        if cur.get("status") == "done":
            return
        cur.update({"status": "done", "ts_ms": _now_ms()})
        self._save_task_status(st)
        extra = {}
        if isinstance(self._cursor, dict) and isinstance(self._cursor.get("pipeline_hash"), str):
            extra["pipeline_hash"] = self._cursor.get("pipeline_hash")
        if isinstance(ctx, dict):
            for k in ("phase", "round_index", "round_repeat_total"):
                if k in ctx:
                    extra[k] = ctx.get(k)
        self._hub.broadcast({"type": "task_status", "ts_ms": _now_ms(), "task_id": task_id, "status": "done", **extra})

    def _task_mark_error(self, task_id: str, st: dict, reason: str, ctx: dict | None = None, block: str | None = None) -> None:
        st.setdefault(task_id, {})
        if not isinstance(st.get(task_id), dict):
            st[task_id] = {}
        cur = st[task_id]
        cur.update({"status": "error", "ts_ms": _now_ms(), "error": reason})
        self._save_task_status(st)
        extra = {}
        if isinstance(self._cursor, dict) and isinstance(self._cursor.get("pipeline_hash"), str):
            extra["pipeline_hash"] = self._cursor.get("pipeline_hash")
        if isinstance(ctx, dict):
            for k in ("phase", "round_index", "round_repeat_total"):
                if k in ctx:
                    extra[k] = ctx.get(k)
        if isinstance(block, str) and block:
            extra["block"] = block
        self._hub.broadcast({"type": "task_status", "ts_ms": _now_ms(), "task_id": task_id, "status": "error", "error": reason, **extra})

    def _cursor_next_step(self, ast: dict, tasks: list, st: dict) -> dict | None:
        """
        Returns an executable step node with derived context, or None if complete.
        Mutates self._cursor in-place (selects next step, and advances program counter only after commit).
        """
        cur = self._cursor if isinstance(self._cursor, dict) else None
        if not cur or not isinstance(cur.get("stack"), list) or not cur["stack"]:
            return None
        stack = cur["stack"]
        pending = cur.get("pending")
        if isinstance(pending, dict):
            # If we already selected a step but haven't committed it yet, return it again.
            node_path = pending.get("node_path")
            ctx = pending.get("ctx")
            if isinstance(node_path, list) and isinstance(ctx, dict):
                node = self._node_by_path(ast, node_path)
                if isinstance(node, dict) and node.get("kind") == "step":
                    return {"node": node, "ctx": ctx}
            # Pending entry is invalid/stale; drop it and continue.
            cur.pop("pending", None)

        def task_at(i: int) -> str | None:
            if i < 0 or i >= len(tasks):
                return None
            t = tasks[i]
            tid = t.get("id") if isinstance(t, dict) else None
            return tid if isinstance(tid, str) and tid else None

        while stack:
            frame = stack[-1]
            if not isinstance(frame, dict):
                stack.pop()
                continue

            kids = self._frame_children(ast, frame)

            # FOREACH: select a pending task and iterate children per task.
            if frame.get("kind") == "foreach_task":
                if not isinstance(frame.get("task_i"), int):
                    frame["task_i"] = 0
                if not isinstance(frame.get("child_i"), int):
                    frame["child_i"] = 0

                # Advance to next runnable task if needed.
                popped = False
                while True:
                    if frame["task_i"] >= len(tasks):
                        stack.pop()
                        popped = True
                        break
                    tid = task_at(frame["task_i"])
                    if not tid:
                        frame["task_i"] += 1
                        frame["child_i"] = 0
                        continue
                    status = st.get(tid, {}).get("status", "pending")
                    if status == "error":
                        # Skip errored tasks for now; runner will stop at first error from execution.
                        frame["task_i"] += 1
                        frame["child_i"] = 0
                        continue
                    frame["task_id"] = tid
                    break
                if popped:
                    continue
                if not stack:
                    continue
                # Task boundary completion.
                if frame["child_i"] >= len(kids):
                    tid = frame.get("task_id")
                    if isinstance(tid, str) and tid:
                        round_f = self._round_from_stack(stack)
                        self._task_mark_done(
                            tid,
                            st,
                            ctx={
                                "phase": "foreach",
                                "round_index": int(round_f.get("repeat_i") or 0) if round_f else 0,
                                "round_repeat_total": int(round_f.get("repeat_total") or 1) if round_f else 1,
                            },
                        )
                    frame["task_i"] += 1
                    frame["child_i"] = 0
                    frame["task_id"] = None
                    continue

            # ROUND repetition.
            if frame.get("kind") == "round":
                if not isinstance(frame.get("repeat_total"), int):
                    frame["repeat_total"] = 1
                if not isinstance(frame.get("repeat_i"), int):
                    frame["repeat_i"] = 0
                if not isinstance(frame.get("child_i"), int):
                    frame["child_i"] = 0

            # Container completion.
            child_i = int(frame.get("child_i") or 0)
            if child_i >= len(kids):
                if frame.get("kind") == "round":
                    ri = int(frame.get("repeat_i") or 0)
                    rt = int(frame.get("repeat_total") or 1)
                    if (ri + 1) < rt:
                        frame["repeat_i"] = ri + 1
                        frame["child_i"] = 0
                        continue
                stack.pop()
                continue

            node = kids[child_i]
            if not isinstance(node, dict):
                frame["child_i"] = child_i + 1
                continue
            k = node.get("kind")

            # Path to this child node (stable index path through children arrays).
            parent_path = frame.get("path") or []
            if frame.get("kind") == "root":
                parent_path = []
            node_path = list(parent_path) + [child_i]

            if k == "step":
                t = node.get("type")
                if not isinstance(t, str) or not t:
                    # Malformed step; skip to avoid getting stuck on an un-executable node.
                    frame["child_i"] = child_i + 1
                    continue
                if node.get("enabled", True) is False:
                    frame["child_i"] = child_i + 1
                    continue
                foreach_f = self._foreach_from_stack(stack)
                task_id = foreach_f.get("task_id") if foreach_f else None
                round_f = self._round_from_stack(stack)
                ctx = {
                    "task_id": task_id,
                    "phase": "foreach" if foreach_f else "global",
                    "round_index": int(round_f.get("repeat_i") or 0) if round_f else 0,
                    "round_repeat_total": int(round_f.get("repeat_total") or 1) if round_f else 1,
                    "ast_path": node_path,
                }
                # Mark this step as pending until it completes successfully; only then advance `child_i`.
                cur["pending"] = {
                    "frame_depth": len(stack) - 1,
                    "child_i": child_i,
                    "node_path": node_path,
                    "ctx": ctx,
                }
                if isinstance(task_id, str) and task_id:
                    self._task_mark_running(task_id, st, ctx=ctx, block=t)
                return {"node": node, "ctx": ctx}

            if k == "round":
                frame["child_i"] = child_i + 1
                repeat = node.get("repeat")
                try:
                    repeat_total = int(repeat)
                except Exception:
                    repeat_total = 1
                if repeat_total < 1:
                    repeat_total = 1
                stack.append({"kind": "round", "path": node_path, "child_i": 0, "repeat_total": repeat_total, "repeat_i": 0})
                continue

            if k == "foreach_task":
                frame["child_i"] = child_i + 1
                stack.append({"kind": "foreach_task", "path": node_path, "child_i": 0, "task_i": 0, "task_id": None})
                continue

            # Unknown nodes: skip but never silently.
            frame["child_i"] = child_i + 1
            continue

        return None

    def _cursor_commit_pending(self) -> None:
        """
        Advance the cursor past the currently pending step.
        Must be called only after the step has completed successfully.
        """
        cur = self._cursor if isinstance(self._cursor, dict) else None
        if not cur:
            return
        pending = cur.get("pending")
        stack = cur.get("stack")
        if not isinstance(pending, dict) or not isinstance(stack, list) or not stack:
            cur.pop("pending", None)
            return
        depth = pending.get("frame_depth")
        child_i = pending.get("child_i")
        if not isinstance(depth, int) or not isinstance(child_i, int):
            cur.pop("pending", None)
            return
        if depth < 0 or depth >= len(stack):
            cur.pop("pending", None)
            return
        frame = stack[depth]
        if isinstance(frame, dict):
            # Only advance if we are still pointing at the same child.
            cur_child_i = int(frame.get("child_i") or 0)
            if cur_child_i == child_i:
                frame["child_i"] = child_i + 1
        cur.pop("pending", None)

    def _maybe_run_codex_stub_once(self) -> None:
        if self._codex_stub_ran:
            return
        self._codex_stub_ran = True
        res = run_codex_stub(self._paths, ["--version"], timeout_s=2.0)
        if res.get("disabled"):
            # Only log the disabled note if the user actually asked for codex in settings.
            agent = get_agent_settings(self._paths)
            if agent.get("sdk") == "codex" and bool(agent.get("enabled", False)):
                if res.get("reason") == "env_gate_disabled":
                    self._log("[codex] disabled (set AUTONOVELWRITER_ENABLE_CODEX=1 to allow subprocess)")
                else:
                    self._log(f"[codex] disabled ({res.get('reason')})")
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
                        self._cursor = None
                        self._save_state()
                        self._emit_status()
                        return
                    if self._paused or self._status != "running":
                        # Cursor is preserved for resume.
                        self._save_state()
                        self._emit_status()
                        return

                script = load_pipeline_script(self._paths)
                _pipeline, pipeline_ast, warnings, errors = parse_pipeline_script_v2(script)
                if errors:
                    self._log(f"[runner] pipeline parse errors (stopping run): {json.dumps(errors)}")
                    async with self._lock:
                        self._status = "idle"
                        self._task_id = None
                        self._block = None
                        self._cursor = None
                        self._save_state()
                        self._emit_status()
                    return
                if warnings:
                    self._log(f"[runner] pipeline parse warnings: {json.dumps(warnings)}")

                pipeline_hash = self._pipeline_hash(script)
                if not isinstance(self._cursor, dict):
                    self._cursor = self._init_cursor(pipeline_hash)
                elif self._cursor.get("pipeline_hash") != pipeline_hash:
                    # Fail safe: cursor is invalid if the canonical script changed.
                    self._log("[runner] pipeline changed since cursor was saved; stopping run (restart required)")
                    async with self._lock:
                        self._status = "idle"
                        self._task_id = None
                        self._block = None
                        self._cursor = None
                        self._save_state()
                        self._emit_status()
                    return

                tasks = self._load_tasks()
                st = self._load_task_status()

                # Optional, gated codex subprocess stub (does not run by default).
                self._maybe_run_codex_stub_once()

                nxt = self._cursor_next_step(pipeline_ast, tasks, st)
                if not nxt:
                    async with self._lock:
                        self._status = "idle"
                        self._task_id = None
                        self._block = None
                        self._cursor = None
                        self._save_state()
                        self._emit_status()
                    return

                node = nxt.get("node") or {}
                ctx = nxt.get("ctx") or {}
                block_type = node.get("type")
                if not isinstance(block_type, str) or not block_type:
                    continue

                task_id = ctx.get("task_id")
                if not isinstance(task_id, str) or not task_id:
                    task_id = None

                async with self._lock:
                    self._task_id = task_id
                    self._block = block_type
                    self._save_state()
                    self._emit_status()

                round_idx = int(ctx.get("round_index") or 0) + 1
                round_tot = int(ctx.get("round_repeat_total") or 1)
                phase = ctx.get("phase") or "global"
                ttag = f" task={task_id}" if task_id else ""
                self._log(f"[runner] round={round_idx}/{round_tot} phase={phase}{ttag} block={block_type} start")

                res = {"ok": True}
                if block_type == "meta_tasks_generate":
                    exec_task_id = task_id or self._global_exec_task_id(self._cursor.get("stack") or [])
                    res = self._write_tasks_batch_stub(exec_task_id, block_type, st)
                    self._save_task_status(st)
                elif block_type == "write":
                    if not task_id:
                        self._log("[runner] write skipped (no task context; place under FOREACH_TASK)")
                        res = {"ok": True, "skipped": True}
                    else:
                        res = self._write_draft_stub(task_id, block_type, st)
                        self._save_task_status(st)
                else:
                    # Stub work unit (cooperative cancellation point).
                    await tornado.gen.sleep(0.25)

                if not res.get("ok"):
                    reason = res.get("error") or f"{block_type}_failed"
                    if task_id:
                        self._task_mark_error(task_id, st, reason, ctx=ctx, block=block_type)
                    self._log(f"[runner] block failed: {json.dumps(res)}")
                    async with self._lock:
                        self._status = "idle"
                        self._task_id = None
                        self._block = None
                        self._save_state()
                        self._emit_status()
                    return

                # Advance cursor only after successful completion so restarts do not skip unfinished work.
                self._cursor_commit_pending()
                self._log(f"[runner] round={round_idx}/{round_tot} phase={phase}{ttag} block={block_type} done")

                async with self._lock:
                    # Persist progress frequently for resumability.
                    self._save_state()
                    self._emit_status()
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


class ProjectsHandler(BaseHandler):
    def initialize(self, paths: dict):
        self._paths = paths

    def get(self):
        root = Path(self._paths["projects_root"])
        _safe_mkdir(root)

        active = load_active_project(self._paths)

        projects = []
        try:
            for p in root.iterdir():
                if not p.is_dir():
                    continue
                pid = p.name
                if not _is_safe_project_id(pid):
                    continue
                try:
                    st = p.stat()
                    mtime_ms = int(st.st_mtime * 1000)
                except Exception:
                    mtime_ms = 0
                projects.append({"id": pid, "mtime_ms": mtime_ms})
        except Exception:
            projects = []

        if not any(pr.get("id") == "default" for pr in projects):
            _ensure_project_dirs(self._paths, "default")
            projects.append({"id": "default", "mtime_ms": _now_ms()})

        projects.sort(key=lambda x: x.get("id", ""))
        self.write_json(
            {
                "ok": True,
                "active_project": active,
                "projects_root": str(root),
                "projects": projects,
            }
        )


class ProjectActiveHandler(BaseHandler):
    def initialize(self, paths: dict, hub: "WebSocketHub"):
        self._paths = paths
        self._hub = hub

    def post(self):
        try:
            body = tornado.escape.json_decode(self.request.body or b"{}")
        except Exception:
            return self.write_json({"ok": False, "error": "invalid_json"}, status=400)
        if not isinstance(body, dict) or not isinstance(body.get("project_id"), str):
            return self.write_json({"ok": False, "error": "expected_project_id"}, status=400)
        pid = body.get("project_id", "").strip()
        if not _is_safe_project_id(pid):
            return self.write_json({"ok": False, "error": "invalid_project_id"}, status=400)
        _ensure_project_dirs(self._paths, pid)
        save_active_project(self._paths, pid)
        self._hub.broadcast({"type": "project_active_changed", "ts_ms": _now_ms(), "project_id": pid})
        self.write_json({"ok": True, "active_project": pid})


class MaterialsIndexHandler(BaseHandler):
    def initialize(self, paths: dict):
        self._paths = paths

    def get(self):
        active = load_active_project(self._paths)
        q = self.get_query_argument("project", default="").strip()
        pid = q if q else active
        if not _is_safe_project_id(pid):
            pid = active
        pr = _ensure_project_dirs(self._paths, pid)
        root = Path(self._paths["projects_root"])

        files = []
        materials_root = Path(pr["materials_root"])
        try:
            for p in materials_root.rglob("*"):
                rel = None
                try:
                    rel = p.relative_to(materials_root).as_posix()
                except Exception:
                    continue
                if not rel or rel.startswith("."):
                    # Hide dotfiles for now.
                    continue
                try:
                    st = p.stat()
                    mtime_ms = int(st.st_mtime * 1000)
                    size = int(st.st_size)
                except Exception:
                    mtime_ms = 0
                    size = 0

                if p.is_dir():
                    files.append({"path": rel + "/", "kind": "dir", "mtime_ms": mtime_ms, "size_bytes": 0})
                elif p.is_file():
                    files.append({"path": rel, "kind": "file", "mtime_ms": mtime_ms, "size_bytes": size})
        except Exception:
            files = []

        # Keep response bounded.
        files.sort(key=lambda x: x.get("path", ""))
        if len(files) > 5000:
            return self.write_json({"ok": False, "error": "too_many_entries", "count": len(files)}, status=400)

        self.write_json(
            {
                "ok": True,
                "active_project": active,
                "project": pid,
                "projects_root": str(root),
                "materials_root": str(materials_root),
                "files": files,
            }
        )


class OutputsIndexHandler(BaseHandler):
    def initialize(self, paths: dict):
        self._paths = paths

    def get(self):
        active = load_active_project(self._paths)
        q = self.get_query_argument("project", default="").strip()
        pid = q if q else active
        if not _is_safe_project_id(pid):
            pid = active
        pr = _ensure_project_dirs(self._paths, pid)
        root = Path(self._paths["projects_root"])

        files = []
        outputs_root = Path(pr["outputs_root"])
        try:
            for p in outputs_root.rglob("*"):
                rel = None
                try:
                    rel = p.relative_to(outputs_root).as_posix()
                except Exception:
                    continue
                if not rel:
                    continue
                # Hide dotfiles/dirs anywhere in the tree.
                if any(seg.startswith(".") for seg in rel.split("/")):
                    continue
                try:
                    st = p.stat()
                    mtime_ms = int(st.st_mtime * 1000)
                    size = int(st.st_size)
                except Exception:
                    mtime_ms = 0
                    size = 0

                if p.is_dir():
                    files.append({"path": rel + "/", "kind": "dir", "mtime_ms": mtime_ms, "size_bytes": 0})
                elif p.is_file():
                    files.append({"path": rel, "kind": "file", "mtime_ms": mtime_ms, "size_bytes": size})

                # Keep scan bounded (avoid walking huge trees before enforcing cap).
                if len(files) > 5000:
                    return self.write_json(
                        {"ok": False, "error": "too_many_entries", "count": len(files)}, status=400
                    )
        except Exception:
            files = []

        files.sort(key=lambda x: x.get("path", ""))

        self.write_json(
            {
                "ok": True,
                "active_project": active,
                "project": pid,
                "projects_root": str(root),
                "outputs_root": str(outputs_root),
                "files": files,
            }
        )


class TasksBatchesIndexHandler(BaseHandler):
    def initialize(self, paths: dict):
        self._paths = paths

    def get(self):
        try:
            limit = int(self.get_query_argument("limit", default="500"))
        except Exception:
            limit = 500
        q = self.get_query_argument("project", default="").strip()
        pid = q if _is_safe_project_id(q) else ""
        batches_root = Path(self._paths["tasks"]) / "batches"
        batches = list_task_batches(self._paths, limit=limit, project_id=pid or None)
        self.write_json({"ok": True, "batches_root": str(batches_root), "batches": batches})


def make_app(paths: dict, settings: dict, debug: bool) -> tornado.web.Application:
    hub = WebSocketHub()
    chat_store = ChatStore(Path(paths["chat_jsonl"]))
    runner = Runner(paths, hub=hub)

    handlers = [
        (r"/api/health", HealthHandler),
        (r"/api/settings", SettingsHandler, {"paths": paths, "settings": settings}),
        (r"/api/projects", ProjectsHandler, {"paths": paths}),
        (r"/api/projects/active", ProjectActiveHandler, {"paths": paths, "hub": hub}),
        (r"/api/materials/index", MaterialsIndexHandler, {"paths": paths}),
        (r"/api/outputs/index", OutputsIndexHandler, {"paths": paths}),
        (r"/api/tasks/batches/index", TasksBatchesIndexHandler, {"paths": paths}),
        (r"/api/pipeline", PipelineHandler, {"paths": paths, "hub": hub}),
        (r"/api/pipeline/validate", PipelineValidateHandler, {"paths": paths}),
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
    # Ensure at least one project exists.
    load_active_project(paths)

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
