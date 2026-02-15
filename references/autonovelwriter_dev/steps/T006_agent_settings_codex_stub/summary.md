# T006 Summary: Agent settings + codex runner stub (no secrets committed)

## Implement
- Backend (`autonovelwriter/backend/server.py`)
  - Extended default settings to include agent fields: `enabled`, `sdk`, `model`, `vision_model`, `codex_cli_path`.
  - Added a gated Codex subprocess stub:
    - Runs `codex --version` only when `settings.agent.enabled=true`, `settings.agent.sdk=codex`, and env `AUTONOVELWRITER_ENABLE_CODEX=1`.
    - Exposes `POST /api/agent/test` to exercise the stub (returns 403 when disabled).
    - Runner emits a one-time “codex disabled” log when user enabled codex but env gate is not set.
  - Updated `autonovelwriter/backend/.env.example` with `AUTONOVELWRITER_ENABLE_CODEX` and optional `AUTONOVELWRITER_CODEX_CLI_PATH`.
- PWA (`autonovelwriter/pwa/index.html`, `autonovelwriter/pwa/app.js`, `autonovelwriter/pwa/app.css`)
  - Added a Settings modal to edit/persist agent settings via `/api/settings`.
  - Added “Test Codex” button calling `/api/agent/test` and rendering output in chat.

## README
- Updated `README.md` to document the agent settings persistence and Codex gating rules.

Verification notes:
- No socket-binding smoke tests were run in this Codex sandbox; only syntax/greps.
