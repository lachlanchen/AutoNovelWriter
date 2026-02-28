[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)



[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>자동 소설 작성(및 앱 개발) 파이프라인을 제어하기 위한 Scratch 스타일 PWA + Tornado 백엔드</strong></p>
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

이 저장소는 `AutoAppDev/`도 서브모듈로 포함합니다(재사용 가능한 자동 개발 스크립트).

> [!TIP]
> `README.md`가 기준 문서입니다. 로컬라이즈된 버전은 `i18n/`에 있으며, 맨 위의 단일 언어 링크 줄에서 연결됩니다.

## 🧭 Project Snapshot

| Quick facts | Details |
|---|---|
| Primary stack | Python + Tornado 백엔드, 브라우저 PWA 프런트엔드 |
| Core UX | 정본 파이프라인 소스 하나를 기반으로 한 스크립트 + 블록 편집기 |
| Execution mode | 커서와 액션 결과를 영속화하는 재개 가능한 러너 |
| Realtime | `/ws` WebSocket 엔드포인트 |
| Mutable runtime root | `autonovelwriter/runtime/` (gitignored) |

## At-a-Glance Navigation

| 🎯 What to use now | 🔧 Command / URL |
|---|---|
| 로컬 PWA 열기 | `http://127.0.0.1:8787/` |
| 실시간 업데이트 연결 | `ws://127.0.0.1:8787/ws` |
| 백엔드 빠르게 시작 | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| 스크립트로 설치 + 실행 | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

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

AutoNovelWriter는 아래 기능을 위한 로컬 오케스트레이션 레이어를 제공합니다.
- 정본 파이프라인 스크립트(`pipeline.script`)를 소스 텍스트와 블록 UI 양쪽에서 편집
- 커서와 액션 결과를 영속화한 재개 가능한 백엔드 실행
- 프로젝트, 자료, 출력물, 작업 배치, 액션 템플릿 관리
- WebSocket(`/ws`)를 통해 PWA로 실시간 업데이트 스트리밍

정본 가변 런타임은 `autonovelwriter/runtime/`입니다(내용은 gitignored).

| Area | What it does |
|---|---|
| Pipeline authoring | 정본 스크립트 + 파생된 블록 UI를 하나의 공통 진실 원천에서 함께 편집 |
| Execution | 커서와 액션 결과를 영속화하는 재개 가능한 러너 |
| Project ops | 프로젝트 범위 소재, 출력물, 설정, 작업 배치 활성화 |
| Realtime UX | 상태/로그/출력/작업/액션 업데이트용 `/ws` 이벤트 |

## ✨ Features

- 정본 스크립트 + parser/AST를 기반으로 한 Scratch 스타일 파이프라인 편집기.
- 재개 가능한 상태를 갖춘 러너 제어 API (`start/pause/resume/stop`).
- 제어흐름 컨테이너: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- 기본 템플릿 + copy-on-edit 사용자 오버라이드가 있는 Action Library.
- 상속 의미론을 갖는 프로젝트 범위 소설 설정 오버라이드.
- `FOREACH_TASK`를 위한 작업 배치 생성/인덱스/상세/활성화 흐름.
- 출력물 인덱싱 및 최신 소설 PDF 미리보기 엔드포인트.
- 내장 PWA i18N 딕셔너리 (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- tmux 보조 스크립트와 재개 가능한 Codex 자동 개발 드라이버.

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
| Python `3.11+` | Yes | 권장 기준 |
| `pip` | Yes | 백엔드 의존성 설치 |
| `tmux` | No | 다중 패널 실행기 스크립트에 필요 |
| `conda` | No | 선택형 보조 스크립트 |
| `node` | No | PWA 테스트 파일을 직접 실행할 때 선택적 |

## 🚀 Installation

| Path | Best when | Command |
|---|---|---|
| Option A | conda를 사용하고 저장소 제공 설정이 필요한 경우 | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | 설치와 실행을 한 번에 수행하고 싶은 경우 | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | `pip`를 수동으로 제어하고 싶은 경우 | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Conda helper (recommended for this repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

그다음 tmux로 실행:

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
| 백엔드 시작 | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| 앱 열기 | `http://127.0.0.1:8787/` |
| WebSocket endpoint | `ws://127.0.0.1:8787/ws` |
| 선택적 정적 PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
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

백엔드는 기본적으로 `autonovelwriter/pwa/`에서 PWA 정적 에셋을 제공합니다. 따라서 다음 주소를 열면 됩니다.
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

선택적: PWA(별도 정적 개발 서버):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

`http://127.0.0.1:5173`에서 PWA를 열고 백엔드를 가리키도록 설정하세요(기본값 `ws://127.0.0.1:8787/ws`).

tmux (백엔드/프런트엔드 패널 + 로그 tail):

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

드라이버 스크립트(`scripts/auto-autonovelwriter-development.sh`)는 자동 개발 중 tmux 세션도 시작할 수 있습니다.

### Typical workflow

1. 백엔드 시작 (또는 tmux 헬퍼).
2. PWA 열기.
3. 블록 및/또는 스크립트 텍스트 영역에서 파이프라인 편집.
4. 파이프라인 검증/저장.
5. 러너 시작 및 로그/상태/이벤트 모니터링.
6. 생성된 출력물/작업 배치 검토.

## ⚙️ Configuration

### Environment variables

`autonovelwriter/backend/.env.example`을 템플릿으로 사용하세요. 백엔드/런타임에서 사용하는 핵심 변수:

- `AUTONOVELWRITER_RUNTIME_ROOT` (default `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (default `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (default `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (CLI flag default: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (default: repository root의 부모)
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
- Project settings (active project): `GET/POST /api/projects/settings` (프로젝트별 오버라이드와 상속 의미론: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (`runtime/tasks/tasks.json`와 프로젝트 `active_tasks.json`에 기록)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (기본값 복사-on-edit 업데이트)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (`../scripts/auto-xiyouzhiyuan-writer.sh`를 읽고 파싱)
  - `POST /api/pipeline/reference_writer/load` (파싱 결과를 런타임 파이프라인으로 로드; 소스 스크립트는 수정하지 않음)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (뷰어용 inline PDF stream)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (enabled + env gate 시에만 `codex --version` 실행)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Runtime Paths

모든 가변 상태와 IO는 `autonovelwriter/runtime/` 아래에 있습니다.

| Path | Purpose |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (drop `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend가 채팅 메시지 기록) |
| `autonovelwriter/runtime/state/` | 영속 JSON 상태 (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite 채팅 미러(`chat.jsonl`의 보조) |
| `autonovelwriter/runtime/state/active_project.json` | 영속화된 active project 포인터 |
| `autonovelwriter/runtime/tasks/` | 작업 큐 파일 |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 생성된 작업 배치(예: `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | 로그 |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | 프로젝트 소재(입력) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | 프로젝트 출력물(초안/내보내기) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | 프로젝트별 소설 설정 오버라이드 (예: 소설 언어) |
| `autonovelwriter/runtime/actions/defaults/` | 기본 Action Library 템플릿 시드(불변 취급) |
| `autonovelwriter/runtime/actions/user/` | 사용자 Action Library 템플릿(copy-on-edit로 생성) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | writer 파이프라인 입력용 채팅 입력 미러 |

## 🧩 Pipeline Script (Canonical Artifact)

파이프라인은 디스크에 있는 포맷 스크립트로 표현됩니다.
- `autonovelwriter/runtime/state/pipeline.script`

백엔드는 `GET/POST /api/pipeline`으로 다음을 제공합니다.
- `script` (canonical, shell-ish `STEP <type>` / `DISABLED <type>` 라인)
- `pipeline` JSON (derived, 단순 블록 렌더링용 평탄 리스트)
- `pipeline_ast` (derived, 루프 + 들여쓰기 UI에 사용되는 중첩 구조)

러너는 동일한 v2 parser/AST에서 파생된 단계를 실행하므로, PWA에서 표시되는 항목과 실행되는 항목이 일치합니다.

Runner control flow는 v2 컨테이너를 지원합니다.
- `ROUND <n>`은 자식을 `n`회 반복합니다.
- `FOREACH_TASK`는 활성 작업 목록(`autonovelwriter/runtime/tasks/tasks.json`)의 각 작업마다 자식을 1회 실행합니다.
- `FOREACH_ACTION`는 현재 작업의 `payload.actions` 목록에서 각 항목마다 자식을 1회 실행합니다.

재개 가능성:
- 러너는 재개 가능한 실행 커서를 `autonovelwriter/runtime/state/runner_state.json`에 저장합니다.
- 커서는 블록이 성공적으로 완료된 뒤에만 전진합니다(재시작 시 미완료 작업 누락을 방지).
- 정본 파이프라인 스크립트가 변경되면(해시 불일치), 러너가 멈추고 재시작이 필요합니다(커서 무효화).
- 러너는 단계별 `ActionResult` 기록을 `autonovelwriter/runtime/state/action_results.jsonl`에 영속화하고, deterministic per-step `exec_id`로 재시작 시 이미 커밋된 결과 중복 기록을 방지합니다.
- `FOREACH_ACTION` 실행 시 ActionResult에는 `action_index`, `action_id_ref`, `action_key`가 포함되며 vars에는 `prev`와 명시적 `task.prev`/`action.prev` 스코프가 포함됩니다.

Pipeline script v2는 중첩을 지원합니다.
- `LOOP <n>`은 루프 블록을 도입합니다.
- `ROUND <n>`은 라운드 컨테이너 블록을 도입합니다.
- `FOREACH_TASK`는 작업별 컨테이너 블록을 도입합니다.
- `FOREACH_ACTION`는 액션별 컨테이너 블록을 도입합니다(러너가 `task.payload.actions`를 순회).
- `IF <expr>`은 조건부 컨테이너 블록을 도입합니다(구문 분석/렌더링; 실행은 현재 then 분기만).
- `ELSE`는 `IF` 블록의 선택적 대체 분기를 도입합니다.
- 하위 노드는 레벨당 2칸 들여쓰기 됩니다.

검증(비영속):
- `POST /api/pipeline/validate`는 canonical preview와 `pipeline_ast`, 경고, 에러를 반환합니다.

PWA는 텍스트 영역에서 스크립트를 표시하고(`source of truth`), `pipeline_ast`를 기반으로 중첩 블록을 렌더링합니다.
백엔드 validate 엔드포인트가 접근 불가하면, PWA는 동일한 v2 동사(`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`)를 지원하는 로컬 파서로 폴백합니다.

Blocks UI 참고:
- `LOOP`와 `ROUND`의 반복 횟수는 블록 목록에서 인라인 편집할 수 있으며, 유효한 수정은 즉시 canonical script 텍스트 영역에 반영됩니다.
- Blocks 툴바는 `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF` 컨테이너를 수동 스크립트 편집 없이 삽입할 수 있습니다(선택 블록을 감싸거나, 유효한 비어 있지 않은 컨테이너를 추가).
- 블록은 캔버스에서 삭제 가능(블록별 Delete 버튼, 블록 선택 시 `Delete` 키). 컨테이너 삭제는 자식 노드를 상위에 splice하며, 에디터는 컨테이너가 비어 있지 않도록 유지해 무효 스크립트를 방지합니다.
- `IF` 블록은 구조적으로 유효하게 유지됩니다: `ELSE`는 `IF` 밖에 남을 수 없고, then 분기는 비어 있을 수 없습니다.
- `STEP` 블록은 Action Library 제어를 노출합니다: 액션 선택기, `Customize`(기본 액션을 사용자 액션으로 복사 후 전환), `Edit`(Action Editor 모달에서 `name/tool/prompt/script` 편집).

## 📝 Runner Outputs (Draft Stub)

파이프라인에 `STEP write` 블록이 있으면, 백엔드 러너가 초안 파일 스텁을 아래 경로에 생성합니다.
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

백엔드는 또한 다음을 방출합니다.
- 경로(`path`)와 프로젝트 상대 경로(`project_rel_path`)가 포함된 WS 이벤트 `output_created`
- 로그 라인 `[output] created: ...`

PWA에는 최소 Outputs 패널이 있으며 `GET /api/outputs/index`로 파일 목록을 표시하고 `output_created`에서 갱신합니다.

## 📦 Runner Tasks (Batch Stub)

파이프라인에 `STEP meta_tasks_generate` 블록이 있으면, 백엔드 러너가 작업 배치 스텁을 생성합니다.
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

백엔드는 또한 다음을 방출합니다.
- `batch_dir`, `tasks_jsonl`, `task_count`가 포함된 WS 이벤트 `tasks_batch_created`
- 로그 라인 `[tasks] created batch: ...`

PWA에는 최소 Task Batches 패널이 있으며 `GET /api/tasks/batches/index`로 배치 목록을 표시하고 `tasks_batch_created`에서 갱신합니다.
또한 배치 상세(`GET /api/tasks/batches/<batch_id>`) 표시 및 배치 활성화를 통해 해당 배치를 `FOREACH_TASK`의 현재 작업 목록으로 사용할 수 있습니다(`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Agent Settings / Codex Gate

PWA Settings 패널은 `/api/settings`를 통해 에이전트 설정을 `autonovelwriter/runtime/state/settings.json`에 영속화합니다.

안전을 위해 백엔드는 `codex` CLI를 다음 조건이 모두 true일 때만 실행합니다.
- `settings.agent.enabled=true` and `settings.agent.sdk="codex"`
- 환경 변수 `AUTONOVELWRITER_ENABLE_CODEX=1` 설정

비밀값은 커밋하지 마세요. 로컬 env 변수 템플릿으로 `autonovelwriter/backend/.env.example`을 사용하세요.

## 🌐 PWA I18N (UI Language)

PWA는 경량 내장 i18N 시스템을 가지고 있습니다.

- UI 언어 강제: PWA URL 뒤에 `?lang=<code>` 추가(예: `?lang=ja`)
- 브라우저별 localStorage에 영속: `anw_lang`
- 지원 UI 언어: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`
- 저장소 레벨 로컬라이즈 README는 현재 `i18n/`에 있으며 이 파일 상단의 언어 링크 줄에서 연결됩니다.

| README locale files (`i18n/`) | Status |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Present |

## 🖋️ Novel Settings (Separate From UI Language)

소설 작성 선호 설정은 백엔드 settings의 `settings.novel.*`에 저장되며 경로는 다음입니다.
- `autonovelwriter/runtime/state/settings.json`

이 값은 PWA UI 언어(`?lang=` / `anw_lang`)와 의도적으로 분리되어 있습니다.

프로젝트별 오버라이드는 다음에 저장됩니다.
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

현재 전역 필드(PWA Settings 모달에서 편집 가능):
- `settings.novel.language` (BCP-47에 가까운 코드: `en`, `ja`, `zh-Hans` 등)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

현재 프로젝트 수준 오버라이드 필드(빈 값/미설정 = 전역 상속):
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

`scripts/auto-autonovelwriter-development.sh`는 `references/autonovelwriter_dev/` 아래의 작업을 대상으로 재개 가능한 Codex 구동 루프로 실행되며, 각 단계(`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`) 후 커밋/푸시를 수행합니다.

유용한 제어:
- 현재 작업 완료 후 중단: `touch references/autonovelwriter_dev/STOP`
- 상태 추적 초기화(큐 유지): `scripts/auto-autonovelwriter-development.sh --reset-state`
- 새로운 Codex 세션 시작: `scripts/auto-autonovelwriter-development.sh --new-session`
- 안전 권장: 깨끗한 브랜치/워크트리에서 실행하고 재시작 전 `references/autonovelwriter_dev/state.tsv`를 확인

### Operational assumptions

- 이 README는 Linux/macOS에서 `bash`와 Python 3.11+를 사용한 로컬 우선 개발을 가정합니다.
- `autonovelwriter/runtime/` 아래 런타임 상태는 가변이며 추적되지 않는 것이 정상입니다.
- 여기 설명된 파이프라인 동작은 현재 `autonovelwriter/backend/server.py`와 `autonovelwriter/pwa/app.js`의 구현을 반영합니다.

## 🧪 Testing Notes

현재 저장소 최상위에는 작성 시점 기준 top-level `Makefile`/`tox`/`npm test` 오케스트레이터가 없습니다.

현재의 실무적인 테스트 진입점:

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

러너 의미론, 파이프라인 문법, Action Library 동작을 변경했다면 같은 변경 사항에서 테스트와 README/API 노트도 함께 갱신하세요.

## 📚 Repository Contents

- `docs/autonovelwriter_spec.md`: Scratch 스타일 컨트롤러(chat + folder pipe + start/pause/stop + settings)를 위한 제품 사양
- `scripts/auto-autonovelwriter-development.sh`: AutoNovelWriter 앱 자체 자동 개발(작업 루프: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`)
- `docs/auto-development-guide.md`: 장기 실행, 재개 가능한 자동 개발 에이전트를 위한 철학 및 요구사항 (EN/ZH)
- `docs/ORDERING_RATIONALE.md`: 스크린샷 기반 단계 순서를 위한 예시 근거
- `scripts-legacy/`: 참고용으로 보관된 구버전 자동화 스크립트 (현재 AutoNovelWriter에서 사용되지 않음)
- `examples/ralph-wiggum-example.sh`: Codex CLI 자동화 헬퍼 예시

추가 개발자 노트:
- 백엔드 테스트는 `autonovelwriter/backend/tests/`에 있습니다.
- 소규모 PWA 동작 테스트는 `autonovelwriter/pwa/tests/`에 있습니다.
- `i18n/`에는 저장소 README 로컬라이즈 파일이 있으며 UI 번역 딕셔너리는 `autonovelwriter/pwa/app.js`에 내장되어 있습니다.

## 🧯 Troubleshooting

| Symptom | What to check |
|---|---|
| `tmux not found in PATH` | tmux를 설치하거나 백엔드/정적 서버를 수동으로 실행 |
| `conda not found in PATH` when using `--env` scripts | Miniconda/Anaconda를 설치하거나 conda 없이 수동 `pip` 설치 |
| PWA cannot connect to backend | 백엔드 주소/포트 및 WebSocket 엔드포인트 `ws://<host>:<port>/ws` 확인 |
| `POST /api/agent/test` returns gated/disabled | `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, `AUTONOVELWRITER_ENABLE_CODEX=1` 모두 설정 확인 |
| Pipeline runner stops after script edit | 정상 동작입니다. 파이프라인 스크립트 해시 불일치 시 커서가 무효화되어 재시작이 필요 |
| Static PWA on `:5173` works but API calls fail | 백엔드가 `:8787`에서 실행 중인지, 또는 앱/백엔드 대상 설정을 확인 |

## 🗺️ Roadmap

- 남은 auto-dev 큐 항목 완성 및 안정화(상기 progress 블록 참조)
- `i18n/` 아래 저장소 수준 README 현지화 변형을 계속 확장하고 동기화
- 러너 엣지 케이스와 PWA 상호작용 전반의 자동 테스트 커버리지 확대
- Action Library와 작업/액션 반복 워크플로의 지속적 개선

## 🤝 Contributing

기여를 환영합니다.

이 저장소의 실무적 가이드:
- `docs/autonovelwriter_spec.md`와 `docs/auto-development-guide.md`를 먼저 확인하세요.
- 런타임 변경은 추적 대상이 아닌 `autonovelwriter/runtime/` (`gitignored`) 하에서 수행하세요.
- 재현 가능한 실행/테스트 명령을 포함한 점진적 PR을 선호하세요.
- 파이프라인 의미론이나 API 계약을 변경한다면 README와 관련 테스트를 함께 갱신하세요.

참고: 현재 초안 기준으로 저장소 루트에 `CONTRIBUTING.md`는 없습니다.

---

## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 License

이 초안 시점 기준으로 저장소 루트에 라이선스 파일/상태가 명시적으로 선언되어 있지 않습니다.

Assumption note:
- 오픈소스 재배포 의도가 명확하다면 최상위 `LICENSE` 파일을 추가하고 이 섹션을 함께 업데이트하세요.
