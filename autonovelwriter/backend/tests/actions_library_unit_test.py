#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import os
import tempfile
from pathlib import Path


def _load_server_py():
    # Load `autonovelwriter/backend/server.py` without requiring package __init__.py files.
    here = Path(__file__).resolve()
    server_py = here.parents[1] / "server.py"
    spec = importlib.util.spec_from_file_location("autonovelwriter_backend_server", server_py)
    assert spec and spec.loader, "failed to create import spec for server.py"
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    return mod


_server = _load_server_py()


def test_actions_library_seed_list_get_copy() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)
            _server.seed_default_actions(paths)

            idx = _server.list_actions(paths)
            assert isinstance(idx, list) and idx, "expected non-empty actions index"
            assert any(a.get("origin") == "default" for a in idx), "expected default actions"

            # Use a known builtin id if present, else fallback to any default.
            default_ids = [a.get("id") for a in idx if a.get("origin") == "default" and isinstance(a.get("id"), str)]
            aid = "write" if "write" in default_ids else str(default_ids[0])
            assert _server._is_safe_action_id(aid)

            act = _server.get_action(paths, aid)
            assert isinstance(act, dict) and act.get("id") == aid
            assert act.get("origin") == "default"

            src_path = Path(paths["actions_defaults"]) / f"{aid}.json"
            before = src_path.read_text(encoding="utf-8")

            copied = _server.copy_default_action(paths, aid, overrides={"name": "My Custom Action"})
            assert isinstance(copied, dict), "expected copy_default_action to return dict"
            new_id = copied.get("id")
            assert isinstance(new_id, str) and new_id and new_id != aid
            assert _server._is_safe_action_id(new_id)
            assert copied.get("origin") == "user"
            assert copied.get("base_action_id") == aid
            assert copied.get("name") == "My Custom Action"

            after = src_path.read_text(encoding="utf-8")
            assert before == after, "default action file should not be mutated by copy-on-edit"

            user_path = Path(paths["actions_user"]) / f"{new_id}.json"
            assert user_path.exists(), "expected copied user action file to exist"

            idx2 = _server.list_actions(paths)
            assert any(a.get("id") == new_id and a.get("origin") == "user" for a in idx2), "expected new user action in index"

            got2 = _server.get_action(paths, new_id)
            assert isinstance(got2, dict) and got2.get("id") == new_id
            assert got2.get("origin") == "user"
            assert got2.get("base_action_id") == aid
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_actions_library_seed_list_get_copy()
    print("ok - actions_library_unit")

