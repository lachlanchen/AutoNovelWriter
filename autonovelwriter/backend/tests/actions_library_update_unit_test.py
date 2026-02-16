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


def test_actions_library_update_copy_on_edit_and_inplace() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_runtime_") as td:
        old_runtime = os.environ.get("AUTONOVELWRITER_RUNTIME_ROOT")
        os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = td
        try:
            paths = _server.resolve_paths()
            _server.ensure_runtime_dirs(paths)
            _server.seed_default_actions(paths)

            idx = _server.list_actions(paths)
            default_ids = [a.get("id") for a in idx if a.get("origin") == "default" and isinstance(a.get("id"), str)]
            assert default_ids, "expected default actions"
            base_id = "write" if "write" in default_ids else str(default_ids[0])

            defaults_path = Path(paths["actions_defaults"]) / f"{base_id}.json"
            before_default = defaults_path.read_text(encoding="utf-8")

            # Updating a default action must copy-on-edit.
            res = _server.update_action_template(paths, base_id, {"name": "My Edited Default", "tool": "stub"})
            assert isinstance(res, dict) and "new_action_id" in res
            new_id = res.get("new_action_id")
            act = res.get("action")
            assert isinstance(new_id, str) and new_id and new_id != base_id
            assert _server._is_safe_action_id(new_id)
            assert isinstance(act, dict) and act.get("id") == new_id
            assert act.get("origin") == "user"
            assert act.get("base_action_id") == base_id
            assert act.get("name") == "My Edited Default"

            after_default = defaults_path.read_text(encoding="utf-8")
            assert before_default == after_default, "default file must not be mutated by update"

            user_path = Path(paths["actions_user"]) / f"{new_id}.json"
            assert user_path.exists(), "expected created user action file"

            # Updating a user action must update in-place.
            res2 = _server.update_action_template(paths, new_id, {"prompt": "hello"})
            assert isinstance(res2, dict) and "new_action_id" not in res2
            act2 = res2.get("action")
            assert isinstance(act2, dict) and act2.get("id") == new_id
            assert act2.get("origin") == "user"
            assert act2.get("prompt") == "hello"

            disk = _server.get_action(paths, new_id)
            assert isinstance(disk, dict) and disk.get("prompt") == "hello"

            # Invalid id rejected.
            try:
                _server.update_action_template(paths, "bad/id", {"name": "x"})
                assert False, "expected ValueError for bad action id"
            except ValueError:
                pass
        finally:
            if old_runtime is None:
                os.environ.pop("AUTONOVELWRITER_RUNTIME_ROOT", None)
            else:
                os.environ["AUTONOVELWRITER_RUNTIME_ROOT"] = old_runtime


if __name__ == "__main__":
    test_actions_library_update_copy_on_edit_and_inplace()
    print("ok - actions_library_update_unit")

