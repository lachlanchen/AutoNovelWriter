[English](README.md) · [العربية](i18n/README.ar.md) · [Español](i18n/README.es.md) · [Français](i18n/README.fr.md) · [日本語](i18n/README.ja.md) · [한국어](i18n/README.ko.md) · [Tiếng Việt](i18n/README.vi.md) · [中文 (简体)](i18n/README.zh-Hans.md) · [中文（繁體）](i18n/README.zh-Hant.md) · [Deutsch](i18n/README.de.md) · [Русский](i18n/README.ru.md)




[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>Scratch-like PWA + Tornado backend for controlling an automated novel-writing (and app-dev) pipeline.</strong></p>
  <p>
    <img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white" />
    <img alt="Backend" src="https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9" />
    <img alt="Frontend" src="https://img.shields.io/badge/frontend-PWA-10b981" />
    <img alt="Realtime" src="https://img.shields.io/badge/realtime-WebSocket-06b6d4" />
    <img alt="Pipeline" src="https://img.shields.io/badge/pipeline-script%20%2B%20AST-2563eb" />
    <img alt="Runtime" src="https://img.shields.io/badge/runtime-local%20state-orange" />
    <img alt="Status" src="https://img.shields.io/badge/status-active%20development-f59e0b" />
    <img alt="Canonical docs" src="https://img.shields.io/badge/docs-README.md-critical?style=flat" />
    <img alt="Languages" src="https://img.shields.io/badge/i18n-10%2B%20languages-8b5cf6?style=flat" />
  </p>
</div>

This repo also vendors `AutoAppDev/` as a submodule (reusable auto-development scripts).

> [!TIP]
> `README.md` is the canonical base. Localized variants live in `i18n/` and are linked by the single language-options line at the top.

## 🧭 Project Snapshot

| Quick facts | Details |
|---|---|
| Primary stack | Python + Tornado backend, browser PWA frontend |
| Core UX | Script + block editor backed by one canonical pipeline source |
| Execution mode | Resumable runner with persisted cursor and action results |
| Realtime | WebSocket endpoint at `/ws` |
| Mutable runtime root | `autonovelwriter/runtime/` (gitignored) |
## At-a-Glance Navigation

| 🎯 What to use now | 🔧 Command / URL |
|---|---|
| Open the local PWA | `http://127.0.0.1:8787/` |
| Connect live updates | `ws://127.0.0.1:8787/ws` |
| Start backend quickly | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Run scripted setup + start | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

> [!TIP]
> Fastest local start:
> 1. `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill`
> 2. Open `http://127.0.0.1:8787/`
> 3. Connect WebSocket updates at `ws://127.0.0.1:8787/ws`

## 🔌 Launch defaults

| Launch defaults | Value |
|---|---|
| PWA URL | `http://127.0.0.1:8787/` |
| WebSocket URL | `ws://127.0.0.1:8787/ws` |
| Backend host/port | `127.0.0.1:8787` |

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture at a Glance](#-architecture-at-a-glance)
- [Project Structure](#️-project-structure)
- [At-a-Glance Navigation](#at-a-glance-navigation)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#️-configuration)
- [Key Backend APIs](#-key-backend-apis)
- [Runtime Paths](#-runtime-paths)
- [Pipeline Script (Canonical Artifact)](#-pipeline-script-canonical-artifact)
- [Runner Outputs (Draft Stub)](#-runner-outputs-draft-stub)
- [Runner Tasks (Batch Stub)](#-runner-tasks-batch-stub)
- [Agent Settings / Codex Gate](#-agent-settings--codex-gate)
- [PWA I18N (UI Language)](#-pwa-i18n-ui-language)
- [Novel Settings (Separate From UI Language)](#️-novel-settings-separate-from-ui-language)
- [Examples](#-examples)
- [Development Notes](#️-development-notes)
- [Testing Notes](#-testing-notes)
- [Repository Contents](#-repository-contents)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#️-roadmap)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## 📌 Overview

AutoNovelWriter provides a local orchestration layer for:
- Editing a canonical pipeline script (`pipeline.script`) via both source text and block UI.
- Running resumable backend execution with persisted cursor and action results.
- Managing projects, materials, outputs, task batches, and action templates.
- Streaming live updates via WebSocket (`/ws`) to the PWA.

The canonical mutable runtime is `autonovelwriter/runtime/` (contents are gitignored).

| Area | What it does |
|---|---|
| Pipeline authoring | Edit canonical script + nested block UI from one shared source of truth |
| Execution | Resumable runner with persisted cursor and action results |
| Project ops | Project-scoped materials, outputs, settings, and task-batch activation |
| Realtime UX | `/ws` events for status/log/output/task/action updates |

## ✨ Features

- Scratch-like pipeline editor backed by a canonical script + parser/AST.
- Runner control APIs (`start/pause/resume/stop`) with resumable state.
- Control-flow containers: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Action Library with default templates + copy-on-edit user overrides.
- Project-scoped novel settings overrides with inherit semantics.
- Task batch generation/index/details/activation flow for `FOREACH_TASK`.
- Output indexing and latest novel PDF preview endpoints.
- Built-in PWA i18n dictionaries (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- tmux helper scripts and a resumable Codex auto-dev driver.

## 🧭 Architecture at a Glance

```text
Browser (PWA)
  ├─ pipeline editor (script + blocks)
  ├─ settings / projects / actions / tasks / outputs panels
  └─ WebSocket client (/ws)
          │
          ▼
Tornado backend (autonovelwriter/backend/server.py)
  ├─ REST APIs (/api/*)
  ├─ WebSocket broadcast hub
  ├─ parser + AST + canonical script persistence
  ├─ resumable runner + action result commit log
  └─ runtime bootstrap (dirs + defaults)
          │
          ▼
autonovelwriter/runtime/ (mutable, local-first)
  ├─ state/ (pipeline, settings, runner, chat)
  ├─ projects/<id>/ (materials, outputs, project settings)
  ├─ tasks/ (active list + generated batches)
  ├─ actions/ (defaults + user overrides)
  └─ logs/ (runner.log)
```

## 🗂️ Project Structure

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # AutoAppDev submodule declaration
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # main backend entrypoint + API/WS handlers + runner logic
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # backend unit tests
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # UI logic + embedded i18n dictionaries
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # mutable state/IO (contents gitignored)
├── scripts/
│   ├── run_autonovelwriter_tmux.sh
│   ├── setup_conda_env.sh
│   ├── setup_and_run_autonovelwriter.sh
│   ├── auto-autonovelwriter-development.sh
│   └── backups/
├── scripts-legacy/
├── docs/
│   ├── autonovelwriter_spec.md
│   ├── auto-development-guide.md
│   └── ORDERING_RATIONALE.md
├── references/
│   └── autonovelwriter_dev/
├── examples/
│   └── ralph-wiggum-example.sh
├── i18n/
│   ├── README.ar.md
│   ├── README.de.md
│   ├── README.es.md
│   ├── README.fr.md
│   ├── README.ja.md
│   ├── README.ko.md
│   ├── README.ru.md
│   ├── README.vi.md
│   ├── README.zh-Hans.md
│   └── README.zh-Hant.md
└── AutoAppDev/                    # git submodule (git@github.com:lachlanchen/AutoAppDev.git)
```

## ✅ Prerequisites

| Dependency | Required | Notes |
|---|---|---|
| Python `3.11+` | Yes | Recommended baseline |
| `pip` | Yes | Install backend dependencies |
| `tmux` | No | Needed for multi-pane launcher script |
| `conda` | No | Optional helper scripts |
| `node` | No | Optional for running PWA test file directly |

## 🚀 Installation

| Path | Best when | Command |
|---|---|---|
| Option A | You use conda and want repo-provided setup | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | You want setup + run in one command | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | You prefer manual pip control | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Conda helper (recommended for this repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Then run with tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B: One-shot setup + run

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Option C: Manual pip install

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

### Optional: initialize submodule

```bash
git submodule update --init --recursive
```

## 🧪 Usage

| Flow | Command / URL |
|---|---|
| Start backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Open app | `http://127.0.0.1:8787/` |
| WebSocket endpoint | `ws://127.0.0.1:8787/ws` |
| Optional static PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| tmux launcher | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Quick Start (No tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# open http://127.0.0.1:8787/
```

### Dev Run (Backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

The backend also serves the PWA static assets from `autonovelwriter/pwa/` by default, so you can open:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Optional: PWA (separate static dev server):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
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
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

The repo’s driver script (`scripts/auto-autonovelwriter-development.sh`) can also start a tmux session during auto-dev.

### Typical workflow

1. Start backend (or tmux helper).
2. Open PWA.
3. Edit pipeline via Blocks and/or script textarea.
4. Validate/save pipeline.
5. Start runner and monitor logs/status/events.
6. Review generated outputs/task batches.

## ⚙️ Configuration

### Environment variables

Use `autonovelwriter/backend/.env.example` as template. Key variables used by backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (default `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (default `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (default `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (CLI flag default: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (default: parent of repo root)
- `AUTONOVELWRITER_WRITER_SCRIPT` (default `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (default `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (default `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (agent execution gate, default disabled)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (optional codex binary override)

### Script CLI options

`run_autonovelwriter_tmux.sh`:
- `--session <name>`
- `--backend-port <n>`
- `--pwa-port <n>`
- `--host <ip>`
- `--env <conda_env>`
- `--debug`
- `--kill`
- `--no-attach`

`setup_conda_env.sh`:
- `--name <env>`
- `--python <ver>`
- `--force-recreate`

`setup_and_run_autonovelwriter.sh`:
- `--env <name>`
- `--python <ver>`
- `--session <name>`
- `--backend-port <n>`
- `--pwa-port <n>`
- `--host <ip>`
- `--force-recreate`
- `--debug`
- `--kill`
- `--no-attach`

## 🔌 Key Backend APIs

| API Group | Primary endpoints |
|---|---|
| Health & settings | `/api/health`, `/api/settings` |
| Projects & project settings | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tasks | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Actions | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Outputs & novel preview | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| Realtime | `/ws` |

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (per-project overrides with inherit semantics: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (writes `runtime/tasks/tasks.json` and project `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (copy-on-edit update for defaults)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (reads and parses `../scripts/auto-xiyouzhiyuan-writer.sh` as reference)
  - `POST /api/pipeline/reference_writer/load` (loads parsed result into runtime pipeline; never edits source script)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (inline PDF stream for viewer)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (runs `codex --version` only when enabled + env gate)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Runtime Paths

All mutable state and IO live under `autonovelwriter/runtime/`:

| Path | Purpose |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (drop `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend writes chat messages) |
| `autonovelwriter/runtime/state/` | persisted JSON state (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite chat mirror (in addition to chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | persisted active project pointer |
| `autonovelwriter/runtime/tasks/` | task queue files |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | generated task batches (e.g. from `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | project materials (inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | project outputs (drafts/exports) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | per-project novel-writing settings overrides (e.g. novel language) |
| `autonovelwriter/runtime/actions/defaults/` | seeded default Action Library templates (treated as immutable) |
| `autonovelwriter/runtime/actions/user/` | user Action Library templates (created via copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | mirrored chat inputs for writer pipeline ingestion |

## 🧩 Pipeline Script (Canonical Artifact)

The pipeline is represented as a formatted script on disk:
- `autonovelwriter/runtime/state/pipeline.script`

The backend serves it via `GET/POST /api/pipeline` as:
- `script` (canonical, shell-ish `STEP <type>` / `DISABLED <type>` lines)
- `pipeline` JSON (derived, flattened list for simple block rendering)
- `pipeline_ast` (derived, nested structure used for loops + indentation UI)

The runner executes steps derived from the same v2 parser/AST so what the PWA displays matches what runs.

Runner control flow supports v2 containers:
- `ROUND <n>` repeats its children `n` times.
- `FOREACH_TASK` runs its children once per task in the active task list (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` runs its children once per entry in the current task’s `payload.actions` list (intended to be nested under `FOREACH_TASK`).

Resumability:
- The runner persists a resumable execution cursor to `autonovelwriter/runtime/state/runner_state.json`.
- The cursor only advances after a block completes successfully (so restarts do not skip unfinished work).
- If the canonical pipeline script changes (hash mismatch), the runner stops and requires a restart (cursor invalidated).
- The runner persists per-step `ActionResult` records to `autonovelwriter/runtime/state/action_results.jsonl` and uses a deterministic per-step `exec_id` to avoid duplicating already-committed results on restart.
- When running inside `FOREACH_ACTION`, ActionResults include `action_index`, `action_id_ref`, and `action_key`, and vars include `prev` plus explicit `task.prev` vs `action.prev` scopes.

Pipeline script v2 supports nesting:
- `LOOP <n>` introduces a loop block.
- `ROUND <n>` introduces a rounds container block.
- `FOREACH_TASK` introduces a per-task container block.
- `FOREACH_ACTION` introduces a per-action container block (runner iterates `task.payload.actions`).
- `IF <expr>` introduces a conditional container block (parse/render; runner executes then-branch only for now).
- `ELSE` introduces an optional alternate branch under an `IF` block.
- Children are indented by 2 spaces per level.

Validation (no persistence):
- `POST /api/pipeline/validate` returns a canonical preview plus `pipeline_ast`, warnings, and errors.

The PWA shows the script in a textarea (source of truth) and renders nested blocks from `pipeline_ast`.
If the backend validate endpoint is unreachable, the PWA falls back to a local parser that supports the same v2 verbs (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Blocks UI notes:
- `LOOP` and `ROUND` repeat counts are editable inline in the blocks list; valid edits immediately update the canonical script textarea.
- The Blocks toolbar can insert `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, and `IF` containers without hand-editing the script (wraps the selected block, or appends a valid non-empty container).
- Blocks can be deleted from the canvas (per-block Delete button; keyboard `Delete` when a block is selected). Container deletes splice children up, and the editor keeps containers non-empty to avoid invalid scripts.
- `IF` blocks are kept structurally valid in the editor: `ELSE` cannot persist outside an `IF`, and the then-branch remains non-empty.
- `STEP` blocks expose Action Library controls: action selector, `Customize` (copy a default action to a user action and switch), and `Edit` (Action Editor modal for `name/tool/prompt/script`).

## 📝 Runner Outputs (Draft Stub)

When the pipeline contains a `STEP write` block, the backend runner will create a stub draft file under:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

The backend also emits:
- WS event `output_created` with `path` and `project_rel_path`
- A `log` line `[output] created: ...`

The PWA includes a minimal Outputs panel which lists files via `GET /api/outputs/index` and refreshes on `output_created`.

## 📦 Runner Tasks (Batch Stub)

When the pipeline contains a `STEP meta_tasks_generate` block, the backend runner will create a stub task batch under:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

The backend emits:
- WS event `tasks_batch_created` with `batch_dir`, `tasks_jsonl`, and `task_count`
- A `log` line `[tasks] created batch: ...`

The PWA includes a minimal Task Batches panel which lists batches via `GET /api/tasks/batches/index` and refreshes on `tasks_batch_created`.
It can also show batch details (`GET /api/tasks/batches/<batch_id>`) and activate a batch to become the current task list for `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Agent Settings / Codex Gate

The PWA Settings panel persists agent settings via `/api/settings` under `autonovelwriter/runtime/state/settings.json`.

For safety, the backend will not spawn the `codex` CLI unless both are true:
- `settings.agent.enabled=true` and `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` is set in the environment

Never commit secrets. Use `autonovelwriter/backend/.env.example` as a template for local env vars.

## 🌐 PWA I18N (UI Language)

The PWA has a lightweight built-in i18n system.

- Force UI language: add `?lang=<code>` to the PWA URL (for example `?lang=ja`).
- Persisted per-browser in localStorage: `anw_lang`.
- Supported UI languages: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Repository-level localized READMEs currently live in `i18n/` and are linked from the single language-options line at the top of this file.

| README locale files (`i18n/`) | Status |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Present |

## 🖋️ Novel Settings (Separate From UI Language)

Novel-writing preferences are stored in backend settings under `settings.novel.*` in:
- `autonovelwriter/runtime/state/settings.json`

These are intentionally separate from the PWA UI language (`?lang=` / `anw_lang`).

Per-project overrides are stored under:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Current global fields (editable in the PWA Settings modal):
- `settings.novel.language` (BCP-47-ish codes like `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Current project-level override fields (blank/unset = inherit global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Examples

### Minimal local run

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### tmux run with no auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Run backend test files directly

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Run PWA logic test file directly

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Scripted automation helper example

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Development Notes

### Driver Workflow (Auto-Dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Auto-Dev Progress (Generated)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` runs a resumable Codex-driven loop over tasks under `references/autonovelwriter_dev/` and will commit/push after each stage (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Useful controls:
- Stop after current task: `touch references/autonovelwriter_dev/STOP`
- Reset state tracking (keeps queue): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Start a fresh Codex session: `scripts/auto-autonovelwriter-development.sh --new-session`
- Safe practice: run in a clean branch/worktree and monitor `references/autonovelwriter_dev/state.tsv` before restarting

### Operational assumptions

- This README assumes local-first development on Linux/macOS with `bash` and Python 3.11+.
- Runtime state under `autonovelwriter/runtime/` is mutable and expected to be untracked.
- Pipeline behavior described here reflects current in-repo implementation in `autonovelwriter/backend/server.py` and `autonovelwriter/pwa/app.js`.

## 🧪 Testing Notes

There is no top-level `Makefile`/`tox`/`npm test` orchestrator in this repository at the time of writing.

Current practical test entry points:

| Area | Entry point |
|---|---|
| Backend parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Backend foreach-action syntax | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Backend runner semantics | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Backend action library update | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| PWA AST delete behavior | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (run individual test files)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

If you add or change runner semantics, pipeline syntax, or action-library behavior, update tests and README/API notes in the same change.

## 📚 Repository Contents

- `docs/autonovelwriter_spec.md`: Product spec for the Scratch-like controller (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Auto-develop the AutoNovelWriter app itself (task loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: Bilingual (EN/ZH) philosophy and requirements for a long-running, resumable auto-development agent.
- `docs/ORDERING_RATIONALE.md`: Example rationale for sequencing screenshot-driven steps.
- `scripts-legacy/`: Older automation scripts kept for reference but not used by AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Example Codex CLI automation helper.

Additional developer notes:
- Backend tests live in `autonovelwriter/backend/tests/`.
- A small PWA behavior test lives in `autonovelwriter/pwa/tests/`.
- `i18n/` is populated with localized repository README files, while UI translation dictionaries are embedded in `autonovelwriter/pwa/app.js`.

## 🧯 Troubleshooting

| Symptom | What to check |
|---|---|
| `tmux not found in PATH` | Install tmux or run backend/static servers manually. |
| `conda not found in PATH` when using `--env` scripts | Install Miniconda/Anaconda, or skip conda and use manual `pip` installation. |
| PWA cannot connect to backend | Verify backend address/port and WebSocket endpoint `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` returns gated/disabled | Ensure both `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, and environment `AUTONOVELWRITER_ENABLE_CODEX=1`. |
| Pipeline runner stops after script edit | Expected behavior; cursor invalidates on pipeline script hash mismatch and requires restart. |
| Static PWA on `:5173` works but API calls fail | Confirm backend is running on `:8787` (or update app/backend target settings accordingly). |

## 🗺️ Roadmap

- Complete and stabilize remaining auto-dev queue items (see generated progress block above).
- Expand and keep synchronized repository-level i18n README variants under `i18n/`.
- Broaden automated test coverage across runner edge cases and PWA interactions.
- Continue improving Action Library and task/action iteration workflows.

## 🤝 Contributing

Contributions are welcome.

Pragmatic guidance for this repository:
- Start from `docs/autonovelwriter_spec.md` and `docs/auto-development-guide.md`.
- Keep runtime mutations under `autonovelwriter/runtime/` (contents are gitignored), not tracked files.
- Prefer incremental PRs with reproducible run/test commands.
- If changing pipeline semantics or API contracts, update README and related tests together.

Note: a dedicated `CONTRIBUTING.md` was not found at repository root at the time of this draft.

---

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 License

License file/status is not explicitly declared at repository root in this draft context.

Assumption note:
- If you intend to open-source redistribution clearly, add a top-level `LICENSE` file and update this section accordingly.
