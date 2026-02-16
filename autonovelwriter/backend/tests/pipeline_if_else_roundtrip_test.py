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
    return (s or "").replace("\r\n", "\n")


def test_roundtrip_if_else_nested() -> None:
    src = "\n".join(
        [
            "# AutoNovelWriter pipeline script v2",
            "ROUND 2",
            "  FOREACH_TASK",
            "    FOREACH_ACTION",
            "      IF task.title",
            "        STEP write",
            "      ELSE",
            "        STEP plan",
            "",
        ]
    )

    pipeline, ast, warnings, errors = parse_pipeline_script_v2(src)
    assert errors == [], f"unexpected errors: {errors}"
    assert isinstance(ast, dict) and ast.get("kind") == "root"
    assert isinstance(pipeline, dict) and isinstance(pipeline.get("blocks"), list)

    out = render_pipeline_script_from_ast(ast)
    assert "IF task.title" in out
    assert "ELSE" in out
    assert "      IF task.title" in out
    assert "      ELSE" in out
    assert "        STEP write" in out
    assert "        STEP plan" in out

    _, ast2, w2, e2 = parse_pipeline_script_v2(out)
    assert e2 == [], f"unexpected errors after roundtrip: {e2}"
    out2 = render_pipeline_script_from_ast(ast2)
    assert _norm(out2) == _norm(out), "roundtrip render mismatch"


def test_if_missing_expr_is_error() -> None:
    src = "\n".join(["# AutoNovelWriter pipeline script v2", "IF", "  STEP write", ""])
    _pipeline, _ast, _warnings, errors = parse_pipeline_script_v2(src)
    assert any(e.get("code") == "if_missing_expr" for e in errors), f"expected if_missing_expr, got: {errors}"


def test_else_without_if_is_error() -> None:
    src = "\n".join(["# AutoNovelWriter pipeline script v2", "ELSE", "  STEP write", ""])
    _pipeline, _ast, _warnings, errors = parse_pipeline_script_v2(src)
    assert any(e.get("code") == "else_without_if" for e in errors), f"expected else_without_if, got: {errors}"


def test_empty_if_body_is_error() -> None:
    src = "\n".join(["# AutoNovelWriter pipeline script v2", "IF x", ""])
    _pipeline, _ast, _warnings, errors = parse_pipeline_script_v2(src)
    assert any(e.get("code") == "if_empty" for e in errors), f"expected if_empty, got: {errors}"


def test_empty_else_body_is_error() -> None:
    src = "\n".join(["# AutoNovelWriter pipeline script v2", "IF x", "  STEP write", "ELSE", ""])
    _pipeline, _ast, _warnings, errors = parse_pipeline_script_v2(src)
    assert any(e.get("code") == "else_empty" for e in errors), f"expected else_empty, got: {errors}"


if __name__ == "__main__":
    test_roundtrip_if_else_nested()
    test_if_missing_expr_is_error()
    test_else_without_if_is_error()
    test_empty_if_body_is_error()
    test_empty_else_body_is_error()
    print("ok - pipeline_if_else_roundtrip")

