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

