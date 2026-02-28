[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)



[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>Scratch-like PWA + backend Tornado để điều khiển một pipeline tự động viết tiểu thuyết (và phát triển ứng dụng).</strong></p>
  <p>
    <img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white" />
    <img alt="Backend" src="https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9" />
    <img alt="Frontend" src="https://img.shields.io/badge/frontend-PWA-10b981" />
    <img alt="Realtime" src="https://img.shields.io/badge/realtime-WebSocket-06b6d4" />
    <img alt="Pipeline" src="https://img.shields.io/badge/pipeline-script%20%2B%20AST-2563eb" />
    <img alt="Runtime" src="https://img.shields.io/badge/runtime-local%20state-orange" />
    <img alt="Status" src="https://img.shields.io/badge/status-active%20development-f59e0b" />
  </p>
</div>

Kho lưu trữ này cũng tích hợp `AutoAppDev/` dưới dạng submodule (các script tự động phát triển có thể tái sử dụng).

> [!TIP]
> `README.md` là bản gốc chính. Các bản địa hóa đặt trong `i18n/` và được liên kết bởi một dòng lựa chọn ngôn ngữ duy nhất ở đầu file.

## 🧭 Project Snapshot

| Điều cần biết nhanh | Chi tiết |
|---|---|
| Công nghệ chính | Python + Tornado backend, PWA frontend trong trình duyệt |
| UX cốt lõi | Script editor + block editor dùng chung một nguồn pipeline chuẩn |
| Chế độ chạy | Trình chạy có thể tiếp tục với con trỏ và kết quả action đã lưu |
| Thời gian thực | Endpoint WebSocket tại `/ws` |
| Runtime gốc có thể thay đổi | `autonovelwriter/runtime/` (được gitignore) |

## At-a-Glance Navigation

| Cần làm gì ngay | Lệnh / URL |
|---|---|
| Mở PWA local | `http://127.0.0.1:8787/` |
| Kết nối cập nhật trực tiếp | `ws://127.0.0.1:8787/ws` |
| Khởi động backend nhanh | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Chạy script thiết lập + khởi chạy | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

| Mặc định khởi chạy | Giá trị |
|---|---|
| PWA URL | `http://127.0.0.1:8787/` |
| WebSocket URL | `ws://127.0.0.1:8787/ws` |
| Host/port backend | `127.0.0.1:8787` |

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

AutoNovelWriter cung cấp lớp điều phối local cho:
- Soạn thảo pipeline chuẩn (`pipeline.script`) đồng thời qua văn bản nguồn và giao diện block.
- Chạy backend có khả năng tiếp tục (resumable) với con trỏ và kết quả action đã được lưu.
- Quản lý dự án, tài liệu, đầu ra, các lô task, và mẫu action.
- Truyền dữ liệu cập nhật trực tiếp qua WebSocket (`/ws`) đến PWA.

Runtime chuẩn có thể thay đổi là `autonovelwriter/runtime/` (nội dung được gitignore).

| Khu vực | Chức năng |
|---|---|
| Viết pipeline | Soạn thảo script chuẩn + giao diện block lồng nhau từ một nguồn tham chiếu duy nhất |
| Chạy | Runner có thể tiếp tục với con trỏ và kết quả action đã lưu |
| Vận hành dự án | Tài liệu, đầu ra, cài đặt theo dự án và kích hoạt batch task |
| UX thời gian thực | Sự kiện `/ws` cho cập nhật trạng thái/log/đầu ra/task/action |

## ✨ Features

- Trình soạn thảo pipeline kiểu Scratch chạy trên script chuẩn + parser/AST.
- API điều khiển runner (`start/pause/resume/stop`) với trạng thái có thể tiếp tục.
- Các khối điều khiển luồng: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Thư viện Action với mẫu mặc định + cơ chế ghi đè của người dùng theo kiểu copy-on-edit.
- Ghi đè cài đặt viết tiểu thuyết theo từng dự án với semantics kế thừa.
- Luồng sinh/chỉ mục/chi tiết/kích hoạt task batch cho `FOREACH_TASK`.
- Endpoint đánh chỉ mục đầu ra và xem trước PDF tiểu thuyết mới nhất.
- Từ điển i18n tích hợp sẵn cho PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Script hỗ trợ tmux và driver Codex auto-dev có khả năng resume.

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
| `pip` | Yes | Cài đặt dependency backend |
| `tmux` | No | Cần cho script launcher nhiều pane |
| `conda` | No | Script phụ trợ tuỳ chọn |
| `node` | No | Tùy chọn để chạy trực tiếp file test PWA |

## 🚀 Installation

| Đường dẫn | Phù hợp khi | Lệnh |
|---|---|---|
| Option A | Bạn dùng conda và muốn dùng thiết lập từ repo | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Bạn muốn setup + chạy trong một lệnh | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Bạn muốn kiểm soát pip thủ công | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

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

Backend cũng phục vụ static assets của PWA từ `autonovelwriter/pwa/` theo mặc định, vì vậy bạn có thể mở:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Optional: PWA (separate static dev server):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Mở PWA tại `http://127.0.0.1:5173` và trỏ sang backend (mặc định `ws://127.0.0.1:8787/ws`).

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

Repo’s driver script (`scripts/auto-autonovelwriter-development.sh`) có thể khởi tạo thêm một phiên tmux trong quá trình auto-dev.

### Typical workflow

1. Start backend (hoặc tmux helper).
2. Open PWA.
3. Edit pipeline qua Blocks và/hoặc textarea script.
4. Validate/save pipeline.
5. Start runner và theo dõi logs/status/events.
6. Review generated outputs/task batches.

## ⚙️ Configuration

### Environment variables

Dùng `autonovelwriter/backend/.env.example` làm mẫu. Các biến chính được backend/runtime sử dụng:

- `AUTONOVELWRITER_RUNTIME_ROOT` (mặc định `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (mặc định `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (mặc định `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (CLI flag mặc định: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (mặc định: cha của repo root)
- `AUTONOVELWRITER_WRITER_SCRIPT` (mặc định `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (mặc định `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (mặc định `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (agent execution gate, mặc định tắt)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (ghi đè nhị phân codex tuỳ chọn)

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
- Project settings (active project): `GET/POST /api/projects/settings` (override theo project với semantics kế thừa: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (tùy chọn: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (ghi vào `runtime/tasks/tasks.json` và `active_tasks.json` của dự án)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (copy-on-edit update for defaults)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (đọc và parse `../scripts/auto-xiyouzhiyuan-writer.sh` dưới dạng reference)
  - `POST /api/pipeline/reference_writer/load` (nạp kết quả parse vào runtime pipeline; không chỉnh sửa script nguồn)
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

Tất cả trạng thái mutable và IO nằm trong `autonovelwriter/runtime/`:

| Path | Purpose |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (đưa vào `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend ghi tin nhắn chat) |
| `autonovelwriter/runtime/state/` | trạng thái JSON đã lưu bền (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite chat mirror (ngoài `chat.jsonl`) |
| `autonovelwriter/runtime/state/active_project.json` | con trỏ dự án active đã được lưu |
| `autonovelwriter/runtime/tasks/` | các file hàng đợi task |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | lô task được sinh ra (ví dụ từ `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | tài liệu đầu vào của dự án |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | đầu ra dự án (bản nháp/xuất bản) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | override cài đặt viết tiểu thuyết theo dự án (ví dụ ngôn ngữ tiểu thuyết) |
| `autonovelwriter/runtime/actions/defaults/` | mẫu Action Library mặc định (được coi là immutable) |
| `autonovelwriter/runtime/actions/user/` | mẫu Action Library của người dùng (được tạo qua copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | mirrored chat inputs cho writer pipeline ingestion |

## 🧩 Pipeline Script (Canonical Artifact)

Pipeline được biểu diễn dưới dạng một script đã format trên đĩa:
- `autonovelwriter/runtime/state/pipeline.script`

Backend phục vụ qua `GET/POST /api/pipeline` dưới dạng:
- `script` (canonical, shell-ish `STEP <type>` / `DISABLED <type>` lines)
- `pipeline` JSON (derived, danh sách phẳng để render block đơn giản)
- `pipeline_ast` (derived, cấu trúc lồng dùng cho UI container + indentation)

Runner chạy các bước suy ra từ cùng parser/AST v2 nên giao diện mà PWA hiển thị sẽ khớp với thứ chạy thực tế.

Runner control flow hỗ trợ v2 containers:
- `ROUND <n>` lặp lại các con của nó `n` lần.
- `FOREACH_TASK` chạy các con của nó một lần cho mỗi task trong danh sách task active (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` chạy các con của nó một lần cho mỗi entry trong `payload.actions` của task hiện tại (dự kiến lồng dưới `FOREACH_TASK`).

Resumability:
- Runner lưu một con trỏ thực thi có thể tiếp tục vào `autonovelwriter/runtime/state/runner_state.json`.
- Con trỏ chỉ tăng sau khi một block hoàn thành thành công (nên restart không bỏ qua phần chưa xong).
- Nếu script pipeline chuẩn thay đổi (hash mismatch), runner dừng và yêu cầu restart (con trỏ bị vô hiệu hóa).
- Runner lưu `ActionResult` theo từng bước vào `autonovelwriter/runtime/state/action_results.jsonl` và dùng `exec_id` cố định theo bước để tránh commit lại kết quả đã có khi restart.
- Khi chạy bên trong `FOREACH_ACTION`, ActionResults bao gồm `action_index`, `action_id_ref`, và `action_key`, và biến bao gồm `prev` cùng phạm vi tường minh `task.prev` và `action.prev`.

Pipeline script v2 hỗ trợ lồng:
- `LOOP <n>` giới thiệu một block loop.
- `ROUND <n>` giới thiệu một block rounds.
- `FOREACH_TASK` giới thiệu một block theo từng task.
- `FOREACH_ACTION` giới thiệu một block theo từng action (runner lặp qua `task.payload.actions`).
- `IF <expr>` giới thiệu block điều kiện (parse/render; runner hiện chỉ chạy nhánh then).
- `ELSE` giới thiệu nhánh thay thế tùy chọn dưới một block `IF`.
- Các node con được thụt vào 2 dấu cách mỗi cấp.

Validation (không ghi vĩnh viễn):
- `POST /api/pipeline/validate` trả về bản preview chuẩn cùng `pipeline_ast`, warnings, và errors.

PWA hiển thị script trong textarea (nguồn chân lý) và render nested blocks từ `pipeline_ast`.
Nếu endpoint validate của backend không thể truy cập, PWA fallback sang parser cục bộ hỗ trợ cùng các verb v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Blocks UI notes:
- Giá trị lặp của `LOOP` và `ROUND` có thể chỉnh sửa inline trong danh sách block; chỉnh sửa hợp lệ sẽ cập nhật ngay ngay lập tức canonical script textarea.
- Thanh công cụ Blocks có thể chèn `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, và `IF` mà không cần chỉnh tay script (tự bao block đang chọn, hoặc thêm một container hợp lệ không rỗng).
- Có thể xóa Block khỏi canvas (nút Delete trên từng block; phím `Delete` khi block được chọn). Xóa container sẽ đưa các node con lên cùng cấp, và editor giữ container không rỗng để tránh script không hợp lệ.
- Block `IF` được giữ đúng cấu trúc trong editor: `ELSE` không thể tồn tại ngoài `IF`, và nhánh then luôn không rỗng.
- Block `STEP` hiển thị Action Library controls: action selector, `Customize` (copy một action mặc định thành action người dùng và chuyển sang dùng nó), và `Edit` (modal Action Editor cho `name/tool/prompt/script`).

## 📝 Runner Outputs (Draft Stub)

Khi pipeline chứa block `STEP write`, backend runner sẽ tạo file nháp stub tại:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Backend cũng phát:
- WS event `output_created` với `path` và `project_rel_path`
- Một dòng `log` `[output] created: ...`

PWA có panel Outputs tối thiểu liệt kê file qua `GET /api/outputs/index` và làm mới khi có `output_created`.

## 📦 Runner Tasks (Batch Stub)

Khi pipeline chứa block `STEP meta_tasks_generate`, backend runner sẽ tạo một task batch stub tại:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Backend phát:
- WS event `tasks_batch_created` với `batch_dir`, `tasks_jsonl`, và `task_count`
- Một dòng `log` `[tasks] created batch: ...`

PWA có panel Task Batches tối thiểu liệt kê batch qua `GET /api/tasks/batches/index` và làm mới khi có `tasks_batch_created`.
Nó cũng có thể hiển thị chi tiết batch (`GET /api/tasks/batches/<batch_id>`) và kích hoạt batch làm danh sách task hiện tại cho `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Agent Settings / Codex Gate

Panel Settings của PWA lưu trữ agent settings qua `/api/settings` tại `autonovelwriter/runtime/state/settings.json`.

Để bảo mật, backend sẽ không spawn lệnh `codex` trừ khi cả hai điều kiện đúng:
- `settings.agent.enabled=true` và `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` được set trong environment

Không commit secrets. Dùng `autonovelwriter/backend/.env.example` làm mẫu cho biến môi trường local.

## 🌐 PWA I18N (UI Language)

PWA có hệ thống i18n nhẹ, gắn sẵn.

- Đặt ngôn ngữ UI: thêm `?lang=<code>` vào URL PWA (ví dụ `?lang=ja`).
- Lưu theo trình duyệt: `anw_lang` trong localStorage.
- Ngôn ngữ UI được hỗ trợ: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Các README đa ngôn ngữ cấp repo hiện nằm trong `i18n/` và được liên kết từ một dòng lựa chọn ngôn ngữ ở đầu file.

| README locale files (`i18n/`) | Trạng thái |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Đã có |

## 🖋️ Novel Settings (Separate From UI Language)

Cài đặt viết tiểu thuyết được lưu trong backend settings dưới `settings.novel.*` tại:
- `autonovelwriter/runtime/state/settings.json`

Những cài đặt này tách biệt có chủ đích với ngôn ngữ UI của PWA (`?lang=` / `anw_lang`).

Override theo dự án được lưu tại:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Các trường global hiện tại (có thể chỉnh trong modal Settings của PWA):
- `settings.novel.language` (mã gần với BCP-47 như `en`, `ja`, `zh-Hans`, ...)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Các trường override cấp dự án (bỏ trống/không đặt = kế thừa global):
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

`scripts/auto-autonovelwriter-development.sh` chạy một loop Codex-driven resumable theo các task trong `references/autonovelwriter_dev/` và sẽ commit/push sau mỗi giai đoạn (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Useful controls:
- Stop after current task: `touch references/autonovelwriter_dev/STOP`
- Reset state tracking (giữ queue): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Start a fresh Codex session: `scripts/auto-autonovelwriter-development.sh --new-session`
- Thực hành an toàn: chạy trên clean branch/worktree và theo dõi `references/autonovelwriter_dev/state.tsv` trước khi khởi động lại

### Operational assumptions

- README này giả định phát triển local-first trên Linux/macOS với `bash` và Python 3.11+.
- Runtime state dưới `autonovelwriter/runtime/` là mutable và được mong đợi là untracked.
- Hành vi pipeline mô tả tại đây phản ánh implementation hiện tại trong `autonovelwriter/backend/server.py` và `autonovelwriter/pwa/app.js`.

## 🧪 Testing Notes

Không có orchestrator top-level `Makefile`/`tox`/`npm test` trong repo tại thời điểm viết.

Các entry point test thực tế hiện tại:

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

Nếu bạn thêm hoặc thay đổi runner semantics, pipeline syntax, hoặc action-library behavior, hãy cập nhật tests và ghi chú README/API trong cùng một thay đổi.

## 📚 Repository Contents

- `docs/autonovelwriter_spec.md`: Spec sản phẩm cho controller kiểu Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Auto-develop bản thân app AutoNovelWriter (task loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: Triết lý và yêu cầu song ngữ (EN/ZH) cho một agent phát triển tự động, chạy dài, có khả năng resume.
- `docs/ORDERING_RATIONALE.md`: Ví dụ về lý do sắp xếp theo thứ tự cho các bước dẫn bởi screenshot.
- `scripts-legacy/`: Script tự động hóa cũ được giữ để tham chiếu nhưng không dùng cho AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Ví dụ helper tự động hóa Codex CLI.

Additional developer notes:
- Backend tests live in `autonovelwriter/backend/tests/`.
- A small PWA behavior test lives in `autonovelwriter/pwa/tests/`.
- `i18n/` được điền đầy đủ các bản localized repository README, còn dictionary dịch UI được nhúng trong `autonovelwriter/pwa/app.js`.

## 🧯 Troubleshooting

| Symptom | What to check |
|---|---|
| `tmux not found in PATH` | Cài tmux hoặc chạy backend/static servers theo cách thủ công. |
| `conda not found in PATH` when using `--env` scripts | Cài Miniconda/Anaconda, hoặc bỏ qua conda và dùng cài đặt `pip` thủ công. |
| PWA cannot connect to backend | Kiểm tra địa chỉ backend và endpoint WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` returns gated/disabled | Đảm bảo cả `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, và env `AUTONOVELWRITER_ENABLE_CODEX=1`. |
| Pipeline runner stops after script edit | Đây là hành vi dự kiến; con trỏ bị vô hiệu hóa khi hash script pipeline thay đổi và cần restart. |
| Static PWA on `:5173` works but API calls fail | Xác nhận backend đang chạy trên `:8787` (hoặc chỉnh backend target trong PWA/backend tương ứng). |

## 🗺️ Roadmap

- Hoàn thiện và ổn định các mục auto-dev queue còn lại (xem block progress đã sinh ở trên).
- Mở rộng và đồng bộ hóa các biến thể README i18n tại `i18n/`.
- Mở rộng phạm vi test tự động cho các edge case runner và tương tác PWA.
- Tiếp tục cải thiện Action Library và workflows lặp qua task/action.

## 🤝 Contributing

Nhận đóng góp đều được hoan nghênh.

Hướng dẫn thực tế cho repo:
- Bắt đầu từ `docs/autonovelwriter_spec.md` và `docs/auto-development-guide.md`.
- Giữ các mutation chạy ở `autonovelwriter/runtime/` (nội dung gitignored), không ghi lên tracked files.
- Ưu tiên PR theo từng phần nhỏ, có lệnh chạy được lặp lại.
- Nếu thay đổi semantics pipeline hoặc API contract, hãy cập nhật README và tests liên quan cùng lúc.

Note: file `CONTRIBUTING.md` riêng chưa được tìm thấy tại root repo tại thời điểm of this draft.

---

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 License

License file/status is not explicitly declared at repository root in this draft.

Assumption note:
- If you intend to open-source redistribution clearly, add a top-level `LICENSE` file and update this section accordingly.
