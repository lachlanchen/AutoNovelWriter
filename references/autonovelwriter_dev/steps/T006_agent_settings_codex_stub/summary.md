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

Verification notes:
- No socket-binding smoke tests were run in this Codex sandbox; only syntax/greps.

## Fixes
- `/api/settings` GET now reloads settings from disk (source of truth) so UI reflects persisted state reliably.
- Codex gate now returns more specific disabled reasons (`agent_sdk_not_codex`, `agent_disabled`, `env_gate_disabled`) to make troubleshooting clearer.

## README
- Added/updated sections documenting agent settings persistence (`/api/settings` -> `autonovelwriter/runtime/state/settings.json`), Codex subprocess gating (`AUTONOVELWRITER_ENABLE_CODEX=1`), and the gated `POST /api/agent/test` helper.

## Next
1. Add settings for runtime path overrides (inbox/outbox/tasks/logs/state) and surface them in the UI (with validation).
2. Add a “redacted settings” view and ensure any future secret-like fields are never returned to the PWA or written to git.
3. Wire agent selection into runner behavior beyond the stub (per-block execution strategy and model selection).
4. Add basic auth/CSRF considerations for non-local deployments (today’s CORS and open WS are dev-friendly only).
