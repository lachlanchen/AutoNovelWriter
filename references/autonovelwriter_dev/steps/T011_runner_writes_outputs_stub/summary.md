# T011 Summary: Runner writes drafts/revisions to outputs (stub)

## Implement
- Backend runner executes a real stub action for the `write` block:
  - Writes a draft markdown file into the active project outputs folder:
    - `autonovelwriter/runtime/projects/<project_id>/outputs/`
  - Persists per-block completion and output path under:
    - `autonovelwriter/runtime/state/task_status.json` (`blocks.write.output_paths`)
  - Emits observability signals:
    - WS event: `output_created` with the created path
    - WS log line: `[output] created: <path>`
  - Idempotency: if `blocks.write` is already `done` and the referenced output exists, the runner logs a skip and does not re-create the draft.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`

## Fixes
- Persist `project_rel_path` alongside absolute paths for created outputs (and include it in the `output_created` WS event).
- If draft write fails, persist per-block `status="error"` and mark the task `status="error"` (do not finalize to `done`).

## I18N
- No PWA user-facing strings were added/changed in this task. The new `output_created` WS event and runner log lines are backend-side diagnostics and are not localized.

## Next
1. Switch runner execution to use v2 pipeline parsing/AST (including loop repeat semantics) so it matches the PWA nested block view.
2. Add a small outputs index API (`GET /api/outputs/index`) and/or PWA UI handling of `output_created` to surface created drafts.
3. Extend `task_status.json` schema to track per-block start/end + errors consistently and keep tasks retriable instead of terminal error.

## README
- Documented the `STEP write` stub output behavior (outputs path + `output_created` WS event) in `README.md`.
