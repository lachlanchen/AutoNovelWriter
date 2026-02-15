# T004 Debug

## Sandbox Note
This Codex sandbox may deny binding listening sockets (seen earlier as `PermissionError: [Errno 1] Operation not permitted`).
Verification for this step is limited to syntax/greps; end-to-end inbox/outbox + WS behavior must be validated by the outer driver on the host.

## Acceptance Review (Code-Level)
- Inbox -> UI:
  - Backend polls `autonovelwriter/runtime/io/inbox` for new `.txt`/`.md` and broadcasts WS `{type:"chat", message:{source:"inbox", ...}}`.
  - PWA listens for WS `chat` events and appends them to the chat log.
- UI -> Outbox:
  - PWA sends `{type:"chat", text}` over WS when connected; otherwise `POST /api/chat/send`.
  - Backend writes `chat_*.txt` into `autonovelwriter/runtime/io/outbox` for both WS-chat and REST-chat.
- Events via WS:
  - Backend broadcasts `chat` and `outbox_written` (plus existing `hello`/`echo`).

## Issues / Risks
- Duplicate messages in UI (high likelihood):
  - On submit, PWA immediately adds a local `you` message, and the backend then broadcasts the same message back over WS as `type:"chat"`. This will show twice unless the UI dedupes by `message.id` or suppresses optimistic echo when WS is connected.
  - `loadChatHistory()` appends history to the current log without clearing/deduping; on reload/reconnect/WS URL change, it can re-add old history again.
- Inbox processing identity is filename-only:
  - `InboxPoller` uses `processed` keyed by `p.name`. Reusing a filename (overwrite/update) will not be reprocessed after the first time, even if contents change.
- Potential partial reads / race with writers:
  - Poller reads files without any “done writing” signal. If a file is still being written, the backend can ingest a truncated message.
- Chat storage scalability:
  - `ChatStore.load_tail()` reads the entire `chat.jsonl` into memory to compute the tail (simple, but can become slow if the file grows large).
  - Appends are synchronous disk writes inside an async method; acceptable for small local usage but can block the Tornado IOLoop under load.
- Separation: driver stages vs in-app pipelines:
  - T004 changes are only chat pipe; no coupling to driver stages is present (good).
  - Pipeline script <-> blocks translation is still not implemented anywhere; current pipeline persistence is JSON only (`/api/pipeline`), not a canonical “pipeline script” artifact.

## Manual Host-Side Smoke Test (Outer Driver)
1. Start backend and PWA via the driver tmux panes.
2. Open PWA; confirm WS connects and chat history loads.
3. Drop `test.md` into `autonovelwriter/runtime/io/inbox/` and confirm it appears in chat (exactly once).
4. Send a chat message from UI; confirm:
   - a new `chat_*.txt` appears in `autonovelwriter/runtime/io/outbox/`
   - UI shows an `outbox_written` event
   - the message does not appear twice (this is currently expected to fail until dedup/optimistic handling is added).
