# T013 Summary: Outputs index API (active project)

## Implement
- Added `GET /api/outputs/index` to list output files for the active project (or `?project=` override).
- Response includes: `active_project`, `project`, `outputs_root`, and a bounded/sorted `files[]` with `{path, kind, mtime_ms, size_bytes}`.
- Safety: results are sorted by `path` and capped at 5000 entries.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`

## Fixes
- Enforced the 5000-entry cap during the directory walk (early exit) to avoid scanning huge trees before failing.
- Improved dotfile filtering to skip nested dot paths (any path segment starting with `.`).

## I18N
- No PWA user-facing strings were added/changed in this task (backend-only endpoint).

## Next
1. Add a minimal PWA Outputs panel that calls `/api/outputs/index` and refreshes on `output_created`.
2. Consider pagination/cursor support for outputs listing instead of a hard cap (or make the cap configurable).
3. Add an API to download/view a specific output file (read-only) with safe path validation.

## README
- Added `GET /api/outputs/index` to the “Key Backend APIs” list in `README.md`.
