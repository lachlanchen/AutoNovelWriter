# T012 Summary: Runner executes v2 pipeline script/AST

## Implement
- Runner now derives enabled steps using the canonical v2 pipeline parser (`parse_pipeline_script_v2`) so execution order matches the PWA’s nested pipeline script/AST semantics (deterministic AST preorder; LOOP repeat counts still ignored).
- Runner logs pipeline parse warnings/errors; on fatal parse errors it falls back to a safe default pipeline instead of running an ambiguous step list.
- Added a tiny helper for unit-style verification without starting the server:
  - `flatten_enabled_steps_from_script_v2(script) -> (enabled_steps, warnings, errors)`

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\nscript='''# test\nLOOP 2\n  STEP plan\n  LOOP 3\n    STEP write\nSTEP summary\n'''\nsteps, w, e = s.flatten_enabled_steps_from_script_v2(script)\nprint(steps)\nassert steps == ['plan','write','summary']\nassert e == []\nPY`

## Fixes
- Runner now stops the run on fatal v2 pipeline parse errors (logs errors and transitions to `idle`) instead of executing the default pipeline.

## I18N
- No PWA user-facing strings were added/changed in this task (runner-only behavior and backend logs).

## Next
1. Implement LOOP repeat semantics in the runner (deterministic counters + persisted resume pointers).
2. Add a runner-visible “pipeline invalid” state (persisted) and surface it in the PWA instead of relying on logs.
3. Extend the pipeline script grammar for the desired default layout (`ROUND`, `FOREACH_TASK`, editable prompts/params) and update script <-> blocks rendering accordingly.
