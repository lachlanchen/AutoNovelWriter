# T002 Summary: Bootstrap PWA shell (light theme, manifest, service worker)

## Implement
- Replaced placeholder with a light-theme PWA shell UI (`autonovelwriter/pwa/index.html`, `autonovelwriter/pwa/app.css`).
- Added WebSocket client (`autonovelwriter/pwa/app.js`) that connects to backend `/ws`, shows connection status, and renders the backend `hello` event into the chat panel.
- Added PWA plumbing (`autonovelwriter/pwa/manifest.webmanifest`, `autonovelwriter/pwa/service_worker.js`) with a minimal offline cached shell.
- Added a simple SVG app icon at `autonovelwriter/pwa/icons/icon.svg`.

Verification notes:
- No TCP-binding smoke tests were run in this Codex sandbox (socket binds may be denied). Use the driver tmux panes to validate browser load + WS connectivity.
