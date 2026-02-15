# T005 Plan: Task runner control (start/pause/resume/stop) + state machine

## Goal
Add a minimal backend “runner” that executes the configured pipeline over queued tasks, supports start/pause/resume/stop, persists state under `autonovelwriter/runtime/state/`, and streams live progress to the PWA over `/ws`.

Non-goals (for this step):
- Do not implement real LLM/Codex execution yet; use stubbed work units (sleep + log) and explicit state transitions.
- Do not conflate driver stages (plan/implement/fix/summary) with in-app pipeline execution.
- Pipeline-script canonical artifact work should be kept separate unless a small compatibility shim is required.

## Files To Create/Change
- Backend
  - Change `autonovelwriter/backend/server.py`
    - Add runner state machine and persistence:
      - `autonovelwriter/runtime/state/runner_state.json` (status + current task/block + timestamps)
      - `autonovelwriter/runtime/state/task_status.json` (per-task status; resumable)
      - Optional append-only: `autonovelwriter/runtime/logs/runner.log`
    - Add REST endpoints:
      - `POST /api/run/start`
      - `POST /api/run/pause`
      - `POST /api/run/resume`
      - `POST /api/run/stop`
      - `GET /api/run/status`
    - Add minimal task queue file integration (JSONL or JSON under `autonovelwriter/runtime/tasks/`):
      - Define a simple `tasks.jsonl` schema `{id, title, payload, status}`
      - Implement “claim next runnable task” and persist status transitions.
    - WS events (broadcast):
      - `{type:"run_status", ...}` on every transition
      - `{type:"task_status", task_id, status, ...}`
      - `{type:"log", line, ...}` for runner output
- PWA
  - Change `autonovelwriter/pwa/index.html`
    - Enable Start/Pause/Resume/Stop buttons (currently disabled).
  - Change `autonovelwriter/pwa/app.js`
    - Call `/api/run/*` endpoints on button clicks.
    - Render run status + current task/block in UI (e.g., in header or a pill).
    - Subscribe to WS `run_status`/`task_status`/`log` and show live progress.

## State Machine (Minimal)
- Runner statuses: `idle` -> `running` -> (`paused` <-> `running`) -> `stopped` -> `idle`
- On restart:
  - Load `runner_state.json` and `task_status.json`
  - If previous status was `running`, resume as `paused` by default (safe) until user hits Resume.

## Acceptance Checklist
- [ ] Start/pause/resume/stop works without losing state (state persisted to disk; restart keeps it).
- [ ] Task statuses persist across restart (`task_status.json` / queue file reflects progress).
- [ ] UI shows live task progress (WS events update UI in real time).

## Minimal Verification Commands (No TCP Bind)
```bash
python3 -m py_compile autonovelwriter/backend/server.py

# Confirm endpoints and persistence file names are present
rg -n -- "/api/run/(start|pause|resume|stop|status)" autonovelwriter/backend/server.py
rg -n -- "runner_state\.json|task_status\.json|run_status|task_status" autonovelwriter/backend/server.py

# Confirm PWA wires controls and listens to WS events
rg -n -- "pipeSave|run" autonovelwriter/pwa/index.html autonovelwriter/pwa/app.js
rg -n -- "run_status|task_status" autonovelwriter/pwa/app.js

# Ensure runtime directories exist
python3 - <<'PY'
from pathlib import Path
paths = [
  'autonovelwriter/runtime/tasks',
  'autonovelwriter/runtime/state',
  'autonovelwriter/runtime/logs',
]
missing = [p for p in paths if not Path(p).is_dir()]
print('missing', missing)
PY
```

## README Update (Later Stages)
- Update `README.md` with:
  - How to run backend + PWA (tmux panes).
  - Runner endpoints summary.
  - Where state files live under `autonovelwriter/runtime/`.
