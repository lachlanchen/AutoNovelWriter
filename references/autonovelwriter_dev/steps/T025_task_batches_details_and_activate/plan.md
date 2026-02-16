# T025_task_batches_details_and_activate — Plan

## Goal
Build on `GET /api/tasks/batches/index` by adding:
1. **Batch details API** (manifest + bounded preview of `tasks.jsonl`).
2. **Activate batch flow** so a selected batch becomes the current task list for `FOREACH_TASK` (per active project).
3. Minimal PWA interaction in the Task Batches panel to view details and activate.

## Architecture / Design Notes

### Fit With Standardized Storage Layout
Existing batch storage:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`
  - `manifest.json`
  - `tasks.jsonl`

Activation should be **project-scoped** (so different projects can have different active task lists):
- Persist an “active tasks source” pointer under:
  - `autonovelwriter/runtime/projects/<project_id>/state/active_tasks.json`
    - `{ "source": "batch", "batch_id": "...", "batch_dir": "...", "tasks_jsonl": "...", "activated_utc": "...", "task_count": N }`

The runner already reads tasks from:
- `autonovelwriter/runtime/tasks/tasks.json`

T025 will implement activation by:
- reading the selected batch’s `tasks.jsonl`
- converting it to the current tasks list and writing `autonovelwriter/runtime/tasks/tasks.json`
- persisting the per-project pointer in `projects/<project_id>/state/active_tasks.json`

This keeps the canonical pipeline script untouched (still `FOREACH_TASK`), and keeps task activation as runtime state.

### Persisted vs Derived vs Ephemeral
- Persisted:
  - `projects/<project_id>/state/active_tasks.json` (which batch is active)
  - `tasks/tasks.json` (the concrete task list that `FOREACH_TASK` iterates)
- Derived:
  - Details response preview (computed by reading manifest + a bounded slice of `tasks.jsonl`)
- Ephemeral:
  - PWA “details modal” open state and selected batch id

### What Must Be Gitignored
All of the above lives under `autonovelwriter/runtime/` which is already gitignored.
No secrets should be introduced (only task text and metadata).

### API / WS Events For Observability + Resumability
Backend REST:
- `GET /api/tasks/batches/<batch_id>`:
  - returns `manifest` (best-effort), `task_count`, and a bounded `preview` of `tasks.jsonl` (e.g. first 20 lines, plus total count if known)
  - includes `batch_dir`, `tasks_jsonl` paths for debugging/operability
- `POST /api/tasks/batches/<batch_id>/activate` (body optional):
  - activates for the **active project**
  - writes `tasks/tasks.json`
  - writes `projects/<project_id>/state/active_tasks.json`
  - returns `{ok, project_id, batch_id, task_count}`

WebSocket:
- broadcast `tasks_batch_activated`:
  - `{type, ts_ms, project_id, batch_id, task_count}`
  - PWA uses this to refresh task batches panel and show status feedback.

Resumability considerations:
- Activation is persisted in `active_tasks.json`; UI can display which batch is currently active on load.
- Runner uses `tasks/tasks.json`; changing tasks while a run is active should be treated carefully:
  - For now: allow activation when runner is idle, or warn/return 409 if runner is running (small safety gate).

## PWA Changes (Minimal)
In Task Batches panel list items:
- Add a “Details” action (opens a small modal/panel) that calls `GET /api/tasks/batches/<batch_id>`.
- Add an “Activate” action that calls `POST /api/tasks/batches/<batch_id>/activate`.
- Display clear status feedback:
  - show “Active” badge on the active batch (requires backend to expose active batch id, either via details endpoint or an `active_tasks` field in index response).

## Files To Change / Create (Implementation Stage)
- Backend:
  - `autonovelwriter/backend/server.py`
    - add `active_tasks_json` path helper (project-scoped)
    - implement `TasksBatchDetailsHandler` and `TasksBatchActivateHandler`
    - add WS broadcast `tasks_batch_activated`
    - add helper to parse `tasks.jsonl` into tasks list format used by `tasks/tasks.json`
  - `autonovelwriter/backend/tests/tasks_batch_activate_unit_test.py` (no sockets):
    - create temp runtime with a fake batch folder containing manifest + tasks.jsonl
    - call handler helpers directly (or call activate helper function)
    - assert `tasks/tasks.json` written and `active_tasks.json` written
- PWA:
  - `autonovelwriter/pwa/app.js`:
    - add click handlers for batch list items to open details and to activate
    - add i18n keys for new UI strings across all required languages

## Acceptance Checklist
- [ ] Backend: `GET /api/tasks/batches/<batch_id>` returns manifest + task_count + bounded preview/tail of `tasks.jsonl`.
- [ ] Backend: `POST /api/tasks/batches/<batch_id>/activate` sets current tasks pointer for active project and persists it under project state.
- [ ] PWA: Task Batches panel can view details and activate with clear status feedback.
- [ ] WS: `tasks_batch_activated` event broadcast so other clients refresh.
- [ ] i18n: new UI strings localized for `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`.
- [ ] Verification: no TCP binds; `py_compile`, `node --check`, and a unit-style backend test pass.

## Minimal Verification Commands (No TCP Binds)
```bash
python3 -m py_compile autonovelwriter/backend/server.py
node --check autonovelwriter/pwa/app.js
python3 autonovelwriter/backend/tests/tasks_batch_activate_unit_test.py
```

