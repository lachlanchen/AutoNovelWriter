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

一个类 Scratch 的 PWA + Tornado 后端，用于控制自动化小说写作（以及应用开发）流水线。

本仓库还以子模块形式引入了 `AutoAppDev/`（可复用的自动开发脚本）。

## 概览

AutoNovelWriter 提供本地编排层，用于：
- 通过源码文本和块状 UI 双方式编辑规范流水线脚本（`pipeline.script`）。
- 运行可恢复的后端执行流程，并持久化游标与动作结果。
- 管理项目、素材、产出、任务批次和动作模板。
- 通过 WebSocket（`/ws`）向 PWA 推送实时更新。

规范的可变运行时目录是 `autonovelwriter/runtime/`（已被 gitignore）。

| 区域 | 功能 |
|---|---|
| 流水线编写 | 从同一真实来源编辑规范脚本 + 嵌套块 UI |
| 执行 | 带持久化游标与动作结果的可恢复运行器 |
| 项目运维 | 按项目维度管理素材、产出、设置与任务批次激活 |
| 实时体验 | 通过 `/ws` 推送状态/日志/输出/任务/动作更新 |

## 功能

- 基于规范脚本 + parser/AST 的类 Scratch 流水线编辑器。
- 运行器控制 API（`start/pause/resume/stop`），支持可恢复状态。
- 控制流容器：`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF/ELSE`。
- 动作库（Action Library）含默认模板 + copy-on-edit 用户覆盖。
- 项目级小说设置覆盖，带继承语义。
- 面向 `FOREACH_TASK` 的任务批次生成/索引/详情/激活流程。
- 输出索引与最新小说 PDF 预览端点。
- 内置 PWA i18n 字典（`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`、`fr`、`es`、`ru`、`de`）。
- tmux 辅助脚本与可恢复的 Codex 自动开发驱动。

## 🗂️ 项目结构

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # AutoAppDev 子模块声明
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # 后端主入口 + API/WS 处理器 + 运行器逻辑
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # 后端单元测试
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # UI 逻辑 + 内嵌 i18n 字典
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # 可变状态/IO（gitignored）
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
├── i18n/                          # 已存在（当前无文件）
└── AutoAppDev/                    # 链接的配套项目
```

## ✅ 前置依赖

| 依赖 | 必需 | 说明 |
|---|---|---|
| Python `3.11+` | 是 | 推荐基线 |
| `pip` | 是 | 安装后端依赖 |
| `tmux` | 否 | 多窗格启动脚本需要 |
| `conda` | 否 | 可选辅助脚本 |
| `node` | 否 | 可选：直接运行 PWA 测试文件 |

## ⚙️ 安装

### 方案 A：Conda 辅助（本仓库推荐）

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

然后用 tmux 运行：

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### 方案 B：一键安装 + 运行

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### 方案 C：手动 pip 安装

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

## 🚀 使用

## 开发运行（Backend + PWA）

后端（Tornado）：
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

后端默认也会从 `autonovelwriter/pwa/` 提供 PWA 静态资源，因此你可以打开：
- `http://127.0.0.1:8787/`（PWA）
- WebSocket：`ws://127.0.0.1:8787/ws`

可选：PWA（独立静态开发服务器）：
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

在 `http://127.0.0.1:5173` 打开 PWA，并将其指向后端（默认 `ws://127.0.0.1:8787/ws`）。

tmux（同时启动两个窗格 + 日志 tail）：
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda 环境辅助：
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

仓库中的驱动脚本（`scripts/auto-autonovelwriter-development.sh`）在自动开发期间也可启动 tmux 会话。

### 典型工作流

1. 启动后端（或 tmux 辅助脚本）。
2. 打开 PWA。
3. 通过 Blocks 和/或脚本文本框编辑流水线。
4. 校验并保存流水线。
5. 启动运行器并监控日志/状态/事件。
6. 查看生成产出与任务批次。

## 🧠 运行时路径

所有可变状态与 IO 都位于 `autonovelwriter/runtime/`（被 git 忽略）：

| 路径 | 用途 |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | 用户 -> 系统（投递 `.txt`/`.md`） |
| `autonovelwriter/runtime/io/outbox/` | 系统 -> 用户（后端写入聊天消息） |
| `autonovelwriter/runtime/state/` | 持久化 JSON 状态（settings、pipeline、runner、chat） |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite 聊天镜像（除 chat.jsonl 外） |
| `autonovelwriter/runtime/state/active_project.json` | 持久化“当前激活项目”指针 |
| `autonovelwriter/runtime/tasks/` | 任务队列文件 |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 生成的任务批次（例如来自 `meta_tasks_generate`） |
| `autonovelwriter/runtime/logs/` | 日志 |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | 项目素材（输入） |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | 项目产出（草稿/导出） |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | 项目级小说设置覆盖（例如小说语言） |
| `autonovelwriter/runtime/actions/defaults/` | 预置的默认动作库模板（视为不可变） |
| `autonovelwriter/runtime/actions/user/` | 用户动作库模板（通过 copy-on-edit 创建） |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | 为写作流水线摄取而镜像的聊天输入 |

## 🧩 流水线脚本（规范工件）

流水线在磁盘上表示为格式化脚本：
- `autonovelwriter/runtime/state/pipeline.script`

后端通过 `GET/POST /api/pipeline` 提供：
- `script`（规范形态，shell 风格 `STEP <type>` / `DISABLED <type>` 行）
- `pipeline` JSON（派生的扁平列表，用于简单块渲染）
- `pipeline_ast`（派生的嵌套结构，用于循环 + 缩进 UI）

运行器执行基于同一 v2 parser/AST 派生的步骤，因此 PWA 显示内容与实际执行保持一致。
运行器控制流支持 v2 容器：
- `ROUND <n>` 将其子节点重复 `n` 次。
- `FOREACH_TASK` 针对当前激活任务列表中的每个任务执行其子节点一次（`autonovelwriter/runtime/tasks/tasks.json`）。
- `FOREACH_ACTION` 针对当前任务 `payload.actions` 列表中的每个条目执行其子节点一次（设计上应嵌套在 `FOREACH_TASK` 下）。

可恢复性：
- 运行器将可恢复执行游标持久化到 `autonovelwriter/runtime/state/runner_state.json`。
- 仅当某个块成功完成后，游标才会前进（因此重启不会跳过未完成工作）。
- 若规范流水线脚本发生变化（hash 不匹配），运行器会停止并要求重启（游标失效）。
- 运行器将每步 `ActionResult` 记录持久化到 `autonovelwriter/runtime/state/action_results.jsonl`，并使用确定性的每步 `exec_id` 来避免重启后重复提交已入账结果。
  - 在 `FOREACH_ACTION` 中运行时，ActionResults 包含 `action_index`、`action_id_ref`、`action_key`，且 vars 包含 `prev` 及显式的 `task.prev` 与 `action.prev` 作用域。

流水线脚本 v2 支持嵌套：
- `LOOP <n>` 引入循环块
- `ROUND <n>` 引入“轮次”容器块
- `FOREACH_TASK` 引入按任务迭代的容器块
- `FOREACH_ACTION` 引入按动作迭代的容器块（运行器迭代 `task.payload.actions`）
- `IF <expr>` 引入条件容器块（解析/渲染已支持；当前运行器仅执行 then 分支）
- `ELSE` 在 `IF` 块下引入可选的替代分支
- 子节点每层缩进 2 个空格

校验（不持久化）：
- `POST /api/pipeline/validate` 返回规范预览以及 `pipeline_ast`、warnings、errors。

PWA 会在文本框中展示脚本（真实来源），并基于 `pipeline_ast` 渲染嵌套块。
如果后端校验端点不可达，PWA 会回退到本地解析器，支持同样的 v2 动词（`LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF`、`ELSE`、`STEP`、`DISABLED`）。

Blocks UI 说明：
- `LOOP` 与 `ROUND` 的重复次数可在块列表中内联编辑；合法编辑会立刻更新规范脚本文本框。
- Blocks 工具栏可插入 `LOOP`、`ROUND`、`FOREACH_TASK`、`FOREACH_ACTION`、`IF` 容器，无需手改脚本（会包裹当前选中块，或追加一个合法且非空的容器）。
- 可在画布中删除块（每块 Delete 按钮；选中块后按键盘 `Delete`）。删除容器时会将子节点上提，编辑器也会保持容器非空以避免脚本非法。
- 编辑器会保持 `IF` 块结构合法：`ELSE` 不能脱离 `IF` 持久化，且 then 分支保持非空。
- `STEP` 块提供动作库控制：动作选择器、`Customize`（将默认动作复制为用户动作并切换）和 `Edit`（`name/tool/prompt/script` 的 Action Editor 模态框）。

## 🔧 配置

### 环境变量

以 `autonovelwriter/backend/.env.example` 为模板。后端/运行时使用的关键变量：

- `AUTONOVELWRITER_RUNTIME_ROOT`（默认 `autonovelwriter/runtime`）
- `AUTONOVELWRITER_PWA_ROOT`（默认 `autonovelwriter/pwa`）
- `AUTONOVELWRITER_HOST`（默认 `127.0.0.1`）
- `AUTONOVELWRITER_PORT`（默认 `8787`）
- `AUTONOVELWRITER_WORKSPACE_ROOT`（默认：仓库根目录的上级目录）
- `AUTONOVELWRITER_WRITER_SCRIPT`（默认 `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`）
- `AUTONOVELWRITER_XIYOU_INPUT_DIR`（默认 `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`）
- `AUTONOVELWRITER_NOVELS_ROOT`（默认 `${WORKSPACE_ROOT}/auto-novels`）
- `AUTONOVELWRITER_ENABLE_CODEX`（代理执行开关，默认关闭）
- `AUTONOVELWRITER_CODEX_CLI_PATH`（可选 codex 二进制覆盖路径）

## 🌐 关键后端 API

### HTTP API

- Health：`GET /api/health`
- Settings：`GET/POST /api/settings`
- Projects：`GET /api/projects`、`POST /api/projects/active`
- 项目设置（激活项目）：`GET/POST /api/projects/settings`（带继承语义的项目级覆盖：`novel_language`、`novel_tone`、`novel_target_length_words`）
- 素材索引（激活项目）：`GET /api/materials/index`
- 产出索引（激活项目）：`GET /api/outputs/index`
- 任务批次索引：`GET /api/tasks/batches/index`（可选：`?project=<project_id>`）
- 任务批次详情：`GET /api/tasks/batches/<batch_id>`
- 任务批次激活：`POST /api/tasks/batches/<batch_id>/activate`（写入 `runtime/tasks/tasks.json` 和项目 `active_tasks.json`）
- 动作库：`GET /api/actions`、`GET /api/actions/<action_id>`、`POST /api/actions/<action_id>/copy`、`PUT /api/actions/<action_id>`（对默认动作执行 copy-on-edit 更新）
- 流水线（规范脚本 + 派生 JSON）：`GET/POST /api/pipeline`
- 流水线校验（仅预览）：`POST /api/pipeline/validate`
- 参考写作流水线预览/加载：
  - `GET /api/pipeline/reference_writer`（读取并解析 `../scripts/auto-xiyouzhiyuan-writer.sh` 作为参考）
  - `POST /api/pipeline/reference_writer/load`（将解析结果加载到运行时流水线；绝不编辑源脚本）
- Chat：`GET /api/chat/history`、`POST /api/chat/send`
- 最新小说 PDF：
  - `GET /api/novel/latest`（元数据）
  - `GET /api/novel/latest/pdf`（供查看器使用的内联 PDF 流）
- 运行器控制：`POST /api/run/start|pause|resume|stop`、`GET /api/run/status`
- Agent 测试（受门控）：`POST /api/agent/test`（仅在启用 + 环境门控时运行 `codex --version`）

### WebSocket

- 端点：`/ws`
- 广播事件：`hello`、`chat`、`outbox_written`、`output_created`、`tasks_batch_created`、`tasks_batch_activated`、`action_created`、`action_updated`、`action_result_committed`、`run_status`、`task_status`、`log`、`pipeline_updated`、`project_active_changed`、`project_settings_updated`

## 📝 运行器输出（草稿桩）

当流水线包含 `STEP write` 块时，后端运行器会在以下目录创建草稿桩文件：
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

后端还会发出：
- WS 事件 `output_created`，包含 `path` 与 `project_rel_path`
- 一行 `log`：`[output] created: ...`

PWA 包含最小化 Outputs 面板，通过 `GET /api/outputs/index` 列出文件，并在 `output_created` 时刷新。

## 📦 运行器任务（批次桩）

当流水线包含 `STEP meta_tasks_generate` 块时，后端运行器会在以下目录创建任务批次桩：
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

后端会发出：
- WS 事件 `tasks_batch_created`，包含 `batch_dir`、`tasks_jsonl`、`task_count`
- 一行 `log`：`[tasks] created batch: ...`

PWA 包含最小化 Task Batches 面板，通过 `GET /api/tasks/batches/index` 列出批次，并在 `tasks_batch_created` 时刷新。
它还可以显示批次详情（`GET /api/tasks/batches/<batch_id>`），并激活一个批次作为 `FOREACH_TASK` 当前任务列表（`POST /api/tasks/batches/<batch_id>/activate`）。

## 🤖 代理设置 / Codex 门控

PWA Settings 面板会通过 `/api/settings` 持久化代理设置到 `autonovelwriter/runtime/state/settings.json`。

出于安全考虑，后端仅在以下两项都为真时才会拉起 `codex` CLI：
- `settings.agent.enabled=true` 且 `settings.agent.sdk="codex"`
- 环境中设置了 `AUTONOVELWRITER_ENABLE_CODEX=1`

切勿提交密钥。请用 `autonovelwriter/backend/.env.example` 作为本地环境变量模板。

## 🌍 PWA I18N（界面语言）

PWA 内置了轻量级 i18n 系统。

- 强制界面语言：在 PWA URL 后添加 `?lang=<code>`（例如 `?lang=ja`）。
- 每浏览器持久化于 localStorage：`anw_lang`。
- 支持的界面语言：`en`、`zh-Hans`、`zh-Hant`、`ja`、`ko`、`vi`、`ar`（RTL）、`fr`、`es`、`ru`、`de`。

## 📚 小说设置（与界面语言分离）

小说写作偏好存储在后端 `settings.novel.*` 下，位于：
- `autonovelwriter/runtime/state/settings.json`

这些设置刻意与 PWA 界面语言（`?lang=` / `anw_lang`）**分离**。

项目级覆盖存储在：
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

当前字段（可在 PWA Settings 模态框编辑）：
- `settings.novel.language`（类似 BCP-47 的代码，如 `en`、`ja`、`zh-Hans` 等）
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

当前项目级覆盖字段（空/未设置 = 继承全局）：
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 示例

### 最小化本地运行

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### tmux 运行且不自动 attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### 直接运行后端测试文件

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### 直接运行 PWA 逻辑测试文件

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### 脚本化自动化辅助示例

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ 开发说明

### Driver 工作流（Auto-Dev）
<!-- AUTO_DEV_PROGRESS_START -->
### Auto-Dev Progress (Generated)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` 会在 `references/autonovelwriter_dev/` 下的任务上运行一个可恢复的 Codex 驱动循环，并且**会在每个阶段后 commit/push**（plan/implement/debug/fix/i18n/summary/update_readme）。

常用控制：
- 当前任务结束后停止：`touch references/autonovelwriter_dev/STOP`
- 重置状态跟踪（保留队列）：`scripts/auto-autonovelwriter-development.sh --reset-state`
- 启动全新 Codex 会话：`scripts/auto-autonovelwriter-development.sh --new-session`
- 安全实践：在干净分支/worktree 运行，并在重启前检查 `references/autonovelwriter_dev/state.tsv`。

## 📚 内容

- `docs/autonovelwriter_spec.md`：类 Scratch 控制器（聊天 + 文件夹管道 + start/pause/stop + settings）的产品规格。
- `scripts/auto-autonovelwriter-development.sh`：自动开发 AutoNovelWriter 应用本身（任务循环：plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push）。
- `docs/auto-development-guide.md`：长时运行、可恢复自动开发代理的双语（EN/ZH）理念与要求。
- `docs/ORDERING_RATIONALE.md`：截图驱动步骤排序的示例说明。
- `scripts-legacy/`：旧版自动化脚本，仅供参考，不由 AutoNovelWriter 使用。
- `examples/ralph-wiggum-example.sh`：Codex CLI 自动化辅助示例。

### 额外开发者说明

- 后端测试位于 `autonovelwriter/backend/tests/`。
- 一个小型 PWA 行为测试位于 `autonovelwriter/pwa/tests/`。
- 根目录 `i18n/` 已存在，但当前为空；UI 翻译目前内嵌在 `autonovelwriter/pwa/app.js` 中。

## 🧯 故障排查

- `tmux not found in PATH`：
  - 安装 tmux，或手动运行后端/静态服务器。
- 使用 `--env` 脚本时 `conda not found in PATH`：
  - 安装 Miniconda/Anaconda，或跳过 conda 改用手动 `pip` 安装。
- PWA 无法连接后端：
  - 检查后端地址/端口与 WebSocket 端点 `ws://<host>:<port>/ws`。
- `POST /api/agent/test` 返回 gated/disabled：
  - 确保同时满足 `settings.agent.enabled=true`、`settings.agent.sdk="codex"`，以及环境变量 `AUTONOVELWRITER_ENABLE_CODEX=1`。
- 编辑脚本后流水线运行器停止：
  - 这是预期行为；流水线脚本哈希不匹配时游标会失效，需重启。

## 🧭 路线图

- 完成并稳定剩余 auto-dev 队列项（见上方生成的进度块）。
- 扩展仓库级外置 i18n 资产到 `i18n/`（当前目录已存在但为空）。
- 扩大对运行器边界情况与 PWA 交互的自动化测试覆盖。
- 持续改进动作库与任务/动作迭代工作流。

## 🤝 贡献

欢迎贡献。

本仓库的务实建议：
- 从 `docs/autonovelwriter_spec.md` 和 `docs/auto-development-guide.md` 开始。
- 运行时变更放在 `autonovelwriter/runtime/`（gitignored）下，不要放到受版本控制文件。
- 优先提交可复现运行/测试命令的增量 PR。
- 若修改流水线语义或 API 契约，请同时更新 README 与相关测试。

说明：在本草稿上下文中，仓库根目录未发现专门的 `CONTRIBUTING.md`。

## ❤️ Sponsor & Donate

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 许可证

在本草稿上下文中，仓库根目录未明确声明许可证文件/状态。

假设说明：
- 如果你希望明确开源再分发，请添加顶层 `LICENSE` 文件并相应更新本节。
