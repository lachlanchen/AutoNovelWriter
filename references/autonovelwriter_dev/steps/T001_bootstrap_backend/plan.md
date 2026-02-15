# T001 Plan: Bootstrap Tornado backend skeleton (health, static, ws)

## Files To Create/Change
- `autonovelwriter/backend/server.py`: Tornado app entrypoint.
- `autonovelwriter/backend/requirements.txt`: backend deps (Tornado).
- `autonovelwriter/backend/.env.example`: documented env vars (no secrets).
- `autonovelwriter/pwa/index.html`: placeholder so static serving has something to serve (T002 will replace).
- `references/autonovelwriter_dev/steps/T001_bootstrap_backend/summary.md`: step notes.

## Runtime Defaults
- Ensure these exist (create on startup if missing):
  - `autonovelwriter/runtime/io/inbox`
  - `autonovelwriter/runtime/io/outbox`
  - `autonovelwriter/runtime/tasks`
  - `autonovelwriter/runtime/logs`
  - `autonovelwriter/runtime/state`

## Acceptance Checklist
- [ ] `python3 autonovelwriter/backend/server.py --port 8787` starts.
- [ ] `GET /api/health` returns 200 JSON.
- [ ] WebSocket `/ws` connects and emits a `hello` event.

## Minimal Verification Commands
```bash
python3 -m py_compile autonovelwriter/backend/server.py
python3 autonovelwriter/backend/server.py --port 8787 --host 127.0.0.1 &
PID=$!
sleep 0.4
curl -sS http://127.0.0.1:8787/api/health
python3 - <<'PY'
import asyncio
from tornado.websocket import websocket_connect

async def main():
    c = await websocket_connect('ws://127.0.0.1:8787/ws')
    msg = await c.read_message()
    print(msg)
    c.close()

asyncio.run(main())
PY
kill $PID
```
