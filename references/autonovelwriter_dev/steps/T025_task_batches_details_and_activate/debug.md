# T025_task_batches_details_and_activate — Debug Review

## Medium
- **TasksBatchDetails “tail” is JSON-only, not raw**
  - Details endpoint uses `_read_jsonl_tail()` which only returns decoded JSON objects, skipping malformed lines.
  - Acceptance asks for “bounded preview/tail of `tasks.jsonl`”; this is acceptable but may hide useful raw debugging context if JSONL lines are invalid.

## Medium
- **Activation safety gate is coarse**
  - `POST /api/tasks/batches/<id>/activate` blocks activation whenever runner status is not `idle` (409).
  - This is safe, but it means users cannot “prepare” the next batch during a paused run. Might be fine for now; consider allowing activation while paused but not running, or requiring explicit `force=true`.

## Low
- **PWA details UX is chat-log based**
  - PWA “Details” currently prints a short summary into the chat log rather than opening a dedicated modal/panel.
  - This meets “can open details” minimally, but it’s easy to lose and hard to read for larger previews.

## Acceptance Coverage Check
- Backend details endpoint: implemented (`GET /api/tasks/batches/<batch_id>` with manifest + task_count + head/tail preview).
- Backend activate endpoint: implemented with project-scoped pointer `projects/<project_id>/state/active_tasks.json` and writes `tasks/tasks.json`.
- PWA details + activate: implemented with clear buttons + active badge + status feedback.
- WS activation broadcast: implemented (`tasks_batch_activated`) and PWA refreshes on it.
- i18n: new Task Batches strings added for all required UI languages.
- No TCP binds: `py_compile`, `node --check`, and unit test pass.

## Separation / Clarity
- Driver stages vs in-app pipelines: no conflation introduced.
- Pipeline script remains canonical; activation is runtime state affecting the task list consumed by `FOREACH_TASK`.

