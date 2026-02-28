[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)



[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>這是一個類似 Scratch 的 PWA 與 Tornado 後端，用來控制自動化小說寫作（也可用於應用開發）流程。</strong></p>
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

這個倉庫同時將 `AutoAppDev/` 以子模組方式納入（可重複使用的自動化開發腳本集合）。

> [!TIP]
> `README.md` 是唯一的權威版本。多語系版本皆放在 `i18n/`，並由檔案頂端單一的語系切換列集中串接。

## 🧭 Project Snapshot

| 快速資訊 | 說明 |
|---|---|
| 主要技術棧 | Python + Tornado 後端、瀏覽器 PWA 前端 |
| 核心體驗 | 以單一真實來源，同時支援腳本文本編輯與區塊式編輯 |
| 執行模式 | 支援可續跑執行，並持久化游標與步驟結果 |
| 即時能力 | WebSocket 端點：`/ws` |
| 可變執行時根目錄 | `autonovelwriter/runtime/`（已加入 `.gitignore`） |

## At-a-Glance Navigation

| 立即操作導覽 | 值 |
|---|---|
| 開啟本機 PWA | `http://127.0.0.1:8787/` |
| 連線即時更新 | `ws://127.0.0.1:8787/ws` |
| 快速啟動後端 | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| 一次完成腳本化啟動 | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

## 🔌 Launch defaults

| 啟動預設值 | 數值 |
|---|---|
| PWA URL | `http://127.0.0.1:8787/` |
| WebSocket URL | `ws://127.0.0.1:8787/ws` |
| 後端主機/埠號 | `127.0.0.1:8787` |

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

AutoNovelWriter 提供一個本機導向的編排層，用於：
- 透過腳本文字與區塊 UI 兩條路徑編輯規範流水線腳本（`pipeline.script`）。
- 運行可續跑的後端執行流程，並持久化執行游標與步驟結果。
- 管理專案、素材、輸出、任務批次與動作樣板。
- 透過 WebSocket（`/ws`）把即時更新推送到 PWA。

可變的執行時根目錄是 `autonovelwriter/runtime/`（內容預設不進版本控制）。

| 項目 | 功能 |
|---|---|
| 流程編輯 | 從同一來源同時編輯規範腳本與巢狀區塊 UI |
| 執行 | 可續跑執行器，會持久化游標與步驟結果 |
| 專案作業 | 專案層級的素材、輸出、設定與任務批次啟用 |
| 即時體驗 | `/ws` 事件：狀態、日誌、輸出、任務、動作更新 |

## ✨ Features

- 以規範腳本 + parser/AST 驅動的 Scratch 式流水線編輯器。
- 執行器控制 API（`start/pause/resume/stop`），支援可續跑狀態。
- 控制流程容器：`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF/ELSE`。
- 內建動作庫模板，含預設值與 copy-on-edit 使用者覆寫。
- 專案層級小說設定覆寫，採繼承語意。
- `FOREACH_TASK` 的任務批次建立、索引、詳情與啟用流程。
- 輸出索引與最新小說 PDF 預覽端點。
- 內建 PWA i18n 字典（`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`、`fr`、`es`、`ru`、`de`）。
- tmux 輔助腳本與可續跑的 Codex auto-dev driver。

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

| 依賴 | 必要性 | 備註 |
|---|---|---|
| Python `3.11+` | 是 | 建議使用的基線版本 |
| `pip` | 是 | 安裝後端依賴 |
| `tmux` | 否 | `tmux` 腳本啟動多窗格時需要 |
| `conda` | 否 | 可選輔助腳本 |
| `node` | 否 | 可選：直接執行 PWA 測試檔 |

## 🚀 Installation

| 路徑 | 最適用情境 | 指令 |
|---|---|---|
| 選項 A | 使用 conda，並想使用倉庫提供的安裝流程 | `scripts/setup_conda_env.sh --name autonovelwriter` |
| 選項 B | 想要一次完成安裝與啟動 | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| 選項 C | 偏好手動控制 pip | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Conda helper (recommended for this repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

然後使用 tmux 啟動：

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

| 流程 | 指令 / URL |
|---|---|
| 啟動後端 | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| 開啟應用 | `http://127.0.0.1:8787/` |
| WebSocket 端點 | `ws://127.0.0.1:8787/ws` |
| 可選：靜態 PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| tmux launcher | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Quick Start (No tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# 開啟 http://127.0.0.1:8787/
```

### Dev Run (Backend + PWA)

後端（Tornado）：

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

後端預設會提供 `autonovelwriter/pwa/` 的靜態資源，所以可直接開啟：
- `http://127.0.0.1:8787/`（PWA）
- WebSocket：`ws://127.0.0.1:8787/ws`

可選：PWA（獨立靜態開發伺服器）：

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

在 `http://127.0.0.1:5173` 開啟 PWA，並指向後端（預設 `ws://127.0.0.1:8787/ws`）。

tmux（同時開啟兩窗格並追蹤日誌）：

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda 環境輔助：

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

倉庫的驅動腳本（`scripts/auto-autonovelwriter-development.sh`）也可在自動開發時啟動 tmux 階段。

### Typical workflow

1. 啟動後端（或 tmux helper）。
2. 開啟 PWA。
3. 透過 Blocks 或腳本文字框編輯流水線。
4. 驗證並儲存流水線。
5. 啟動執行器，監看日誌／狀態／事件。
6. 檢視產生的輸出與任務批次。

## ⚙️ Configuration

### Environment variables

使用 `autonovelwriter/backend/.env.example` 作為模板。後端與執行時會用到以下主要變數：

- `AUTONOVELWRITER_RUNTIME_ROOT`（預設 `autonovelwriter/runtime`）
- `AUTONOVELWRITER_PWA_ROOT`（預設 `autonovelwriter/pwa`）
- `AUTONOVELWRITER_HOST`（預設 `127.0.0.1`）
- `AUTONOVELWRITER_PORT`（CLI 預設值：`8787`）
- `AUTONOVELWRITER_WORKSPACE_ROOT`（預設：倉庫目錄的上層）
- `AUTONOVELWRITER_WRITER_SCRIPT`（預設 `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`）
- `AUTONOVELWRITER_XIYOU_INPUT_DIR`（預設 `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`）
- `AUTONOVELWRITER_NOVELS_ROOT`（預設 `${WORKSPACE_ROOT}/auto-novels`）
- `AUTONOVELWRITER_ENABLE_CODEX`（代理執行閘道，預設停用）
- `AUTONOVELWRITER_CODEX_CLI_PATH`（可選擇的 codex 執行檔覆寫）

### Script CLI options

`run_autonovelwriter_tmux.sh`：
- `--session <name>`
- `--backend-port <n>`
- `--pwa-port <n>`
- `--host <ip>`
- `--env <conda_env>`
- `--debug`
- `--kill`
- `--no-attach`

`setup_conda_env.sh`：
- `--name <env>`
- `--python <ver>`
- `--force-recreate`

`setup_and_run_autonovelwriter.sh`：
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

| API 群組 | 主要端點 |
|---|---|
| 健康檢查與設定 | `/api/health`, `/api/settings` |
| 專案與專案設定 | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| 流水線 | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| 任務 | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| 動作 | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| 執行器 | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| 輸出與小說預覽 | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| 即時更新 | `/ws` |

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings（啟用中的專案）: `GET/POST /api/projects/settings`（每專案覆寫欄位與繼承語意：`novel_language`、`novel_tone`、`novel_target_length_words`）
- Materials index（啟用中的專案）: `GET /api/materials/index`
- Outputs index（啟用中的專案）: `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index`（可選：`?project=<project_id>`）
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate`（寫入 `runtime/tasks/tasks.json` 與專案 `active_tasks.json`）
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>`（copy-on-edit 更新預設動作）
- Pipeline（規範腳本 + 派生 JSON）: `GET/POST /api/pipeline`
- Pipeline validate（僅預覽）: `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer`（讀取並解析 `../scripts/auto-xiyouzhiyuan-writer.sh` 作為參考）
  - `POST /api/pipeline/reference_writer/load`（將解析結果載入 runtime pipeline；不改變來源腳本）
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest`（metadata）
  - `GET /api/novel/latest/pdf`（inline PDF stream，供檢視器使用）
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test（受控）: `POST /api/agent/test`（僅在啟用且通過環境門控時執行 `codex --version`）

### WebSocket

- Endpoint: `/ws`
- 廣播事件：`hello`、`chat`、`outbox_written`、`input_mirror_written`、`output_created`、`tasks_batch_created`、`tasks_batch_activated`、`action_created`、`action_updated`、`action_result_committed`、`run_status`、`task_status`、`log`、`pipeline_updated`、`project_active_changed`、`project_settings_updated`、`echo`

## 📁 Runtime Paths

所有可變狀態與 I/O 都集中在 `autonovelwriter/runtime/`：

| 路徑 | 用途 |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system（接收 `.txt`/`.md`） |
| `autonovelwriter/runtime/io/outbox/` | system -> user（後端寫入聊天訊息） |
| `autonovelwriter/runtime/state/` | 持久化 JSON 狀態（settings、pipeline、runner、chat） |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite 聊天鏡像（除 `chat.jsonl` 外） |
| `autonovelwriter/runtime/state/active_project.json` | 持久化啟用專案游標 |
| `autonovelwriter/runtime/tasks/` | 任務佇列檔案 |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 產生的任務批次（例如 `meta_tasks_generate`） |
| `autonovelwriter/runtime/logs/` | 日誌 |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | 專案素材（輸入） |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | 專案輸出（草稿／輸出） |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | 每專案小說設定覆寫（例如小說語言） |
| `autonovelwriter/runtime/actions/defaults/` | 預設 Action Library 範本（視為不可變） |
| `autonovelwriter/runtime/actions/user/` | 使用者 Action Library 範本（透過 copy-on-edit 建立） |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | 用於作家流程匯入聊天輸入的鏡像目錄 |

## 🧩 Pipeline Script (Canonical Artifact)

流水線在本機磁碟上的表示為格式化腳本：
- `autonovelwriter/runtime/state/pipeline.script`

後端透過 `GET/POST /api/pipeline` 提供：
- `script`（規範格式，類似 shell 的 `STEP <type>` / `DISABLED <type>` 行）
- `pipeline` JSON（衍生出來的扁平清單，用於簡單區塊渲染）
- `pipeline_ast`（衍生出來的巢狀結構，用於迴圈與縮排 UI）

執行器使用同一個 v2 parser/AST 的衍生步驟執行，因此 PWA 的顯示與實際執行一致。

執行器控制流程支援 v2 容器：
- `ROUND <n>` 重複其子步驟 `n` 次。
- `FOREACH_TASK` 對啟用任務清單（`autonovelwriter/runtime/tasks/tasks.json`）中的每個任務執行子步驟一次。
- `FOREACH_ACTION` 對目前任務 `payload.actions` 清單中的每個項目執行子步驟一次（預期置於 `FOREACH_TASK` 內）。

可續跑特性：
- 執行器會把可續跑游標持久化到 `autonovelwriter/runtime/state/runner_state.json`。
- 游標只有在區塊成功完成後才前進，因此重啟不會跳過未完成工作。
- 若規範腳本有變更（hash 不一致），執行器會停止並要求重啟（游標失效）。
- 執行器會將每步驟 `ActionResult` 持久化到 `autonovelwriter/runtime/state/action_results.jsonl`，並用可預測的每步驟 `exec_id` 避免重啟後重複提交已提交結果。
- 在 `FOREACH_ACTION` 中執行時，`ActionResults` 會包含 `action_index`、`action_id_ref` 與 `action_key`；變數中包含 `prev`，並區分 `task.prev` 與 `action.prev` 的作用域。

Pipeline script v2 支援巢狀：
- `LOOP <n>`：建立 loop 容器。
- `ROUND <n>`：建立 rounds 容器。
- `FOREACH_TASK`：建立 per-task 容器。
- `FOREACH_ACTION`：建立 per-action 容器（執行器會遍歷 `task.payload.actions`）。
- `IF <expr>`：建立條件容器（解析與渲染已支援；目前執行器只會走 then 分支）。
- `ELSE`：在 `IF` 底下建立可選替代分支。
- 子節點每層縮排為 2 個空格。

驗證（非持久化）：
- `POST /api/pipeline/validate` 會回傳規範預覽、`pipeline_ast`、warnings 與 errors。

PWA 以 textarea 顯示腳本（作為單一真相來源），並從 `pipeline_ast` 繪製巢狀區塊。
若後端 validate 端點無法存取，PWA 會退回本地 parser，支援相同 v2 指令（`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF`、`ELSE`、`STEP`、`DISABLED`）。

Blocks UI 說明：
- `LOOP` 與 `ROUND` 的重複次數可在區塊列表內聯編輯；合法編輯會立即同步回規範腳本 textarea。
- Blocks 工具列可插入 `LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF` 容器，不需手動改腳本（會包住所選區塊，或新增有效的非空容器）。
- 區塊可在畫布刪除（每個區塊有 Delete 按鈕；選取時可按鍵盤 `Delete`）。刪除容器會把子項目上提，編輯器會保持容器非空，避免生成無效腳本。
- `IF` 區塊在編輯器中始終保持結構正確：`ELSE` 不會脫離 `IF` 存在，且 then 分支會保持非空。
- `STEP` 區塊提供 Action Library 控制：動作選擇器、`Customize`（將預設動作複製為使用者動作並切換）、`Edit`（`name/tool/prompt/script` 的動作編輯視窗）。

## 📝 Runner Outputs (Draft Stub)

當流水線包含 `STEP write` 區塊時，後端 runner 會在以下目錄建立草稿檔：
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

後端也會輸出：
- WS 事件 `output_created`（含 `path`、`project_rel_path`）
- `log` 記錄行：`[output] created: ...`

PWA 包含簡化的 Outputs 面板，透過 `GET /api/outputs/index` 列出檔案，並在 `output_created` 時刷新。

## 📦 Runner Tasks (Batch Stub)

當流水線包含 `STEP meta_tasks_generate` 區塊時，後端 runner 會在以下目錄建立任務批次：
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

後端也會輸出：
- WS 事件 `tasks_batch_created`（含 `batch_dir`、`tasks_jsonl`、`task_count`）
- `log` 記錄行：`[tasks] created batch: ...`

PWA 包含簡化的 Task Batches 面板，透過 `GET /api/tasks/batches/index` 列出批次並在 `tasks_batch_created` 時刷新。
它同時支援顯示批次詳情（`GET /api/tasks/batches/<batch_id>`）並啟用某個批次作為 `FOREACH_TASK` 的目前任務清單（`POST /api/tasks/batches/<batch_id>/activate`）。

## 🔐 Agent Settings / Codex Gate

PWA 設定面板透過 `/api/settings` 把代理設定持久化到 `autonovelwriter/runtime/state/settings.json`。

為了安全考量，後端僅在兩條件都成立時才會啟動 `codex` CLI：
- `settings.agent.enabled=true` 且 `settings.agent.sdk="codex"`
- 環境變數 `AUTONOVELWRITER_ENABLE_CODEX=1` 已設置

請勿提交機密資訊。以 `autonovelwriter/backend/.env.example` 作為本機環境變數範本。

## 🌐 PWA I18N (UI Language)

PWA 內建輕量級 i18n。

- 強制 UI 語言：在 PWA URL 加上 `?lang=<code>`（例如 `?lang=ja`）。
- 每個瀏覽器儲存在 localStorage 的鍵值：`anw_lang`。
- 支援的 UI 語言：`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`（RTL）、`fr`、`es`、`ru`、`de`。
- 倉庫級 README 多語系版本位於 `i18n/`，由本檔案頂端的單一語系切換列連結。

| README locale files (`i18n/`) | 狀態 |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Present |

## 🖋️ Novel Settings (Separate From UI Language)

小說偏好會存放在後端設定 `autonovelwriter/runtime/state/settings.json` 的 `settings.novel.*`。

這些設定故意與 PWA UI 語言（`?lang=` / `anw_lang`）分離。

每專案覆寫存於：
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

目前可編輯的全域欄位（在 PWA 設定彈窗）：
- `settings.novel.language`（類 BCP-47 格式，如 `en`、`ja`、`zh-Hans`）
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

目前每專案可覆寫欄位（空白 / 未設定即繼承全域）：
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Examples

### Minimal local run

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# 然後開啟 http://127.0.0.1:8787/
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

`scripts/auto-autonovelwriter-development.sh` 會對 `references/autonovelwriter_dev/` 下的任務執行可續跑的 Codex 任務循環，並在每個階段（`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`）後提交並推送。

實用控制：
- 完成目前任務後停止：`touch references/autonovelwriter_dev/STOP`
- 重置狀態追蹤（保留隊列）：`scripts/auto-autonovelwriter-development.sh --reset-state`
- 啟動全新 Codex 階段：`scripts/auto-autonovelwriter-development.sh --new-session`
- 建議做法：在乾淨分支／工作區執行，並在重啟前檢查 `references/autonovelwriter_dev/state.tsv`

### Operational assumptions

- 本 README 假設在 Linux/macOS 本機環境、`bash` 與 Python 3.11+ 下使用。
- `autonovelwriter/runtime/` 下的執行時狀態可變，預期不進版控。
- 這裡描述的流水線行為以目前 `autonovelwriter/backend/server.py` 與 `autonovelwriter/pwa/app.js` 實作為準。

## 🧪 Testing Notes

目前此倉庫沒有頂層 `Makefile` / `tox` / `npm test` 協調腳本。

目前可用的實際測試入口：

| 範圍 | 入口 |
|---|---|
| 後端 parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| 後端 foreach-action 語法 | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| 後端 runner 語義 | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| 後端 Action Library 更新 | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| PWA AST 刪除行為 | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (run individual test files)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

若你新增或改變 runner 語義、流水線語法，或 Action Library 行為，請同步更新測試與 README/API 說明。

## 📚 Repository Contents

- `docs/autonovelwriter_spec.md`：Scratch 式控制器的產品規格（聊天 + folder pipe + start/pause/stop + settings）。
- `scripts/auto-autonovelwriter-development.sh`：自動開發 AutoNovelWriter 本身（任務循環：`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`）。
- `docs/auto-development-guide.md`：中英雙語（EN/ZH）長跑、可續跑自動開發代理的理念與需求。
- `docs/ORDERING_RATIONALE.md`：示範截圖驅動步驟排序的理由。
- `scripts-legacy/`：舊版自動化腳本保留，用途參考，但 AutoNovelWriter 不再使用。
- `examples/ralph-wiggum-example.sh`：Codex CLI 自動化輔助腳本範例。

Additional developer notes:
- 後端測試位於 `autonovelwriter/backend/tests/`。
- PWA 行為測試位於 `autonovelwriter/pwa/tests/`（小型）。
- `i18n/` 下已放置本地語系 README，UI 語言字典仍嵌在 `autonovelwriter/pwa/app.js`。

## 🧯 Troubleshooting

| 現象 | 排查方式 |
|---|---|
| `tmux not found in PATH` | 安裝 tmux，或改用手動啟動後端／靜態伺服器。 |
| `conda not found in PATH`（使用 `--env` 腳本時） | 安裝 Miniconda/Anaconda，或略過 conda 並改用手動 `pip` 安裝。 |
| PWA 無法連接後端 | 確認後端位址/連接埠與 WebSocket 端點 `ws://<host>:<port>/ws`。 |
| `POST /api/agent/test` 回傳 gated/disabled | 確保同時滿足 `settings.agent.enabled=true`、`settings.agent.sdk="codex"`，並且設定 `AUTONOVELWRITER_ENABLE_CODEX=1`。 |
| 編輯腳本後 Runner 停止 | 這是預期行為；規範腳本 hash 不一致會使游標失效，需重新啟動。 |
| 靜態 PWA 可在 `:5173` 開啟但 API 失敗 | 確認後端是否已在 `:8787` 運行（或調整前後端目標位址）。 |

## 🗺️ Roadmap

- 完成並穩定剩餘 auto-dev queue 項目（見上方產生的進度區塊）。
- 擴充並持續同步 `i18n/` 下 repository 層級 README 的語言版本。
- 擴大 runner 邊界案例與 PWA 互動測試覆蓋率。
- 持續提升 Action Library 與任務／動作迭代流程。

## 🤝 Contributing

歡迎貢獻。

實務建議：
- 先閱讀 `docs/autonovelwriter_spec.md` 與 `docs/auto-development-guide.md`。
- 將執行時變更限制在 `autonovelwriter/runtime/`（該目錄通常不進版控）。
- 優先採用可重複執行、漸進式的 PR。
- 若變更流水線語義或 API 契約，請同步更新 README 與相關測試。

Note: 目前在倉庫根目錄尚未發現獨立的 `CONTRIBUTING.md`。

---

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 License

本倉庫根目錄目前未明確宣告 `LICENSE` 檔案或授權狀態。

假設備註：
- 若你計劃正式開源發佈，請新增頂層 `LICENSE` 檔並同步更新本節。
