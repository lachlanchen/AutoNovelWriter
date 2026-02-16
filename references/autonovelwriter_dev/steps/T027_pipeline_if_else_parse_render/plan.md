## Plan (T027_pipeline_if_else_parse_render)

### Architecture / Design Notes
- Canonical artifact remains the formatted pipeline script at `autonovelwriter/runtime/state/pipeline.script` (gitignored).
- Derived artifacts:
  - `autonovelwriter/runtime/state/pipeline_ast.json`: nested AST used by UI + runner (gitignored).
  - `autonovelwriter/runtime/state/pipeline.json`: flattened blocks list for legacy/simple rendering (gitignored).
- Persisted vs derived vs ephemeral:
  - Persisted: canonical script, runner cursor/state, ActionResults, task batches, project state.
  - Derived: `pipeline_ast` + flattened `pipeline` computed from script; should be fully reproducible from the script.
  - Ephemeral: UI selection/drag state, transient validation previews.
- Gitignore: all of `autonovelwriter/runtime/**` stays mutable runtime state; this task only changes how the script is parsed/rendered and how derived AST is represented.

### IF/ELSE Grammar + AST Shape
- Add two new v2 verbs:
  - `IF <expr>`: starts a conditional container; `<expr>` is stored as a raw string (no evaluation in this task).
  - `ELSE`: optional sibling clause at the same indentation level as the `IF` body (within the same parent container).
- AST node shape (backend + PWA local fallback should match):
  - `{ kind: "if", expr: "<raw>", then_children: [...], else_children: [...] }`
  - `else_children` may be an empty list when ELSE is absent.
- Rendering:
  - Emit `IF <expr>` at the node level, followed by indented `then_children`.
  - If `else_children` exists and is non-empty (or ELSE explicitly present), emit `ELSE` then indented `else_children`.
  - Use 2 spaces per indentation level (consistent with existing containers).

### Runner Semantics / Resumability
- Runner semantics remain a stub:
  - Treat `if` as a container that executes `then_children` only (ignore ELSE for now).
  - Cursor traversal must recognize `if` nodes as containers so pipelines containing IF do not break runner resumability.
- No new WS events needed; IF/ELSE changes flow through existing `pipeline_updated` and `/api/pipeline/validate` responses.

### API / WS Observability (No New Endpoints)
- `/api/pipeline` and `/api/pipeline/validate` continue to be the source of parse/render truth.
- `pipeline_updated` WS events already distribute the canonical script; PWA re-validates and rebuilds local AST.

### Files To Change / Create
- Backend:
  - `autonovelwriter/backend/server.py`
    - Extend `parse_pipeline_script_v2()` to parse `IF <expr>` and `ELSE` with correct indentation rules.
    - Extend `render_pipeline_script_from_ast()` to render `if` nodes.
    - Extend AST helpers/traversals to include `if` (flatten steps; detect loops/containers; validation of empty containers).
    - Extend runner cursor traversal to treat `if` as a container (execute `then_children` only).
  - `autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` (new)
    - Roundtrip: script -> ast -> script stable for nested IF/ELSE under ROUND/FOREACH_TASK/FOREACH_ACTION.
    - Validate common error cases: missing expr, ELSE without IF, empty IF body, ELSE without body (as applicable).
- PWA (recommended for offline parity; keep small):
  - `autonovelwriter/pwa/app.js`
    - Update local fallback `parseScriptToAst()` and `renderScriptFromAst()` to support `if` nodes with `IF/ELSE` verbs.
    - Update AST normalization to preserve `if` nodes (and any container detection used by UI).

### Acceptance Checklist
- Parser accepts `IF <expr>` with indented body and optional `ELSE` and produces an `if` node in `pipeline_ast`.
- Renderer emits canonical IF/ELSE formatting with correct indentation.
- Roundtrip unit test added and passing: `script -> ast -> script` stable with IF/ELSE nested under ROUND/FOREACH_TASK/FOREACH_ACTION.
- `/api/pipeline/validate` reports helpful errors for malformed IF/ELSE:
  - missing `<expr>`
  - `ELSE` without a matching open IF at that indentation
  - empty IF body (and empty ELSE body if ELSE is present)
- No TCP binds; syntax/import checks pass.

### Minimal Verification Commands (No Server Start)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py`
- If PWA fallback is updated: `node --check autonovelwriter/pwa/app.js`

