# T002 Plan: Bootstrap PWA shell (light theme, manifest, service worker)

## Files To Create/Change
- Change `autonovelwriter/pwa/index.html`
  - App shell layout: header + pipeline area placeholder + right-side chat panel.
  - Load `app.css` + `app.js`.
  - Link `manifest.webmanifest`.
- Create `autonovelwriter/pwa/app.css`
  - Light-theme CSS variables (tokens) as default.
  - Basic responsive layout (desktop split, mobile stacked).
- Create `autonovelwriter/pwa/app.js`
  - Establish WebSocket connection to backend `/ws`.
  - Render received `hello` event into chat panel.
  - Minimal chat UI scaffold (history list + input) with no persistence yet.
- Create `autonovelwriter/pwa/manifest.webmanifest`
  - Name/short_name/icons/theme_color/background_color; `display: standalone`.
- Create `autonovelwriter/pwa/service_worker.js`
  - Offline shell caching: cache core assets (`/`, `index.html`, `app.css`, `app.js`, manifest).
  - Network-first for `/ws` (or bypass) and API; cache-first for static.
- (Optional) Create `autonovelwriter/pwa/icons/` with a minimal PNG set.
- Create step artifacts:
  - `references/autonovelwriter_dev/steps/T002_bootstrap_pwa_shell/summary.md`
  - `references/autonovelwriter_dev/steps/T002_bootstrap_pwa_shell/critique.md`

## Acceptance Checklist
- [ ] PWA loads in a browser when served as static files (driver uses `python3 -m http.server --directory autonovelwriter/pwa`).
- [ ] Light theme is the default via CSS variables (no dark-first styling).
- [ ] Chat panel displays the backend WS `hello` event after connecting to `/ws`.

## Minimal Verification Commands (No TCP Bind)
```bash
# 1) Sanity: files exist
ls -la autonovelwriter/pwa/

# 2) Validate manifest JSON
python3 -m json.tool autonovelwriter/pwa/manifest.webmanifest >/dev/null

# 3) Grep for required tokens and references
rg -n "--(bg|fg|panel|accent)" autonovelwriter/pwa/app.css
rg -n "manifest\.webmanifest" autonovelwriter/pwa/index.html
rg -n "service_worker\.js" autonovelwriter/pwa/app.js autonovelwriter/pwa/index.html || true

# 4) Basic static-shell audit (no server): ensure relative paths are consistent
python3 - <<'PY'
from pathlib import Path
root = Path('autonovelwriter/pwa')
required = ['index.html','app.css','app.js','manifest.webmanifest','service_worker.js']
missing = [p for p in required if not (root/p).exists()]
print('missing:', missing)
PY
```

Notes:
- Full acceptance requires a real browser load and a backend reachable at `/ws`; the driver’s tmux panes will handle that outside this sandbox.
