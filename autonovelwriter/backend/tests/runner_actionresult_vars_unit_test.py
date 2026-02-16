#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import os
import tempfile
from pathlib import Path


def _load_server_py():
    here = Path(__file__).resolve()
    server_py = here.parents[1] / "server.py"
    spec = importlib.util.spec_from_file_location("autonovelwriter_backend_server", server_py)
    assert spec and spec.loader, "failed to create import spec for server.py"
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    return mod


_server = _load_server_py()


class _Hub:
    def __init__(self):
        self.events = []

    def broadcast(self, event: dict) -> None:
        self.events.append(event)


def test_actionresult_idempotent_and_vars_plumbed() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)

            # Minimal pipeline: foreach task -> write
            script = "\n".join(
                [
                    "# AutoNovelWriter pipeline script v2",
                    "FOREACH_TASK",
                    "  STEP write",
                    "",
                ]
            )
            pipeline, ast, warnings, errors = _server.parse_pipeline_script_v2(script)
            assert errors == [], f"unexpected errors: {errors}"
            assert isinstance(ast, dict) and ast.get("kind") == "root"

            # Create runner with fake hub and seed tasks/status.
            hub = _Hub()
            runner = _server.Runner(paths, hub=hub)
            runner._cursor = runner._init_cursor("hash123")  # test-only setup

            tasks = [{"id": "task_001", "title": "t", "payload": {}}]
            st = {}
            nxt = runner._cursor_next_step(ast, tasks, st)
            assert nxt and nxt.get("node") and nxt.get("ctx")
            ctx = nxt["ctx"]
            exec_id = ctx.get("exec_id")
            assert isinstance(exec_id, str) and exec_id, "expected exec_id in ctx"

            # Commit a fake ActionResult and ensure vars update.
            ar = {
                "id": exec_id,
                "ts_start_ms": 1,
                "ts_end_ms": 2,
                "status": "ok",
                "action_id": "write",
                "task_id": "task_001",
                "phase": "foreach",
                "round_index": 0,
                "round_repeat_total": 1,
                "ast_path": ctx.get("ast_path"),
                "inputs": {"vars": {}},
                "outputs": {"draft_path": "/tmp/fake.md"},
                "artifacts": [{"path": "/tmp/fake.md", "kind": "draft", "name": "draft"}],
            }

            _server.tornado.ioloop.IOLoop.current().run_sync(lambda: runner._commit_action_result(ar))
            runner._update_vars_from_action_result(ctx, ar)

            # Vars should now be available for the next step in the same task scope.
            v = runner._vars_for_ctx(ctx)
            assert v.get("prev", {}).get("action_result_id") == exec_id
            assert v.get("prev", {}).get("outputs", {}).get("draft_path") == "/tmp/fake.md"

            # Store should report the result as existing (idempotency signal).
            ok_has = _server.tornado.ioloop.IOLoop.current().run_sync(lambda: runner._action_results.has(exec_id))
            assert ok_has is True
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_actionresult_idempotent_and_vars_plumbed()
    print("ok - runner_actionresult_vars_unit")

