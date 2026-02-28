[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/figs/banner.png" alt="LazyingArt banner" />
</p>

# AutoNovelWriter

![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9)
![Frontend](https://img.shields.io/badge/frontend-PWA-10b981)
![Runtime](https://img.shields.io/badge/runtime-local%20state-orange)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)

以 Scratch 風格 PWA + Tornado 後端建構，用於控制自動化小說寫作（以及 app 開發）流程。

此 repo 也以子模組方式納入 `AutoAppDev/`（可重用的自動開發腳本）。

## Overview

AutoNovelWriter 提供本地編排層，支援：
- 透過原始文字與區塊 UI 共同編輯單一正典流程腳本（`pipeline.script`）。
- 以持久化游標與 action 結果執行可續跑後端流程。
- 管理專案、素材、輸出、任務批次與 action 範本。
- 透過 WebSocket（`/ws`）將即時更新串流到 PWA。

正典且可變動的執行期目錄為 `autonovelwriter/runtime/`（已加入 gitignore）。

| Area | 功能說明 |
|---|---|
| Pipeline authoring | 從同一份真實來源編輯正典腳本與巢狀區塊 UI |
| Execution | 具持久化游標與 action 結果的可續跑執行器 |
| Project ops | 以專案為範圍管理素材、輸出、設定與任務批次啟用 |
| Realtime UX | 透過 `/ws` 事件更新狀態／日誌／輸出／任務／action |

## Features

- 以正典腳本 + parser/AST 為核心的 Scratch 風格流程編輯器。
- 執行器控制 API（`start/pause/resume/stop`）與可續跑狀態。
- 控制流程容器：`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF/ELSE`。
- Action Library 具預設範本 + 編輯時複製（copy-on-edit）使用者覆寫。
- 以專案為範圍的小說設定覆寫，具繼承語意。
- 針對 `FOREACH_TASK` 的任務批次產生／索引／明細／啟用流程。
- 輸出索引與最新小說 PDF 預覽端點。
- 內建 PWA i18n 字典（`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`、`fr`、`es`、`ru`、`de`）。
- tmux 輔助腳本與可續跑的 Codex 自動開發驅動器。

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
│   └── runtime/                   # mutable state/IO (gitignored)
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
├── i18n/                          # present (currently no files)
└── AutoAppDev/                    # linked companion project
```

## ✅ Prerequisites

| Dependency | 必要性 | 備註 |
|---|---|---|
| Python `3.11+` | Yes | 建議基準版本 |
| `pip` | Yes | 安裝後端依賴 |
| `tmux` | No | 多分割啟動腳本需要 |
| `conda` | No | 可選輔助腳本 |
| `node` | No | 可選，用於直接執行 PWA 測試檔 |

## ⚙️ Installation

### Option A: Conda helper（本 repo 推薦）

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

接著用 tmux 執行：

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

## 🚀 Usage

### Dev Run (Backend + PWA)

Backend（Tornado）：
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

後端預設也會從 `autonovelwriter/pwa/` 提供 PWA 靜態資產，因此可直接開啟：
- `http://127.0.0.1:8787/`（PWA）
- WebSocket: `ws://127.0.0.1:8787/ws`

可選：PWA（獨立靜態開發伺服器）：
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

在 `http://127.0.0.1:5173` 開啟 PWA，並指向後端（預設 `ws://127.0.0.1:8787/ws`）。

tmux（同時啟動雙窗格 + 日誌追蹤）：
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda env helper：
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

此 repo 的驅動腳本（`scripts/auto-autonovelwriter-development.sh`）也可在自動開發期間啟動 tmux session。

### Typical workflow

1. 啟動後端（或 tmux helper）。
2. 開啟 PWA。
3. 透過區塊與／或腳本文字區編輯 pipeline。
4. 驗證／儲存 pipeline。
5. 啟動 runner 並監看 logs/status/events。
6. 檢視產生的輸出與任務批次。

## 🧠 Runtime Paths

所有可變動狀態與 I/O 都位於 `autonovelwriter/runtime/`（git 忽略）：

| Path | 用途 |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system（放入 `.txt`/`.md`） |
| `autonovelwriter/runtime/io/outbox/` | system -> user（後端寫入聊天訊息） |
| `autonovelwriter/runtime/state/` | 持久化 JSON 狀態（settings、pipeline、runner、chat） |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite 聊天鏡像（除了 chat.jsonl 之外） |
| `autonovelwriter/runtime/state/active_project.json` | 持久化「目前啟用專案」指標 |
| `autonovelwriter/runtime/tasks/` | 任務佇列檔案 |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 產生的任務批次（例如由 `meta_tasks_generate` 產生） |
| `autonovelwriter/runtime/logs/` | 日誌 |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | 專案素材（輸入） |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | 專案輸出（草稿／匯出） |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | 各專案小說設定覆寫（例如小說語言） |
| `autonovelwriter/runtime/actions/defaults/` | 預置預設 Action Library 範本（視為不可變） |
| `autonovelwriter/runtime/actions/user/` | 使用者 Action Library 範本（透過 copy-on-edit 建立） |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | 寫作流程擷取用的聊天輸入鏡像 |

## 🧩 Pipeline Script (Canonical Artifact)

pipeline 在磁碟上以格式化腳本表示：
- `autonovelwriter/runtime/state/pipeline.script`

後端透過 `GET/POST /api/pipeline` 提供：
- `script`（正典、類 shell 的 `STEP <type>` / `DISABLED <type>` 行）
- `pipeline` JSON（衍生、扁平清單，用於簡單區塊渲染）
- `pipeline_ast`（衍生、巢狀結構，用於 loops + 縮排 UI）

runner 會執行由同一套 v2 parser/AST 產生的步驟，因此 PWA 顯示內容與實際執行一致。
runner 控制流程支援 v2 容器：
- `ROUND <n>` 會讓其子節點重複執行 `n` 次。
- `FOREACH_TASK` 會針對 active task list（`autonovelwriter/runtime/tasks/tasks.json`）中的每個 task，各執行一次其子節點。
- `FOREACH_ACTION` 會針對目前 task 的 `payload.actions` 清單中每個項目，各執行一次其子節點（預期巢狀於 `FOREACH_TASK` 內）。

可續跑性：
- runner 會把可續跑執行游標持久化到 `autonovelwriter/runtime/state/runner_state.json`。
- 僅在區塊成功完成後游標才會前進（因此重啟不會略過未完成工作）。
- 若正典 pipeline script 有變更（hash mismatch），runner 會停止並要求重新啟動（游標失效）。
- runner 會將每步驟 `ActionResult` 記錄持久化到 `autonovelwriter/runtime/state/action_results.jsonl`，並使用具決定性的逐步 `exec_id`，避免重啟後重複提交已完成結果。
  - 在 `FOREACH_ACTION` 內執行時，ActionResults 會包含 `action_index`、`action_id_ref` 與 `action_key`，且 vars 會包含 `prev`，以及明確區分 `task.prev` 與 `action.prev` 範圍。

Pipeline script v2 支援巢狀：
- `LOOP <n>`：引入 loop 區塊
- `ROUND <n>`：引入 rounds 容器區塊
- `FOREACH_TASK`：引入逐 task 容器區塊
- `FOREACH_ACTION`：引入逐 action 容器區塊（runner 迭代 `task.payload.actions`）
- `IF <expr>`：引入條件容器區塊（可 parse/render；目前 runner 只執行 then 分支）
- `ELSE`：在 `IF` 區塊下引入可選替代分支
- 子節點每層縮排 2 個空格

驗證（不持久化）：
- `POST /api/pipeline/validate` 會回傳正典預覽與 `pipeline_ast`、warnings、errors。

PWA 以 textarea 顯示 script（單一真實來源），並從 `pipeline_ast` 渲染巢狀區塊。
若後端 validate 端點無法連線，PWA 會回退到本地 parser，支援相同 v2 動詞（`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF`、`ELSE`、`STEP`、`DISABLED`）。

Blocks UI 備註：
- `LOOP` 與 `ROUND` 的重複次數可在區塊清單內直接編輯；合法編輯會立即更新正典 script textarea。
- Blocks 工具列可插入 `LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION` 與 `IF` 容器，無需手動編輯腳本（包住選取區塊，或附加合法且非空容器）。
- 區塊可從畫布刪除（每個區塊的 Delete 按鈕；選取區塊時按鍵盤 `Delete`）。刪除容器時會把子節點向上拼接，且編輯器會維持容器非空以避免無效腳本。
- `IF` 區塊在編輯器中會維持結構合法：`ELSE` 不能在 `IF` 之外持久存在，且 then 分支保持非空。
- `STEP` 區塊提供 Action Library 控制：action 選擇器、`Customize`（把預設 action 複製成使用者 action 並切換）、`Edit`（用於 `name/tool/prompt/script` 的 Action Editor modal）。

## 🔧 Configuration

### Environment variables

使用 `autonovelwriter/backend/.env.example` 作為範本。後端／runtime 使用的關鍵變數：

- `AUTONOVELWRITER_RUNTIME_ROOT`（預設 `autonovelwriter/runtime`）
- `AUTONOVELWRITER_PWA_ROOT`（預設 `autonovelwriter/pwa`）
- `AUTONOVELWRITER_HOST`（預設 `127.0.0.1`）
- `AUTONOVELWRITER_PORT`（預設 `8787`）
- `AUTONOVELWRITER_WORKSPACE_ROOT`（預設：repo 根目錄的上層）
- `AUTONOVELWRITER_WRITER_SCRIPT`（預設 `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`）
- `AUTONOVELWRITER_XIYOU_INPUT_DIR`（預設 `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`）
- `AUTONOVELWRITER_NOVELS_ROOT`（預設 `${WORKSPACE_ROOT}/auto-novels`）
- `AUTONOVELWRITER_ENABLE_CODEX`（agent 執行閘門，預設停用）
- `AUTONOVELWRITER_CODEX_CLI_PATH`（可選 codex 二進位覆寫路徑）

## 🌐 Key Backend APIs

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings（active project）: `GET/POST /api/projects/settings`（具繼承語意的各專案覆寫：`novel_language`、`novel_tone`、`novel_target_length_words`）
- Materials index（active project）: `GET /api/materials/index`
- Outputs index（active project）: `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index`（可選：`?project=<project_id>`）
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate`（寫入 `runtime/tasks/tasks.json` 與專案 `active_tasks.json`）
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>`（預設項目的 copy-on-edit 更新）
- Pipeline（正典 script + 衍生 JSON）: `GET/POST /api/pipeline`
- Pipeline validate（僅預覽）: `POST /api/pipeline/validate`
- 參考寫作 pipeline 預覽／載入：
  - `GET /api/pipeline/reference_writer`（讀取並解析 `../scripts/auto-xiyouzhiyuan-writer.sh` 作為參考）
  - `POST /api/pipeline/reference_writer/load`（將解析結果載入 runtime pipeline；絕不編輯來源腳本）
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest`（metadata）
  - `GET /api/novel/latest/pdf`（提供 viewer 的 inline PDF stream）
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test（有閘門）: `POST /api/agent/test`（僅在啟用 + env gate 成立時執行 `codex --version`）

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Runner Outputs (Draft Stub)

當 pipeline 包含 `STEP write` 區塊時，後端 runner 會在下列位置建立 stub 草稿檔：
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

後端也會發送：
- WS event `output_created`（含 `path` 與 `project_rel_path`）
- `log` 行 `[output] created: ...`

PWA 含有最小化 Outputs 面板，透過 `GET /api/outputs/index` 列出檔案，並在 `output_created` 時刷新。

## 📦 Runner Tasks (Batch Stub)

當 pipeline 包含 `STEP meta_tasks_generate` 區塊時，後端 runner 會在下列位置建立 stub 任務批次：
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

後端會發送：
- WS event `tasks_batch_created`（含 `batch_dir`、`tasks_jsonl` 與 `task_count`）
- `log` 行 `[tasks] created batch: ...`

PWA 含有最小化 Task Batches 面板，透過 `GET /api/tasks/batches/index` 列出批次，並在 `tasks_batch_created` 時刷新。
它也能顯示批次明細（`GET /api/tasks/batches/<batch_id>`），並啟用某批次作為 `FOREACH_TASK` 的目前任務清單（`POST /api/tasks/batches/<batch_id>/activate`）。

## 🤖 Agent Settings / Codex Gate

PWA Settings 面板會透過 `/api/settings` 把 agent 設定持久化到 `autonovelwriter/runtime/state/settings.json`。

基於安全性，後端僅在以下兩條件都成立時才會啟動 `codex` CLI：
- `settings.agent.enabled=true` 且 `settings.agent.sdk="codex"`
- 環境變數已設定 `AUTONOVELWRITER_ENABLE_CODEX=1`

切勿提交 secrets。請以 `autonovelwriter/backend/.env.example` 作為本地環境變數範本。

## 🌍 PWA I18N (UI Language)

PWA 具有輕量內建 i18n 系統。

- 強制指定 UI 語言：在 PWA URL 加上 `?lang=<code>`（例如 `?lang=ja`）。
- 每個瀏覽器會持久化於 localStorage：`anw_lang`。
- 支援的 UI 語言：`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`（RTL）、`fr`、`es`、`ru`、`de`。

## 📚 Novel Settings (Separate From UI Language)

小說寫作偏好儲存在後端設定 `settings.novel.*`，位於：
- `autonovelwriter/runtime/state/settings.json`

這些設定刻意與 PWA UI 語言（`?lang=` / `anw_lang`）**分離**。

各專案覆寫儲存在：
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

目前欄位（可在 PWA Settings modal 編輯）：
- `settings.novel.language`（類 BCP-47 代碼，如 `en`、`ja`、`zh-Hans` 等）
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

目前專案層級覆寫欄位（空白／未設定 = 繼承全域）：
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 Examples

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

`scripts/auto-autonovelwriter-development.sh` 會對 `references/autonovelwriter_dev/` 下任務執行可續跑的 Codex 驅動循環，且**每個階段（plan/implement/debug/fix/i18n/summary/update_readme）後都會 commit/push**。

常用控制：
- 當前任務結束後停止：`touch references/autonovelwriter_dev/STOP`
- 重置狀態追蹤（保留 queue）：`scripts/auto-autonovelwriter-development.sh --reset-state`
- 啟動全新 Codex session：`scripts/auto-autonovelwriter-development.sh --new-session`
- 安全實務：在乾淨 branch/worktree 執行，並在重啟前監看 `references/autonovelwriter_dev/state.tsv`。

## 📚 Contents

- `docs/autonovelwriter_spec.md`：Scratch 風格控制器產品規格（chat + folder pipe + start/pause/stop + settings）。
- `scripts/auto-autonovelwriter-development.sh`：自動開發 AutoNovelWriter app 本身（任務循環：plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push）。
- `docs/auto-development-guide.md`：雙語（EN/ZH）長期執行、可續跑自動開發代理的理念與需求。
- `docs/ORDERING_RATIONALE.md`：截圖驅動步驟排序的範例理由。
- `scripts-legacy/`：保留供參考的舊版自動化腳本（AutoNovelWriter 不使用）。
- `examples/ralph-wiggum-example.sh`：Codex CLI 自動化輔助範例。

### Additional developer notes

- Backend 測試位於 `autonovelwriter/backend/tests/`。
- 一個小型 PWA 行為測試位於 `autonovelwriter/pwa/tests/`。
- 根目錄 `i18n/` 目錄存在但目前為空；UI 翻譯目前內嵌於 `autonovelwriter/pwa/app.js`。

## 🧯 Troubleshooting

- `tmux not found in PATH`：
  - 安裝 tmux，或手動執行 backend/static servers。
- 使用 `--env` 腳本時出現 `conda not found in PATH`：
  - 安裝 Miniconda/Anaconda，或跳過 conda 改用手動 `pip` 安裝。
- PWA 無法連線後端：
  - 確認後端位址／埠號與 WebSocket 端點 `ws://<host>:<port>/ws`。
- `POST /api/agent/test` 回傳 gated/disabled：
  - 確認 `settings.agent.enabled=true`、`settings.agent.sdk="codex"`，以及環境變數 `AUTONOVELWRITER_ENABLE_CODEX=1`。
- 編輯 script 後 pipeline runner 停止：
  - 屬預期行為；pipeline script hash mismatch 會使游標失效並需要重啟。

## 🧭 Roadmap

- 完成並穩定剩餘 auto-dev queue 項目（見上方 generated progress 區塊）。
- 擴充 repo 層級外部化 i18n 資產到 `i18n/`（目前目錄存在但為空）。
- 擴大 runner 邊界案例與 PWA 互動的自動化測試覆蓋。
- 持續改進 Action Library 與任務／action 迭代工作流程。

## 🤝 Contributing

歡迎貢獻。

本 repo 的務實建議：
- 從 `docs/autonovelwriter_spec.md` 與 `docs/auto-development-guide.md` 開始。
- 將執行期變更留在 `autonovelwriter/runtime/`（gitignore），不要寫入追蹤檔案。
- 優先提交可重現執行／測試指令的增量 PR。
- 若變更 pipeline 語意或 API 契約，請同步更新 README 與相關測試。

注意：在本草稿當下，repo 根目錄未找到專門的 `CONTRIBUTING.md`。

## ❤️ Sponsor & Donate

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 License

在此草稿脈絡中，repo 根目錄尚未明確宣告 License 檔案／狀態。

Assumption note:
- 若你打算明確支援開源再散布，請新增頂層 `LICENSE` 檔案並同步更新本節。
