[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>用于控制自动化小说写作（及应用开发）流水线的 Scratch 风格 PWA + Tornado 后端。</strong></p>
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

本仓库同时将 `AutoAppDev/` 以子模块方式内置（可复用的自动化开发脚本集合）。

> [!TIP]
> `README.md` 是权威基准。各语言版本位于 `i18n/`，并由顶部的单行语言切换链接统一管理。

| 快速信息 | 说明 |
|---|---|
| 主要技术栈 | Python + Tornado 后端、浏览器端 PWA 前端 |
| 核心交互 | 以单一规范来源支持脚本式编辑与块式编辑 |
| 执行模式 | 支持可恢复运行；持久化执行游标与动作结果 |
| 实时能力 | WebSocket 端点：`/ws` |
| 可变运行时根目录 | `autonovelwriter/runtime/`（默认 gitignore） |

| 启动默认值 | 值 |
|---|---|
| PWA 地址 | `http://127.0.0.1:8787/` |
| WebSocket 地址 | `ws://127.0.0.1:8787/ws` |
| 后端主机/端口 | `127.0.0.1:8787` |

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture at a Glance](#-architecture-at-a-glance)
- [Project Structure](#️-project-structure)
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

AutoNovelWriter 提供本地编排层，用于：
- 通过源码文本与块状 UI 双路径编辑规范流水线脚本（`pipeline.script`）。
- 运行可恢复的后端执行流程，并持久化执行游标与动作结果。
- 管理项目、素材、产物、任务批次与动作模板。
- 通过 WebSocket（`/ws`）向 PWA 推送实时更新。

可变运行时根目录是 `autonovelwriter/runtime/`（内容会被 gitignore）。

| 模块 | 功能 |
|---|---|
| 流水线编排 | 从同一单一源同时编辑规范脚本和嵌套块 UI |
| 执行 | 支持可恢复状态的运行器 |
| 项目运维 | 项目范围的素材、产物、设置与任务批次激活 |
| 实时体验 | `/ws` 事件：状态/日志/输出/任务/动作更新 |

## ✨ Features

- Scratch 风格的流水线编辑器，底层由规范脚本与解析器/AST 驱动。
- 运行器控制 API（`start/pause/resume/stop`），支持可恢复状态。
- 控制流容器：`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF/ELSE`。
- 动作库：内置默认模板，并支持 copy-on-edit 的用户覆盖。
- 项目级小说设置覆盖，支持继承语义。
- `FOREACH_TASK` 的任务批次生成/索引/详情/激活流程。
- 输出索引与最新小说 PDF 预览端点。
- 内置 PWA i18n 字典（`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`、`fr`、`es`、`ru`、`de`）。
- tmux 辅助脚本以及可恢复的 Codex 自动开发驱动。

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

| 依赖项 | 是否必需 | 备注 |
|---|---|---|
| Python `3.11+` | 是 | 建议基线版本 |
| `pip` | 是 | 安装后端依赖 |
| `tmux` | 否 | 用于多窗格启动脚本 |
| `conda` | 否 | 可选辅助脚本 |
| `node` | 否 | 可选：直接运行 PWA 测试文件 |

## 🚀 Installation

| 路径 | 最适场景 | 命令 |
|---|---|---|
| 方案 A | 使用 conda 且偏好仓库提供的环境配置 | `scripts/setup_conda_env.sh --name autonovelwriter` |
| 方案 B | 希望一步完成安装与启动 | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| 方案 C | 你更偏好手动控制 pip | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Conda helper (recommended for this repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

然后使用 tmux 运行：

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

| 流程 | 命令 / 地址 |
|---|---|
| 启动后端 | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| 打开应用 | `http://127.0.0.1:8787/` |
| WebSocket 端点 | `ws://127.0.0.1:8787/ws` |
| 可选静态 PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| tmux launcher | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Quick Start (No tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# 打开 http://127.0.0.1:8787/
```

### Dev Run (Backend + PWA)

后端（Tornado）：

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

后端默认会从 `autonovelwriter/pwa/` 提供 PWA 的静态资源，因此你可直接打开：
- `http://127.0.0.1:8787/`（PWA）
- WebSocket：`ws://127.0.0.1:8787/ws`

可选：PWA（独立静态开发服务器）：

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

在 `http://127.0.0.1:5173` 打开 PWA，并将其指向后端（默认 `ws://127.0.0.1:8787/ws`）。

tmux（同时启动两个窗格 + 日志跟随）：

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
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

Conda 环境辅助：

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

仓库中的驱动脚本（`scripts/auto-autonovelwriter-development.sh`）也可在自动开发期间启动 tmux 会话。

### Typical workflow

1. 启动后端（或 tmux 辅助脚本）。
2. 打开 PWA。
3. 通过 Blocks 或脚本文本框编辑流水线。
4. 校验并保存流水线。
5. 启动运行器并监控日志 / 状态 / 事件。
6. 查看生成的产物与任务批次。

## ⚙️ Configuration

### Environment variables

以 `autonovelwriter/backend/.env.example` 为模板。后端/运行时使用的关键变量：

- `AUTONOVELWRITER_RUNTIME_ROOT`（默认 `autonovelwriter/runtime`）
- `AUTONOVELWRITER_PWA_ROOT`（默认 `autonovelwriter/pwa`）
- `AUTONOVELWRITER_HOST`（默认 `127.0.0.1`）
- `AUTONOVELWRITER_PORT`（CLI 默认值：`8787`）
- `AUTONOVELWRITER_WORKSPACE_ROOT`（默认：仓库上级目录）
- `AUTONOVELWRITER_WRITER_SCRIPT`（默认 `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`）
- `AUTONOVELWRITER_XIYOU_INPUT_DIR`（默认 `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`）
- `AUTONOVELWRITER_NOVELS_ROOT`（默认 `${WORKSPACE_ROOT}/auto-novels`）
- `AUTONOVELWRITER_ENABLE_CODEX`（代理执行开关，默认关闭）
- `AUTONOVELWRITER_CODEX_CLI_PATH`（可选的 codex 二进制覆盖路径）

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

| API 分组 | 主要端点 |
|---|---|
| 健康检查与设置 | `/api/health`, `/api/settings` |
| 项目与项目设置 | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| 流水线 | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| 任务 | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| 动作 | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| 运行器 | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| 输出与小说预览 | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| 实时更新 | `/ws` |

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings（当前激活项目）: `GET/POST /api/projects/settings`（项目级覆盖，继承字段：`novel_language`、`novel_tone`、`novel_target_length_words`）
- Materials index（当前项目）: `GET /api/materials/index`
- Outputs index（当前项目）: `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index`（可选：`?project=<project_id>`）
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate`（写入 `runtime/tasks/tasks.json` 与项目 `active_tasks.json`）
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>`（用于 copy-on-edit 更新默认模板）
- Pipeline（规范脚本 + 衍生 JSON）: `GET/POST /api/pipeline`
- Pipeline validate（仅预览）: `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer`（读取并解析 `../scripts/auto-xiyouzhiyuan-writer.sh`）
  - `POST /api/pipeline/reference_writer/load`（将解析结果加载到运行时 pipeline；不改动源脚本）
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest`（元信息）
  - `GET /api/novel/latest/pdf`（内联 PDF 流，用于查看器）
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test（受控）: `POST /api/agent/test`（仅在启用且环境变量通过时运行 `codex --version`）

### WebSocket

- 端点: `/ws`
- 推送事件: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Runtime Paths

所有可变状态与 IO 都位于 `autonovelwriter/runtime/`：

| 路径 | 用途 |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | 用户 -> 系统（投递 `.txt`/`.md`） |
| `autonovelwriter/runtime/io/outbox/` | 系统 -> 用户（后端写入聊天消息） |
| `autonovelwriter/runtime/state/` | 持久化 JSON 状态（settings、pipeline、runner、chat） |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite 聊天镜像（除了 chat.jsonl） |
| `autonovelwriter/runtime/state/active_project.json` | 持久化“当前激活项目”指针 |
| `autonovelwriter/runtime/tasks/` | 任务队列文件 |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 生成的任务批次（如 `meta_tasks_generate`） |
| `autonovelwriter/runtime/logs/` | 日志 |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | 项目素材（输入） |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | 项目产物（草稿/导出） |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | 项目级小说设置覆盖（如小说语言） |
| `autonovelwriter/runtime/actions/defaults/` | 预置动作库模板（视为不可变） |
| `autonovelwriter/runtime/actions/user/` | 用户自定义动作库（通过 copy-on-edit 创建） |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | 供写作流水线采集的聊天输入镜像 |

## 🧩 Pipeline Script (Canonical Artifact)

流水线在磁盘中的表示是一个格式化脚本：
- `autonovelwriter/runtime/state/pipeline.script`

后端通过 `GET/POST /api/pipeline` 提供：
- `script`（规范形式，shell 风格的 `STEP <type>` / `DISABLED <type>` 行）
- `pipeline` JSON（派生的扁平列表，用于简单块渲染）
- `pipeline_ast`（派生的嵌套结构，用于循环 + 缩进 UI）

运行器执行也基于同一 v2 parser/AST 派生的步骤，因此 PWA 展示与实际执行保持一致。

运行器控制流支持 v2 容器：
- `ROUND <n>` 将子节点重复 `n` 次。
- `FOREACH_TASK` 对当前激活任务列表（`autonovelwriter/runtime/tasks/tasks.json`）的每个任务执行其子节点一次。
- `FOREACH_ACTION` 对当前任务 `payload.actions` 列表中的每个条目执行其子节点一次（设计上应嵌套于 `FOREACH_TASK` 下）。

可恢复机制：
- 运行器将可恢复执行游标持久化到 `autonovelwriter/runtime/state/runner_state.json`。
- 仅当某个块成功完成后才前进游标，因此重启不会跳过未完成工作。
- 若规范脚本发生变更（hash 不匹配），运行器会停止并要求重启（游标失效）。
- 运行器将每步 `ActionResult` 持久化到 `autonovelwriter/runtime/state/action_results.jsonl`，并使用确定性的每步 `exec_id` 避免重启后重复提交已入账结果。
  - 在 `FOREACH_ACTION` 中运行时，ActionResults 包含 `action_index`、`action_id_ref`、`action_key`，变量中还会出现 `prev` 以及显式的 `task.prev` 与 `action.prev` 作用域。

Pipeline v2 支持嵌套：
- `LOOP <n>` 引入循环块
- `ROUND <n>` 引入轮次容器块
- `FOREACH_TASK` 引入按任务迭代容器
- `FOREACH_ACTION` 引入按动作迭代容器（运行器会遍历 `task.payload.actions`）
- `IF <expr>` 引入条件容器（解析与渲染已支持；当前运行器仅执行 then 分支）
- `ELSE` 在 `IF` 下引入可选分支
- 子节点每层缩进 2 个空格

校验（非持久化）：
- `POST /api/pipeline/validate` 返回规范预览及 `pipeline_ast`、warnings、errors。

PWA 在文本域中展示脚本（这是权威来源），并基于 `pipeline_ast` 渲染嵌套块。
若后端验证端点不可达，PWA 会回退到本地解析器，支持相同 v2 动词（`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF`、`ELSE`、`STEP`、`DISABLED`）。

Blocks UI 说明：
- `LOOP` 与 `ROUND` 的重复次数可在块列表中内联编辑；合法编辑会立即同步到规范脚本文本框。
- Blocks 工具栏可插入 `LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF` 容器，无需手工改脚本（会包裹选中的块，或追加一个合法且非空容器）。
- 可在画布中删除块（每个块有 Delete 按钮；选中块后也可按 `Delete` 键）。删除容器时会提升子节点，编辑器也会强制容器保持非空，以避免脚本非法。
- `IF` 块结构在编辑器内始终保持有效：`ELSE` 不会脱离 `IF` 持久化，且 then 分支保持非空。
- `STEP` 块提供动作库控制：动作选择器、`Customize`（将默认动作复制到用户动作并切换）与 `Edit`（`name/tool/prompt/script` 的动作编辑器弹窗）。

## 📝 Runner Outputs (Draft Stub)

当流水线包含 `STEP write` 块时，后端运行器会在项目输出目录下创建草稿文件：
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

后端同时会触发：
- WebSocket 事件 `output_created`（含 `path` 与 `project_rel_path`）
- 一行日志 `[output] created: ...`

PWA 包含最小化的 Outputs 面板，通过 `GET /api/outputs/index` 列出文件，并在 `output_created` 时刷新。

## 📦 Runner Tasks (Batch Stub)

当流水线包含 `STEP meta_tasks_generate` 时，后端运行器会在任务批次目录下创建占位输出：
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

后端同时会触发：
- WebSocket 事件 `tasks_batch_created`（含 `batch_dir`、`tasks_jsonl`、`task_count`）
- 一行日志 `[tasks] created batch: ...`

PWA 包含最小化的 Task Batches 面板，通过 `GET /api/tasks/batches/index` 列出批次，并在 `tasks_batch_created` 时刷新。
它还可查看批次详情（`GET /api/tasks/batches/<batch_id>`）并激活某批次作为 `FOREACH_TASK` 的当前任务列表（`POST /api/tasks/batches/<batch_id>/activate`）。

## 🔐 Agent Settings / Codex Gate

PWA 的设置面板通过 `/api/settings` 将代理设置持久化到 `autonovelwriter/runtime/state/settings.json`。

出于安全考虑，后端只有在以下条件同时满足时才会启动 `codex` CLI：
- `settings.agent.enabled=true` 且 `settings.agent.sdk="codex"`
- 环境变量 `AUTONOVELWRITER_ENABLE_CODEX=1` 已设置

请勿提交任何密钥。可使用 `autonovelwriter/backend/.env.example` 作为本地环境变量模板。

## 🌐 PWA I18N (UI Language)

PWA 内置轻量级 i18n 系统。

- 强制 UI 语言：在 PWA 地址后追加 `?lang=<code>`（例如 `?lang=ja`）。
- 浏览器持久化：`localStorage` 键为 `anw_lang`。
- 支持的 UI 语言：`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`（RTL）、`fr`、`es`、`ru`、`de`。
- 本仓库级 README 多语言版本位于 `i18n/`，并从本文件顶部的单一语言切换行跳转。

| README locale files (`i18n/`) | 状态 |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | 已存在 |

## 🖋️ Novel Settings (Separate From UI Language)

小说写作偏好存储在后端设置中的 `settings.novel.*`：
- `autonovelwriter/runtime/state/settings.json`

该设置与 PWA UI 语言（`?lang=` / `anw_lang`）有意保持解耦。

每个项目的覆盖设置存储于：
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

当前全局可编辑字段（PWA 设置弹窗）：
- `settings.novel.language`（类似 BCP-47 的代码，如 `en`、`ja`、`zh-Hans` 等）
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

当前项目级覆盖字段（空值/未设置 = 继承全局）：
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Examples

### Minimal local run

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# 然后打开 http://127.0.0.1:8787/
```

### tmux run with no auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
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

`scripts/auto-autonovelwriter-development.sh` 会对 `references/autonovelwriter_dev/` 下的任务执行可恢复的 Codex 自动循环，并在每个阶段（`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`）后提交并推送。

实用控制项：
- 在当前任务完成后停止：`touch references/autonovelwriter_dev/STOP`
- 重置状态跟踪（保留队列）：`scripts/auto-autonovelwriter-development.sh --reset-state`
- 开启全新 Codex 会话：`scripts/auto-autonovelwriter-development.sh --new-session`
- 安全实践：在干净的分支/工作区内运行，并在重启前检查 `references/autonovelwriter_dev/state.tsv`

### Operational assumptions

- 本 README 默认以 Linux/macOS 下本地优先的开发方式为前提，假定已安装 `bash` 与 Python 3.11+。
- `autonovelwriter/runtime/` 下的运行时状态是可变的，且预计不纳入版本控制。
- 这里描述的流水线行为以仓库内当前实现为准，主要位于 `autonovelwriter/backend/server.py` 和 `autonovelwriter/pwa/app.js`。

## 🧪 Testing Notes

当前仓库没有顶层 `Makefile`/`tox`/`npm test` 编排器。

当前可用的测试入口如下：

| 范围 | 入口 |
|---|---|
| 后端 parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| 后端 foreach-action 语法 | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| 后端运行器语义 | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| 后端动作库更新 | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| PWA AST 删除行为 | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (run individual test files)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

如果你修改了运行器语义、流水线语法或动作库行为，请同步更新测试与 README/API 说明。

## 📚 Repository Contents

- `docs/autonovelwriter_spec.md`：Scratch 风格控制器的产品规格（聊天 + 文件夹流水线 + start/pause/stop + settings）。
- `scripts/auto-autonovelwriter-development.sh`：自动开发 AutoNovelWriter 本身（任务循环：`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`）。
- `docs/auto-development-guide.md`：双语（EN/ZH）长程可恢复 auto-development 代理的理念与要求。
- `docs/ORDERING_RATIONALE.md`：截图驱动步骤排序的示例说明。
- `scripts-legacy/`：保留但不再用于 AutoNovelWriter 的旧脚本。
- `examples/ralph-wiggum-example.sh`：Codex CLI 自动化示例脚本。

额外开发说明：
- 后端测试位于 `autonovelwriter/backend/tests/`。
- 一个小型 PWA 行为测试在 `autonovelwriter/pwa/tests/`。
- `i18n/` 下存放本地化仓库 README 文件，UI 的翻译字典内置于 `autonovelwriter/pwa/app.js`。

## 🧯 Troubleshooting

| 现象 | 排查方向 |
|---|---|
| `tmux not found in PATH` | 安装 tmux，或改为手动运行后端/静态服务。 |
| `conda not found in PATH`（在使用 `--env` 脚本时） | 安装 Miniconda/Anaconda，或改用手动 `pip` 安装。 |
| PWA 无法连接后端 | 检查后端地址/端口和 WebSocket 端点 `ws://<host>:<port>/ws`。 |
| `POST /api/agent/test` 返回 gated/disabled | 确认同时满足 `settings.agent.enabled=true`、`settings.agent.sdk="codex"` 与环境变量 `AUTONOVELWRITER_ENABLE_CODEX=1`。 |
| 修改脚本后运行器停止 | 预期行为；规范脚本 hash 变化会使游标失效并要求重启。 |
| 静态 PWA 在 `:5173` 正常但接口失败 | 确认后端在 `:8787` 运行（或相应调整前端后端地址）。 |

## 🗺️ Roadmap

- 完成并稳定化剩余 auto-dev 队列任务（见上方自动进度块）。
- 扩展并持续同步 `i18n/` 下的仓库级 README 多语言版本。
- 扩大运行器边界场景与 PWA 交互的自动化测试覆盖。
- 继续改进动作库与任务/动作迭代流程。

## 🤝 Contributing

欢迎贡献。

仓库贡献建议：
- 先阅读 `docs/autonovelwriter_spec.md` 与 `docs/auto-development-guide.md`。
- 将运行时变更限制在 `autonovelwriter/runtime/`（该目录内容是 gitignored，不应提交）。
- 更推荐拆分成可复现的增量 PR。
- 如更改流水线语义或 API 契约，请同步更新 README 与相关测试。

备注：当前草稿环境中未发现独立 `CONTRIBUTING.md`。

## ❤️ Support

| Donate | PayPal | Stripe |
|---|---|---|
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=ko-fi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 License

本仓库根目录当前草稿中未显式声明 License 文件或状态。

假设说明：
- 如果你计划明确开源发布，请在顶层添加 `LICENSE` 文件并相应更新本节。
