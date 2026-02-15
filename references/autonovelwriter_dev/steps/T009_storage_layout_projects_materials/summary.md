# T009 Summary: Storage layout (projects) + materials index

## Implement
- Standardized per-project runtime layout under `autonovelwriter/runtime/projects/<project_id>/` with subfolders:
  - `materials/`, `interactions/`, `outputs/`, `state/`
- Backend:
  - Added persisted active project pointer: `autonovelwriter/runtime/state/active_project.json` (defaults to `default`).
  - Added `GET /api/projects` (lists projects + active project).
  - Added `POST /api/projects/active` (sets active project; creates missing project dirs).
  - Added `GET /api/materials/index` (recursive scan of active project `materials/`; returns bounded listing).
- PWA:
  - Added an active project badge + project selector + read-only materials file list.
  - Polls `/api/materials/index` so files dropped into the materials folder appear without restart/reload.

Docs:
- Updated `docs/autonovelwriter_spec.md` to include `runtime/projects/<project_id>/...` in the recommended standardized storage layout.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `node --check autonovelwriter/pwa/app.js`

## Fixes
- Validated `project_id` inside `save_active_project()` to avoid persisting unsafe IDs (falls back to `default`).
- Reduced noisy polling when backend is unreachable by adding a simple backoff loop for `/api/materials/index` refreshes (still updates quickly when backend is available).
- Localized the project selector accessibility label via `data-i18n-aria-label` and extended the i18n applicator to set `aria-label`.

## I18N
- Added i18n keys for the new Projects/Materials panel (`projects.title`, `projects.select`, `projects.selector_aria`, `materials.empty`) across all required UI languages in `autonovelwriter/pwa/app.js`.
- Wired the project selector `aria-label` through i18n (`data-i18n-aria-label`) in `autonovelwriter/pwa/index.html`.
