# UI Layout, Chat Sync, and Toast Update Notes

Date: 2026-04-25

This document records the recent AutoNovelWriter browser updates so the same ideas can later be considered for AutoAppDev. It is a reference only. Do not apply changes to AutoAppDev from this document without an explicit separate task.

## Change Batches

### 1. Remote and PWA Foundation

The public tunnel previously loaded the PWA over HTTPS while the frontend still tried to call `http://127.0.0.1:8788/api/...`. Browsers block that as mixed content on remote devices.

The fix was to make the public proxy the same-origin API gateway:

- `scripts/run_autonovelwriter_public_tmux.sh` writes `pwa/config.local.js`.
- `config.local.js` sets `window.__AUTOAPPDEV_CONFIG__.API_BASE_URL = ""`.
- Remote pages call `/api/...` through the authenticated public proxy.
- Local `localhost` and `127.0.0.1` sessions can still use the local backend default.

The service worker cache was bumped whenever shell behavior changed so hard refreshes and normal refreshes can pick up new `index.html`, `app.js`, and `styles.css`.

### 2. First Major Layout Update: Desktop and Mobile

The writing workspace moved from a stacked preview/chat layout to a two-mode responsive layout.

Desktop:

- `Beats Board`, `Draft Studio`, and `Autopilot Loop` use `.writing-screen` as a two-column grid.
- Left column: preview panel for beats, draft, or loop script.
- Right column: chat log and input.
- This keeps material context visible while writing or chatting.
- `Autopilot Setup` keeps the Scratch-like three-column blocks/program/inspector layout.

Mobile:

- The bottom tabs remain full width, mobile-app style.
- Mobile preview is controlled by the single top-left app chrome button, so preview panels no longer add a second three-line icon on narrow screens.
- The old text `Preview` / `Hide` button was replaced by icon-only controls on desktop and by the global app chrome toggle on mobile.
- Subtitles are hidden or ellipsized on narrow screens.
- Chat and input get most of the height.
- Padding, gaps, and bottom navigation height were reduced.
- `html` and `body` prevent horizontal dragging with `overflow-x: hidden`, `overscroll-behavior-x: none`, and `touch-action: pan-y`.
- Inputs use at least `16px` font size on mobile to prevent iOS/Safari input zoom.

The key design principle is that mobile must feel like a real chat/writing app: one vertical flow, no side-scroll, no accidental zoom, and no huge empty chrome.

### 3. Header and Monitor Fixes

The mobile header had a failure mode where opening Settings expanded the topbar and closing it did not restore the workspace height. The frontend now recalculates `--topbar-h` with `setViewportVars()` immediately, on the next animation frames, and after a short timeout.

The Agent Monitor changed from a hard-to-close popover to a normal overlay behavior:

- click `Agent` to open,
- click outside to close,
- press `Escape` to close,
- click `Close` if desired.

The monitor remains shared across tabs and calls `/api/novel/agent/status`.

### 4. Preview Button Overflow Fix

After adding mobile folding, the preview header could push `Refresh` out of the viewport when `Preview` was clicked.

The fix:

- `.writing-head > div:first-child` now has `min-width: 0` and flexible shrink behavior.
- `.writing-actions` stays on one row on mobile and has a bounded width.
- action buttons can shrink, ellipsize, and keep their line height stable.
- the folded and expanded preview states use similar header geometry.

This avoids a layout jump where the right-side actions become wider than the viewport.

### 5. Chat Presentation

Chat now separates user and assistant/system messages visually:

- user messages align right and use a green bubble,
- assistant/system messages align left with a warm light bubble,
- messages use `white-space: pre-wrap` so line breaks remain readable,
- chat scrolls to the bottom after refresh.

The same merged chat stream is rendered into Beats Board, Draft Studio, Autopilot Loop, Autopilot Setup, and the older internal chat panel.

### 6. Cross-Device Live Sync

The app now refreshes active browser state regularly:

- `liveSync()` calls `loadChat()`, `loadNovelPreview()`, and `refreshNovelAgentStatus()`.
- It runs about every 2.5 seconds while the document is visible.
- It force-runs when a hidden tab becomes visible again.
- It uses a `liveSyncBusy` guard so polling calls do not overlap.

This means a message sent from a phone should appear on a desktop browser without manually refreshing, and vice versa. The preview already updated before; chat now follows the same model.

### 7. Mechanical Ack as Toast

The fixed acknowledgement:

```text
已收到。我会先保存这条输入；快速回复会尽快回来，复杂整理和写作会交给后台 assistant 任务继续处理。
```

was previously stored as an assistant chat message. That made the chat feel mechanical and made it hard to distinguish real agent writing from app plumbing.

The backend now returns the fixed acknowledgement in the `POST /api/chat` response:

```json
{
  "ok": true,
  "record": { "...": "..." },
  "agent_status": { "...": "..." },
  "notice": {
    "kind": "mechanical_ack",
    "text": "已收到。..."
  }
}
```

The frontend displays that notice through `showToast()` and does not add it to the durable chat stream.

Durable chat should contain:

- user messages,
- real quick replies from the reply Codex session,
- real writer summaries from the assistant Codex session,
- pipeline/outbox messages when they are meaningful.

Mechanical fallback messages are also filtered from display for older stored records, so old fixed acknowledgements should stop cluttering the visible chat.

### 8. Cache Versions

Recent shell cache bumps:

- `autoappdev-shell-v18`: desktop/mobile layout split and live chat sync.
- `autoappdev-shell-v19`: preview action overflow fix and toast-based mechanical ack.
- `autoappdev-shell-v20`: backend-owned chat sessions and `New Chat` buttons on the writing tabs.
- `autoappdev-shell-v24`: session titles from first user message, per-tab chat rendering, toolbar label updates, and History session switching.
- `autoappdev-shell-v25`: clickable History popover and Beats Board legacy-history recovery.
- `autoappdev-shell-v26`: lazy chat message paging and cleaner Autopilot Loop toolbar.
- `autoappdev-shell-v27`: dedicated Settings page and default shared writing sessions.
- `autoappdev-shell-v28`: AutoNovel Studio title, compact header chrome, expanded previews, and Settings-only monitor access.
- `autoappdev-shell-v29`: mobile preview merged with the global header control, preview-card hamburger hidden on mobile, and Loop header setup shortcut removed.
- `autoappdev-shell-v30`: desktop hamburger controls removed, preview-card fold buttons removed everywhere, and logo/title/subtitle made persistent.

When shell behavior changes, bump `pwa/service-worker.js` again.

### 9. Chat Session Management

The first three writing tabs now have `New Chat` controls:

- `Beats Board`
- `Draft Studio`
- `Autopilot Loop`

Sessions are owned by the backend rather than only by browser `localStorage`. The backend stores the active session per mode in `app_config.chat_active_sessions`, and `GET /api/chat?mode=beats|draft|loop|setup|chat` returns the current session's messages.

Creating a new session:

```http
POST /api/chat/sessions
Content-Type: application/json

{"action":"new","mode":"beats"}
```

The response includes `active_session_id`. Subsequent chat posts for that mode use the backend active session unless a specific `session_id` is passed.

The Codex reply and writer sessions are also separated per chat session. New non-legacy sessions write resume ids below:

```text
runtime/novel/state/chat_sessions/<session_id>/codex_reply_session.txt
runtime/novel/state/chat_sessions/<session_id>/codex_writer_session.txt
```

This keeps a new browser chat from automatically continuing the old Codex conversation thread. The `legacy` session keeps old global behavior and old messages readable.

Session title behavior follows the LazyBlog Studio pattern: create the session as `Untitled chat`, then rename it from the first user message. AutoNovelWriter strips its internal instruction prefixes before deriving the title, so a Beats Board message such as `Add this to...: 太多整天是非對錯的蠢貨了` becomes a readable title based on the actual note. The backend also exposes `POST /api/chat/sessions` with `{"action":"rename", ...}` for explicit local title updates.

Important rendering rule: each writing tab must render only its own mode/session chat. Beats Board messages should not be painted into Draft Studio, Autopilot Loop, or Autopilot Setup. Global outbox messages remain limited to the older internal chat panel.

The History button now opens an in-app clickable session list rather than a browser `prompt()` with numbered choices. Each row shows the session title, timestamp, and current-session marker. This avoids the awkward `1. Probe Session` flow and works better on mobile.

Beats Board also exposes the older `legacy` shared chat as `Legacy Chat (previous Beats history)` when that legacy stream has messages. This preserves notes created before per-tab sessions existed while still allowing fresh Beats, Draft, Loop, and Setup chats to stay separate.

Writing-tab chat logs now lazy-load message history. `GET /api/chat` accepts `limit` and `offset`; the frontend first loads the newest 10 raw messages, renders a top `More earlier messages` control when older history exists, and automatically loads the next batch when the user scrolls near the top. The renderer preserves scroll position when prepending older messages, so reading back through history should not jump.

Autopilot Loop no longer shows the shared Monitor button or the `Autopilot Setup` shortcut in its toolbar. Setup remains available from the bottom navigation, and Monitor access is centralized in Settings.

Settings is now a dedicated workspace page instead of an expandable topbar section. The topbar uses a right-side gear button and the bottom `Settings` tab opens the same page. Controls are grouped into panels:

- Agent: agent, model, reply reasoning, assistant reasoning.
- Session: `Share Session`, language, theme.
- Pipeline: Start, Pause, Resume, Stop with equal button height and a separated status/message area.

`Share Session` defaults on. When enabled, `Beats Board`, `Draft Studio`, `Autopilot Loop`, and `Autopilot Setup` resolve to the same active backend chat session. When disabled, each tab keeps its own active session, but the backend still injects all tab session ids and Codex resume file paths into reply/writer prompts so agents stay aware of adjacent tab context.

The app title shown in the browser shell is now `AutoNovel Studio`. The desktop topbar keeps the logo, title, and subtitle visible, with the gear Settings button at the right. Desktop no longer has any hamburger controls. On mobile, the only hamburger is the top-left preview fold button for the active writing tab; it does not hide or alter the logo/title/subtitle. Monitor buttons were removed from writing preview headers and the Autopilot Setup program header; the Agent Monitor now lives in Settings.

### 10. Delta Since Previous Documentation Pass

The previous documentation pass described the v28/v29 state: compact app header, writing preview cards, preview-card hamburger buttons on desktop, mobile preview controlled by the global hamburger, and a Settings-only Agent Monitor.

The latest v30 revision simplified the header model further:

- Desktop no longer shows a global hamburger button.
- Desktop no longer shows preview-card hamburger buttons in Beats Board, Draft Studio, or Autopilot Loop.
- The logo, title, and subtitle are persistent on desktop and mobile; no control toggles brand visibility anymore.
- Mobile still shows one top-left hamburger, but it only opens or closes the active writing preview.
- Mobile writing previews start collapsed so chat has room first; tapping the top-left hamburger opens the preview, and tapping it again closes the preview.
- The Autopilot Loop header does not include the `Autopilot Setup` shortcut button. Setup remains available from the bottom navigation, avoiding a cramped toolbar.
- The mobile preview panel is visually pulled up against the app header with reduced top spacing, so the global header and preview feel like one surface instead of two stacked headers.
- `pwa/service-worker.js` moved to `autoappdev-shell-v30`; normal refreshes should pick up the revised shell after the worker updates.

Implementation files for this delta:

- `pwa/app.js`: decoupled the hamburger from brand visibility and kept it as a mobile-only active-preview toggle.
- `pwa/styles.css`: hides the global hamburger on desktop, keeps brand elements visible, and removes preview-card fold controls.
- `pwa/index.html`: removed preview-card hamburger buttons and the Loop header's `Autopilot Setup` shortcut.
- `pwa/service-worker.js`: cache version bump.

## Files Changed in These Updates

Primary frontend files:

- `pwa/index.html`
- `pwa/styles.css`
- `pwa/app.js`
- `pwa/service-worker.js`

Primary backend files:

- `backend/app.py`

Operational launcher/proxy files involved in the remote flow:

- `scripts/run_autonovelwriter_public_tmux.sh`
- `scripts/autonovelwriter_public_proxy.py`
- `/home/lachlan/scripts/start_autonovelwriter_public_tmux.sh`

## Verification Used

Static checks:

```bash
python3 -m py_compile backend/app.py backend/storage.py backend/pipeline_parser.py
node --check pwa/app.js
node --check pwa/api-client.js
node --check pwa/i18n.js
python3 -m json.tool pwa/manifest.json
python3 - <<'PY'
from pathlib import Path
css = Path("pwa/styles.css").read_text()
assert css.count("{") == css.count("}")
PY
```

Runtime checks:

- restart `autonovelwriter_public` tmux session,
- verify `http://127.0.0.1:8788/api/health`,
- verify authenticated proxy serves `service-worker.js`, `app.js`, and `styles.css`,
- verify ngrok serves the same updated assets.

## AutoAppDev Adaptation Checklist

This section is for future planning only. It intentionally does not edit AutoAppDev.

Possible transfer targets:

1. Same-origin remote API config for ngrok or public proxy.
2. Mobile topbar height recalculation after settings collapse.
3. Bottom navigation spacing and safe-area handling.
4. Desktop split workspace where a preview/status area stays visible next to chat/logs.
5. Mobile foldable preview panels controlled by one global app-header button, with stable per-panel actions.
6. Chat bubble styling and durable-message rules.
7. Toast channel for fixed mechanical acknowledgements.
8. Cross-device polling or WebSocket live sync for chat/status/log surfaces.
9. Service worker cache bump discipline for every shell update.

When adapting to AutoAppDev, first identify which surfaces are equivalent:

| AutoNovelWriter | Possible AutoAppDev Equivalent |
|---|---|
| Beats/Draft/Loop preview | task status, script preview, current run summary |
| writing chat | inbox/outbox or control chat |
| Agent Monitor | pipeline/agent monitor |
| Autopilot Setup | existing Scratch-like pipeline editor |
| mechanical ack toast | command accepted / run queued notice |

Keep the core rule: user-visible chat should show meaningful conversation and results, while fixed app acknowledgements should be transient toast/status UI.
