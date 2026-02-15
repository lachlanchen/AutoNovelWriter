# T006 Plan: Agent settings + codex runner stub (no secrets committed)

## Files To Create/Change
- Backend
  - Change `autonovelwriter/backend/server.py`
    - Extend `/api/settings` schema and persistence to include:
      - `agent.sdk` (codex|copilot|gemini|claude)
      - `agent.model`, `agent.vision_model`
      - `agent.codex_cli_path` (optional override)
      - `agent.enabled` (default false)
    - Add a gated “codex runner stub” function:
      - Only runs if `agent.sdk == "codex"` and `agent.enabled == true` and an env gate is set (e.g. `AUTONOVELWRITER_ENABLE_CODEX=1`).
      - Uses `subprocess` to shell out to `codex` CLI (or `agent.codex_cli_path`).
      - Emits WS `log` events + updates `task_status` with stubbed results (no real prompt plumbing required yet).
      - If gate is off: emit clear log “codex disabled” and continue with stub behavior.
    - Add minimal endpoints (if needed) to test the stub without wiring full runner:
      - `POST /api/agent/test` (optional): attempts a no-op `codex --version` (or similar) behind the env gate and returns stdout/stderr.
  - Change `autonovelwriter/backend/.env.example`
    - Add `AUTONOVELWRITER_ENABLE_CODEX=0` and document that secrets must NOT be stored in repo.

- PWA
  - Change `autonovelwriter/pwa/index.html`
    - Add a Settings panel (modal or drawer) with fields:
      - Agent SDK dropdown
      - Model + vision model text inputs
      - “Enable codex runner” toggle (local UI flag; backend still requires env gate)
      - Backend URL hint remains unchanged
  - Change `autonovelwriter/pwa/app.js`
    - Load settings from `GET /api/settings`.
    - Save settings to `POST /api/settings`.
    - Show effective agent status (sdk/model + whether codex gate is enabled) in UI.

- Step artifacts
  - Create `references/autonovelwriter_dev/steps/T006_agent_settings_codex_stub/debug.md`
  - Create `references/autonovelwriter_dev/steps/T006_agent_settings_codex_stub/summary.md`

- README
  - Update `README.md` with:
    - Settings endpoint usage (`/api/settings`).
    - Codex gating: must set `AUTONOVELWRITER_ENABLE_CODEX=1` and never commit secrets.

## Acceptance Checklist
- [ ] Settings persist (agent sdk/model/path): values saved via `/api/settings` survive backend restart.
- [ ] Codex runner is stubbed + gated: no subprocess calls happen unless both settings + env gate allow it; otherwise the system logs “disabled”.
- [ ] No secrets in git: only `.env.example` added/extended; runtime state stays under `autonovelwriter/runtime/` (gitignored).

## Minimal Verification Commands (No TCP Bind)
```bash
python3 -m py_compile autonovelwriter/backend/server.py

# Settings keys present
rg -n -- "agent\\.sdk|AUTONOVELWRITER_ENABLE_CODEX|codex_cli_path" autonovelwriter/backend/server.py autonovelwriter/backend/.env.example

# PWA settings wiring present
rg -n -- "/api/settings" autonovelwriter/pwa/app.js autonovelwriter/pwa/index.html

# Ensure repo ignores runtime/IO artifacts (sanity)
rg -n -- "autonovelwriter/runtime" .gitignore
```
