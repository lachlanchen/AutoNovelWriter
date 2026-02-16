# T025_task_batches_details_and_activate — Summary

## Implement
- Backend:
  - Added batch details endpoint: `GET /api/tasks/batches/<batch_id>` returning manifest + `task_count` + bounded `tasks.jsonl` head/tail preview.
  - Added batch activation endpoint: `POST /api/tasks/batches/<batch_id>/activate` which (when runner is idle):
    - writes current task list to `autonovelwriter/runtime/tasks/tasks.json`
    - persists project-scoped pointer `autonovelwriter/runtime/projects/<project_id>/state/active_tasks.json`
    - broadcasts WS event `tasks_batch_activated`
  - Extended `GET /api/tasks/batches/index` response with `active_batch_id` for status feedback.
- PWA:
  - Task Batches panel now supports “Details” and “Activate” per batch, with status feedback and refresh.
  - Handles WS `tasks_batch_activated` by refreshing the batches panel.
- Added unit-style backend test (no sockets): `autonovelwriter/backend/tests/tasks_batch_activate_unit_test.py`.

## Fixes
- Batch details now returns a more faithful bounded tail preview: tail lines are preserved as raw (`{\"_raw\": ...}`) when JSON decoding fails, instead of being silently skipped.
- Batch activation is allowed while the runner is `paused` (in addition to `idle`) to support “prepare next batch during a pause” workflows.

## I18N
- Added new Task Batches panel strings for “Details”, “Activate”, and the “Active” badge in `autonovelwriter/pwa/app.js`, localized across all required UI languages: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`.

## Next
1. Improve PWA details UX: show batch manifest + tasks preview in a modal/panel (instead of printing a summary into chat).
2. Add `GET /api/tasks/active` (or include active pointer in projects API) so the PWA can show the currently active batch and task list source more explicitly.
3. Extend activation flow with an optional “force” flag and better runner coordination (e.g. allow activation while paused, but warn if cursor is mid-FOREACH_TASK).
4. Add runner-side `FOREACH_ACTION` semantics to execute `task.actions` from batch tasks (ties task batches to Action Library + ActionResult pipeline).

## README
- Documented task batch details/activation endpoints and WS `tasks_batch_activated`.
