# T005 Summary: Task runner control (start/pause/resume/stop) + state machine

## Implement
- Backend (`autonovelwriter/backend/server.py`)
  - Added canonical pipeline script storage: `autonovelwriter/runtime/state/pipeline.script`.
  - `/api/pipeline` now returns and persists both:
    - `script` (canonical, line-based `STEP/DISABLED` format)
    - `pipeline` JSON (derived)
  - Added a minimal persisted runner state machine:
    - State: `autonovelwriter/runtime/state/runner_state.json`
    - Task status: `autonovelwriter/runtime/state/task_status.json`
    - Seed tasks file: `autonovelwriter/runtime/tasks/tasks.json`
    - Runner log: `autonovelwriter/runtime/logs/runner.log`
  - Added runner endpoints:
    - `POST /api/run/start`, `/api/run/pause`, `/api/run/resume`, `/api/run/stop`
    - `GET /api/run/status`
  - Emits WS events: `run_status`, `task_status`, `log`.
- PWA (`autonovelwriter/pwa/index.html`, `autonovelwriter/pwa/app.js`, `autonovelwriter/pwa/app.css`)
  - Enabled Start/Pause/Resume/Stop buttons.
  - Shows runner status pill and reacts to WS `run_status`.
  - Displays pipeline script textarea (canonical) alongside derived JSON.

## README
- Updated `README.md` with run instructions, key endpoints, and where runtime state lives.

Verification notes:
- No socket-binding smoke tests were run in this Codex sandbox; only syntax/greps.

## Fixes
- Runner loop guard: prevent overlapping runner loops from rapid start/resume calls by tracking a single active `_run_loop`.
- Pipeline script feedback: `/api/pipeline` now returns parse warnings (unknown verbs/types) and the PWA surfaces a small warning snippet.
- PWA operability: chat log is now capped to 300 entries to avoid UI degradation during long runs.
