# T013 Summary: Outputs index API (active project)

## Implement
- Added `GET /api/outputs/index` to list output files for the active project (or `?project=` override).
- Response includes: `active_project`, `project`, `outputs_root`, and a bounded/sorted `files[]` with `{path, kind, mtime_ms, size_bytes}`.
- Safety: results are sorted by `path` and capped at 5000 entries.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`

