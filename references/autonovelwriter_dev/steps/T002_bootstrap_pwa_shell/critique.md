# T002 Critique: Bootstrap PWA shell (light theme, manifest, service worker)

## Acceptance Check (What Looks Good)
- PWA shell files exist under `autonovelwriter/pwa/`: `index.html`, `app.css`, `app.js`, `manifest.webmanifest`, `service_worker.js`, and `icons/icon.svg`.
- Light theme is the default and tokenized in `autonovelwriter/pwa/app.css` via `:root` CSS variables (`--bg`, `--fg`, `--panel`, `--accent`, etc.).
- `autonovelwriter/pwa/app.js` attempts a WS connection and renders a `hello` event into the chat log when it receives `{type:\"hello\"...}`.

## Issues / Risks
- Service worker caching and scope assumptions:
  - `autonovelwriter/pwa/service_worker.js` only handles same-origin fetches and caches `./index.html` as the navigation shell. If the app is served from a subpath (not root), this is fine; if served from root with non-relative navigation, it is also fine. Just ensure future asset URLs stay relative or the caching logic will miss them.
  - The plan mentioned “Network-first for `/ws`”; service workers do not intercept WebSocket upgrades, so this is moot (not harmful, but expectations should be clear).
- Backend URL default may be wrong in some setups:
  - Default WS URL is `ws(s)://<page-hostname>:8787/ws`. If the PWA is opened on a different host than the backend (common when accessing from a phone on LAN), it will try `<phone-host>:8787` and fail. The query overrides `?ws=` and `?backend=` mitigate this, but it’s an operability footgun until a Settings UI exists.
- Offline-first behavior is minimal:
  - Only the shell is cached; chat events/history are not persisted (acceptable for T002, but note that refresh loses chat log).

## Resumability / Path Clarity
- The PWA has no dependency on runtime folders yet (correct for T002). Folder-based inbox/outbox interruption will need explicit UI affordances and backend event wiring in later tasks.

## Verification Gaps
- No real browser test was run here (sandbox avoids TCP binds). The outer driver should confirm:
  - Served via `python3 -m http.server --directory autonovelwriter/pwa`, the page loads and registers the service worker without console errors.
  - With backend running, chat panel shows the backend `hello` event after WS connects.

