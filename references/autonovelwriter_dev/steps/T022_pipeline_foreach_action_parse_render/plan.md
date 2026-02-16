# T022_pipeline_foreach_action_parse_render — Plan

## Goal
Extend pipeline script v2 parse/render to support a new container:
- `FOREACH_ACTION` (intended to be nested under `FOREACH_TASK`)

Maintain round-trip stability:
`script -> pipeline_ast -> script` preserves indentation semantics and child ordering.

## Architecture / Design Notes

### Storage layout fit
This task changes how the canonical pipeline script is parsed/rendered, and how the derived AST is stored.

No new runtime folders are introduced; it continues to use the existing standardized runtime layout:
- Canonical script: `autonovelwriter/runtime/state/pipeline.script`
- Derived AST cache: `autonovelwriter/runtime/state/pipeline_ast.json` (gitignored runtime)
- Derived flat JSON: `autonovelwriter/runtime/state/pipeline.json` (gitignored runtime)

### Persisted vs derived vs ephemeral
- Persisted (canonical):
  - `pipeline.script` (formatted text).
- Persisted (derived cache, safe to regenerate):
  - `pipeline_ast.json` and `pipeline.json` (derived from canonical script).
- Ephemeral:
  - Request-local parse warnings/errors; UI selection state; runner in-memory execution frames.

### Gitignore expectations
Runtime state remains gitignored under `autonovelwriter/runtime/**`.
New code/test files are source-controlled.

### API / WS events (observability + resumability)
No new endpoints are required:
- Existing `GET/POST /api/pipeline` and `POST /api/pipeline/validate` will return updated `pipeline_ast`.
- Existing WS broadcast `pipeline_updated` already carries the canonical script + warnings.

Runner resumability is unchanged in this task; it will continue to invalidate the cursor on script hash mismatch.
(A later runner task can execute `FOREACH_ACTION` semantics.)

## Implementation Outline (for next stage)

### Backend: AST + parse/render
Update `autonovelwriter/backend/server.py` v2 pipeline helpers:
- Add AST constructor: `_ast_foreach_action(children: list) -> dict` returning `{"kind":"foreach_action","children":[...]}`.
- Update AST walkers to include the new kind:
  - `_flatten_ast_steps()` should traverse `foreach_action`.
  - `_ast_has_loop()` should treat `foreach_action` as a container (so header remains v2).
- Update renderer `render_pipeline_script_from_ast()`:
  - emit `FOREACH_ACTION` for `kind == "foreach_action"` with correct indentation and children order.
- Update parser `parse_pipeline_script_v2()`:
  - recognize verb `FOREACH_ACTION` (like `FOREACH_TASK`).
  - push a new stack frame and enforce non-empty children (fatal error `foreach_action_empty`).
  - accept as a top-level container for robustness, but add a warning if not nested under `FOREACH_TASK` (optional; keep minimal if warning plumbing is awkward).

### PWA fallback parser/renderer (recommended)
PWA’s local fallback parser/renderer in `autonovelwriter/pwa/app.js` should be updated similarly so offline/WS-down editing stays consistent:
- Add `kind: 'foreach_action'` support in:
  - `normalizePipelineAst`, `flattenAstSteps`, `astHasLoop`, `renderScriptFromAst`, `parseScriptToAst`.
- Add display label key:
  - `pipeline.verb_foreach_action` (i18n for 11 languages).

(If we skip PWA in this task, backend-connected UI will work, but offline validate/fallback will reject `FOREACH_ACTION` scripts.)

### Tests / fixtures
Add a tiny unit-style test (no server bind) to validate round-trip and indentation:
- Example script fixture (covers acceptance nesting):
  - `ROUND 2`
    - `FOREACH_TASK`
      - `FOREACH_ACTION`
        - `STEP write`
- Assertions:
  - parse ok, no fatal errors.
  - AST contains the new container kind.
  - render(script_from_ast(parse(script))) produces canonical formatting (2-space indentation, stable order).

## Files To Change / Create (Implementation Stage)
- Backend:
  - `autonovelwriter/backend/server.py`
  - (new) `autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` (plain asserts, runnable via `python3 ...`)
- PWA (fallback + display):
  - `autonovelwriter/pwa/app.js`
  - (optional) update any CSS only if new UI strings require it (unlikely)

## Acceptance Checklist
- [ ] Parser accepts `FOREACH_ACTION` as a container block with indented children.
- [ ] Renderer outputs `FOREACH_ACTION` with correct indentation and children ordering.
- [ ] Round-trip fixtures cover: `ROUND -> FOREACH_TASK -> FOREACH_ACTION -> STEP <action_id>`.
- [ ] Backend stores updated AST alongside canonical script without breaking existing scripts.
- [ ] No TCP binds; minimal python/js checks or unit tests pass.

## Minimal Verification Commands (No TCP binds)
```bash
python3 -m py_compile autonovelwriter/backend/server.py
node --check autonovelwriter/pwa/app.js
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
```

