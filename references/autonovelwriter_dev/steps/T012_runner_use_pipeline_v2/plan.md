# T012 Plan: Runner executes v2 pipeline script/AST

## Design Note (Storage + Persist/Derive + Observability)
- Storage fit (standard layout):
  - Runner reads the canonical pipeline script from:
    - `autonovelwriter/runtime/state/pipeline.script`
  - Runner derives a nested AST + flattened enabled step list from v2 parsing (indent + `LOOP <n>`):
    - AST may be cached at `autonovelwriter/runtime/state/pipeline_ast.json` (already written by `/api/pipeline`), but the runner should re-derive from the script for correctness.
  - Runner state and task status remain persisted under:
    - `autonovelwriter/runtime/state/runner_state.json`
    - `autonovelwriter/runtime/state/task_status.json`
- Persisted vs derived vs ephemeral (and gitignore):
  - Persisted (gitignored runtime):
    - `pipeline.script`, `runner_state.json`, `task_status.json`, logs
  - Derived:
    - `pipeline_ast.json` (cache); flattened steps list derived from AST preorder
  - Ephemeral:
    - in-memory flattened step list, loop traversal, WS event stream
- Observability/resumability API/WS expectations:
  - No new endpoints required.
  - Continue using existing WS events:
    - `run_status` (runner status + current block)
    - `task_status` (task lifecycle)
    - `log` (include parse warnings/errors and a stable “flattened steps” summary if helpful)
  - Optional small addition (if needed for operability): log `pipeline_script_hash` alongside `run_status` so the UI can correlate what version of the pipeline was executed.

## Execution Semantics (v2 + LOOP)
- Use `parse_pipeline_script_v2(script)` (same as `/api/pipeline`) to get:
  - `pipeline_ast` (nested)
  - `pipeline.blocks` (flat list derived from `_flatten_ast_steps()`)
  - `warnings`/`errors`
- Flattening rule for this task:
  - Deterministic preorder traversal of the AST.
  - **Ignore `LOOP repeat` counts initially** (treat `LOOP` as grouping only), matching current `_flatten_ast_steps()` behavior.
  - If `parse_pipeline_script_v2` returns fatal errors, runner should:
    - log structured error(s)
    - fall back to a safe default pipeline (or no-op) rather than executing an ambiguous list.

## Files To Change/Create
- Backend:
  - Change: `autonovelwriter/backend/server.py`
    - In `Runner._run_loop()`:
      - replace any remaining non-v2 derivation with `parse_pipeline_script_v2`
      - filter enabled steps based on AST-derived blocks
      - log parse warnings/errors (do not silently ignore)
    - Add a tiny helper for testability (pure function):
      - e.g. `flatten_enabled_steps_from_script_v2(script) -> list[str]`
  - Create (optional): `autonovelwriter/backend/tests/test_pipeline_flatten.py` (or a small script under `autonovelwriter/backend/`) that asserts flatten order for a sample nested LOOP script.

## Acceptance Checklist
- Runner uses v2 parsing:
  - Runner derives enabled steps using `parse_pipeline_script_v2` (same canonical logic as `/api/pipeline`).
- Deterministic order:
  - A script containing nested `LOOP` blocks results in a deterministic flattened execution order that matches AST preorder (with LOOP treated as grouping).
- Verification without sockets:
  - `python3 -m py_compile autonovelwriter/backend/server.py` passes.
  - A small unit-style test (no server) can parse a nested LOOP script and confirm flattened step order.

## Minimal Verification Commands (No TCP Binds)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- Unit-style flatten check (example):
  - `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\nscript='''# test\\nLOOP 2\\n  STEP plan\\n  LOOP 3\\n    STEP write\\nSTEP summary\\n'''\np, ast, w, e = s.parse_pipeline_script_v2(script)\nprint([b['type'] for b in p['blocks'] if b.get('enabled', True)])\nassert [b['type'] for b in p['blocks'] if b.get('enabled', True)] == ['plan','write','summary']\nPY`

