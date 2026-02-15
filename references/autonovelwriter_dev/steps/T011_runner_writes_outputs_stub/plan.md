# T011 Plan: Runner writes drafts/revisions to outputs (stub)

## Design Note (Storage + Persist/Derive + Observability)
- Storage fit (standard layout):
  - Write generated text artifacts into the **active project** outputs folder:
    - `autonovelwriter/runtime/projects/<project_id>/outputs/`
  - Use existing active project pointer:
    - `autonovelwriter/runtime/state/active_project.json`
  - Persist runner/task progress in existing state:
    - `autonovelwriter/runtime/state/task_status.json` (extend schema to include per-block status + output paths)
    - `autonovelwriter/runtime/state/runner_state.json` (already persisted)
  - Optional follow-up (not required for acceptance): an `outputs/index.json` derived cache under `runtime/projects/<project_id>/state/` for fast UI listing.
- Persisted vs derived vs ephemeral (and gitignore):
  - Persisted (gitignored runtime):
    - Output files: `runtime/projects/<project_id>/outputs/*.md`
    - Task status (including which output file was created): `runtime/state/task_status.json`
  - Derived:
    - Any UI listing of outputs (from scanning outputs dir or an index cache).
  - Ephemeral:
    - WS events (`output_created`, logs) and in-memory runner state between ticks.
  - Ensure all runtime artifacts remain under `autonovelwriter/runtime/` (already gitignored).
- API/WS events for observability/resumability:
  - WS:
    - Emit an explicit `output_created` event: `{type:"output_created", ts_ms, project_id, task_id, block, path}`.
    - Also log a `[output] created: <path>` line via existing `log` event (acceptance allows event/log).
  - HTTP (optional, small):
    - `GET /api/outputs/index` to list active project outputs for the PWA (can be deferred if not needed for acceptance).
  - Resumability behavior:
    - Persist per-task per-block completion (`task_status.json`) so the runner can **skip** already-completed `write` blocks after restart/resume to avoid duplicate drafts.

## Implementation Outline
1. Extend runner’s block execution to recognize the `write` block type.
2. When executing `write`:
  - Resolve `project_id = load_active_project(paths)` and call `_ensure_project_dirs()` to get `outputs_root`.
  - Create a deterministic-ish output filename:
    - Example: `draft_<task_id>_<YYYYmmdd_HHMMSS>.md` (or include a monotonic counter if needed).
  - Content can be placeholder but should include:
    - task id
    - timestamp
    - `settings.novel.*` summary (language/tone/pov/tense/targets) to prove wiring
  - Write file to `outputs_root` with UTF-8.
  - Update `task_status.json`:
    - `st[task_id].blocks.write = {status:"done", ts_ms, outputs:[rel_path or abs_path]}`
  - Emit WS:
    - `output_created` + a `log` line including the file path.
3. Idempotency/minimal skip:
  - If `task_status.json` says `blocks.write.status=="done"` and the referenced output exists, skip writing again and only log `skipped`.

## Files To Change/Create
- Backend:
  - Change: `autonovelwriter/backend/server.py`
    - Update `Runner._run_loop()` to execute a real stub action for `block.type=="write"`.
    - Extend `task_status.json` schema with per-block details and output paths.
    - Add WS event broadcast: `output_created`.
  - Optional (only if needed for UI visibility beyond WS):
    - Add handler: `GET /api/outputs/index` (active project) in `autonovelwriter/backend/server.py`.
- PWA (optional, small):
  - Change: `autonovelwriter/pwa/app.js`
    - Handle WS `output_created` by displaying a message (and optionally provide a hint where the file lives on disk).
    - No requirement to fetch file contents in-browser.
- Docs (optional, tiny):
  - Update `docs/autonovelwriter_spec.md` and/or `README.md` to mention:
    - runner `write` produces `runtime/projects/<project_id>/outputs/*`
    - WS `output_created` event exists

## Acceptance Checklist
- Output file creation:
  - Running a pipeline containing a `STEP write` block creates a new file under:
    - `autonovelwriter/runtime/projects/<active_project>/outputs/`
- Observability:
  - WS emits either:
    - `output_created` with the created path, and/or
    - a `log` line containing the created path.
- Persistence/resume:
  - `autonovelwriter/runtime/state/task_status.json` records completion of the `write` step with the output path.
  - After backend restart, `GET /api/run/status` + WS logs show status and `task_status.json` still reflects the completed `write` step (and the runner does not duplicate the draft when re-running the same task unless explicitly intended).

## Minimal Verification Commands (No TCP Binds)
- Backend syntax:
  - `python3 -m py_compile autonovelwriter/backend/server.py`
- PWA syntax (only if touched):
  - `node --check autonovelwriter/pwa/app.js`
- Optional lightweight “writes file” check without starting server:
  - `python3 -c "import json; from pathlib import Path; import autonovelwriter.backend.server as s; p=s.resolve_paths(); s.ensure_runtime_dirs(p); pid=s.load_active_project(p); d=s._ensure_project_dirs(p,pid); print(d['outputs_root'])"`
    - (If helper functions are refactored for testability, add a tiny unit-style script to confirm file writes into `outputs_root`.)

