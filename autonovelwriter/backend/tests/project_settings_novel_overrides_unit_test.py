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


def test_project_novel_overrides_precedence_and_validation() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)

            Path(paths["settings_json"]).write_text(
                json.dumps({"novel": {"language": "ja", "tone": "calm", "target_length_words": 90000}}, indent=2, sort_keys=True)
                + "\n",
                encoding="utf-8",
            )

            pid = "proj1"
            _server.save_active_project(paths, pid)
            _server.save_project_settings(paths, pid, {})

            eff0 = _server.effective_novel_settings(paths, pid)
            assert eff0["novel_language"] == "ja"
            assert eff0["novel_tone"] == "calm"
            assert eff0["novel_target_length_words"] == 90000

            cur = _server.load_project_settings(paths, pid)
            nxt, err = _server._apply_project_settings_update(
                cur, {"novel_language": "fr", "novel_tone": "dark", "novel_target_length_words": "120000"}
            )
            assert err is None
            _server.save_project_settings(paths, pid, nxt)

            eff1 = _server.effective_novel_settings(paths, pid)
            assert eff1["novel_language"] == "fr"
            assert eff1["novel_tone"] == "dark"
            assert eff1["novel_target_length_words"] == 120000

            # Empty values remove project overrides and inherit global defaults again.
            cur = _server.load_project_settings(paths, pid)
            nxt2, err2 = _server._apply_project_settings_update(cur, {"novel_tone": "", "novel_target_length_words": ""})
            assert err2 is None
            _server.save_project_settings(paths, pid, nxt2)

            eff2 = _server.effective_novel_settings(paths, pid)
            assert eff2["novel_language"] == "fr"  # still overridden
            assert eff2["novel_tone"] == "calm"  # inherited
            assert eff2["novel_target_length_words"] == 90000  # inherited

            _, e_bad_type = _server._apply_project_settings_update({}, {"novel_target_length_words": "oops"})
            assert isinstance(e_bad_type, dict) and e_bad_type.get("error") == "invalid_novel_target_length_words_type"

            _, e_bad_range = _server._apply_project_settings_update({}, {"novel_target_length_words": 12})
            assert isinstance(e_bad_range, dict) and e_bad_range.get("error") == "invalid_novel_target_length_words_range"
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_project_novel_overrides_precedence_and_validation()
    print("ok - project_settings_novel_overrides_unit")
