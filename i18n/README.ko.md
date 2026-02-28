[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/figs/banner.png" alt="LazyingArt banner" />
</p>

# AutoNovelWriter

언어 옵션: **한국어**. i18n 작업 공간은 `i18n/`에 있으며, 현지화된 README 변형은 언어별로 순차 생성됩니다.

![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9)
![Frontend](https://img.shields.io/badge/frontend-PWA-10b981)
![Runtime](https://img.shields.io/badge/runtime-local%20state-orange)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)

자동 소설 작성(및 앱 개발) 파이프라인을 제어하기 위한 Scratch 스타일 PWA + Tornado 백엔드입니다.

이 저장소에는 `AutoAppDev/`도 서브모듈(재사용 가능한 자동 개발 스크립트)로 포함되어 있습니다.

## Overview

AutoNovelWriter는 다음을 위한 로컬 오케스트레이션 레이어를 제공합니다.
- 소스 텍스트와 블록 UI 양쪽에서 정본 파이프라인 스크립트(`pipeline.script`)를 편집.
- 커서와 액션 결과를 영속화하는 재개 가능한 백엔드 실행.
- 프로젝트, 자료, 출력물, 작업 배치, 액션 템플릿 관리.
- PWA로 WebSocket(`/ws`) 실시간 업데이트 스트리밍.

정본 가변 런타임은 `autonovelwriter/runtime/`(gitignored)입니다.

| Area | 기능 |
|---|---|
| Pipeline authoring | 하나의 단일 소스 오브 트루스에서 정본 스크립트 + 중첩 블록 UI 편집 |
| Execution | 커서/액션 결과 영속화를 갖춘 재개 가능한 러너 |
| Project ops | 프로젝트 범위 자료, 출력물, 설정, 작업 배치 활성화 |
| Realtime UX | 상태/로그/출력/작업/액션 업데이트용 `/ws` 이벤트 |

## Features

- 정본 스크립트 + parser/AST를 기반으로 하는 Scratch 스타일 파이프라인 에디터.
- 재개 가능한 상태를 갖춘 러너 제어 API (`start/pause/resume/stop`).
- 제어 흐름 컨테이너: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- 기본 템플릿 + copy-on-edit 사용자 오버라이드를 제공하는 Action Library.
- 상속 의미론을 갖춘 프로젝트별 소설 설정 오버라이드.
- `FOREACH_TASK`를 위한 작업 배치 생성/인덱스/상세/활성화 플로우.
- 출력물 인덱싱 및 최신 소설 PDF 미리보기 엔드포인트.
- 내장 PWA i18n 사전(`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- tmux 헬퍼 스크립트 및 재개 가능한 Codex 자동 개발 드라이버.

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
| Python `3.11+` | Yes | 권장 기준 버전 |
| `pip` | Yes | 백엔드 의존성 설치 |
| `tmux` | No | 멀티 패인 런처 스크립트에 필요 |
| `conda` | No | 선택적 헬퍼 스크립트 |
| `node` | No | PWA 테스트 파일 직접 실행 시 선택 |

## ⚙️ Installation

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

## 🚀 Usage

## Dev Run (Backend + PWA)

Backend (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

백엔드는 기본적으로 `autonovelwriter/pwa/`의 PWA 정적 자산도 함께 서빙하므로 다음 주소를 열 수 있습니다.
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

선택 사항: PWA (별도 정적 개발 서버):
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

`http://127.0.0.1:5173`에서 PWA를 열고 백엔드(기본 `ws://127.0.0.1:8787/ws`)를 지정하세요.

tmux (두 패인 + 로그 tail 실행):
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda env 헬퍼:
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

저장소의 드라이버 스크립트(`scripts/auto-autonovelwriter-development.sh`)도 자동 개발 중 tmux 세션을 시작할 수 있습니다.

### Typical workflow

1. 백엔드(또는 tmux 헬퍼) 시작.
2. PWA 열기.
3. Blocks 및/또는 스크립트 텍스트영역으로 파이프라인 편집.
4. 파이프라인 검증/저장.
5. 러너 시작 후 로그/상태/이벤트 모니터링.
6. 생성된 출력물/작업 배치 검토.

## 🧠 Runtime Paths

모든 가변 상태와 IO는 `autonovelwriter/runtime/`(git ignored) 아래에 있습니다.

| Path | 용도 |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (`.txt`/`.md` 투입) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (백엔드가 채팅 메시지 기록) |
| `autonovelwriter/runtime/state/` | 영속 JSON 상태(settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite 채팅 미러(chat.jsonl 외) |
| `autonovelwriter/runtime/state/active_project.json` | 영속 "active project" 포인터 |
| `autonovelwriter/runtime/tasks/` | 작업 큐 파일 |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | 생성된 작업 배치(예: `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | 로그 |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | 프로젝트 자료(입력) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | 프로젝트 출력물(초안/내보내기) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | 프로젝트별 소설 설정 오버라이드(예: 소설 언어) |
| `autonovelwriter/runtime/actions/defaults/` | 시드된 기본 Action Library 템플릿(불변 취급) |
| `autonovelwriter/runtime/actions/user/` | 사용자 Action Library 템플릿(copy-on-edit로 생성) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | 작가 파이프라인 입력용 채팅 입력 미러 |

## 🧩 Pipeline Script (Canonical Artifact)

파이프라인은 디스크의 포맷된 스크립트로 표현됩니다.
- `autonovelwriter/runtime/state/pipeline.script`

백엔드는 `GET/POST /api/pipeline`을 통해 다음 형태로 제공합니다.
- `script` (정본, shell-ish `STEP <type>` / `DISABLED <type>` 라인)
- `pipeline` JSON (파생값, 단순 블록 렌더링용 평탄 리스트)
- `pipeline_ast` (파생값, 루프 + 들여쓰기 UI용 중첩 구조)

러너는 동일한 v2 parser/AST에서 파생된 단계를 실행하므로 PWA 표시 내용과 실제 실행 내용이 일치합니다.
러너 제어 흐름은 v2 컨테이너를 지원합니다.
- `ROUND <n>`: 자식 블록을 `n`회 반복.
- `FOREACH_TASK`: 활성 작업 목록(`autonovelwriter/runtime/tasks/tasks.json`)의 각 작업마다 자식 1회 실행.
- `FOREACH_ACTION`: 현재 작업의 `payload.actions` 목록 항목마다 자식 1회 실행(`FOREACH_TASK` 내부 중첩 의도).

재개 가능성(Resumability):
- 러너는 재개 가능한 실행 커서를 `autonovelwriter/runtime/state/runner_state.json`에 영속화합니다.
- 커서는 블록이 성공적으로 완료된 뒤에만 전진합니다(재시작 시 미완료 작업을 건너뛰지 않음).
- 정본 파이프라인 스크립트가 변경되면(hash 불일치) 러너는 중지되고 재시작이 필요합니다(커서 무효화).
- 러너는 단계별 `ActionResult`를 `autonovelwriter/runtime/state/action_results.jsonl`에 영속화하며, 재시작 시 이미 커밋된 결과 중복을 피하기 위해 결정론적 단계별 `exec_id`를 사용합니다.
  - `FOREACH_ACTION` 내부 실행 시 ActionResult에는 `action_index`, `action_id_ref`, `action_key`가 포함되고, vars에는 `prev`와 함께 명시적 `task.prev`/`action.prev` 스코프가 포함됩니다.

Pipeline script v2는 중첩을 지원합니다.
- `LOOP <n>`: 루프 블록 시작
- `ROUND <n>`: 라운드 컨테이너 블록 시작
- `FOREACH_TASK`: 작업별 컨테이너 블록 시작
- `FOREACH_ACTION`: 액션별 컨테이너 블록 시작(러너가 `task.payload.actions` 순회)
- `IF <expr>`: 조건 컨테이너 블록 시작(parse/render 지원, 현재 러너는 then 분기만 실행)
- `ELSE`: `IF` 블록의 선택적 대체 분기
- 자식은 레벨당 공백 2칸 들여쓰기

검증(영속화 없음):
- `POST /api/pipeline/validate`는 정본 프리뷰와 `pipeline_ast`, 경고, 오류를 반환.

PWA는 스크립트를 텍스트영역(단일 소스 오브 트루스)으로 표시하고 `pipeline_ast`에서 중첩 블록을 렌더링합니다.
백엔드 validate 엔드포인트에 접근할 수 없으면, PWA는 동일한 v2 동사(`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`)를 지원하는 로컬 파서로 폴백합니다.

Blocks UI 참고:
- `LOOP`/`ROUND` 반복 횟수는 블록 목록에서 인라인 편집 가능하며, 유효한 편집은 즉시 정본 스크립트 텍스트영역에 반영됩니다.
- Blocks 툴바는 `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF` 컨테이너를 스크립트 수동 편집 없이 삽입할 수 있습니다(선택 블록 감싸기 또는 유효한 비어있지 않은 컨테이너 추가).
- 블록은 캔버스에서 삭제할 수 있습니다(블록별 Delete 버튼, 블록 선택 시 키보드 `Delete`). 컨테이너 삭제 시 자식은 상위로 스플라이스되고, 에디터는 스크립트 무효화를 방지하기 위해 컨테이너를 비어있지 않게 유지합니다.
- `IF` 블록은 에디터에서 구조적으로 유효하게 유지됩니다: `ELSE`는 `IF` 바깥에 남을 수 없고, then 분기는 비어있지 않게 유지됩니다.
- `STEP` 블록은 Action Library 제어를 노출합니다: action selector, `Customize`(기본 액션을 사용자 액션으로 복사 후 전환), `Edit`(`name/tool/prompt/script`용 Action Editor 모달).

## 🔧 Configuration

### Environment variables

`autonovelwriter/backend/.env.example`를 템플릿으로 사용하세요. 백엔드/런타임에서 사용하는 핵심 변수:

- `AUTONOVELWRITER_RUNTIME_ROOT` (기본 `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (기본 `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (기본 `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (기본 `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (기본: 저장소 루트의 상위 경로)
- `AUTONOVELWRITER_WRITER_SCRIPT` (기본 `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (기본 `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (기본 `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (에이전트 실행 게이트, 기본 비활성)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (선택적 codex 바이너리 오버라이드)

## 🌐 Key Backend APIs

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (상속 의미론을 갖는 프로젝트별 오버라이드: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (선택: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (`runtime/tasks/tasks.json` 및 프로젝트 `active_tasks.json` 기록)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (defaults에 대한 copy-on-edit 업데이트)
- Pipeline (정본 스크립트 + 파생 JSON): `GET/POST /api/pipeline`
- Pipeline validate (프리뷰 전용): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (`../scripts/auto-xiyouzhiyuan-writer.sh`를 참조로 읽고 파싱)
  - `POST /api/pipeline/reference_writer/load` (파싱 결과를 런타임 파이프라인에 로드, 원본 스크립트는 절대 수정하지 않음)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (메타데이터)
  - `GET /api/novel/latest/pdf` (뷰어용 인라인 PDF 스트림)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (활성화 + 환경 게이트 충족 시에만 `codex --version` 실행)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Runner Outputs (Draft Stub)

파이프라인에 `STEP write` 블록이 포함되면, 백엔드 러너는 다음 경로 아래에 스텁 초안 파일을 생성합니다.
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

백엔드는 또한 다음을 발생시킵니다.
- `path`와 `project_rel_path`를 포함한 WS 이벤트 `output_created`
- `log` 라인 `[output] created: ...`

PWA에는 최소한의 Outputs 패널이 포함되어 있으며 `GET /api/outputs/index`로 파일 목록을 보여주고 `output_created` 시 갱신합니다.

## 📦 Runner Tasks (Batch Stub)

파이프라인에 `STEP meta_tasks_generate` 블록이 포함되면, 백엔드 러너는 다음 경로 아래에 스텁 작업 배치를 생성합니다.
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

백엔드는 다음을 발생시킵니다.
- `batch_dir`, `tasks_jsonl`, `task_count`를 포함한 WS 이벤트 `tasks_batch_created`
- `log` 라인 `[tasks] created batch: ...`

PWA에는 최소한의 Task Batches 패널이 포함되어 있으며 `GET /api/tasks/batches/index`로 배치 목록을 보여주고 `tasks_batch_created` 시 갱신합니다.
또한 배치 상세(`GET /api/tasks/batches/<batch_id>`)를 표시하고, 배치를 `FOREACH_TASK`용 현재 작업 목록으로 활성화할 수 있습니다(`POST /api/tasks/batches/<batch_id>/activate`).

## 🤖 Agent Settings / Codex Gate

PWA Settings 패널은 `/api/settings`를 통해 에이전트 설정을 `autonovelwriter/runtime/state/settings.json`에 영속화합니다.

안전을 위해 백엔드는 아래 두 조건이 모두 참인 경우에만 `codex` CLI를 스폰합니다.
- `settings.agent.enabled=true` 및 `settings.agent.sdk="codex"`
- 환경 변수에 `AUTONOVELWRITER_ENABLE_CODEX=1` 설정

비밀값은 절대 커밋하지 마세요. 로컬 환경 변수 템플릿으로 `autonovelwriter/backend/.env.example`를 사용하세요.

## 🌍 PWA I18N (UI Language)

PWA에는 경량 내장 i18n 시스템이 있습니다.

- UI 언어 강제 지정: PWA URL에 `?lang=<code>` 추가(예: `?lang=ja`).
- 브라우저별 localStorage 영속 키: `anw_lang`.
- 지원 UI 언어: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## 📚 Novel Settings (Separate From UI Language)

소설 작성 선호 설정은 `settings.novel.*` 아래 백엔드 설정으로 저장되며 위치는 다음과 같습니다.
- `autonovelwriter/runtime/state/settings.json`

이는 PWA UI 언어(`?lang=` / `anw_lang`)와 의도적으로 **분리**되어 있습니다.

프로젝트별 오버라이드는 다음 위치에 저장됩니다.
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

현재 필드(PWA Settings 모달에서 편집 가능):
- `settings.novel.language` (예: `en`, `ja`, `zh-Hans` 등의 BCP-47 유사 코드)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

현재 프로젝트 레벨 오버라이드 필드(빈 값/미설정 = 전역 상속):
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

`scripts/auto-autonovelwriter-development.sh`는 `references/autonovelwriter_dev/`의 작업을 대상으로 재개 가능한 Codex 기반 루프를 실행하며, 각 단계(plan/implement/debug/fix/i18n/summary/update_readme) 후 **commit/push를 수행합니다**.

유용한 제어:
- 현재 작업 이후 중지: `touch references/autonovelwriter_dev/STOP`
- 상태 추적 리셋(큐는 유지): `scripts/auto-autonovelwriter-development.sh --reset-state`
- 새 Codex 세션 시작: `scripts/auto-autonovelwriter-development.sh --new-session`
- 안전 권장사항: 깨끗한 브랜치/워크트리에서 실행하고, 재시작 전 `references/autonovelwriter_dev/state.tsv`를 확인하세요.

## 📚 Contents

- `docs/autonovelwriter_spec.md`: Scratch 스타일 컨트롤러(chat + folder pipe + start/pause/stop + settings) 제품 명세.
- `scripts/auto-autonovelwriter-development.sh`: AutoNovelWriter 앱 자체 자동 개발(작업 루프: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md`: 장기 실행/재개 가능한 자동 개발 에이전트를 위한 철학과 요구사항(영/중 이중언어).
- `docs/ORDERING_RATIONALE.md`: 스크린샷 기반 단계 순서화 예시 근거.
- `scripts-legacy/`: AutoNovelWriter에서 사용하지 않지만 참고를 위해 보관한 구형 자동화 스크립트.
- `examples/ralph-wiggum-example.sh`: Codex CLI 자동화 헬퍼 예제.

### Additional developer notes

- 백엔드 테스트는 `autonovelwriter/backend/tests/`에 있습니다.
- 작은 PWA 동작 테스트는 `autonovelwriter/pwa/tests/`에 있습니다.
- 루트 `i18n/` 디렉터리는 존재하며, 이 원문 초안 작성 시점에는 비어 있다고 기재되어 있습니다(현재는 다국어 README 생성 과정에서 파일이 채워질 수 있습니다).

## 🧯 Troubleshooting

- `tmux not found in PATH`:
  - tmux를 설치하거나 백엔드/정적 서버를 수동으로 실행하세요.
- `conda not found in PATH` when using `--env` scripts:
  - Miniconda/Anaconda를 설치하거나 conda 없이 수동 `pip` 설치를 사용하세요.
- PWA cannot connect to backend:
  - 백엔드 주소/포트와 WebSocket 엔드포인트 `ws://<host>:<port>/ws`를 확인하세요.
- `POST /api/agent/test` returns gated/disabled:
  - `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, 환경 변수 `AUTONOVELWRITER_ENABLE_CODEX=1`이 모두 설정되어야 합니다.
- Pipeline runner stops after script edit:
  - 정상 동작입니다. 파이프라인 스크립트 해시 불일치 시 커서가 무효화되며 재시작이 필요합니다.

## 🧭 Roadmap

- 남은 자동 개발 큐 항목 완료 및 안정화(위 생성된 진행 블록 참조).
- 저장소 레벨 i18n 자산을 `i18n/` 아래로 확장(디렉터리는 이미 존재).
- 러너 엣지 케이스와 PWA 상호작용 전반의 자동 테스트 커버리지 확대.
- Action Library 및 작업/액션 반복 워크플로 개선 지속.

## 🤝 Contributing

기여를 환영합니다.

이 저장소를 위한 실용 가이드:
- `docs/autonovelwriter_spec.md`와 `docs/auto-development-guide.md`부터 시작하세요.
- 런타임 변경은 추적 파일이 아닌 `autonovelwriter/runtime/`(gitignored) 아래에서 수행하세요.
- 재현 가능한 실행/테스트 명령과 함께 점진적 PR을 선호합니다.
- 파이프라인 의미론 또는 API 계약을 변경한다면 README와 관련 테스트를 함께 갱신하세요.

참고: 이 초안 시점 기준 저장소 루트에서 전용 `CONTRIBUTING.md`는 확인되지 않았습니다.

## ❤️ Sponsor & Donate

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 License

이 초안 컨텍스트 기준, 저장소 루트에 라이선스 파일/상태가 명시적으로 선언되어 있지 않습니다.

Assumption note:
- 오픈소스 재배포 의도를 명확히 하려면 루트에 `LICENSE` 파일을 추가하고 이 섹션을 함께 업데이트하세요.
