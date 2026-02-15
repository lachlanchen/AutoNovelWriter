# T001 Summary: Bootstrap Tornado backend skeleton (health, static, ws)

## Implement
- Created `autonovelwriter/backend/server.py` with Tornado app providing:
  - `GET /api/health` JSON
  - `GET/POST /api/settings` (minimal persisted JSON under runtime state)
  - `GET /ws` WebSocket that emits a `hello` event on connect
  - Optional static serving from `autonovelwriter/pwa/` when present
- Added `autonovelwriter/backend/requirements.txt` and `autonovelwriter/backend/.env.example`.
- Created runtime default directories under `autonovelwriter/runtime/` and also ensure they are created on server startup.

## Fixes
- Addressed critique blockers by creating the missing `autonovelwriter/` tree and required step artifacts (`plan.md`, `summary.md`).
- WS events are emitted as JSON strings (more predictable for browser clients).
- Verification in this Codex sandbox is limited: binding a listening socket fails with `PermissionError: [Errno 1] Operation not permitted`. `python3 -m py_compile autonovelwriter/backend/server.py` succeeds, and the server should be runnable in a normal local environment.

## Next
1. Run locally (outside sandbox) to confirm T001 acceptance: `python3 autonovelwriter/backend/server.py --port 8787`, `curl http://127.0.0.1:8787/api/health`, and verify `/ws` hello event in browser console.
2. T002: replace placeholder `autonovelwriter/pwa/index.html` with the real light-theme PWA shell (manifest + service worker) and connect to `/ws`.
3. Tighten `/api/settings` validation and add explicit fields for agent/model/path settings as per spec.
4. Add an event schema convention (e.g., `{type, ts_ms, ...}`) and basic server-side logging to `autonovelwriter/runtime/logs/`.
