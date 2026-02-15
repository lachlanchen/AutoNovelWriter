# T002 Summary: Bootstrap PWA shell (light theme, manifest, service worker)

## Implement
- Replaced placeholder with a light-theme PWA shell UI (`autonovelwriter/pwa/index.html`, `autonovelwriter/pwa/app.css`).
- Added WebSocket client (`autonovelwriter/pwa/app.js`) that connects to backend `/ws`, shows connection status, and renders the backend `hello` event into the chat panel.
- Added PWA plumbing (`autonovelwriter/pwa/manifest.webmanifest`, `autonovelwriter/pwa/service_worker.js`) with a minimal offline cached shell.
- Added a simple SVG app icon at `autonovelwriter/pwa/icons/icon.svg`.

Verification notes:
- No TCP-binding smoke tests were run in this Codex sandbox (socket binds may be denied). Use the driver tmux panes to validate browser load + WS connectivity.

## Fixes
- Improved operability when PWA host differs from backend host: click the “Backend” URL in the chat panel to set a persisted WS URL (stored in `localStorage`).
- Clarified in `service_worker.js` that service workers do not intercept WebSockets.
- Fixed the plan’s `rg` verification command to use `--` so patterns starting with `--` aren’t parsed as flags.
