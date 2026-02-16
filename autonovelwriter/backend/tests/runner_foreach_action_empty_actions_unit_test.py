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


def test_foreach_action_zero_iters_when_no_actions() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)

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

            # Task has no actions list => FOREACH_ACTION should execute 0 iterations and commit no results.
            tasks = [{"id": "task_001", "title": "t", "payload": {}}]
            Path(paths["tasks_json"]).write_text(json.dumps(tasks, indent=2, sort_keys=True) + "\n", encoding="utf-8")

            hub = _Hub()
            runner = _server.Runner(paths, hub=hub)
            runner._status = "running"
            _server.tornado.ioloop.IOLoop.current().run_sync(lambda: runner._run_loop())

            ar_path = Path(paths["action_results_jsonl"])
            assert not ar_path.exists() or ar_path.read_text(encoding="utf-8", errors="replace").strip() == ""
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_foreach_action_zero_iters_when_no_actions()
    print("ok - runner_foreach_action_empty_actions_unit")

