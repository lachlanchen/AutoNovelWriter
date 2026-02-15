# T017 Debug: Runner: meta_tasks_generate writes task batch

## Acceptance Review
- Creates a new batch folder + JSONL on disk:
  - PASS: runner action writes `autonovelwriter/runtime/tasks/batches/<batch_id>/tasks.jsonl` and `manifest.json`.
- WS/log includes batch path and task count:
  - PASS: runner logs `[tasks] created batch: ... count=<n>` and broadcasts WS event `tasks_batch_created` including `batch_dir`, `tasks_jsonl`, `task_count`.
- Task status persists and records completion with output paths:
  - PASS: updates `autonovelwriter/runtime/state/task_status.json` under `st[task_id].blocks.meta_tasks_generate` with `status:"done"` and `output_paths`.

## Issues / Risks

### Medium: Runner semantics are per-task (FOREACH not yet executed as real control flow)
- Current runner flattens the AST into a single list of steps and runs them for each task; `ROUND`/`FOREACH_TASK` are still grouping-only.
- Impact: if a pipeline script places `meta_tasks_generate` “outside” a `FOREACH_TASK` container, it will still effectively run once per task (because everything is flattened).
- Follow-up: implement true execution semantics for `ROUND`/`FOREACH_TASK` so `meta_tasks_generate` can be a “global” step (generate a new tasks batch) before iterating tasks.

### Medium: Generated batch is not wired into the active task list
- The stub writes a batch folder but does not update `autonovelwriter/runtime/tasks/tasks.json` (the runner’s current task source).
- Impact: batches are observable artifacts only; runner won’t pick them up automatically.
- Follow-up: add a “promote batch to tasks.json” step or a backend API to set the active task list from a batch.

### Low: PWA does not currently consume `tasks_batch_created`
- The PWA may ignore this WS event (no UI panel for task batches yet).
- Impact: acceptance is still met (WS/log exists), but the user won’t see the batch creation in the UI unless they tail logs.

### Low: Block type parity is manual
- Backend and PWA maintain separate allowed-type lists; `meta_tasks_generate` was added to both.
- Impact: future block types risk getting dropped offline or rejected by backend if one side isn’t updated.
- Follow-up: consider having backend return allowed types in `/api/pipeline` metadata so PWA can treat them as data.

## Notes
- Separation preserved: writes only under `autonovelwriter/runtime/` (no interaction with driver queue under `references/autonovelwriter_dev/`).
