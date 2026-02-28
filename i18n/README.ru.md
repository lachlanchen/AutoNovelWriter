[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>Scratch-подобная PWA и backend на Tornado для управления автоматизированным конвейером написания романов (и разработки приложений).</strong></p>
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

В этом репозитории также используется `AutoAppDev/` как submodule (повторно используемые скрипты авторазработки).

> [!TIP]
> `README.md` — каноническая база. Локализованные версии лежат в `i18n/` и подключаются через единственную строку выбора языка в начале файла.

| Коротко | Подробности |
|---|---|
| Основной стек | Python + backend Tornado, frontend PWA в браузере |
| Базовый UX | Редактор скриптов и блоков на одной общей канонической source-of-truth |
| Режим выполнения | Возобновляемый runner с сохранением курсора и результатов действий |
| Realtime | WebSocket endpoint по адресу `/ws` |
| Изменяемая runtime root | `autonovelwriter/runtime/` (игнорируется Git) |

| Значения по умолчанию | Значение |
|---|---|
| PWA URL | `http://127.0.0.1:8787/` |
| WebSocket URL | `ws://127.0.0.1:8787/ws` |
| Backend host/port | `127.0.0.1:8787` |

## Содержание

- [Обзор](#-обзор)
- [Возможности](#-возможности)
- [Архитектура с первого взгляда](#-архитектура-с-первого-взгляда)
- [Структура проекта](#️-структура-проекта)
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
- [Настройки романа (отдельно от языка UI)](#️-настройки-романа-отдельно-от-языка-ui)
- [Примеры](#-примеры)
- [Заметки по разработке](#️-заметки-по-разработке)
- [Заметки по тестированию](#-заметки-по-тестированию)
- [Содержимое репозитория](#-содержимое-репозитория)
- [Устранение неполадок](#-устранение-неполадок)
- [Roadmap](#️-roadmap)
- [Как помочь проекту](#-как-помочь-проекту)
- [Support](#-support)
- [Лицензия](#-лицензия)

## 📌 Обзор

AutoNovelWriter предоставляет локальный слой оркестрации для:
- Редактирования канонического pipeline-скрипта (`pipeline.script`) как в текстовом виде, так и через интерфейс блоков.
- Запуска возобновляемого выполнения в backend с сохранением курсора и результатов действий.
- Управления проектами, материалами, выходными файлами, партиями задач и шаблонами действий.
- Отправки live-обновлений через WebSocket (`/ws`) в PWA.

Каноническая изменяемая runtime — `autonovelwriter/runtime/` (содержимое игнорируется Git).

| Область | Назначение |
|---|---|
| Авторинг pipeline | Редактирование канонического скрипта + вложенного UI блоков из одного источника истины |
| Выполнение | Возобновляемый runner с сохраненным курсором и результатами действий |
| Операции с проектами | Проектные материалы, выходы, настройки и активация партий задач |
| Realtime UX | События `/ws` для обновлений статуса, логов, выходов, задач и действий |

## ✨ Возможности

- Scratch-подобный редактор pipeline на основе канонического скрипта + parser/AST.
- API управления runner (`start/pause/resume/stop`) с возобновляемым состоянием.
- Control-flow контейнеры: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Библиотека действий с шаблонами по умолчанию + пользовательские override по модели copy-on-edit.
- Настройки романа на уровне проекта с семантикой наследования.
- Поток генерации/индекса/деталей/активации партий для `FOREACH_TASK`.
- Индексация выходов и endpoint предпросмотра последнего PDF романа.
- Встроенные i18n-словарные файлы для PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Служебные скрипты tmux и возобновляемый драйвер Codex auto-dev.

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
  ├─ resumable runner + журнал коммитов результатов действий
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
├── .gitmodules                     # объявление submodule AutoAppDev
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # main backend entrypoint + API/WS handlers + runner logic
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # backend unit tests
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # логика UI + встроенные i18n dictionaries
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

| Зависимость | Обязательно | Примечание |
|---|---|---|
| Python `3.11+` | Да | Рекомендуемая базовая версия |
| `pip` | Да | Для установки зависимостей backend |
| `tmux` | Нет | Нужен для скрипта запуска с несколькими панелями |
| `conda` | Нет | Опционально, для вспомогательных скриптов |
| `node` | Нет | Опционально для прямого запуска PWA-теста |

## 🚀 Установка

| Путь | Когда использовать | Команда |
|---|---|---|
| Option A | Вы используете conda и хотите конфигурацию из репозитория | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Нужен setup + запуск в одной команде | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Предпочитаете ручное управление pip | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Помощник conda (рекомендуется для этого репозитория)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Затем запустите через tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B: Однокомандный setup + run

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

| Этап | Команда / URL |
|---|---|
| Запуск backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Открыть приложение | `http://127.0.0.1:8787/` |
| WebSocket endpoint | `ws://127.0.0.1:8787/ws` |
| Optional static PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| tmux launcher | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

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

По умолчанию backend также отдает статические assets PWA из `autonovelwriter/pwa/`, поэтому можно открыть:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Опционально: PWA на отдельном static dev-server:

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Откройте PWA по адресу `http://127.0.0.1:5173` и укажите backend (по умолчанию `ws://127.0.0.1:8787/ws`).

tmux (запуск двух панелей + tail логов):

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

Скрипт проекта (`scripts/auto-autonovelwriter-development.sh`) также может запускать tmux-сессию в ходе auto-dev.

### Типовой workflow

1. Запустите backend (или helper через tmux).
2. Откройте PWA.
3. Отредактируйте pipeline в Blocks и/или textarea скрипта.
4. Проверьте/сохраните pipeline.
5. Запустите runner и отслеживайте логи, статус и события.
6. Просмотрите сгенерированные outputs/task batches.

## ⚙️ Конфигурация

### Переменные окружения

Используйте `autonovelwriter/backend/.env.example` как шаблон. Ключевые переменные backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (по умолчанию `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (по умолчанию `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (по умолчанию `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (по умолчанию CLI: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (по умолчанию: родительский каталог корня репозитория)
- `AUTONOVELWRITER_WRITER_SCRIPT` (по умолчанию `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (по умолчанию `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (по умолчанию `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (gate выполнения агента, по умолчанию отключен)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (опциональный override пути к бинарнику codex)

### Параметры CLI скриптов

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

| Группа API | Основные endpoints |
|---|---|
| Health & settings | `/api/health`, `/api/settings` |
| Проекты и проектные настройки | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tasks | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Actions | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Outputs & preview романа | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| Realtime | `/ws` |

### HTTP API

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (project overrides with inherit semantics: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (записывает `runtime/tasks/tasks.json` и project-level `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (copy-on-edit update для defaults)
- Pipeline (канонический скрипт + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (только preview): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (читает и парсит `../scripts/auto-xiyouzhiyuan-writer.sh` как reference)
  - `POST /api/pipeline/reference_writer/load` (загружает распарсенный результат в runtime pipeline; source script не изменяется)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (inline PDF stream для viewer)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (запускает `codex --version` только при включении + env gate)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Пути runtime

Все изменяемые state и IO хранятся под `autonovelwriter/runtime/`:

| Путь | Назначение |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (place `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend пишет chat-сообщения) |
| `autonovelwriter/runtime/state/` | сохраненные JSON-состояния (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | SQLite-«зеркало» чата (в дополнение к chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | сохраненный pointer активного проекта |
| `autonovelwriter/runtime/tasks/` | файлы очереди задач |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | сгенерированные task batches (например из `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | логи |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | материалы проекта (inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | выходы проекта (черновики/экспорты) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | проектные overrides настроек написания романа (например, язык романа) |
| `autonovelwriter/runtime/actions/defaults/` | seeded шаблоны Action Library (трактуются как immutable) |
| `autonovelwriter/runtime/actions/user/` | пользовательские шаблоны Action Library (создаваемые через copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | mirrored chat inputs для ingestion writer pipeline |

## 🧩 Pipeline Script (Канонический артефакт)

Pipeline хранится как отформатированный скрипт на диске:
- `autonovelwriter/runtime/state/pipeline.script`

Backend отдает его через `GET/POST /api/pipeline` как:
- `script` (канонический shell-подобный формат с строками `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (derived, flattened list для простого render blocks)
- `pipeline_ast` (derived, nested структура для loops + UI отступов)

Runner исполняет шаги, полученные тем же parser/AST v2, поэтому то, что видит PWA, совпадает с тем, что выполняется.

Runner control flow поддерживает v2 контейнеры:
- `ROUND <n>` повторяет своих children `n` раз.
- `FOREACH_TASK` выполняет children по одной на каждую задачу в active task list (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` выполняет children по одной на каждый entry из `payload.actions` текущей задачи (предполагается вложенность под `FOREACH_TASK`).

Возобновляемость:
- Runner сохраняет resumable execution cursor в `autonovelwriter/runtime/state/runner_state.json`.
- Курсор продвигается только после успешного завершения блока (чтобы рестарт не пропускал незавершенную работу).
- Если канонический pipeline script меняется (hash mismatch), runner останавливается и требует рестарт (cursor invalidated).
- Runner сохраняет `ActionResult` по шагам в `autonovelwriter/runtime/state/action_results.jsonl` и использует детерминированный `exec_id` для шага, чтобы не дублировать уже зафиксированные результаты при рестарте.
- Во время `FOREACH_ACTION` в ActionResults попадают `action_index`, `action_id_ref` и `action_key`, а переменные включают `prev`, а также явные scope `task.prev` и `action.prev`.

Pipeline script v2 поддерживает вложенность:
- `LOOP <n>` вводит loop block.
- `ROUND <n>` вводит round container block.
- `FOREACH_TASK` вводит per-task container block.
- `FOREACH_ACTION` вводит per-action container block (runner итерирует `task.payload.actions`).
- `IF <expr>` вводит условный container block (parse/render; пока runner выполняет только then-ветку).
- `ELSE` вводит optional alternate branch под `IF`.
- Дочерние элементы отступают на 2 пробела на уровень.

Валидация (без сохранения):
- `POST /api/pipeline/validate` возвращает canonical preview вместе с `pipeline_ast`, warnings и errors.

PWA показывает скрипт в textarea (source of truth) и рендерит вложенные блоки из `pipeline_ast`.
Если backend validate endpoint недоступен, PWA переключается на local parser, который поддерживает те же v2-глаголы (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Примечания по Blocks UI:
- Значения повторов `LOOP` и `ROUND` редактируются прямо в списке блоков; корректные изменения сразу обновляют каноническую script textarea.
- Панель Blocks может вставлять `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` и `IF` без ручного редактирования скрипта (оборачивает выделенный блок или добавляет валидный непустой контейнер).
- Блоки можно удалять с canvas (кнопка Delete у блока; клавиша `Delete`, когда блок выделен). При удалении контейнеров дети поднимаются вверх, и редактор удерживает контейнeры непустыми, чтобы не создавать невалидные скрипты.
- Блоки `IF` остаются структурно валидными: `ELSE` не может существовать вне `IF`, а then-ветка всегда остается непустой.
- `STEP` блоки показывают управление Action Library: селектор действия, `Customize` (копирует default action в user action и переключает), `Edit` (модальное окно Action Editor для `name/tool/prompt/script`).

## 📝 Runner outputs (черновой stub)

Когда в pipeline есть блок `STEP write`, backend runner создаст черновой draft-файл в:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Backend также отсылает:
- WS event `output_created` с `path` и `project_rel_path`
- Строку `log`: `[output] created: ...`

В PWA есть минимальная Outputs panel, которая перечисляет файлы через `GET /api/outputs/index` и обновляется по `output_created`.

## 📦 Runner tasks (batch stub)

Когда в pipeline есть блок `STEP meta_tasks_generate`, backend runner создаст черновой task batch в:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Backend также отсылает:
- WS event `tasks_batch_created` с `batch_dir`, `tasks_jsonl` и `task_count`
- Строку `log`: `[tasks] created batch: ...`

В PWA есть минимальная панель Task Batches, которая выводит batches через `GET /api/tasks/batches/index` и обновляется по `tasks_batch_created`.
Она также показывает детали batch (`GET /api/tasks/batches/<batch_id>`) и активирует batch как текущий список задач для `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Настройки агента / Codex Gate

Панель Settings в PWA хранит настройки агента через `/api/settings` в `autonovelwriter/runtime/state/settings.json`.

Для безопасности backend не запускает CLI `codex`, пока не соблюдены оба условия:
- `settings.agent.enabled=true` и `settings.agent.sdk="codex"`
- в env выставлен `AUTONOVELWRITER_ENABLE_CODEX=1`

Никогда не коммитьте секреты. Используйте `autonovelwriter/backend/.env.example` как шаблон локальных env vars.

## 🌐 PWA I18N (язык UI)

У PWA есть легковесная встроенная система i18n.

- Принудительно указать язык UI: добавить `?lang=<code>` в URL PWA (например, `?lang=ja`).
- Устанавливается в localStorage браузера как `anw_lang`.
- Поддерживаемые UI-языки: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Локализованные README репозитория в `i18n/` и связаны в единственной строке выбора языка сверху.

| Файлы README локали (`i18n/`) | Статус |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Present |

## 🖋️ Настройки романа (отдельно от языка UI)

Параметры написания романа хранятся в backend-настройках под `settings.novel.*` в:
- `autonovelwriter/runtime/state/settings.json`

Они намеренно **отделены** от языка интерфейса PWA (`?lang=` / `anw_lang`).

Project-level overrides лежат в:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Текущие глобальные поля (редактируются в Settings modal в PWA):
- `settings.novel.language` (BCP-47-like коды вроде `en`, `ja`, `zh-Hans` и т.д.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Текущие project-level override fields (empty/unset = inherit global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Примеры

### Минимальный локальный запуск

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### tmux запуск без auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Запуск backend тестов напрямую

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Прямой запуск файла теста PWA логики

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

`scripts/auto-autonovelwriter-development.sh` выполняет резюмируемый цикл Codex по tasks из `references/autonovelwriter_dev/` и будет commit/push после каждой стадии (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Полезные команды:
- Остановиться после текущей задачи: `touch references/autonovelwriter_dev/STOP`
- Сбросить state tracking (очередь сохраняется): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Запустить новую сессию Codex: `scripts/auto-autonovelwriter-development.sh --new-session`
- Безопасная практика: работайте в чистой branch/worktree и смотрите `references/autonovelwriter_dev/state.tsv` перед рестартом.

### Операционные предположения

- Эта README предполагает локальную разработку на Linux/macOS с `bash` и Python 3.11+.
- Runtime-состояние внутри `autonovelwriter/runtime/` изменяемое и ожидаемо untracked.
- Описанное поведение pipeline отражает текущую реализацию в `autonovelwriter/backend/server.py` и `autonovelwriter/pwa/app.js`.

## 🧪 Заметки по тестированию

В репозитории на момент написания нет top-level оркестратора `Makefile`/`tox`/`npm test`.

Текущие практические точки входа в тесты:

| Область | Точка входа |
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

Если вы меняете runner-семантику, синтаксис pipeline или поведение action-library, обновляйте тесты и notes по README/API в одном change.

## 📚 Содержимое репозитория

- `docs/autonovelwriter_spec.md`: product spec для Scratch-like controller (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: автоматическая разработка самого AutoNovelWriter (task loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: двуязычный (EN/ZH) philosophy и требования к долгоживущему резюмируемому auto-dev agent.
- `docs/ORDERING_RATIONALE.md`: пример rationale для последовательности screenshot-driven шагов.
- `scripts-legacy/`: старые скрипты автоматизации, сохраненные для справки, не используются AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: пример скриптового automation helper.

Дополнительные заметки:
- Backend tests в `autonovelwriter/backend/tests/`.
- Небольшой тест поведения PWA в `autonovelwriter/pwa/tests/`.
- `i18n/` заполнен локализованными README репозитория, тогда как UI dictionaries хранятся встроенно в `autonovelwriter/pwa/app.js`.

## 🧯 Устранение неполадок

| Симптом | Что проверить |
|---|---|
| `tmux not found in PATH` | Установите tmux или запускайте backend/static-сервер вручную. |
| `conda not found in PATH` при использовании `--env` scripts | Установите Miniconda/Anaconda, либо пропустите conda и используйте manual `pip` install. |
| PWA не подключается к backend | Проверьте backend address/port и WebSocket endpoint `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` возвращает gated/disabled | Убедитесь, что `settings.agent.enabled=true`, `settings.agent.sdk="codex"` и `AUTONOVELWRITER_ENABLE_CODEX=1` в env. |
| Pipeline runner останавливается после правки скрипта | Это ожидаемо; курсор инвалидируется при несоответствии hash скрипта и требует перезапуска. |
| Static PWA на `:5173` работает, но API fails | Убедитесь, что backend запущен на `:8787` (или корректно обновите target settings для app/backend). |

## 🗺️ Roadmap

- Завершить и стабилизировать оставшиеся элементы очереди auto-dev (см. generated progress выше).
- Расширять и синхронизировать i18n README variants в `i18n/`.
- Расширять автоматическое покрытие runner edge cases и PWA interactions.
- Продолжать улучшать Action Library и рабочие процессы task/action итерации.

## 🤝 Как помочь проекту

Вклад приветствуется.

Практические рекомендации:
- Начинайте с `docs/autonovelwriter_spec.md` и `docs/auto-development-guide.md`.
- Храните mutations runtime в `autonovelwriter/runtime/` (содержимое gitignored), а не в tracked файлах.
- Предпочитайте небольшие incremental PR с reproducible commands run/test.
- При изменениях pipeline semantics или API contracts обновляйте README и соответствующие тесты вместе.

Note: в текущем черновике отдельный `CONTRIBUTING.md` в корне не найден.

## ❤️ Support

| Donate | PayPal | Stripe |
|---|---|---|
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=ko-fi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 Лицензия

Статус лицензии/файл `LICENSE` в корне репозитория в текущем черновике явно не указан.

Примечание:
- Если планируется явно открытое распространение проекта, добавьте top-level файл `LICENSE` и обновите этот раздел.
