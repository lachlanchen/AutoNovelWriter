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

自動小説執筆（およびアプリ開発）パイプラインを制御するための、Scratch 風 PWA + Tornado バックエンドです。

このリポジトリには `AutoAppDev/` サブモジュール（再利用可能な自動開発スクリプト）も同梱されています。

## Overview

AutoNovelWriter は、以下のためのローカルオーケストレーション層を提供します。
- ソーステキストとブロック UI の両方から、正規パイプラインスクリプト（`pipeline.script`）を編集。
- カーソルとアクション結果を永続化した、再開可能なバックエンド実行。
- プロジェクト、資料、出力、タスクバッチ、アクションテンプレートの管理。
- WebSocket（`/ws`）経由で PWA にライブ更新を配信。

正規の可変ランタイムは `autonovelwriter/runtime/`（gitignore 対象）です。

| Area | What it does |
|---|---|
| Pipeline authoring | 単一の正規ソースから、正規スクリプトとネストされたブロック UI を編集 |
| Execution | カーソルとアクション結果を永続化した再開可能ランナー |
| Project ops | プロジェクト単位の資料・出力・設定・タスクバッチ有効化 |
| Realtime UX | ステータス/ログ/出力/タスク/アクション更新用の `/ws` イベント |

## Features

- 正規スクリプト + parser/AST を基盤にした Scratch 風パイプラインエディタ。
- 再開可能状態を備えた Runner 制御 API（`start/pause/resume/stop`）。
- 制御フローコンテナ: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`。
- 既定テンプレート + copy-on-edit ユーザー上書き対応の Action Library。
- 継承セマンティクスを備えた、プロジェクト単位の小説設定オーバーライド。
- `FOREACH_TASK` 向けタスクバッチ生成/インデックス/詳細/有効化フロー。
- 出力インデックスと最新小説 PDF プレビューエンドポイント。
- 組み込み PWA i18n 辞書（`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`）。
- tmux ヘルパースクリプトと再開可能な Codex 自動開発ドライバ。

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

| Dependency | Required | Notes |
|---|---|---|
| Python `3.11+` | Yes | 推奨ベースライン |
| `pip` | Yes | バックエンド依存関係をインストール |
| `tmux` | No | マルチペイン起動スクリプトに必要 |
| `conda` | No | 補助スクリプト用（任意） |
| `node` | No | PWA テストファイルを直接実行する場合のみ任意 |

## ⚙️ Installation

### Option A: Conda helper (recommended for this repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

その後、tmux で実行:

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

## Dev Run (Backend + PWA)

Backend (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

バックエンドはデフォルトで `autonovelwriter/pwa/` から PWA 静的アセットも配信するため、以下を開けます。
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

任意: PWA（別の静的開発サーバー）:
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

`http://127.0.0.1:5173` で PWA を開き、バックエンド（デフォルト `ws://127.0.0.1:8787/ws`）を指定してください。

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

このリポジトリのドライバースクリプト（`scripts/auto-autonovelwriter-development.sh`）も、自動開発中に tmux セッションを開始できます。

### Typical workflow

1. バックエンド（または tmux ヘルパー）を起動する。
2. PWA を開く。
3. Blocks と/またはスクリプトテキストエリアでパイプラインを編集する。
4. パイプラインを検証/保存する。
5. ランナーを開始し、ログ/ステータス/イベントを監視する。
6. 生成された出力とタスクバッチを確認する。

## 🧠 Runtime Paths

すべての可変状態と IO は `autonovelwriter/runtime/`（gitignore 対象）配下にあります。

| Path | Purpose |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system（`.txt`/`.md` を投入） |
| `autonovelwriter/runtime/io/outbox/` | system -> user（バックエンドがチャットメッセージを書き込み） |
| `autonovelwriter/runtime/state/` | 永続化 JSON 状態（settings, pipeline, runner, chat） |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite チャットミラー（chat.jsonl に加えて） |
| `autonovelwriter/runtime/state/active_project.json` | 永続化された「active project」ポインタ |
| `autonovelwriter/runtime/tasks/` | タスクキューファイル |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 生成タスクバッチ（例: `meta_tasks_generate` 由来） |
| `autonovelwriter/runtime/logs/` | ログ |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | プロジェクト資料（入力） |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | プロジェクト出力（下書き/エクスポート） |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | プロジェクト単位の小説執筆設定オーバーライド（例: 小説言語） |
| `autonovelwriter/runtime/actions/defaults/` | 初期投入される既定 Action Library テンプレート（不変として扱う） |
| `autonovelwriter/runtime/actions/user/` | ユーザー Action Library テンプレート（copy-on-edit で作成） |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | writer パイプライン取り込み用にミラーされたチャット入力 |

## 🧩 Pipeline Script (Canonical Artifact)

パイプラインは、ディスク上の整形済みスクリプトとして表現されます。
- `autonovelwriter/runtime/state/pipeline.script`

バックエンドは `GET/POST /api/pipeline` で以下を提供します。
- `script`（正規、shell 風 `STEP <type>` / `DISABLED <type>` 行）
- `pipeline` JSON（派生、単純ブロック描画向けフラットリスト）
- `pipeline_ast`（派生、ループ + インデント UI に使うネスト構造）

ランナーは同じ v2 parser/AST から導出したステップを実行するため、PWA 表示と実行内容が一致します。
ランナー制御フローは v2 コンテナをサポートします。
- `ROUND <n>` は子要素を `n` 回繰り返します。
- `FOREACH_TASK` は active task list（`autonovelwriter/runtime/tasks/tasks.json`）内の各タスクごとに子要素を 1 回実行します。
- `FOREACH_ACTION` は現在タスクの `payload.actions` リスト内の各要素ごとに子要素を 1 回実行します（`FOREACH_TASK` 配下でのネストを意図）。

再開可能性:
- ランナーは再開可能な実行カーソルを `autonovelwriter/runtime/state/runner_state.json` に永続化します。
- カーソルはブロック成功完了後にのみ進みます（再起動で未完了作業をスキップしない）。
- 正規パイプラインスクリプトが変更された場合（ハッシュ不一致）、ランナーは停止し再起動を要求します（カーソル無効化）。
- ランナーはステップごとの `ActionResult` レコードを `autonovelwriter/runtime/state/action_results.jsonl` に永続化し、決定的なステップ単位 `exec_id` を使って再起動時の重複コミットを防ぎます。
  - `FOREACH_ACTION` 内で実行する場合、ActionResults には `action_index`, `action_id_ref`, `action_key` が含まれ、vars には `prev` に加えて明示的な `task.prev` と `action.prev` スコープが含まれます。

Pipeline script v2 はネストをサポートします。
- `LOOP <n>` はループブロックを導入
- `ROUND <n>` は「rounds」コンテナブロックを導入
- `FOREACH_TASK` はタスク単位コンテナブロックを導入
- `FOREACH_ACTION` はアクション単位コンテナブロックを導入（ランナーは `task.payload.actions` を反復）
- `IF <expr>` は条件コンテナブロックを導入（parse/render。現状ランナーは then-branch のみ実行）
- `ELSE` は `IF` ブロック下の任意代替ブランチを導入
- 子要素はレベルごとに 2 スペースでインデント

検証（永続化なし）:
- `POST /api/pipeline/validate` は正規プレビュー、`pipeline_ast`、warnings、errors を返します。

PWA はテキストエリア内のスクリプト（source of truth）を表示し、`pipeline_ast` からネストブロックを描画します。
バックエンド検証エンドポイントに到達できない場合、PWA は同じ v2 動詞（`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`）をサポートするローカルパーサーへフォールバックします。

Blocks UI ノート:
- `LOOP` と `ROUND` の反復回数はブロックリスト上でインライン編集可能で、有効な編集は即座に正規スクリプトテキストエリアへ反映されます。
- Blocks ツールバーは、スクリプトを手編集せずに `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF` コンテナを挿入できます（選択ブロックをラップ、または有効な非空コンテナを追加）。
- ブロックはキャンバスから削除可能です（ブロックごとの Delete ボタン、または選択時キーボード `Delete`）。コンテナ削除時は子要素が上位へスプライスされ、エディタは無効スクリプトを避けるためコンテナを非空に保ちます。
- `IF` ブロックはエディタ内で構造的整合性を維持します。`ELSE` は `IF` 外に残存できず、then-branch は非空のまま維持されます。
- `STEP` ブロックは Action Library 操作を提供します。action selector、`Customize`（既定 action を user action にコピーして切り替え）、`Edit`（`name/tool/prompt/script` 用 Action Editor モーダル）。

## 🔧 Configuration

### Environment variables

`autonovelwriter/backend/.env.example` をテンプレートとして使用してください。バックエンド/ランタイムで使われる主要変数:

- `AUTONOVELWRITER_RUNTIME_ROOT` (default `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (default `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (default `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (default `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (default: parent of repo root)
- `AUTONOVELWRITER_WRITER_SCRIPT` (default `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (default `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (default `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (agent execution gate, default disabled)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (optional codex binary override)

## 🌐 Key Backend APIs

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (継承セマンティクスつきプロジェクト単位オーバーライド: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (`runtime/tasks/tasks.json` と project `active_tasks.json` を書き込み)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (defaults 向け copy-on-edit 更新)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (`../scripts/auto-xiyouzhiyuan-writer.sh` を参照として読み取り・解析)
  - `POST /api/pipeline/reference_writer/load` (解析結果を runtime pipeline に読み込み。元スクリプトは編集しない)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (ビューア向け inline PDF stream)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (`codex --version` を実行。enabled + env gate が有効な場合のみ)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Runner Outputs (Draft Stub)

パイプラインに `STEP write` ブロックがある場合、バックエンドランナーは以下配下にスタブ下書きファイルを作成します。
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

バックエンドは以下も送信します。
- `path` と `project_rel_path` を含む WS イベント `output_created`
- `log` 行 `[output] created: ...`

PWA には最小構成の Outputs パネルがあり、`GET /api/outputs/index` 経由でファイルを一覧表示し、`output_created` で更新します。

## 📦 Runner Tasks (Batch Stub)

パイプラインに `STEP meta_tasks_generate` ブロックがある場合、バックエンドランナーは以下配下にスタブタスクバッチを作成します。
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

バックエンドは以下を送信します。
- `batch_dir`, `tasks_jsonl`, `task_count` を含む WS イベント `tasks_batch_created`
- `log` 行 `[tasks] created batch: ...`

PWA には最小構成の Task Batches パネルがあり、`GET /api/tasks/batches/index` 経由でバッチ一覧を表示し、`tasks_batch_created` で更新します。
また、バッチ詳細（`GET /api/tasks/batches/<batch_id>`）の表示と、`FOREACH_TASK` 用の現在タスクリストとしてバッチを有効化（`POST /api/tasks/batches/<batch_id>/activate`）も可能です。

## 🤖 Agent Settings / Codex Gate

PWA Settings パネルは、`/api/settings` 経由で agent settings を `autonovelwriter/runtime/state/settings.json` に永続化します。

安全のため、バックエンドが `codex` CLI を起動するのは次の両方を満たす場合のみです。
- `settings.agent.enabled=true` かつ `settings.agent.sdk="codex"`
- 環境変数で `AUTONOVELWRITER_ENABLE_CODEX=1` が設定されている

秘密情報は絶対にコミットしないでください。ローカル環境変数のテンプレートとして `autonovelwriter/backend/.env.example` を使用してください。

## 🌍 PWA I18N (UI Language)

PWA には軽量な組み込み i18n システムがあります。

- UI 言語を強制: PWA URL に `?lang=<code>` を追加（例: `?lang=ja`）。
- ブラウザごとの永続化キー（localStorage）: `anw_lang`。
- 対応 UI 言語: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`。

## 📚 Novel Settings (Separate From UI Language)

小説執筆設定は、バックエンド設定の `settings.novel.*` として以下に保存されます。
- `autonovelwriter/runtime/state/settings.json`

これらは PWA UI 言語（`?lang=` / `anw_lang`）とは意図的に**分離**されています。

プロジェクト単位のオーバーライドは以下に保存されます。
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

現在のフィールド（PWA Settings モーダルで編集可能）:
- `settings.novel.language`（`en`, `ja`, `zh-Hans` などの BCP-47 風コード）
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

現在のプロジェクトレベルオーバーライドフィールド（空/未設定 = グローバル継承）:
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

`scripts/auto-autonovelwriter-development.sh` は `references/autonovelwriter_dev/` 配下タスクに対して再開可能な Codex 駆動ループを実行し、**各ステージ（plan/implement/debug/fix/i18n/summary/update_readme）ごとに commit/push を実行**します。

有用な制御:
- 現在タスク完了後に停止: `touch references/autonovelwriter_dev/STOP`
- 状態追跡をリセット（キューは維持）: `scripts/auto-autonovelwriter-development.sh --reset-state`
- 新しい Codex セッションを開始: `scripts/auto-autonovelwriter-development.sh --new-session`
- 安全運用: クリーンなブランチ/ワークツリーで実行し、再開前に `references/autonovelwriter_dev/state.tsv` を監視

## 📚 Contents

- `docs/autonovelwriter_spec.md`: Scratch 風コントローラーのプロダクト仕様（chat + folder pipe + start/pause/stop + settings）。
- `scripts/auto-autonovelwriter-development.sh`: AutoNovelWriter アプリ自体を自動開発（タスクループ: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push）。
- `docs/auto-development-guide.md`: 長時間実行・再開可能な自動開発エージェントの思想と要件（EN/ZH バイリンガル）。
- `docs/ORDERING_RATIONALE.md`: スクリーンショット主導ステップ順序の例示的 rationale。
- `scripts-legacy/`: 参照用に保持された旧自動化スクリプト（AutoNovelWriter 本体では未使用）。
- `examples/ralph-wiggum-example.sh`: Codex CLI 自動化ヘルパー例。

### Additional developer notes

- バックエンドテストは `autonovelwriter/backend/tests/` にあります。
- 小規模な PWA 挙動テストは `autonovelwriter/pwa/tests/` にあります。
- ルート `i18n/` ディレクトリは存在しますが現在は空です。UI 翻訳は現状 `autonovelwriter/pwa/app.js` に埋め込まれています。

## 🧯 Troubleshooting

- `tmux not found in PATH`:
  - tmux をインストールするか、バックエンド/静的サーバーを手動起動してください。
- `conda not found in PATH` when using `--env` scripts:
  - Miniconda/Anaconda をインストールするか、conda を使わず手動 `pip` インストールを利用してください。
- PWA cannot connect to backend:
  - バックエンドのアドレス/ポートと WebSocket エンドポイント `ws://<host>:<port>/ws` を確認してください。
- `POST /api/agent/test` returns gated/disabled:
  - `settings.agent.enabled=true`、`settings.agent.sdk="codex"`、環境変数 `AUTONOVELWRITER_ENABLE_CODEX=1` のすべてを確認してください。
- Pipeline runner stops after script edit:
  - 想定動作です。パイプラインスクリプトのハッシュ不一致時はカーソルが無効化され、再起動が必要です。

## 🧭 Roadmap

- 残りの auto-dev キュー項目の完了と安定化（上記の生成済み進捗ブロック参照）。
- `i18n/` 配下の外部化されたリポジトリレベル i18n アセットを拡充（現状は存在するが空）。
- ランナーのエッジケースと PWA 相互作用に対する自動テスト網羅を拡張。
- Action Library と task/action 反復ワークフローの継続的改善。

## 🤝 Contributing

コントリビューションを歓迎します。

このリポジトリ向けの実践ガイド:
- `docs/autonovelwriter_spec.md` と `docs/auto-development-guide.md` から着手。
- ランタイム変更は追跡対象ファイルではなく `autonovelwriter/runtime/`（gitignore）配下で行う。
- 再現可能な実行/テストコマンド付きの段階的 PR を推奨。
- パイプライン意味論または API 契約を変更する場合は、README と関連テストを同時更新。

注記: このドラフト時点では、リポジトリルートに専用 `CONTRIBUTING.md` は見つかっていません。

## ❤️ Sponsor & Donate

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 License

このドラフト文脈では、リポジトリルートに License ファイル/状態は明示されていません。

Assumption note:
- オープンソース再配布を明確にする場合は、トップレベル `LICENSE` ファイルを追加し、この節を対応更新してください。
