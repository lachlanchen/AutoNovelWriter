#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import os
import json
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


def test_activate_batch_writes_tasks_and_pointer() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)
            pid = "default"
            _server._ensure_project_dirs(paths, pid)

            bid = "batch_test_001"
            bdir = Path(paths["tasks"]) / "batches" / bid
            bdir.mkdir(parents=True, exist_ok=True)
            (bdir / "tasks.jsonl").write_text(
                "\n".join(
                    [
                        json.dumps({"id": "t1", "title": "One", "kind": "plan"}),
                        json.dumps({"id": "t2", "title": "Two", "kind": "write", "notes": "n"}),
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            (bdir / "manifest.json").write_text(
                json.dumps(
                    {
                        "batch_id": bid,
                        "created_utc": "2026-01-01T00:00:00Z",
                        "project_id": pid,
                        "task_count": 2,
                        "outputs": {"tasks_jsonl": str(bdir / "tasks.jsonl")},
                    },
                    indent=2,
                    sort_keys=True,
                )
                + "\n",
                encoding="utf-8",
            )

            res = _server.activate_task_batch(paths, pid, bid)
            assert isinstance(res, dict) and res.get("batch_id") == bid
            assert res.get("task_count") == 2

            tasks = json.loads(Path(paths["tasks_json"]).read_text(encoding="utf-8"))
            assert isinstance(tasks, list) and len(tasks) == 2
            assert tasks[0]["id"] == "t1" and tasks[0]["title"] == "One"
            assert isinstance(tasks[0].get("payload"), dict) and tasks[0]["payload"].get("kind") == "plan"

            ptr_p = Path(_server._project_active_tasks_json(paths, pid))
            ptr = json.loads(ptr_p.read_text(encoding="utf-8"))
            assert isinstance(ptr, dict) and ptr.get("batch_id") == bid
            assert ptr.get("source") == "batch"
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_activate_batch_writes_tasks_and_pointer()
    print("ok - tasks_batch_activate_unit")

