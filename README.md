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

Open the PWA at `http://127.0.0.1:5173` and point it at the backend (default `ws://127.0.0.1:8787/ws`).

tmux (launch both panes + log tail):
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda env helper:
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

The repo’s driver script (`scripts/auto-autonovelwriter-development.sh`) can also start a tmux session during auto-dev.

## Runtime Paths

All mutable state and IO live under `autonovelwriter/runtime/` (ignored by git):
- `autonovelwriter/runtime/io/inbox/` user -> system (drop `.txt`/`.md`)
- `autonovelwriter/runtime/io/outbox/` system -> user (backend writes chat messages)
- `autonovelwriter/runtime/state/` persisted JSON state (settings, pipeline, runner, chat)
- `autonovelwriter/runtime/state/active_project.json` persisted “active project” pointer
- `autonovelwriter/runtime/tasks/` task queue files
- `autonovelwriter/runtime/logs/` logs
- `autonovelwriter/runtime/projects/<project_id>/materials/` project materials (inputs)
- `autonovelwriter/runtime/projects/<project_id>/outputs/` project outputs (drafts/exports)

## Pipeline Script (Canonical Artifact)

The pipeline is represented as a formatted script on disk:
- `autonovelwriter/runtime/state/pipeline.script`

The backend serves it via `GET/POST /api/pipeline` as:
- `script` (canonical, shell-ish `STEP <type>` / `DISABLED <type>` lines)
- `pipeline` JSON (derived, flattened list for simple block rendering)
- `pipeline_ast` (derived, nested structure used for loops + indentation UI)

The runner executes steps derived from the same v2 parser/AST so what the PWA displays matches what runs.

Pipeline script v2 supports nesting:
- `LOOP <n>` introduces a loop block
- children are indented by 2 spaces per level

Validation (no persistence):
- `POST /api/pipeline/validate` returns a canonical preview plus `pipeline_ast`, warnings, and errors.

The PWA shows the script in a textarea (source of truth) and renders nested blocks from `pipeline_ast`.

## Key Backend APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (runs `codex --version` only when enabled + env gate)
- WebSocket events: `/ws` (broadcasts `hello`, `chat`, `outbox_written`, `run_status`, `task_status`, `log`, `pipeline_updated`)

## Runner Outputs (Draft Stub)

When the pipeline contains a `STEP write` block, the backend runner will create a stub draft file under:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

The backend also emits:
- WS event `output_created` with `path` and `project_rel_path`
- a `log` line `[output] created: ...`

## Agent Settings / Codex Gate

The PWA Settings panel persists agent settings via `/api/settings` under `autonovelwriter/runtime/state/settings.json`.

For safety, the backend will not spawn the `codex` CLI unless both are true:
- `settings.agent.enabled=true` and `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` is set in the environment

Never commit secrets. Use `autonovelwriter/backend/.env.example` as a template for local env vars.

## PWA I18N (UI Language)

The PWA has a lightweight built-in i18n system.

- Force UI language: add `?lang=<code>` to the PWA URL (e.g. `?lang=ja`).
- Persisted per-browser in localStorage: `anw_lang`.
- Supported UI languages: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## Novel Settings (Separate From UI Language)

Novel-writing preferences are stored in backend settings under `settings.novel.*` in:
- `autonovelwriter/runtime/state/settings.json`

These are intentionally **separate** from the PWA UI language (`?lang=` / `anw_lang`).

Current fields (editable in the PWA Settings modal):
- `settings.novel.language` (BCP-47-ish codes like `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

## Driver Workflow (Auto-Dev)

`scripts/auto-autonovelwriter-development.sh` runs a resumable Codex-driven loop over tasks under `references/autonovelwriter_dev/` and **will commit/push after each stage** (plan/implement/debug/fix/i18n/summary/update_readme).

Useful controls:
- Stop after current task: `touch references/autonovelwriter_dev/STOP`
- Reset state tracking (keeps queue): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Start a fresh Codex session: `scripts/auto-autonovelwriter-development.sh --new-session`

## Contents
- `docs/autonovelwriter_spec.md`: Product spec for the Scratch-like controller (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Auto-develop the AutoNovelWriter app itself (task loop: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md`: Bilingual (EN/ZH) philosophy and requirements for a long-running, resumable auto-development agent.
- `docs/ORDERING_RATIONALE.md`: Example rationale for sequencing screenshot-driven steps.
- `scripts-legacy/`: older automation scripts kept for reference but not used by AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Example Codex CLI automation helper.
