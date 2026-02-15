# T020 Plan: Task batches: index API + PWA panel

## Architecture / Design Note

### Fit With Standardized Storage Layout
- Task batches are already written by the runner under:
  - `autonovelwriter/runtime/tasks/batches/<batch_id>/`
    - `tasks.jsonl`
    - `manifest.json` (includes `batch_id`, `created_utc`, `task_count`, and output paths)
- This task makes those batches **observable**:
  - Backend: index the on-disk batches via a new API endpoint.
  - PWA: show a “Task Batches” panel and refresh it from WS `tasks_batch_created`.
- Keep separation from driver workflow artifacts under `references/autonovelwriter_dev/` (this feature is for in-app pipelines/runtime only).

### Persisted vs Derived vs Ephemeral (and what is gitignored)
- Persisted (gitignored; runtime):
  - Batch folders and manifests: `autonovelwriter/runtime/tasks/batches/<batch_id>/...`
  - Runner + task status state: `autonovelwriter/runtime/state/*.json`
- Derived:
  - Batch index response is derived by scanning `tasks/batches` and reading each `manifest.json` (best-effort).
  - PWA list UI is derived from the backend response.
- Ephemeral:
  - PWA in-memory list state + “last refresh” timestamp.

### API / WS Events Needed (Observability + Resumability)
- New backend API:
  - `GET /api/tasks/batches/index`
    - Returns a stable list of batches, sorted newest-first.
    - Fields per batch (minimum per acceptance):
      - `batch_id`
      - `batch_dir`
      - `tasks_jsonl`
      - `task_count`
      - `created_utc`
    - Recommended extras (non-breaking):
      - `manifest_path`, `project_id`, `task_id`, `block`, `mtime_ms`, `errors` (if manifest missing/unreadable)
- WebSocket:
  - Reuse existing runner WS event `tasks_batch_created` to trigger PWA refresh and show a small notification.

## Implementation Outline (Tight Scope)

### Backend: index batches on disk
- Add a helper in `autonovelwriter/backend/server.py`:
  - `list_task_batches(paths) -> list[dict]`
    - `batches_root = Path(paths["tasks"]) / "batches"`
    - For each child dir:
      - Prefer `manifest.json` if present/valid JSON; otherwise fallback to stat-based minimal record.
      - Use `created_utc` from manifest when available; otherwise compute from mtime.
      - Fill `tasks_jsonl` from manifest (`outputs.tasks_jsonl`) or `batch_dir / "tasks.jsonl"` if exists.
      - Compute `task_count` from manifest or count lines in `tasks.jsonl` (bounded / best-effort) if needed.
    - Sort by `created_utc` (or `mtime_ms`) descending.
- Add a Tornado handler:
  - `TasksBatchesIndexHandler` at route `/api/tasks/batches/index`
  - Respond shape:
    - `{ ok: true, batches_root: <path>, batches: [...] }`

### PWA: show batches panel + WS refresh hook
- Add a new panel in `autonovelwriter/pwa/index.html` near Outputs/Materials:
  - Title: “Task Batches”
  - List: batch_id + created_utc + task_count
  - Optional: show `tasks_jsonl` / `batch_dir` in smaller monospace.
- Add PWA logic in `autonovelwriter/pwa/app.js`:
  - `loadTaskBatchesIndex()` calls `GET /api/tasks/batches/index` and renders the list.
  - On WS event `tasks_batch_created`:
    - Show an immediate message in the chat/event log (existing pattern).
    - Schedule a refresh (similar to outputs refresh throttling).
- I18N:
  - Add keys for the new panel title/empty state/created label across 11 languages:
    - `tasks_batches.title`, `tasks_batches.empty`, `tasks_batches.created`
  - Keep Arabic RTL-safe by using short, neutral strings.

## Files To Change / Create
- Backend:
  - `autonovelwriter/backend/server.py` (new handler + helper + route)
- PWA:
  - `autonovelwriter/pwa/index.html` (panel markup)
  - `autonovelwriter/pwa/app.js` (fetch + render + WS hook + i18n keys)
  - `autonovelwriter/pwa/app.css` (minimal list styling, reuse materials list styles if possible)
- Step artifacts:
  - `references/autonovelwriter_dev/steps/T020_tasks_batches_index_and_pwa_panel/summary.md` (implementation notes later)

## Acceptance Checklist
- Backend:
  - `GET /api/tasks/batches/index` returns batches with stable fields:
    - `batch_id`, `batch_dir`, `tasks_jsonl`, `task_count`, `created_utc`
  - Works when `manifest.json` exists; degrades gracefully if it doesn’t.
- PWA:
  - Displays a batches list and updates it automatically on WS `tasks_batch_created` (no reload).
  - Shows a small immediate notification/message on batch creation.
- Verification (no extra ports):
  - `python3 -m py_compile autonovelwriter/backend/server.py`
  - `node --check autonovelwriter/pwa/app.js`
  - Unit-style batch indexing call (no server bind):
    - `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\npaths=s.resolve_paths(); s.ensure_runtime_dirs(paths)\nprint(s.list_task_batches(paths)[:1])\nPY`

## Minimal Verification Commands (No TCP Binds)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `node --check autonovelwriter/pwa/app.js`
- `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\npaths=s.resolve_paths(); s.ensure_runtime_dirs(paths)\nprint('batches', len(s.list_task_batches(paths)))\nPY`

