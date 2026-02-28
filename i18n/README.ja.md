[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)




[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>自動小説執筆（およびアプリ開発）パイプラインを制御するための、Scratch 風 PWA + Tornado バックエンド。</strong></p>
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

このリポジトリには `AutoAppDev/` サブモジュール（再利用可能な自動開発スクリプト群）も同梱されています。

> [!TIP]
> `README.md` が基準版（canonical base）です。各言語版は `i18n/` にあり、先頭 1 行の言語リンクから参照します。

## 🧭 Project Snapshot

| Quick facts | Details |
|---|---|
| 主要スタック | Python + Tornado バックエンド、ブラウザ PWA フロントエンド |
| コア UX | 1 つの正規パイプラインソースを基盤にした Script + Blocks エディタ |
| 実行モード | カーソルとアクション結果を永続化する再開可能ランナー |
| リアルタイム | WebSocket エンドポイント `/ws` |
| 可変ランタイムルート | `autonovelwriter/runtime/`（gitignore 対象） |

## At-a-Glance Navigation

| 🎯 What to use now | 🔧 Command / URL |
|---|---|
| PWA を開く | `http://127.0.0.1:8787/` |
| リアルタイム更新に接続 | `ws://127.0.0.1:8787/ws` |
| バックエンドをすぐ起動 | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| セットアップと起動を一括 | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

> [!TIP]
> 最短のローカル起動手順:
> 1. `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill`
> 2. `http://127.0.0.1:8787/` を開く
> 3. WebSocket 更新: `ws://127.0.0.1:8787/ws`

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

AutoNovelWriter は、次のためのローカルオーケストレーション層を提供します。
- 正規パイプラインスクリプト（`pipeline.script`）を、ソーステキストとブロック UI の両方から編集。
- カーソルとアクション結果を永続化した、再開可能なバックエンド実行。
- プロジェクト、資料、出力、タスクバッチ、アクションテンプレートの管理。
- WebSocket（`/ws`）経由で PWA へライブ更新を配信。

正規の可変ランタイムは `autonovelwriter/runtime/`（中身は gitignore）です。

| Area | What it does |
|---|---|
| Pipeline authoring | 1 つの共有ソース・オブ・トゥルースから正規スクリプトとネストされた Blocks UI を編集 |
| Execution | カーソルとアクション結果を永続化する再開可能ランナー |
| Project ops | プロジェクト単位の資料・出力・設定・タスクバッチ有効化 |
| Realtime UX | ステータス/ログ/出力/タスク/アクション更新用の `/ws` イベント |

## ✨ Features

- 正規スクリプト + parser/AST に支えられた Scratch 風パイプラインエディタ。
- 再開可能状態を備えたランナー制御 API（`start/pause/resume/stop`）。
- 制御フローコンテナ: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`。
- デフォルトテンプレート + copy-on-edit ユーザー上書きに対応する Action Library。
- 継承セマンティクスを持つ、プロジェクト単位の小説設定オーバーライド。
- `FOREACH_TASK` 用タスクバッチの生成/一覧/詳細/有効化フロー。
- 出力一覧と最新小説 PDF プレビュー API。
- 内蔵 PWA i18n 辞書（`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`（RTL）, `fr`, `es`, `ru`, `de`）。
- tmux ヘルパースクリプトと再開可能な Codex 自動開発ドライバー。

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
| Python `3.11+` | Yes | 推奨ベースライン |
| `pip` | Yes | バックエンド依存関係をインストール |
| `tmux` | No | マルチペイン起動スクリプトに必要 |
| `conda` | No | 任意のヘルパースクリプト用 |
| `node` | No | PWA テストファイルを直接実行する場合に任意 |

## 🚀 Installation

| Path | Best when | Command |
|---|---|---|
| Option A | conda を使い、リポジトリ提供のセットアップを使いたい場合 | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | セットアップと起動を 1 コマンドで行いたい場合 | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | `pip` を手動で管理したい場合 | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Conda helper (recommended for this repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

その後 tmux で起動:

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
| バックエンド起動 | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| アプリを開く | `http://127.0.0.1:8787/` |
| WebSocket エンドポイント | `ws://127.0.0.1:8787/ws` |
| 任意: 静的 PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| tmux ランチャー | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

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

バックエンドはデフォルトで `autonovelwriter/pwa/` から PWA の静的アセットも配信します。以下にアクセスできます。
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

任意: PWA（別の静的開発サーバー）

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

`http://127.0.0.1:5173` で PWA を開き、バックエンド（既定 `ws://127.0.0.1:8787/ws`）を指定してください。

tmux（両ペイン起動 + ログ追跡）:

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda 環境ヘルパー:

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

このリポジトリのドライバースクリプト（`scripts/auto-autonovelwriter-development.sh`）でも、自動開発中に tmux セッションを開始できます。

### Typical workflow

1. バックエンド（または tmux ヘルパー）を起動する。
2. PWA を開く。
3. Blocks と/またはスクリプトテキストエリアでパイプラインを編集する。
4. パイプラインを検証・保存する。
5. ランナーを開始し、ログ/ステータス/イベントを監視する。
6. 生成された出力とタスクバッチを確認する。

## ⚙️ Configuration

### Environment variables

`autonovelwriter/backend/.env.example` をテンプレートとして使用してください。バックエンド/ランタイムが使う主な変数:

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
- Project settings (active project): `GET/POST /api/projects/settings`（継承セマンティクス付きのプロジェクト単位オーバーライド: `novel_language`, `novel_tone`, `novel_target_length_words`）
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index`（optional: `?project=<project_id>`）
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate`（`runtime/tasks/tasks.json` と project `active_tasks.json` に書き込み）
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>`（defaults の copy-on-edit 更新）
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer`（`../scripts/auto-xiyouzhiyuan-writer.sh` を参照として読み込み・解析）
  - `POST /api/pipeline/reference_writer/load`（解析結果をランタイム pipeline に読み込み。元スクリプトは編集しない）
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest`（metadata）
  - `GET /api/novel/latest/pdf`（ビューア向け inline PDF stream）
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test`（有効化 + env gate を満たす場合のみ `codex --version` を実行）

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Runtime Paths

すべての可変状態と IO は `autonovelwriter/runtime/` 配下にあります。

| Path | Purpose |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system（`.txt`/`.md` を投入） |
| `autonovelwriter/runtime/io/outbox/` | system -> user（バックエンドがチャットメッセージを書き込み） |
| `autonovelwriter/runtime/state/` | 永続化 JSON 状態（settings, pipeline, runner, chat） |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite チャットミラー（chat.jsonl に加えて） |
| `autonovelwriter/runtime/state/active_project.json` | 永続化された active project ポインタ |
| `autonovelwriter/runtime/tasks/` | タスクキューファイル |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 生成されたタスクバッチ（例: `meta_tasks_generate`） |
| `autonovelwriter/runtime/logs/` | ログ |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | プロジェクト資料（入力） |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | プロジェクト出力（下書き/エクスポート） |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | プロジェクト単位の小説設定オーバーライド（例: 小説言語） |
| `autonovelwriter/runtime/actions/defaults/` | 初期投入されるデフォルト Action Library テンプレート（不変扱い） |
| `autonovelwriter/runtime/actions/user/` | ユーザー Action Library テンプレート（copy-on-edit で作成） |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | writer パイプライン取り込み用ミラー済みチャット入力 |

## 🧩 Pipeline Script (Canonical Artifact)

パイプラインは、ディスク上の整形済みスクリプトとして表現されます。
- `autonovelwriter/runtime/state/pipeline.script`

バックエンドは `GET/POST /api/pipeline` で次を返します。
- `script`（正規。shell 風 `STEP <type>` / `DISABLED <type>` 行）
- `pipeline` JSON（派生。単純ブロック描画向けフラットリスト）
- `pipeline_ast`（派生。ループ + インデント UI で使うネスト構造）

ランナーは同じ v2 parser/AST から導出されたステップを実行するため、PWA の表示と実行内容が一致します。

ランナー制御フローは v2 コンテナをサポートします。
- `ROUND <n>` は子要素を `n` 回繰り返します。
- `FOREACH_TASK` は active task list（`autonovelwriter/runtime/tasks/tasks.json`）の各タスクごとに子要素を 1 回実行します。
- `FOREACH_ACTION` は現在タスクの `payload.actions` リストの各要素ごとに子要素を 1 回実行します（`FOREACH_TASK` 配下でのネストを想定）。

再開可能性:
- ランナーは再開可能な実行カーソルを `autonovelwriter/runtime/state/runner_state.json` に永続化します。
- カーソルはブロック成功完了後にのみ進みます（再起動しても未完了作業を飛ばさない）。
- 正規パイプラインスクリプトが変更された場合（ハッシュ不一致）、ランナーは停止して再起動を要求します（カーソル無効化）。
- ランナーはステップごとの `ActionResult` を `autonovelwriter/runtime/state/action_results.jsonl` に永続化し、決定的なステップ単位 `exec_id` により再起動時の重複コミットを防ぎます。
- `FOREACH_ACTION` 内で実行する場合、ActionResults には `action_index`, `action_id_ref`, `action_key` が含まれ、vars には `prev` に加え `task.prev` と `action.prev` の明示スコープが含まれます。

Pipeline script v2 はネストをサポートします。
- `LOOP <n>` は loop ブロックを導入。
- `ROUND <n>` は rounds コンテナブロックを導入。
- `FOREACH_TASK` は task 単位コンテナブロックを導入。
- `FOREACH_ACTION` は action 単位コンテナブロックを導入（ランナーは `task.payload.actions` を反復）。
- `IF <expr>` は条件コンテナブロックを導入（parse/render。現状ランナーは then-branch のみ実行）。
- `ELSE` は `IF` ブロック配下の任意代替ブランチを導入。
- 子要素はレベルごとに 2 スペースでインデント。

検証（永続化なし）:
- `POST /api/pipeline/validate` は canonical preview、`pipeline_ast`、warnings、errors を返します。

PWA は textarea 上のスクリプト（source of truth）を表示し、`pipeline_ast` からネストブロックを描画します。
バックエンドの validate endpoint に到達できない場合、PWA は同じ v2 動詞（`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`）をサポートするローカルパーサーへフォールバックします。

Blocks UI notes:
- `LOOP` と `ROUND` の反復回数はブロックリスト上でインライン編集できます。妥当な編集は即座に canonical script textarea に反映されます。
- Blocks ツールバーは、スクリプトを手編集せずに `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF` コンテナを挿入できます（選択ブロックをラップ、または妥当な非空コンテナを追加）。
- ブロックはキャンバスから削除可能です（ブロックごとの Delete ボタン、または選択時キーボード `Delete`）。コンテナ削除時は子要素が上位へスプライスされ、エディタは無効スクリプトを避けるためコンテナを非空に保ちます。
- `IF` ブロックはエディタ内で構造的整合性が維持されます。`ELSE` は `IF` 外に残存できず、then-branch は非空のまま維持されます。
- `STEP` ブロックには Action Library 操作があります: action selector、`Customize`（default action を user action にコピーして切り替え）、`Edit`（`name/tool/prompt/script` 用 Action Editor モーダル）。

## 📝 Runner Outputs (Draft Stub)

パイプラインに `STEP write` ブロックがある場合、バックエンドランナーは次にスタブ下書きファイルを作成します。
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

バックエンドは次も送出します。
- WS event `output_created`（`path` と `project_rel_path` を含む）
- `log` 行 `[output] created: ...`

PWA には最小限の Outputs パネルがあり、`GET /api/outputs/index` でファイル一覧を表示し、`output_created` で更新されます。

## 📦 Runner Tasks (Batch Stub)

パイプラインに `STEP meta_tasks_generate` ブロックがある場合、バックエンドランナーは次にスタブタスクバッチを作成します。
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

バックエンドは次を送出します。
- WS event `tasks_batch_created`（`batch_dir`, `tasks_jsonl`, `task_count` を含む）
- `log` 行 `[tasks] created batch: ...`

PWA には最小限の Task Batches パネルがあり、`GET /api/tasks/batches/index` でバッチ一覧を表示し、`tasks_batch_created` で更新されます。
また、バッチ詳細（`GET /api/tasks/batches/<batch_id>`）を表示し、`FOREACH_TASK` 用の現在タスクリストとしてバッチを有効化できます（`POST /api/tasks/batches/<batch_id>/activate`）。

## 🔐 Agent Settings / Codex Gate

PWA Settings パネルは、`autonovelwriter/runtime/state/settings.json` に対して `/api/settings` 経由でエージェント設定を永続化します。

安全のため、バックエンドは次の両方を満たさない限り `codex` CLI を起動しません。
- `settings.agent.enabled=true` かつ `settings.agent.sdk="codex"`
- 環境変数 `AUTONOVELWRITER_ENABLE_CODEX=1` が設定済み

シークレットはコミットしないでください。ローカル環境変数は `autonovelwriter/backend/.env.example` をテンプレートとして使ってください。

## 🌐 PWA I18N (UI Language)

PWA には軽量な内蔵 i18n システムがあります。

- UI 言語を強制指定: PWA URL に `?lang=<code>` を付与（例: `?lang=ja`）。
- ブラウザごとに localStorage `anw_lang` へ永続化。
- 対応 UI 言語: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`（RTL）, `fr`, `es`, `ru`, `de`。
- リポジトリレベルの多言語 README は `i18n/` にあり、このファイル先頭の言語リンク行から参照します。

| README locale files (`i18n/`) | Status |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Present |

## 🖋️ Novel Settings (Separate From UI Language)

小説執筆設定は、バックエンド設定 `settings.novel.*` として次に保存されます。
- `autonovelwriter/runtime/state/settings.json`

これらは PWA UI 言語（`?lang=` / `anw_lang`）とは意図的に分離されています。

プロジェクト単位のオーバーライドは次に保存されます。
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

現在のグローバル項目（PWA Settings モーダルで編集可）:
- `settings.novel.language`（`en`, `ja`, `zh-Hans` などの BCP-47 風コード）
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

現在のプロジェクトレベル項目（空/未設定 = グローバル継承）:
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

`scripts/auto-autonovelwriter-development.sh` は `references/autonovelwriter_dev/` 配下のタスクを対象に、再開可能な Codex 駆動ループを実行し、各ステージ（`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`）後に commit/push します。

便利な操作:
- 現在タスク完了後に停止: `touch references/autonovelwriter_dev/STOP`
- 状態追跡をリセット（キューは維持）: `scripts/auto-autonovelwriter-development.sh --reset-state`
- 新しい Codex セッションを開始: `scripts/auto-autonovelwriter-development.sh --new-session`
- 安全策: クリーンな branch/worktree で実行し、再開前に `references/autonovelwriter_dev/state.tsv` を確認

### Operational assumptions

- この README は、`bash` と Python 3.11+ がある Linux/macOS のローカルファースト開発を前提としています。
- `autonovelwriter/runtime/` 配下のランタイム状態は可変であり、追跡対象外（untracked）である前提です。
- ここで説明するパイプライン動作は、`autonovelwriter/backend/server.py` と `autonovelwriter/pwa/app.js` の現行実装を反映しています。

## 🧪 Testing Notes

執筆時点では、このリポジトリにトップレベルの `Makefile` / `tox` / `npm test` オーケストレーターはありません。

現在の実用的なテスト入口:

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

ランナーセマンティクス、パイプライン構文、Action Library の挙動を追加・変更する場合は、同じ変更内でテストと README/API ノートも更新してください。

## 📚 Repository Contents

- `docs/autonovelwriter_spec.md`: Scratch 風コントローラー（chat + folder pipe + start/pause/stop + settings）のプロダクト仕様。
- `scripts/auto-autonovelwriter-development.sh`: AutoNovelWriter 本体を自動開発（タスクループ: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`）。
- `docs/auto-development-guide.md`: 長時間実行・再開可能な自動開発エージェントの方針と要件（EN/ZH）。
- `docs/ORDERING_RATIONALE.md`: スクリーンショット駆動ステップ順序付けの根拠例。
- `scripts-legacy/`: 参照用に保持している旧自動化スクリプト（AutoNovelWriter 本体では未使用）。
- `examples/ralph-wiggum-example.sh`: Codex CLI 自動化ヘルパーの例。

追加の開発者メモ:
- バックエンドテストは `autonovelwriter/backend/tests/` にあります。
- 小規模な PWA 挙動テストは `autonovelwriter/pwa/tests/` にあります。
- `i18n/` にはリポジトリ README の多言語版があり、UI 翻訳辞書は `autonovelwriter/pwa/app.js` に埋め込まれています。

## 🧯 Troubleshooting

| Symptom | What to check |
|---|---|
| `tmux not found in PATH` | tmux をインストールするか、バックエンド/静的サーバーを手動起動してください。 |
| `conda not found in PATH` when using `--env` scripts | Miniconda/Anaconda を導入するか、conda を使わず手動 `pip` インストールに切り替えてください。 |
| PWA cannot connect to backend | バックエンドのアドレス/ポートと WebSocket `ws://<host>:<port>/ws` を確認してください。 |
| `POST /api/agent/test` returns gated/disabled | `settings.agent.enabled=true`、`settings.agent.sdk="codex"`、環境変数 `AUTONOVELWRITER_ENABLE_CODEX=1` のすべてを確認してください。 |
| Pipeline runner stops after script edit | 想定動作です。パイプラインスクリプトのハッシュ不一致でカーソルが無効化され、再起動が必要です。 |
| Static PWA on `:5173` works but API calls fail | バックエンドが `:8787` で起動しているか（またはアプリ/バックエンド接続先設定を更新したか）を確認してください。 |

## 🗺️ Roadmap

- 残りの auto-dev キュー項目を完了・安定化する（上記の生成済み進捗ブロックを参照）。
- `i18n/` 配下のリポジトリ README 多言語版を拡充し、同期を維持する。
- ランナーのエッジケースと PWA 相互作用に対する自動テストカバレッジを拡大する。
- Action Library と task/action 反復ワークフローを継続的に改善する。

## 🤝 Contributing

コントリビューションを歓迎します。

このリポジトリ向けの実践的ガイド:
- `docs/autonovelwriter_spec.md` と `docs/auto-development-guide.md` から着手してください。
- ランタイムの可変データは `autonovelwriter/runtime/`（gitignore 対象）に置き、追跡ファイルには含めないでください。
- 再現可能な実行/テストコマンド付きの小さな PR を推奨します。
- パイプラインセマンティクスや API 契約を変更する場合は、README と関連テストを同時に更新してください。

注記: このドラフト時点では、リポジトリルートに専用 `CONTRIBUTING.md` はありません。

---

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 License

このドラフト時点では、リポジトリルートでライセンスファイル/ステータスが明示されていません。

前提メモ:
- オープンソースとしての再配布条件を明確化したい場合は、ルートに `LICENSE` を追加し、このセクションを更新してください。
