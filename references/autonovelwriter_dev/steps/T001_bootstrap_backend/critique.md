# T001 Critique: Bootstrap Tornado Backend Skeleton (health, static, ws)

## Current Status
- No backend implementation exists yet: `autonovelwriter/backend/server.py` is missing.
- The expected app root directory `autonovelwriter/` does not exist in the repo at all.
- Step artifacts are missing: `references/autonovelwriter_dev/steps/T001_bootstrap_backend/plan.md` and `references/autonovelwriter_dev/steps/T001_bootstrap_backend/summary.md`.

## Acceptance Gaps (Blockers)
- `python3 autonovelwriter/backend/server.py --port 8787` cannot run because `autonovelwriter/backend/` does not exist.
- `GET /api/health` cannot return 200 JSON because there is no Tornado app wired up.
- WebSocket `/ws` cannot connect/emit “hello” because there is no WS handler/server.

## Operability / Path Clarity Risks
- The driver script hard-codes:
  - `app_root="autonovelwriter"`
  - `backend_root="autonovelwriter/backend"`
  - `pwa_root="autonovelwriter/pwa"`
  - `runtime_root="autonovelwriter/runtime"`
  If these directories are not created, tmux panes will idle (“waiting for .../server.py”) and the workflow stalls.
- Spec requires runtime defaults under `autonovelwriter/runtime/` (including `io/inbox`, `io/outbox`, `logs`, `state`, `tasks`). None exist yet, so even a minimal backend would lack its expected filesystem environment.

## Repository Hygiene Observations (Non-blocking)
- `git status` currently shows `?? references/` as untracked. That’s fine for the driver’s generated state, but the step’s required artifacts (`plan.md`, `critique.md`, `summary.md`) live under `references/` and will remain unversioned unless the outer driver commits them.

## What To Address Next (For Fix/Implement Stage)
- Create the missing directory skeleton:
  - `autonovelwriter/backend/`, `autonovelwriter/pwa/`, `autonovelwriter/runtime/` (+ required runtime subdirs).
- Add `autonovelwriter/backend/server.py` implementing:
  - `GET /api/health` -> JSON 200
  - `GET/POST /api/settings` -> minimal stub backed by env + JSON file under `autonovelwriter/runtime/state/`
  - `GET /ws` -> WebSocket that emits a `hello` event on connect
  - Optional: static handler for serving `autonovelwriter/pwa/` (even if PWA task is later, it’s harmless to support).
- Add minimal dependency metadata (`requirements.txt` or equivalent) and `.env.example` if env vars are introduced.

