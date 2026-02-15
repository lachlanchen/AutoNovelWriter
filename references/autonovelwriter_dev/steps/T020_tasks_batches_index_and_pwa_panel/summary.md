# T020 Summary: Task batches: index API + PWA panel

## Implement
- Backend:
  - Added `GET /api/tasks/batches/index` to list on-disk batches under `autonovelwriter/runtime/tasks/batches/` (manifest-first, best-effort fallbacks) (`autonovelwriter/backend/server.py`).
  - Added helper `list_task_batches(paths, limit=...)` returning stable batch fields: `batch_id`, `batch_dir`, `tasks_jsonl`, `task_count`, `created_utc`.
- PWA:
  - Added a “Task Batches” panel listing recent batches (`autonovelwriter/pwa/index.html`, `autonovelwriter/pwa/app.js`).
  - Hooked WS `tasks_batch_created` to show a notification and refresh the panel automatically.
  - Added i18n keys `tasks_batches.*` across 11 UI languages.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `node --check autonovelwriter/pwa/app.js`
- Unit-style index call: `list_task_batches()` returns expected fields from disk.

## Fixes
- Added optional `?project=<project_id>` filtering to `/api/tasks/batches/index` (filters by `project_id` from batch manifests when present) and updated the PWA to request batches scoped to the active project.
- Added a file-size guard when falling back to counting `tasks.jsonl` lines for `task_count` (skips counting very large files).

## I18N
- Added i18n keys for the new PWA Task Batches panel across 11 UI languages:
  - `tasks_batches.title`, `tasks_batches.empty`, `tasks_batches.created`

## Next
1. Add an optional `GET /api/tasks/batches/<batch_id>` (manifest + tail of `tasks.jsonl`) so the PWA can expand a batch to view its tasks without opening files manually.
2. Link batch selection to “activate this batch into tasks.json” (explicit user action) so the runner can pick a chosen batch as the active task list.
3. Add a small size/entry cap to the index handler response body (e.g. max 500 batches, and omit very long paths) and surface a warning in the PWA when truncation occurs.

## README
- Updated `README.md` to document `GET /api/tasks/batches/index` and that the PWA Task Batches panel refreshes on WS `tasks_batch_created`.
