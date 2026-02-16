#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
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


def test_reference_writer_pipeline_builder_basic() -> None:
    sample = "\n".join(
        [
            "#!/usr/bin/env bash",
            "main() {",
            '  run_local_action "A_init_scaffold" "init"',
            "  for v in 1 2 3; do",
            '    run_action_with_prompt_file "A000_source_materials" "src"',
            "    c=1",
            "    while true; do",
            '      run_action_with_prompt_file "V$(printf \'%02d\' \"$v\")C$(printf \'%02d\' \"$c\")_write" "w"',
            "      done",
            "  done",
            "}",
            "",
        ]
    )

    out = _server.build_reference_writer_pipeline_from_text(sample)
    assert isinstance(out, dict)
    assert "pipeline_ast" in out and isinstance(out["pipeline_ast"], dict)
    assert "script" in out and isinstance(out["script"], str)
    assert "action_map" in out and isinstance(out["action_map"], list)
    assert len(out["action_map"]) >= 3

    script = out["script"]
    assert "ROUND 3" in script, script
    assert "STEP a_init_scaffold" in script, script
    assert "STEP a000_source_materials" in script, script
    assert "STEP v_var_" in script, script

    _, _, warnings, errors = _server.parse_pipeline_script_v2(script)
    assert errors == [], f"expected no parser errors, got: {errors}"
    # Unknown action ids are expected here; parser should keep them as warnings only.
    assert isinstance(warnings, list)


if __name__ == "__main__":
    test_reference_writer_pipeline_builder_basic()
    print("ok - reference_writer_pipeline_unit")
