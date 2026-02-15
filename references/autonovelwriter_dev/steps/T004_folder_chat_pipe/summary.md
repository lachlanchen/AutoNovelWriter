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

## Fixes
- Prevented common UI duplication: when WS is connected, the chat input no longer renders an optimistic local copy (it waits for the server-broadcast `chat` message). Chat history and WS messages are also deduped by `message.id`.
- Inbox ingestion is more robust: processing key now includes filename + mtime_ns + size, and very-recently-modified files are skipped to reduce partial reads.
- Reduced startup cost for large `chat.jsonl`: chat history tail-load now reads only the last ~2MB of the file.

## Next
1. Add a simple “Inbox/Outbox” panel in the PWA that shows the runtime paths and recent files written (helps operability).
2. Implement an explicit message ack/receipt model (UI message id -> server message id) so the UI can safely render optimistically without duplication.
3. Improve inbox ingestion robustness: support “.partial -> .txt” rename convention, and/or ignore files until size is stable across two polls.
4. Create a dedicated task for the pipeline-script canonical artifact (parse script <-> blocks JSON) and migrate `/api/pipeline` to store both forms.
