[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)




[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>Scratch-like PWA + Tornado backend для управления автоматизированным пайплайном написания романов (и разработки приложений).</strong></p>
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

В этом репозитории также используется `AutoAppDev/` как submodule (повторно используемые скрипты auto-development).

> [!TIP]
> `README.md` — базовый канонический документ. Локализованные версии находятся в `i18n/` и подключаются через единственную строку выбора языка наверху.

## 🧭 Обзор проекта

| Кратко | Подробности |
|---|---|
| Основной стек | Python + backend Tornado, frontend PWA в браузере |
| Базовый UX | Редактор скрипта и блоков на одной общей источнике правды |
| Режим выполнения | Возобновляемый runner с сохраненным курсором и результатами действий |
| Realtime | WebSocket endpoint по адресу `/ws` |
| Изменяемый runtime- root | `autonovelwriter/runtime/` (игнорируется git) |

## At-a-Glance Navigation

| Что использовать прямо сейчас | Команда / URL |
|---|---|
| Открыть локальную PWA | `http://127.0.0.1:8787/` |
| Подключить live-обновления | `ws://127.0.0.1:8787/ws` |
| Быстрый старт backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Скриптный setup + start | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

> [!TIP]
> Самый быстрый локальный старт:
> 1. `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill`
> 2. Откройте `http://127.0.0.1:8787/`
> 3. Подключите WebSocket-обновления: `ws://127.0.0.1:8787/ws`

## 🔌 Значения запуска по умолчанию

| Значение запуска по умолчанию | Значение |
|---|---|
| PWA URL | `http://127.0.0.1:8787/` |
| WebSocket URL | `ws://127.0.0.1:8787/ws` |
| Backend host/port | `127.0.0.1:8787` |

## Содержание

- [Обзор](#-обзор-проекта)
- [Возможности](#-возможности)
- [Архитектура с первого взгляда](#-архитектура-с-первого-взгляда)
- [Структура проекта](#️-структура-проекта)
- [At-a-Glance Navigation](#at-a-glance-navigation)
- [Требования](#-требования)
- [Установка](#-установка)
- [Использование](#-использование)
- [Конфигурация](#️-конфигурация)
- [Ключевые backend API](#-ключевые-backend-api)
- [Пути runtime](#-пути-runtime)
- [Pipeline script (канонический артефакт)](#-pipeline-script-канонический-артефакт)
- [Runner outputs (черновик)](#-runner-outputs-черновик)
- [Runner tasks (batch-черновик)](#-runner-tasks-batch-черновик)
- [Настройки агента / Codex Gate](#-настройки-агента--codex-gate)
- [PWA I18N (язык интерфейса)](#-pwa-i18n-язык-интерфейса)
- [Настройки романа (отдельно от UI)](#️-настройки-романа-отдельно-от-ui)
- [Примеры](#-примеры)
- [Заметки по разработке](#️-заметки-по-разработке)
- [Заметки по тестированию](#-заметки-по-тестированию)
- [Содержимое репозитория](#-содержимое-репозитория)
- [Устранение неполадок](#-устранение-неполадок)
- [Roadmap](#️-roadmap)
- [Как внести вклад](#-как-внести-вклад)
- [Support](#-support)
- [Лицензия](#-лицензия)

## 📌 Обзор

AutoNovelWriter предоставляет локальный orchestration-уровень для:
- Редактирования канонического пайплайн-скрипта (`pipeline.script`) через текст и блоки.
- Запуска возобновляемого исполнения в backend с сохранением курсора и результатов действий.
- Управления проектами, материалами, выводами, пакетами задач и шаблонами действий.
- Трансляции live-обновлений через WebSocket (`/ws`) в PWA.

Канонический изменяемый runtime — `autonovelwriter/runtime/` (содержимое игнорируется Git).

| Область | Назначение |
|---|---|
| Редактирование pipeline | Редактирование канонического скрипта + вложенного UI блоков из одного источника истины |
| Выполнение | Возобновляемый runner с сохраненным курсором и результатами действий |
| Работа с проектами | Материалы проекта, outputs, настройки и активация задач batch |
| Realtime UX | События `/ws` для обновлений статуса, логов, outputs, tasks и действий |

## ✨ Возможности

- Scratch-like редактор pipeline на основе канонического скрипта + parser/AST.
- API управления runner (`start/pause/resume/stop`) с возобновляемым состоянием.
- Control-flow контейнеры: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Библиотека действий с шаблонами по умолчанию + пользовательскими override по модели copy-on-edit.
- Проектные override-настройки романа с семантикой наследования.
- Поток генерации/индекса/деталей/активации batch для `FOREACH_TASK`.
- Индексация outputs и endpoint предпросмотра последнего PDF романа.
- Встроенные словари i18n для PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Скрипты tmux и возобновляемый Codex auto-dev драйвер.

## 🧭 Архитектура с первого взгляда

```text
Browser (PWA)
  ├─ pipeline editor (скрипт + blocks)
  ├─ panels: settings / projects / actions / tasks / outputs
  └─ WebSocket client (/ws)
          │
          ▼
Tornado backend (autonovelwriter/backend/server.py)
  ├─ REST APIs (/api/*)
  ├─ WebSocket broadcast hub
  ├─ parser + AST + persistence канонического скрипта
  ├─ resumable runner + журнал коммитов action-result
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

## 🗂️ Структура проекта

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

## ✅ Требования

| Зависимость | Требуется | Примечание |
|---|---|---|
| Python `3.11+` | Да | Рекомендуемый baseline |
| `pip` | Да | Установка зависимостей backend |
| `tmux` | Нет | Нужен для многооконного launcher-скрипта |
| `conda` | Нет | Опционально для helper-скриптов |
| `node` | Нет | Опционально для прямого запуска PWA тестов |

## 🚀 Установка

| Путь | Когда использовать | Команда |
|---|---|---|
| Option A | Используете conda и хотите использовать setup из репозитория | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Нужен setup + запуск одной командой | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Предпочитаете ручное управление pip | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Помощник conda (рекомендуется для этого репозитория)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Затем запустите через tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B: Setup + run в одной команде

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Option C: Ручная установка pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

### Опционально: инициализация submodule

```bash
git submodule update --init --recursive
```

## 🧪 Использование

| Поток | Команда / URL |
|---|---|
| Запустить backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Открыть приложение | `http://127.0.0.1:8787/` |
| WebSocket endpoint | `ws://127.0.0.1:8787/ws` |
| Optional static PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| launcher через tmux | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Быстрый старт (без tmux)

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

Backend также отдает статику PWA из `autonovelwriter/pwa/` по умолчанию, поэтому можно открыть:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Опционально: PWA (отдельный статический dev server):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Откройте PWA на `http://127.0.0.1:5173` и направьте её на backend (по умолчанию `ws://127.0.0.1:8787/ws`).

tmux (запуск backend и PWA + tail логов):

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

Скрипт драйвера репозитория (`scripts/auto-autonovelwriter-development.sh`) также может запускать tmux-сессию для auto-dev.

### Типичный workflow

1. Запустите backend (или tmux helper).
2. Откройте PWA.
3. Отредактируйте pipeline через блоки и/или текстовое поле скрипта.
4. Проверьте/сохраните pipeline.
5. Запустите runner и следите за логами/статусом/events.
6. Просмотрите сгенерированные outputs и task batches.

## ⚙️ Конфигурация

### Переменные окружения

Используйте `autonovelwriter/backend/.env.example` как шаблон. Ключевые переменные для backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (по умолчанию `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (по умолчанию `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (по умолчанию `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (значение по умолчанию в CLI: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (по умолчанию: родитель корня репозитория)
- `AUTONOVELWRITER_WRITER_SCRIPT` (по умолчанию `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (по умолчанию `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (по умолчанию `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (включатель запуска агента, по умолчанию disabled)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (опциональный override для бинарника codex)

### CLI опции скриптов

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

## 🔌 Ключевые backend API

| API-группа | Ключевые endpoints |
|---|---|
| Health & settings | `/api/health`, `/api/settings` |
| Проекты и project settings | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tasks | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Actions | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Outputs & preview романа | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| Realtime | `/ws` |

### HTTP API

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Проекты: `GET /api/projects`, `POST /api/projects/active`
- Настройки проекта (активный проект): `GET/POST /api/projects/settings` (inherit semantics на проект: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Индекс материалов (активный проект): `GET /api/materials/index`
- Outputs index (активный проект): `GET /api/outputs/index`
- Индекс task batches: `GET /api/tasks/batches/index` (опционально: `?project=<project_id>`)
- Детали task batch: `GET /api/tasks/batches/<batch_id>`
- Активация task batch: `POST /api/tasks/batches/<batch_id>/activate` (записывает `runtime/tasks/tasks.json` и `active_tasks.json` проекта)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (copy-on-edit update для defaults)
- Pipeline (канонический скрипт + производный JSON): `GET/POST /api/pipeline`
- Проверка pipeline (только preview): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (читает и парсит `../scripts/auto-xiyouzhiyuan-writer.sh` как reference)
  - `POST /api/pipeline/reference_writer/load` (загружает разобранный результат в runtime pipeline; исходный скрипт не изменяет)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Последний PDF романа:
  - `GET /api/novel/latest` (метаданные)
  - `GET /api/novel/latest/pdf` (inline PDF stream для viewer)
- Управление runner: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (с gate): `POST /api/agent/test` (запускает `codex --version` только при включении gate + env)

### WebSocket

- Endpoint: `/ws`
- Broadcast-события: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Пути runtime

Все изменяемое состояние и IO лежат в `autonovelwriter/runtime/`:

| Путь | Назначение |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (загрузка `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend пишет chat messages) |
| `autonovelwriter/runtime/state/` | persistируемый JSON state (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | зеркальный sqlite чат (дополнительно к chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | сохраненный указатель активного проекта |
| `autonovelwriter/runtime/tasks/` | файлы очереди задач |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | сгенерированные batches задач (напр. из `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | логи |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | материалы проекта (inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | outputs проекта (drafts/exports) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | пер-проектные override для параметров романа (например, novel language) |
| `autonovelwriter/runtime/actions/defaults/` | базовые шаблоны Action Library (рассматриваются как immutable) |
| `autonovelwriter/runtime/actions/user/` | пользовательские шаблоны Action Library (созданы через copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | зеркальные чаты writer-пайплайна в ingestion |

## 🧩 Pipeline Script (канонический артефакт)

Pipeline хранится как форматированный скрипт на диске:
- `autonovelwriter/runtime/state/pipeline.script`

Backend отдает его через `GET/POST /api/pipeline` как:
- `script` (канонический, shell-like `STEP <type>` / `DISABLED <type>` строки)
- `pipeline` JSON (derived, плоский список для рендера блоков)
- `pipeline_ast` (derived, nested structure для loop/indent UI)

Runner выполняет шаги, полученные из одного и того же v2 parser/AST, поэтому PWA и backend совпадают.

Runner control flow поддерживает v2 контейнеры:
- `ROUND <n>` повторяет детей `n` раз.
- `FOREACH_TASK` выполняет детей один раз для каждой задачи из active task list (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` выполняет детей для каждого элемента в `payload.actions` текущей задачи (предназначен для вложения под `FOREACH_TASK`).

Возобновление:
- runner сохраняет resumable execution cursor в `autonovelwriter/runtime/state/runner_state.json`.
- Курсор продвигается только после успешного завершения блока (поэтому restart не пропускает незавершенную работу).
- Если канонический скрипт pipeline изменился (хэш не совпал), runner останавливается и требует restart (cursor инвалидируется).
- Runner сохраняет `ActionResult` на шаг в `autonovelwriter/runtime/state/action_results.jsonl` и использует детерминированный `exec_id` на шаг, чтобы не дублировать уже закоммиченные результаты после restart.
- При выполнении внутри `FOREACH_ACTION` ActionResults содержат `action_index`, `action_id_ref`, `action_key`, а переменные включают `prev` и явные скоупы `task.prev` и `action.prev`.

Pipeline script v2 поддерживает вложенность:
- `LOOP <n>` создает loop block.
- `ROUND <n>` создает rounds container block.
- `FOREACH_TASK` создает per-task container block.
- `FOREACH_ACTION` создает per-action container block (runner итерирует `task.payload.actions`).
- `IF <expr>` создает conditional container block (parse/render; сейчас runner исполняет только then-branch).
- `ELSE` создает optional alternate branch под `IF` block.
- Дети отступаются на 2 пробела на уровень.

Валидация (без сохранения):
- `POST /api/pipeline/validate` возвращает канонический preview плюс `pipeline_ast`, warnings и errors.

PWA показывает скрипт в textarea (source of truth) и рендерит вложенные блоки из `pipeline_ast`.
Если endpoint валидации backend недоступен, PWA переходит на local parser с теми же v2 глаголами (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Заметки по Blocks UI:
- `LOOP` и `ROUND` repeat-count редактируются inline в списке блоков; валидные изменения сразу обновляют канонический script textarea.
- Панель блоков может вставлять контейнеры `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF` без ручного редактирования скрипта (оборачивает выбранный блок или добавляет корректный непустой контейнер).
- Блоки можно удалять с canvas (Delete-кнопка у каждого блока; клавиша `Delete`, если блок выбран). Удаление контейнера вынимает детей наверх, и редактор поддерживает non-empty containers, чтобы не создавать invalid скрипты.
- `IF` блоки поддерживают структурную корректность: `ELSE` не может остаться вне `IF`, основной branch остается непустым.
- `STEP` блоки показывают controls Action Library: selector action, `Customize` (копирует default action в пользовательскую и переключает на нее), `Edit` (Action Editor modal для `name/tool/prompt/script`).

## 📝 Runner Outputs (черновик)

Когда pipeline содержит блок `STEP write`, backend runner создает stub draft файл в:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Backend также эмитит:
- WS-событие `output_created` с `path` и `project_rel_path`
- строку лога `[output] created: ...`

В PWA есть минимальная панель Outputs, она показывает файлы через `GET /api/outputs/index` и обновляется на `output_created`.

## 📦 Runner Tasks (Batch-черновик)

Когда pipeline содержит блок `STEP meta_tasks_generate`, backend runner создает stub task batch в:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Backend также эмитит:
- WS-событие `tasks_batch_created` с `batch_dir`, `tasks_jsonl` и `task_count`
- строку лога `[tasks] created batch: ...`

PWA содержит минимальную панель Task Batches, которая списки batches через `GET /api/tasks/batches/index` и обновляет их на `tasks_batch_created`.
Она также умеет показывать детали batch (`GET /api/tasks/batches/<batch_id>`) и активировать batch, чтобы сделать его текущим списком для `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Настройки агента / Codex Gate

Panel настроек PWA сохраняет agent settings через `/api/settings` в `autonovelwriter/runtime/state/settings.json`.

Для безопасности backend не запускает `codex` CLI, пока не истинны оба условия:
- `settings.agent.enabled=true` и `settings.agent.sdk="codex"`
- в окружении установлен `AUTONOVELWRITER_ENABLE_CODEX=1`

Не коммитьте секреты. Используйте `autonovelwriter/backend/.env.example` как шаблон локальных переменных среды.

## 🌐 PWA I18N (язык интерфейса)

У PWA есть облегченная встроенная система i18n.

- Форсировать язык UI: добавьте `?lang=<code>` в URL PWA (например, `?lang=ja`).
- Сохраняется в localStorage на браузер: `anw_lang`.
- Поддерживаемые UI языки: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Локализованные README на уровне репозитория сейчас находятся в `i18n/` и подключаются через единственную строку выбора языка в начале этого документа.

| README locale-файлы (`i18n/`) | Статус |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Present |

## 🖋️ Настройки романа (отдельно от UI)

Настройки написания романа хранятся в backend settings under `settings.novel.*` в:
- `autonovelwriter/runtime/state/settings.json`

Они намеренно отделены от PWA UI языка (`?lang=` / `anw_lang`).

Пер-проектные overrides лежат в:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Текущие глобальные поля (редактируемые в модалке PWA Settings):
- `settings.novel.language` (BCP-47-like коды, например `en`, `ja`, `zh-Hans` и т.д.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Текущие проектные override-поля (empty/unset означает inherit глобальных):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Примеры

### Минимальный локальный запуск

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### tmux-run без auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Запуск тестовых файлов backend напрямую

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Запуск PWA logic test file напрямую

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Пример scripted automation helper

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Заметки по разработке

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

`scripts/auto-autonovelwriter-development.sh` запускает возобновляемый Codex-driven loop по задачам в `references/autonovelwriter_dev/` и делает commit/push после каждой стадии (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Полезные управления:
- Остановиться после текущей задачи: `touch references/autonovelwriter_dev/STOP`
- Сбросить state tracking (сохраняет queue): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Начать новую Codex session: `scripts/auto-autonovelwriter-development.sh --new-session`
- Best practice: работайте в чистой branch/worktree и наблюдайте `references/autonovelwriter_dev/state.tsv` перед перезапуском

### Операционные предположения

- Это README ориентировано на локальную разработку на Linux/macOS с `bash` и Python 3.11+.
- Runtime state в `autonovelwriter/runtime/` изменяем и ожидается как untracked.
- Описанное поведение pipeline отражает текущую реализацию в `autonovelwriter/backend/server.py` и `autonovelwriter/pwa/app.js`.

## 🧪 Заметки по тестированию

В этом репозитории на момент написания нет top-level `Makefile`/`tox`/`npm test` оркестратора.

Текущие входные точки для практического тестирования:

| Зона | Точка входа |
|---|---|
| Backend parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Backend foreach-action syntax | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Backend runner semantics | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Backend action library update | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| PWA AST delete behavior | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (запуск отдельных тестовых файлов)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

Если вы меняете семантику runner, синтаксис pipeline или поведение action-library, обновляйте тесты и заметки README/API в том же PR.

## 📚 Содержимое репозитория

- `docs/autonovelwriter_spec.md`: Product spec для Scratch-like контроллера (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Auto-development самого AutoNovelWriter (task loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: Bilingual (EN/ZH) философия и требования к долгоживущему, возобновляемому auto-development агенту.
- `docs/ORDERING_RATIONALE.md`: Пример rationale для последовательности screenshot-driven шагов.
- `scripts-legacy/`: Старые automation скрипты сохранены для справки и больше не используются AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Пример помощника автоматизации Codex CLI.

Дополнительные заметки для разработчиков:
- Backend tests лежат в `autonovelwriter/backend/tests/`.
- Небольшой тест поведения PWA в `autonovelwriter/pwa/tests/`.
- `i18n/` заполнен локализованными README репозитория, тогда как UI translation dictionaries встроены в `autonovelwriter/pwa/app.js`.

## 🧯 Устранение неполадок

| Симптом | Что проверить |
|---|---|
| `tmux not found in PATH` | Установить tmux или запускать backend и static servers вручную. |
| `conda not found in PATH` при использовании скриптов `--env` | Установить Miniconda/Anaconda или пропустить conda и использовать ручную установку `pip`. |
| PWA не может подключиться к backend | Проверить backend адрес/порт и WebSocket endpoint `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` возвращает gated/disabled | Убедиться, что установлены и `settings.agent.enabled=true`, и `settings.agent.sdk="codex"`, и env `AUTONOVELWRITER_ENABLE_CODEX=1`. |
| Runner останавливается после изменения скрипта | Нормальное поведение: cursor invalidates при mismatch хэша pipeline script и требует рестарта. |
| Статическая PWA на `:5173` работает, но API calls падают | Убедиться, что backend запущен на `:8787` (или обновить target settings в app/backend). |

## 🗺️ Roadmap

- Завершить и стабилизировать оставшиеся пункты auto-dev queue (см. progress block выше).
- Расширять и синхронизировать локализованные README в репозитории в `i18n/`.
- Увеличивать покрытие автотестами по edge cases runner и взаимодействию PWA.
- Продолжать улучшение Action Library и workflows task/action iteration.

## 🤝 Как внести вклад

Пожелания и изменения приветствуются.

Практические рекомендации для этого репозитория:
- Начинайте с `docs/autonovelwriter_spec.md` и `docs/auto-development-guide.md`.
- Keep runtime mutations under `autonovelwriter/runtime/` (contents are gitignored), not tracked files.
- Предпочитайте инкрементальные PR с воспроизводимыми командами run/test.
- При изменении семантики pipeline или контрактов API обновляйте README и связанные тесты одновременно.

Примечание: dedicated `CONTRIBUTING.md` на корне на момент этого черновика не найден.

---

## 📄 Лицензия

Файл/статус лицензии в корне репозитория в этом черновике явно не объявлен.

Примечание по предположению:
- Если вы планируете явное открытое распространение и лицензирование, добавьте top-level `LICENSE` и обновите этот раздел.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
