# T004 Plan: Folder-based inbox/outbox + backend polling + UI sync

## Goal
Implement the file-based interruption channel:
- User drops `.txt`/`.md` into `autonovelwriter/runtime/io/inbox/`.
- Backend polls inbox, appends messages to chat history, and broadcasts events over `/ws`.
- UI can send chat; backend writes a file to `autonovelwriter/runtime/io/outbox/` and broadcasts an event.

Non-goals for T004:
- Do not conflate the *driver stages* (plan/implement/fix/summary) with the *in-app pipeline* being controlled. T004 only adds the chat pipe.
- Pipeline-script visualization module is out of scope for T004 (will be handled in a dedicated task).

## Files To Create/Change
- Backend
  - Change `autonovelwriter/backend/server.py`
    - Add chat history storage (append-only file under `autonovelwriter/runtime/state/`, e.g. `chat.jsonl`).
    - Add inbox polling loop (Tornado `PeriodicCallback`) watching `autonovelwriter/runtime/io/inbox/` for new `.txt`/`.md`.
      - Track processed files (in-memory + persisted state file, e.g. `inbox_state.json`).
      - On new file: read text, create chat message `{id, ts_ms, role:'user', source:'inbox', filename, text}`.
      - Append to history; broadcast WS event `{type:'chat', message:...}`.
    - Add outbox writer
      - When receiving a UI chat message: write a timestamped file into `autonovelwriter/runtime/io/outbox/`.
      - Broadcast WS event `{type:'outbox_written', filename, message}`.
    - Add REST endpoints:
      - `GET /api/chat/history` returns recent chat messages (bounded, e.g. last 200).
      - `POST /api/chat/send` accepts `{text}` and routes it through the outbox writer + broadcast.
    - Extend WS handler to support `{type:'chat', text}` from clients (so UI can use WS only).
- PWA
  - Change `autonovelwriter/pwa/app.js`
    - On startup: fetch `GET /api/chat/history` (derive API base from configured backend URL as done for pipeline) and render messages.
    - On chat form submit:
      - Prefer sending `{type:'chat', text}` over WS.
      - If WS not connected, fall back to `POST /api/chat/send`.
    - Handle new WS event types:
      - `chat`: append to chat panel.
      - `outbox_written`: show acknowledgement (optional).
  - (Optional minimal) Change `autonovelwriter/pwa/index.html` to clarify inbox/outbox paths in the UI hint area.

## Acceptance Checklist
- [ ] Dropping a `.md`/`.txt` into `autonovelwriter/runtime/io/inbox/` appears in the PWA chat panel.
- [ ] Sending chat from the UI causes the backend to write a file into `autonovelwriter/runtime/io/outbox/`.
- [ ] All events are visible via WS (at least: inbox message -> WS `chat`, UI send -> WS `outbox_written` and/or `chat`).

## Minimal Verification Commands (No TCP Bind)
```bash
# Backend syntax
python3 -m py_compile autonovelwriter/backend/server.py

# Confirm runtime paths used by server include inbox/outbox and state paths
rg -n -- "io_inbox|io_outbox|chat\\.jsonl|PeriodicCallback|/api/chat" autonovelwriter/backend/server.py

# PWA wiring checks (no browser)
rg -n -- "/api/chat/history|/api/chat/send|type: 'chat'|outbox" autonovelwriter/pwa/app.js

# Ensure runtime folders exist (created by T001; verify still present)
python3 - <<'PY'
from pathlib import Path
paths = [
  'autonovelwriter/runtime/io/inbox',
  'autonovelwriter/runtime/io/outbox',
  'autonovelwriter/runtime/state',
]
missing = [p for p in paths if not Path(p).is_dir()]
print('missing', missing)
PY
```

Notes:
- End-to-end acceptance needs real backend + PWA running (outer driver tmux panes). This step’s verification avoids binding sockets in the Codex sandbox.
