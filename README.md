# AutoNovelWriter

Scratch-like PWA + Tornado backend for controlling an automated novel-writing (and app-dev) pipeline.

This repo also vendors `AutoAppDev/` as a submodule (reusable auto-development scripts).

## Dev Run (Backend + PWA)

Backend (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

PWA (static dev server):
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

The repo’s driver script (`scripts/auto-autonovelwriter-development.sh`) can also start a tmux session with both panes.

## Runtime Paths

All mutable state and IO live under `autonovelwriter/runtime/` (ignored by git):
- `autonovelwriter/runtime/io/inbox/` user -> system (drop `.txt`/`.md`)
- `autonovelwriter/runtime/io/outbox/` system -> user (backend writes chat messages)
- `autonovelwriter/runtime/state/` persisted JSON state (settings, pipeline, runner, chat)
- `autonovelwriter/runtime/tasks/` task queue files
- `autonovelwriter/runtime/logs/` logs

## Key Backend APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- WebSocket events: `/ws` (broadcasts `hello`, `chat`, `outbox_written`, `run_status`, `task_status`, `log`)

## Contents
- `docs/autonovelwriter_spec.md`: Product spec for the Scratch-like controller (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Auto-develop the AutoNovelWriter app itself (task loop: plan -> implement -> critique -> fix -> summary -> commit+push).
- `docs/auto-development-guide.md`: Bilingual (EN/ZH) philosophy and requirements for a long-running, resumable auto-development agent.
- `docs/ORDERING_RATIONALE.md`: Example rationale for sequencing screenshot-driven steps.
- `scripts/app-auto-development.sh`: The linear pipeline driver (plan -> backend -> PWA -> Android -> iOS -> review -> summary), with resume/state support.
- `scripts/generate_screenshot_docs.sh`: Screenshot -> markdown description generator (Codex-driven).
- `scripts/setup_backend_env.sh`: Backend conda env bootstrap for local runs.
- `examples/ralph-wiggum-example.sh`: Example Codex CLI automation helper.
