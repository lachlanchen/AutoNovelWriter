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

