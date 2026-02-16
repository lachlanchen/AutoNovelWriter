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


def test_project_novel_language_override() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)

            # Set a global default novel language.
            Path(paths["settings_json"]).write_text(
                json.dumps({"novel": {"language": "ja"}}, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
            )

            pid = "proj1"
            _server.save_active_project(paths, pid)

            # No project override yet => fall back to global.
            eff1 = _server.effective_novel_language(paths, pid)
            assert eff1 == "ja"

            # Save project override => should win.
            _server.save_project_settings(paths, pid, {"novel_language": "fr"})
            eff2 = _server.effective_novel_language(paths, pid)
            assert eff2 == "fr"

            # Another project without override => global still applies.
            eff3 = _server.effective_novel_language(paths, "proj2")
            assert eff3 == "ja"
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_project_novel_language_override()
    print("ok - project_settings_novel_language_unit")

