#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
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


def _read_jsonl(p: Path) -> list[dict]:
    out = []
    if not p.exists():
        return out
    for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
        t = (line or "").strip()
        if not t:
            continue
        try:
            obj = json.loads(t)
        except Exception:
            continue
        if isinstance(obj, dict):
            out.append(obj)
    return out


def test_runner_foreach_action_iterates_and_sets_ctx_and_vars() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)

            # Canonical pipeline script: for each task -> for each action -> execute action id.
            script = "\n".join(
                [
                    "# AutoNovelWriter pipeline script v2",
                    "FOREACH_TASK",
                    "  FOREACH_ACTION",
                    "    STEP <action_id>",
                    "",
                ]
            )
            Path(paths["pipeline_script"]).write_text(script, encoding="utf-8")

            # Seed tasks with an explicit actions list.
            tasks = [
                {
                    "id": "task_001",
                    "title": "t",
                    "payload": {"actions": ["a1", "a2"]},
                }
            ]
            Path(paths["tasks_json"]).write_text(json.dumps(tasks, indent=2, sort_keys=True) + "\n", encoding="utf-8")

            hub = _Hub()
            runner = _server.Runner(paths, hub=hub)

            # Run the loop to completion (no TCP binds; runner uses file state only).
            runner._status = "running"
            _server.tornado.ioloop.IOLoop.current().run_sync(lambda: runner._run_loop())

            # Assert ActionResults committed for each action loop entry.
            ar_path = Path(paths["action_results_jsonl"])
            rows = _read_jsonl(ar_path)
            # We expect exactly two executed steps (a1, a2). (Runner may emit other events, but results should match.)
            assert len(rows) == 2, f"expected 2 ActionResults, got {len(rows)}"

            # Ensure phase/action-loop metadata is present and ordered.
            assert rows[0].get("phase") == "foreach_action"
            assert rows[0].get("action_index") == 0
            assert rows[0].get("action_id") == "a1"
            assert isinstance(rows[0].get("action_key"), str) and rows[0].get("action_key")
            assert rows[0].get("action_id_ref") == "a1"

            assert rows[1].get("phase") == "foreach_action"
            assert rows[1].get("action_index") == 1
            assert rows[1].get("action_id") == "a2"
            assert rows[1].get("action_id_ref") == "a2"

            # Exec ids must be deterministic and distinct across action loop iterations.
            assert isinstance(rows[0].get("id"), str) and rows[0].get("id")
            assert isinstance(rows[1].get("id"), str) and rows[1].get("id")
            assert rows[0]["id"] != rows[1]["id"]

            # Vars plumbing: in action-scope, prev is per-action_key; task.prev advances globally.
            v1 = rows[0].get("inputs", {}).get("vars", {})
            v2 = rows[1].get("inputs", {}).get("vars", {})
            assert isinstance(v1, dict) and isinstance(v2, dict)

            # First iteration: no task prev yet.
            assert v1.get("task", {}).get("prev", {}).get("action_result_id") in ("", None)

            # Second iteration: task prev points to first ActionResult, but action prev is empty (new action scope).
            assert v2.get("task", {}).get("prev", {}).get("action_result_id") == rows[0]["id"]
            assert v2.get("action", {}).get("prev", {}).get("action_result_id") in ("", None)
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_runner_foreach_action_iterates_and_sets_ctx_and_vars()
    print("ok - runner_foreach_action_semantics_unit")

