# T018 Plan: Runner: execute ROUND/FOREACH_TASK semantics

## Architecture / Design Note

### Fit With Standardized Storage Layout
- Materials/inputs:
  - `autonovelwriter/runtime/projects/<project_id>/materials/`
  - `autonovelwriter/runtime/state/chat.jsonl` and `autonovelwriter/runtime/io/inbox/` (interruptions)
- Tasks:
  - Active task list: `autonovelwriter/runtime/tasks/tasks.json`
  - (Optional) batches: `autonovelwriter/runtime/tasks/batches/<batch_id>/...`
- Outputs:
  - `autonovelwriter/runtime/projects/<project_id>/outputs/`
- Logs/state:
  - `autonovelwriter/runtime/logs/runner.log`
  - `autonovelwriter/runtime/state/task_status.json` (per-task + per-block completion, output paths)
  - `autonovelwriter/runtime/state/runner_state.json` (runner status + persisted execution cursor for resume)

This task changes the runner’s *in-app pipeline* execution semantics only. It must not touch the driver’s dev-task queue under `references/autonovelwriter_dev/`.

### Persisted vs Derived vs Ephemeral
- Persisted:
  - Execution cursor in `runner_state.json`:
    - `round_index` (0-based), `round_repeat_total`
    - `task_index` (0-based within current tasks list) and `task_id`
    - `ast_path` (path of indices to the current node in `pipeline_ast`)
    - `phase`: `"global"` vs `"foreach"` (whether we’re executing outside/inside `FOREACH_TASK`)
  - Per-task per-block completion in `task_status.json` (existing; used to avoid duplicating outputs).
- Derived:
  - `pipeline_ast` is derived from the canonical pipeline script; execution plan is derived from AST.
- Ephemeral:
  - In-memory “execution frame stack” while running (container context for logging/events).

Gitignore expectations:
- All of `autonovelwriter/runtime/` is mutable runtime state and remains gitignored.

### API/WS Events For Observability + Resumability
No new HTTP endpoints required; runner behavior changes should be observable via existing WS/log channels.
- `run_status` (existing): extend payload (and runner_state persistence) to include cursor fields:
  - `round_index`, `round_repeat_total`, `phase`, `ast_path`, and current `task_id`/`block`
- `task_status` (existing): include container context when broadcasting:
  - `round_index`, `phase` and/or `container_stack` summary
- `log` (existing): prefix lines with container context, e.g.:
  - `[runner] round=1/2 phase=global block=meta_tasks_generate ...`
  - `[runner] round=1/2 phase=foreach task=... block=write ...`

Resumability rules:
- On restart, load `runner_state.json` cursor and continue from the *next unfinished* node, using `task_status.json` as the source of truth for already-completed outputs.
- If the pipeline script hash changes since the cursor was saved, fail safe:
  - pause/idle with a clear log message and require user to restart run (cursor invalidated).

## Files To Change / Create
- `autonovelwriter/backend/server.py`
  - Replace flatten-only step loop in `Runner._run_loop()` with an AST-driven executor:
    - Walk the AST with true container semantics:
      - `ROUND <n>` repeats its children `n` times (global context).
      - `FOREACH_TASK` runs its children once per task (task context).
      - Steps outside `FOREACH_TASK` run once per run (or per round iteration if nested under ROUND).
    - Persist cursor frequently (after each block completion) into `runner_state.json`.
    - Broadcast `run_status`/`task_status` with container context.
  - Add helpers:
    - `iter_ast(ast)` with stack frames and stable `ast_path`
    - `load_cursor()/save_cursor()` with pipeline script hash to detect invalidation

## Acceptance Checklist
- Semantics:
  - For script:
    - `ROUND 2`
      - `STEP meta_tasks_generate`
      - `FOREACH_TASK`
        - `STEP write`
  - `meta_tasks_generate` runs once per round (2 times total) and not once per task.
  - `write` runs for each task under `FOREACH_TASK`.
- Resumability:
  - Cursor persisted in `runner_state.json`.
  - After restart, runner resumes from next unfinished `(round_index, task_index, block)` without duplicating outputs already recorded in `task_status.json`.
- Observability:
  - WS `run_status`/`task_status` and `runner.log` include round index + whether we are in global vs foreach execution.

## Minimal Verification Commands (No TCP Binds)
- Syntax/import:
  - `python3 -m py_compile autonovelwriter/backend/server.py`
- Unit-style harness (no server bind):
  - `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\npaths=s.resolve_paths(); s.ensure_runtime_dirs(paths)\n# Build a small pipeline script with ROUND/FOREACH and call the new executor helpers directly.\nprint('ok')\nPY`
