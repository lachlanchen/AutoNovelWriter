# T022_pipeline_foreach_action_parse_render — Debug Review

## Acceptance Coverage
- Parser accepts `FOREACH_ACTION` as a container with indented children:
  - Backend: `parse_pipeline_script_v2()` now recognizes `FOREACH_ACTION` and builds `{"kind":"foreach_action","children":[...]}`.
  - PWA fallback: `parseScriptToAst()` recognizes `FOREACH_ACTION` and validates non-empty containers.
- Renderer outputs `FOREACH_ACTION` with correct indentation/order:
  - Backend: `render_pipeline_script_from_ast()` emits `FOREACH_ACTION` and recursively renders children with +1 indent.
  - PWA fallback: `renderScriptFromAst()` emits `FOREACH_ACTION` similarly.
- Round-trip fixture:
  - `autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` covers `ROUND -> FOREACH_TASK -> FOREACH_ACTION -> STEP write` and asserts `render(parse(render(parse(src))))` stability.
- Backend stores updated AST alongside canonical script:
  - `GET/POST /api/pipeline` and `POST /api/pipeline/validate` already persist `pipeline_ast.json` derived from canonical script; adding a new container kind doesn’t change the storage contract.
- Verification (no TCP binds):
  - `python3 -m py_compile autonovelwriter/backend/server.py`
  - `node --check autonovelwriter/pwa/app.js`
  - `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py`

## Issues / Risks
- **Runner semantics are intentionally incomplete**: `Runner._cursor_next_step()` treats `foreach_action` as a generic container that runs its children once, not “for action in task.actions”. This is OK for this task’s scope (parse/render), but it’s important to avoid assuming the loop is “real” yet.
- **Backend parser docstring/comments lag**: `parse_pipeline_script_v2()` header comments still describe only LOOP/STEP; not functional, but could mislead future edits.
- **Nesting policy not enforced**: The backend currently allows `FOREACH_ACTION` anywhere (including top-level). The task notes say “nested under FOREACH_TASK”, but enforcement is not required by acceptance; consider adding a warning later if needed.

## Operability / Resumability Notes
- Canonical script remains the source of truth; `FOREACH_ACTION` only changes derived AST and the script rendering.
- Runner cursor hash invalidation behavior is unchanged: editing scripts still changes the pipeline hash and should stop/invalidate as before.
- UI light theme is unaffected (no styling changes required for this task).

