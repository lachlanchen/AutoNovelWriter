# T015 Summary: Pipeline script ROUND/FOREACH_TASK parse+render

## Implement
- Backend pipeline script v2 parser now accepts two new structured verbs:
  - `ROUND <n>`: parsed into AST node `kind:"round"` with `repeat=n` and nested children (2-space indentation).
  - `FOREACH_TASK`: parsed into AST node `kind:"foreach_task"` with nested children.
- Renderer preserves these constructs when canonicalizing from AST back to script:
  - emits `ROUND <n>` / `FOREACH_TASK` with correct indentation.
- Validation:
  - maintains strict indentation rules (tabs/odd spaces/indent jumps are errors).
  - adds structured error codes for ROUND count issues and empty containers (`round_*`, `foreach_task_empty`).
  - unknown verbs remain warnings (never silent).
- Traversal helpers now treat `round`/`foreach_task` as loop-like:
  - `_flatten_ast_steps()` includes steps nested under them.
  - `_ast_has_loop()` keeps v2 header when these constructs exist.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\nscript='''ROUND 2\n  STEP plan\n  FOREACH_TASK\n    STEP write\n    STEP summary\n'''\np, ast, w, e = s.parse_pipeline_script_v2(script)\nassert not e\ncanon = s.render_pipeline_script_from_ast(ast)\nassert 'ROUND 2' in canon and 'FOREACH_TASK' in canon\np2, ast2, w2, e2 = s.parse_pipeline_script_v2(canon)\nassert not e2\nprint([b['type'] for b in p2['blocks'] if b.get('enabled', True)])\nPY`

## Fixes
- Updated PWA local pipeline parser/normalizer/renderer to support `ROUND <n>` and `FOREACH_TASK` as container AST nodes (like `LOOP`) so offline validation (fallback) and backend-returned ASTs won’t break UI rendering/indent/outdent.

Verification (no TCP binds):
- `node --check autonovelwriter/pwa/app.js`

## I18N
- Added i18n keys for the new block container labels shown in the PWA pipeline blocks list (`ROUND`, `FOREACH_TASK`) and the `foreach` badge, for all required UI languages.

## Next
1. Runner semantics: implement execution for `ROUND` and `FOREACH_TASK` with persisted loop counters and resume pointers in state.
2. PWA pipeline UI: allow creating/editing container blocks (`ROUND` repeat count, `FOREACH_TASK`) rather than only parsing them from script.
3. Canonicalization: ensure backend `/api/pipeline` always returns a script that includes `ROUND`/`FOREACH_TASK` when present in AST, and that UI round-trips without losing them.
4. Add non-socket tests for parse/render/normalize parity between backend and PWA fallback (golden scripts).

## README
- Updated root `README.md` to document pipeline script v2 container verbs (`ROUND`, `FOREACH_TASK`) and to list `output_created` among the WebSocket events.
