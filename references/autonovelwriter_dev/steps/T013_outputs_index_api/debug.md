# T013 Debug: Outputs index API (active project)

## Acceptance Review
- `GET /api/outputs/index` exists and is registered in `autonovelwriter/backend/server.py`.
- Response shape matches acceptance intent:
  - `ok=true`
  - includes `active_project`, `project`, and `outputs_root`
  - includes `files[]` with `{path, kind, mtime_ms, size_bytes}`
- Stability/safety:
  - `files[]` sorted by `path`
  - bounded to 5000 entries (returns `400 too_many_entries` when exceeded)

## Issues / Risks

### Medium: Cap is enforced after full recursive scan
- Handler collects *all* entries via `outputs_root.rglob("*")` and only then checks `len(files) > 5000`.
- For very large output trees this can be slow/high-memory even though the response is capped.
- Suggested improvement (future fix): stop walking after 5001 entries (early exit) and/or implement pagination (`?cursor=`) to keep the endpoint responsive.

### Low: Dotfile filtering only checks top-level relative prefix
- Current check `rel.startswith(".")` hides paths that begin with `.` at the root, but it will not hide nested dot paths like `subdir/.cache/x`.
- Suggested improvement: skip any path segment starting with `.` (e.g., split on `/` and check segments).

### Low: Error handling silently returns empty list
- On exceptions during scan, handler returns `files=[]` without signaling an error.
- Consider returning `ok=false` with an error code for operability, or include a `warnings` field.

## Notes
- No impact on PWA/light theme (backend-only addition).
- No changes to runner resumability/state; this is a derived read-only listing of existing outputs.

