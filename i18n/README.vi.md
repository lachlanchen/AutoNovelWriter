[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)




[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>PWA kiểu Scratch cùng backend Tornado để điều phối pipeline tự động viết tiểu thuyết (và phát triển ứng dụng).</strong></p>
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

Repo này cũng tích hợp `AutoAppDev/` như một submodule (tập hợp scripts tự động phát triển có thể tái sử dụng).

> [!TIP]
> `README.md` là tài liệu gốc. Các bản địa hoá được đặt trong `i18n/` và được liên kết bởi dòng chọn ngôn ngữ duy nhất ở đầu file.

## 🧭 Project Snapshot

| Quick facts | Details |
|---|---|
| Công nghệ chính | Python + Tornado backend, frontend PWA chạy trong trình duyệt |
| UX cốt lõi | Soạn thảo script + block dựa trên một nguồn pipeline quy chuẩn duy nhất |
| Chế độ chạy | Trình chạy có thể tiếp tục (resumable) với con trỏ và kết quả hành động đã lưu |
| Realtime | Endpoint WebSocket tại `/ws` |
| Nguồn runtime có thể thay đổi | `autonovelwriter/runtime/` (đã gitignore) |
## At-a-Glance Navigation

| 🎯 What to use now | 🔧 Command / URL |
|---|---|
| Mở PWA local | `http://127.0.0.1:8787/` |
| Kết nối cập nhật trực tiếp | `ws://127.0.0.1:8787/ws` |
| Khởi động backend nhanh | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Chạy setup + start gói gọn | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

> [!TIP]
> Cách nhanh nhất để chạy local:
> 1. `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill`
> 2. Mở `http://127.0.0.1:8787/`
> 3. Kết nối cập nhật WebSocket tại `ws://127.0.0.1:8787/ws`

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

AutoNovelWriter cung cấp một tầng điều phối nội bộ cục bộ để:
- Soạn thảo pipeline quy chuẩn (`pipeline.script`) qua cả văn bản nguồn và giao diện block.
- Chạy backend có thể tiếp tục (`resumable`) với con trỏ và kết quả hành động được lưu.
- Quản lý dự án, tài nguyên, đầu ra, nhóm task và mẫu action.
- Truyền luồng cập nhật trực tiếp qua WebSocket (`/ws`) tới PWA.

Runtime quy chuẩn có thể thay đổi là `autonovelwriter/runtime/` (nội dung được gitignore).

| Khu vực | Mô tả |
|---|---|
| Viết pipeline | Soạn thảo script chuẩn + giao diện block lồng nhau từ một nguồn dữ liệu duy nhất |
| Thực thi | Runner có thể tiếp tục chạy với con trỏ và kết quả hành động đã lưu |
| Vận hành dự án | Quản lý tài nguyên, đầu ra, cài đặt theo dự án và kích hoạt task batch |
| UX realtime | Sự kiện `/ws` cho update trạng thái/log/đầu ra/task/action |

## ✨ Features

- Trình soạn thảo pipeline kiểu Scratch chạy trên script chuẩn + parser/AST.
- API điều khiển runner (`start/pause/resume/stop`) có trạng thái có thể tiếp tục.
- Các khối điều khiển luồng: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Thư viện Action với template mặc định + lớp ghi đè của người dùng theo cơ chế copy-on-edit.
- Override cài đặt viết tiểu thuyết theo từng dự án với semantics kế thừa.
- Quy trình sinh/lập chỉ mục/chi tiết/kích hoạt task batch cho `FOREACH_TASK`.
- Endpoint lập chỉ mục đầu ra và xem trước PDF tiểu thuyết mới nhất.
- Từ điển i18n có sẵn cho PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Script hỗ trợ tmux và driver auto-dev Codex có khả năng resume.

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
| Python `3.11+` | Yes | baseline được khuyến nghị |
| `pip` | Yes | Cài dependency backend |
| `tmux` | No | Cần cho script launcher nhiều pane |
| `conda` | No | Script hỗ trợ tùy chọn |
| `node` | No | Tùy chọn để chạy trực tiếp file test PWA |

## 🚀 Installation

| Path | Tốt nhất khi | Command |
|---|---|---|
| Option A | Bạn dùng conda và muốn setup theo repo | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Bạn muốn setup + chạy trong một lệnh | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Bạn muốn điều khiển cài đặt pip thủ công | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

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

Backend cũng phục vụ static assets của PWA từ `autonovelwriter/pwa/` theo mặc định, nên bạn có thể mở:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Optional: PWA (separate static dev server):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Mở PWA tại `http://127.0.0.1:5173` rồi trỏ về backend (mặc định `ws://127.0.0.1:8787/ws`).

tmux (khởi chạy cả hai pane + log tail):

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

Script điều khiển repo (`scripts/auto-autonovelwriter-development.sh`) cũng có thể khởi tạo một session tmux khi auto-dev.

### Typical workflow

1. Khởi chạy backend (hoặc tmux helper).
2. Mở PWA.
3. Chỉnh pipeline qua Blocks và/hoặc textarea script.
4. Validate/save pipeline.
5. Khởi chạy runner và theo dõi logs/status/events.
6. Xem lại outputs/task batches đã tạo.

## ⚙️ Configuration

### Environment variables

Dùng `autonovelwriter/backend/.env.example` làm template. Các biến chính dùng bởi backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (mặc định `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (mặc định `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (mặc định `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (CLI flag mặc định: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (mặc định: parent của repo root)
- `AUTONOVELWRITER_WRITER_SCRIPT` (mặc định `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (mặc định `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (mặc định `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (agent execution gate, mặc định disabled)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (tuỳ chọn ghi đè đường dẫn binary codex)

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
- Project settings (active project): `GET/POST /api/projects/settings` (per-project overrides với semantics kế thừa: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (ghi vào `runtime/tasks/tasks.json` và `project_settings` của dự án)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (copy-on-edit update for defaults)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (đọc và parse `../scripts/auto-xiyouzhiyuan-writer.sh` làm reference)
  - `POST /api/pipeline/reference_writer/load` (nạp kết quả parse vào runtime pipeline; không chỉnh sửa source script)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (luồng PDF inline cho viewer)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (chỉ chạy `codex --version` khi đã bật gate + env)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Runtime Paths

Tất cả state và IO thay đổi nằm trong `autonovelwriter/runtime/`:

| Path | Mục đích |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (đưa vào `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend ghi chat messages) |
| `autonovelwriter/runtime/state/` | persisted JSON state (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite chat mirror (ngoài chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | con trỏ dự án active đã được lưu |
| `autonovelwriter/runtime/tasks/` | các file hàng đợi task |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | task batch đã sinh (ví dụ từ `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | tài liệu dự án (inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | đầu ra dự án (drafts/exports) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | override cài đặt viết tiểu thuyết theo dự án (ví dụ ngôn ngữ tiểu thuyết) |
| `autonovelwriter/runtime/actions/defaults/` | template mặc định Action Library (coi như immutable) |
| `autonovelwriter/runtime/actions/user/` | template Action Library của user (tạo qua copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | mirrored chat inputs cho writer pipeline ingestion |

## 🧩 Pipeline Script (Canonical Artifact)

Pipeline được biểu diễn dưới dạng script đã format trên đĩa:
- `autonovelwriter/runtime/state/pipeline.script`

Backend phục vụ thông qua `GET/POST /api/pipeline` với:
- `script` (canonical, shell-ish `STEP <type>` / `DISABLED <type>` lines)
- `pipeline` JSON (derived, danh sách phẳng cho việc render block đơn giản)
- `pipeline_ast` (derived, cấu trúc lồng dùng cho loops + indentation UI)

Runner thực thi các bước được sinh ra từ cùng parser/AST v2 để PWA hiển thị đúng nội dung đang chạy.

Luồng điều khiển runner hỗ trợ các container v2:
- `ROUND <n>` lặp lại children `n` lần.
- `FOREACH_TASK` chạy children của nó một lần cho mỗi task trong danh sách task đang active (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` chạy children của nó một lần cho mỗi entry trong `payload.actions` của task hiện tại (được thiết kế để lồng dưới `FOREACH_TASK`).

Khả năng tiếp tục:
- Runner lưu con trỏ thực thi có thể tiếp tục vào `autonovelwriter/runtime/state/runner_state.json`.
- Con trỏ chỉ tăng sau khi block hoàn thành thành công (vì vậy restart không bỏ qua phần chưa xong).
- Nếu script pipeline chuẩn thay đổi (hash mismatch), runner dừng và yêu cầu khởi động lại (con trỏ bị vô hiệu hoá).
- Runner lưu `ActionResult` theo từng bước vào `autonovelwriter/runtime/state/action_results.jsonl` và dùng `exec_id` định danh theo bước để không trùng lặp kết quả đã commit khi restart.
- Khi chạy trong `FOREACH_ACTION`, ActionResults gồm `action_index`, `action_id_ref`, và `action_key`, và biến bao gồm `prev` cùng phạm vi tách bạch `task.prev` và `action.prev`.

Pipeline script v2 hỗ trợ nesting:
- `LOOP <n>` thêm một loop block.
- `ROUND <n>` thêm một rounds container block.
- `FOREACH_TASK` thêm một per-task container block.
- `FOREACH_ACTION` thêm một per-action container block (runner iterate `task.payload.actions`).
- `IF <expr>` thêm một conditional container block (parse/render; runner hiện chỉ chạy nhánh then).
- `ELSE` thêm nhánh thay thế tùy chọn dưới block `IF`.
- Children được thụt lề 2 spaces mỗi cấp.

Validation (không lưu vĩnh viễn):
- `POST /api/pipeline/validate` trả về bản preview chuẩn kèm `pipeline_ast`, warnings và errors.

PWA hiển thị script trong textarea (nguồn gốc chân lý) và render nested blocks từ `pipeline_ast`.
Nếu endpoint validate của backend không truy cập được, PWA fallback sang parser local hỗ trợ cùng các verb v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Blocks UI notes:
- Giá trị lặp của `LOOP` và `ROUND` chỉnh trực tiếp inline trong danh sách block; sửa hợp lệ sẽ cập nhật ngay lập tức textarea script canonical.
- Thanh công cụ Blocks có thể chèn `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, và `IF` containers mà không cần chỉnh tay script (tự bao block đang chọn hoặc append một container hợp lệ không rỗng).
- Có thể xóa block từ canvas (nút Delete trên từng block; phím `Delete` khi block được chọn). Xóa container sẽ tách nodes con lên cùng cấp, và editor giữ container non-empty để tránh script không hợp lệ.
- Block `IF` được giữ đúng cấu trúc trong editor: `ELSE` không thể tồn tại ngoài `IF`, và nhánh then luôn non-empty.
- Block `STEP` hiển thị action controls: action selector, `Customize` (copy một action mặc định sang user action và chuyển sang dùng nó), và `Edit` (Action Editor modal cho `name/tool/prompt/script`).

## 📝 Runner Outputs (Draft Stub)

Khi pipeline chứa block `STEP write`, runner backend sẽ tạo file draft stub tại:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Backend cũng phát:
- WS event `output_created` với `path` và `project_rel_path`
- Một dòng `log` `[output] created: ...`

PWA có panel Outputs tối thiểu liệt kê file qua `GET /api/outputs/index` và refresh khi nhận `output_created`.

## 📦 Runner Tasks (Batch Stub)

Khi pipeline chứa block `STEP meta_tasks_generate`, runner backend sẽ tạo task batch stub tại:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Backend cũng phát:
- WS event `tasks_batch_created` với `batch_dir`, `tasks_jsonl`, và `task_count`
- Một dòng `log` `[tasks] created batch: ...`

PWA có panel Task Batches tối thiểu liệt kê batches qua `GET /api/tasks/batches/index` và refresh khi có `tasks_batch_created`.
Nó cũng có thể xem chi tiết batch (`GET /api/tasks/batches/<batch_id>`) và kích hoạt batch để trở thành danh sách task hiện tại cho `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Agent Settings / Codex Gate

Panel Settings của PWA lưu trữ agent settings qua `/api/settings` tại `autonovelwriter/runtime/state/settings.json`.

Để an toàn, backend sẽ không khởi tạo `codex` CLI trừ khi cả hai điều kiện đúng:
- `settings.agent.enabled=true` và `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` được set trong environment

Không commit secrets. Dùng `autonovelwriter/backend/.env.example` như template cho các biến môi trường local.

## 🌐 PWA I18N (UI Language)

PWA có hệ thống i18n gọn nhẹ.

- Cố định ngôn ngữ UI: thêm `?lang=<code>` vào URL PWA (ví dụ `?lang=ja`).
- Lưu theo trình duyệt trong localStorage: `anw_lang`.
- Các ngôn ngữ UI hỗ trợ: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- README đa ngôn ngữ cấp repo hiện nằm trong `i18n/` và được liên kết bằng một dòng language-options ở đầu file.

| README locale files (`i18n/`) | Trạng thái |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Có sẵn |

## 🖋️ Novel Settings (Separate From UI Language)

Cài đặt viết tiểu thuyết được lưu trong backend settings dưới `settings.novel.*` tại:
- `autonovelwriter/runtime/state/settings.json`

Những cài đặt này được tách biệt cố ý khỏi ngôn ngữ UI PWA (`?lang=` / `anw_lang`).

Per-project overrides được lưu tại:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Các trường global hiện tại (có thể chỉnh trong modal Settings của PWA):
- `settings.novel.language` (mã gần kiểu BCP-47 như `en`, `ja`, `zh-Hans`, ...)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Các trường override theo dự án (để trống/không đặt = kế thừa global):
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

`scripts/auto-autonovelwriter-development.sh` chạy một loop Codex-driven resumable qua các task trong `references/autonovelwriter_dev/` và sẽ commit/push sau mỗi giai đoạn (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Useful controls:
- Dừng sau task hiện tại: `touch references/autonovelwriter_dev/STOP`
- Reset state tracking (giữ queue): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Bắt đầu một Codex session mới: `scripts/auto-autonovelwriter-development.sh --new-session`
- Thực hành an toàn: chạy trong clean branch/worktree và theo dõi `references/autonovelwriter_dev/state.tsv` trước khi khởi động lại

### Operational assumptions

- README này giả định phát triển local-first trên Linux/macOS với `bash` và Python 3.11+.
- Trạng thái runtime trong `autonovelwriter/runtime/` là mutable và dự kiến không được theo dõi.
- Hành vi pipeline mô tả phản ánh implementation hiện tại trong `autonovelwriter/backend/server.py` và `autonovelwriter/pwa/app.js`.

## 🧪 Testing Notes

Không có orchestrator cấp top-level `Makefile`/`tox`/`npm test` trong repository tại thời điểm viết.

Các entry point test thực tế:

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

Nếu bạn thêm hoặc thay đổi runner semantics, cú pháp pipeline, hoặc hành vi action-library, cập nhật tests và ghi chú README/API trong cùng một thay đổi.

## 📚 Repository Contents

- `docs/autonovelwriter_spec.md`: Spec sản phẩm cho controller kiểu Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Auto-develop chính ứng dụng AutoNovelWriter (task loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: Tư duy song ngữ (EN/ZH) và yêu cầu cho agent auto-development chạy dài, có khả năng resume.
- `docs/ORDERING_RATIONALE.md`: Ví dụ lý do sắp xếp theo sequence bằng screenshot.
- `scripts-legacy/`: Các script tự động hóa cũ, giữ để tham khảo và không dùng cho AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Helper automates Codex CLI.

Additional developer notes:
- Backend tests nằm trong `autonovelwriter/backend/tests/`.
- Có một PWA behavior test nhỏ trong `autonovelwriter/pwa/tests/`.
- `i18n/` đã được điền các bản README repository có localize, còn dictionary dịch UI được nhúng trong `autonovelwriter/pwa/app.js`.

## 🧯 Troubleshooting

| Symptom | What to check |
|---|---|
| `tmux not found in PATH` | Cài tmux hoặc chạy backend/static servers thủ công. |
| `conda not found in PATH` khi dùng script `--env` | Cài Miniconda/Anaconda, hoặc bỏ qua conda và dùng cài `pip` thủ công. |
| PWA cannot connect to backend | Kiểm tra địa chỉ backend và endpoint WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` returns gated/disabled | Đảm bảo cả `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, và env `AUTONOVELWRITER_ENABLE_CODEX=1`. |
| Pipeline runner stops after script edit | Hành vi dự kiến; con trỏ bị vô hiệu hoá khi hash script pipeline mismatch và cần restart. |
| Static PWA on `:5173` works but API calls fail | Xác nhận backend đang chạy trên `:8787` (hoặc cập nhật target backend trong thiết lập app/backend cho phù hợp). |

## 🗺️ Roadmap

- Hoàn tất và ổn định các mục còn lại trong auto-dev queue (xem block progress ở trên).
- Mở rộng và đồng bộ hóa các bản README đa ngôn ngữ dưới `i18n/`.
- Mở rộng phạm vi kiểm thử tự động cho các edge case runner và tương tác PWA.
- Tiếp tục cải thiện Action Library và luồng lặp task/action.

## 🤝 Contributing

Đóng góp luôn được hoan nghênh.

Hướng dẫn thực tế cho repo:
- Bắt đầu từ `docs/autonovelwriter_spec.md` và `docs/auto-development-guide.md`.
- Giữ các mutation runtime trong `autonovelwriter/runtime/` (nội dung gitignored), không để theo track trong git.
- Ưu tiên PR theo từng phần nhỏ với lệnh chạy/tái tạo được.
- Nếu thay đổi semantics pipeline hoặc API contract, cập nhật README và tests liên quan cùng lúc.

Note: chưa tìm thấy file `CONTRIBUTING.md` riêng ở repo root tại thời điểm của bản nháp này.

---

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 License

File/địa vị status giấy phép chưa được khai báo rõ tại repository root trong bản nháp này.

Ghi chú giả định:
- Nếu bạn muốn phân phối mã nguồn công khai rõ ràng, thêm file `LICENSE` cấp root và cập nhật đúng phần này theo trạng thái thực tế.
