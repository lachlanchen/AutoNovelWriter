# T013 Plan: Outputs index API (active project)

## Design Note (Storage + Persist/Derive + Observability)
- Storage fit (standard layout):
  - Outputs already live under:
    - `autonovelwriter/runtime/projects/<project_id>/outputs/`
  - This task adds an API to **derive** a listing of that folder on demand (no new persisted state required).
- Persisted vs derived vs ephemeral (and gitignore):
  - Persisted (gitignored runtime):
    - output files themselves in `runtime/projects/<project_id>/outputs/`
  - Derived:
    - outputs index response (`files[]`) computed by walking `outputs_root` (no cache in v1)
  - Ephemeral:
    - HTTP response + any UI refresh timers
- API/WS events for observability/resumability:
  - New HTTP endpoint:
    - `GET /api/outputs/index` (lists active project outputs; optional `?project=` override like materials index)
  - Existing WS event `output_created` remains the push signal; the PWA can refresh `/api/outputs/index` on that event.
  - No runner/state changes required.

## Implementation Outline
1. Add a Tornado handler `OutputsIndexHandler` modeled on `MaterialsIndexHandler`:
  - Determine `active_project` via `load_active_project(paths)`.
  - Allow query override: `?project=<id>` with `_is_safe_project_id` validation, falling back to active.
  - Resolve `pr = _ensure_project_dirs(paths, pid)` and set `outputs_root = pr["outputs_root"]`.
  - Recursively list entries via `outputs_root.rglob("*")`.
    - Hide dotfiles (skip paths starting with `.`) consistent with materials index.
    - Return directories with trailing `/` and `kind="dir"`, files with `kind="file"`.
    - Include `mtime_ms` and `size_bytes` for files; `size_bytes=0` for dirs.
  - Sort by `path` for stable ordering.
  - Cap results at 5000 (400 with `too_many_entries`) for safety.
2. Add route in `make_app()`:
  - `(r"/api/outputs/index", OutputsIndexHandler, {"paths": paths})`

## Files To Change/Create
- Backend:
  - Change: `autonovelwriter/backend/server.py`
    - Add `OutputsIndexHandler`
    - Register `/api/outputs/index`
- Docs (optional, tiny):
  - Update `README.md` (optional) to list the new endpoint under Key Backend APIs if useful.

## Acceptance Checklist
- `GET /api/outputs/index` returns:
  - `ok=true`
  - `project` (resolved project id) and `active_project`
  - `outputs_root` (absolute path)
  - `files[]` where each entry includes: `path`, `kind`, `mtime_ms`, `size_bytes`
- Stability + safety:
  - `files[]` sorted by `path`
  - bounded to <= 5000 entries (else 400 `too_many_entries`)

## Minimal Verification Commands (No TCP Binds)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- Grep references:
  - `rg -n \"/api/outputs/index|OutputsIndexHandler\" autonovelwriter/backend/server.py`

