# T020 Debug: Task batches: index API + PWA panel

## Acceptance Review

### 1) Backend `GET /api/tasks/batches/index` stable fields
- Implemented route: `/api/tasks/batches/index` (`autonovelwriter/backend/server.py`).
- Indexing source of truth: on-disk manifests under `autonovelwriter/runtime/tasks/batches/<batch_id>/manifest.json` (fallbacks to mtime/tasks.jsonl if missing).
- `list_task_batches()` returns at least the acceptance fields per record:
  - `batch_id`, `batch_dir`, `tasks_jsonl`, `task_count`, `created_utc`
- Response is bounded via `limit` (default 500).

Status: **Meets acceptance**.

### 2) PWA displays batches and refreshes on WS `tasks_batch_created`
- Added “Task Batches” list (`#batchesList`) and renders from `GET /api/tasks/batches/index`.
- WS handler now reacts to `tasks_batch_created` by:
  - showing an immediate message using localized `tasks_batches.created`
  - scheduling a refresh via `scheduleBatchesRefresh()`
- Also refreshes on `project_active_changed` (safe even if batches are global; keeps panel consistent with other panels).

Status: **Meets acceptance**.

### 3) Operable without extra ports; verification hooks
- Backend: `python3 -m py_compile autonovelwriter/backend/server.py` passes.
- PWA: `node --check autonovelwriter/pwa/app.js` passes.
- Unit-style indexing call works (no server bind): `list_task_batches()` can scan runtime and return batches.

Status: **Meets acceptance**.

## Issues / Risks
- Task batches are currently global (under `runtime/tasks/batches/`) rather than per-project; the API returns `project_id` from the manifest when present, but the endpoint is not scoped by project. This is OK for now, but if/when multiple projects are used concurrently, consider:
  - query filter by `project_id`, or
  - per-project batches root under `runtime/projects/<project_id>/tasks/batches/`.
- `task_count` fallback may count lines in `tasks.jsonl` (bounded at 100k). For extremely large batches, consider storing counts only in manifest and skipping counting.

## Separation / Path Clarity
- No coupling to the driver queue/state under `references/autonovelwriter_dev/`.
- Index reads only from `autonovelwriter/runtime/` (gitignored runtime state).

