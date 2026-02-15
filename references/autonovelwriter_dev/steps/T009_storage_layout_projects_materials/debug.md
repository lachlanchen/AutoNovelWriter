# T009 Debug

## Acceptance Review
- Backend exposes required endpoints:
  - `GET /api/projects` exists and returns `active_project` + a project list.
  - `GET /api/materials/index` exists and returns `active_project`, `project`, `materials_root`, and `files[]`.
- PWA shows active project and materials list:
  - UI includes a project selector and a read-only list of files from `/api/materials/index`.
  - Polling refreshes the list (2s interval), meeting “drop a file appears without restart” assuming backend is reachable.
- Runtime defaults:
  - `autonovelwriter/runtime/projects/default/{materials,interactions,outputs,state}/` exists after backend startup.

## Issues / Risks
- README not updated for projects/materials:
  - `README.md` runtime layout section does not mention `runtime/projects/` or the new projects/materials APIs. This should be documented in the `update_readme` stage.
- `save_active_project()` does not validate `project_id`:
  - `POST /api/projects/active` validates IDs, but `save_active_project()` can write arbitrary strings if used elsewhere in the future. Low risk today, but prefer validating inside `save_active_project()` too.
- Materials index performance/scaling:
  - `rglob('*')` over large trees may be slow; current cap is 5000 entries. No incremental caching yet. Probably fine for v1, but needs a follow-up if users drop many files.
- Materials polling is unconditional:
  - PWA polls every 2s regardless of connection state and without backoff. If backend is offline, this is noisy (caught and ignored, but it will still spin).
- i18n coverage for new panel:
  - New UI strings were added with i18n keys, but the project selector’s `aria-label` is not localized (minor accessibility gap).

## Operability / Resumability
- Active project pointer is persisted at `autonovelwriter/runtime/state/active_project.json` (gitignored), enabling resume across restarts.
- Materials index is derived on demand from the filesystem and does not require a restart.

## Separation Checks
- Driver stages vs in-app pipelines:
  - No coupling introduced.
- Pipeline script <-> blocks translation:
  - Unchanged by this task; this task only adds project/materials storage and indexing.
