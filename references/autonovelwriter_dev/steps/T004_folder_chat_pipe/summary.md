# T004 Summary: Folder-based inbox/outbox + backend polling + UI sync

## Implement
- Backend (`autonovelwriter/backend/server.py`)
  - Added chat history storage at `autonovelwriter/runtime/state/chat.jsonl`.
  - Added inbox polling (PeriodicCallback) reading new `.txt`/`.md` in `autonovelwriter/runtime/io/inbox/` and emitting WS `{type:'chat', message:...}`.
  - Added outbox writer: UI chat messages write `chat_*.txt` files into `autonovelwriter/runtime/io/outbox/`.
  - Added REST endpoints:
    - `GET /api/chat/history` (last messages)
    - `POST /api/chat/send` (write outbox + broadcast)
  - Extended WS handler to accept `{type:'chat', text}` from clients and route it through outbox + broadcast.
- PWA (`autonovelwriter/pwa/app.js`)
  - On startup: loads chat history from `/api/chat/history` and renders it.
  - On WS events: renders `chat` messages and `outbox_written` acknowledgements.
  - On chat submit: sends over WS when connected; falls back to `POST /api/chat/send` when WS is unavailable.

Notes:
- Pipeline-script visualization module is not implemented here; T004 only adds the folder-based chat interruption pipe.
