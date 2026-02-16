#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
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
parse_pipeline_script_v2 = _server.parse_pipeline_script_v2
render_pipeline_script_from_ast = _server.render_pipeline_script_from_ast


def _norm(s: str) -> str:
    # Normalize newlines for stable asserts.
    return (s or "").replace("\r\n", "\n")


def test_roundtrip_foreach_action() -> None:
    src = "\n".join(
        [
            "# AutoNovelWriter pipeline script v2",
            "ROUND 2",
            "  FOREACH_TASK",
            "    FOREACH_ACTION",
            "      STEP write",
            "",
        ]
    )

    pipeline, ast, warnings, errors = parse_pipeline_script_v2(src)
    assert errors == [], f"unexpected errors: {errors}"
    assert isinstance(ast, dict) and ast.get("kind") == "root"
    assert isinstance(pipeline, dict) and isinstance(pipeline.get("blocks"), list)

    out = render_pipeline_script_from_ast(ast)
    # Ensure the new verb renders with correct indentation and stable ordering.
    assert "FOREACH_ACTION" in out
    assert "    FOREACH_ACTION" in out
    assert "      STEP write" in out

    # Round-trip stability: parse(render(parse(src))) renders identically.
    _, ast2, w2, e2 = parse_pipeline_script_v2(out)
    assert e2 == [], f"unexpected errors after roundtrip: {e2}"
    out2 = render_pipeline_script_from_ast(ast2)
    assert _norm(out2) == _norm(out), "roundtrip render mismatch"


if __name__ == "__main__":
    test_roundtrip_foreach_action()
    print("ok - pipeline_foreach_action_roundtrip")
