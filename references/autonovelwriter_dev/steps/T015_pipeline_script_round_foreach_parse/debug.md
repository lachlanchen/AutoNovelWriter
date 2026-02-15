# T015 Debug: Pipeline script ROUND/FOREACH_TASK parse+render

## Acceptance Review
- Parser accepts new verbs and produces nested AST:
  - `ROUND <n>` -> `kind:"round"` with children.
  - `FOREACH_TASK` -> `kind:"foreach_task"` with children.
  - Indentation rules remain strict (2 spaces, no tabs, no indent jumps).
- Renderer round-trips with constructs preserved:
  - `render_pipeline_script_from_ast()` emits `ROUND <n>` and `FOREACH_TASK` with correct indentation.
  - Parse -> render -> parse retains structured nodes.
- Validation produces structured errors/warnings:
  - New error codes exist: `round_missing_repeat`, `round_repeat_not_int`, `round_repeat_out_of_range`, `round_empty`, `foreach_task_empty`.
  - Unknown verbs remain warnings (`unknown_verb`) and are not silent.

## Issues / Risks

### High: PWA local parser fallback does not understand ROUND/FOREACH_TASK
- `autonovelwriter/pwa/app.js` contains a local parser fallback (`parseScriptToAst`) used when `/api/pipeline/validate` is unreachable.
- That fallback likely only supports `STEP`, `DISABLED`, `LOOP`, so users offline (or with backend down) may see errors or lossy behavior when editing scripts containing `ROUND`/`FOREACH_TASK`.
- Follow-up: extend the PWA fallback parser/render to match backend grammar, or hard-disable fallback for scripts containing new verbs (with a clear warning).

### Medium: FOREACH_TASK tokens beyond the verb are only a warning
- Current behavior warns `too_many_tokens` but still creates the node.
- That’s acceptable, but consider making it an error if strictness is desired for canonical scripts.

### Medium: Flattening semantics ignore ROUND and FOREACH_TASK repeat/iteration behavior
- `_flatten_ast_steps()` treats these nodes as grouping only; runner will execute a single preorder pass.
- This is fine for parse/render acceptance but not for real execution semantics (needs persisted loop counters + resume pointers).

## Notes
- Separation between driver stages vs in-app pipeline steps remains intact (these are in-app script verbs).
- No light-theme impact (backend-only change).

