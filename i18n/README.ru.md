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

Scratch-подобная PWA + backend на Tornado для управления автоматизированным конвейером написания романов (и разработки приложений).

Этот репозиторий также подключает `AutoAppDev/` как submodule (переиспользуемые скрипты авторазработки).

## Обзор

AutoNovelWriter предоставляет локальный оркестрационный слой для:
- Редактирования канонического скрипта конвейера (`pipeline.script`) и через исходный текст, и через блочный UI.
- Запуска возобновляемого backend-исполнения с сохранением курсора и результатов действий.
- Управления проектами, материалами, выходами, пакетами задач и шаблонами действий.
- Потоковой передачи live-обновлений через WebSocket (`/ws`) в PWA.

Канонический изменяемый runtime: `autonovelwriter/runtime/` (игнорируется git).

| Область | Что делает |
|---|---|
| Авторинг конвейера | Редактирование канонического скрипта + вложенного блочного UI из одного общего source of truth |
| Исполнение | Возобновляемый runner с сохранением курсора и результатов действий |
| Операции проекта | Материалы, выходы, настройки и активация пакетов задач в рамках проекта |
| UX в реальном времени | События `/ws` для обновлений статуса/логов/выходов/задач/действий |

## Возможности

- Scratch-подобный редактор конвейера на основе канонического скрипта + parser/AST.
- API управления runner (`start/pause/resume/stop`) с возобновляемым состоянием.
- Контейнеры управления потоком: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Action Library с шаблонами по умолчанию + пользовательскими override по схеме copy-on-edit.
- Переопределения настроек романа на уровне проекта с семантикой наследования.
- Поток генерации/индексации/деталей/активации пакетов задач для `FOREACH_TASK`.
- Индексация выходов и endpoint предпросмотра последнего PDF романа.
- Встроенные словари i18n для PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Вспомогательные скрипты tmux и возобновляемый Codex auto-dev driver.

## 🗂️ Структура проекта

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # объявление submodule AutoAppDev
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # основной entrypoint backend + API/WS handlers + логика runner
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # unit-тесты backend
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # логика UI + встроенные словари i18n
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # изменяемое состояние/IO (игнорируется git)
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
├── i18n/                          # присутствует (пока без файлов)
└── AutoAppDev/                    # связанный companion-проект
```

## ✅ Предварительные требования

| Dependency | Обязательно | Примечания |
|---|---|---|
| Python `3.11+` | Да | Рекомендуемая базовая версия |
| `pip` | Да | Установка зависимостей backend |
| `tmux` | Нет | Нужен для скрипта запуска с несколькими панелями |
| `conda` | Нет | Необязательные вспомогательные скрипты |
| `node` | Нет | Необязательно для прямого запуска тестового файла PWA |

## ⚙️ Установка

### Вариант A: helper для Conda (рекомендуется для этого репозитория)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Затем запуск через tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Вариант B: одношаговая настройка + запуск

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Вариант C: ручная установка через pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

## 🚀 Использование

## Dev Run (Backend + PWA)

Backend (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

Backend также по умолчанию раздает статические ресурсы PWA из `autonovelwriter/pwa/`, поэтому можно открыть:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Опционально: PWA (отдельный static dev server):
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

Откройте PWA по адресу `http://127.0.0.1:5173` и укажите backend (по умолчанию `ws://127.0.0.1:8787/ws`).

tmux (запуск обеих панелей + tail логов):
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Helper для Conda env:
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Driver-скрипт репозитория (`scripts/auto-autonovelwriter-development.sh`) также может запускать tmux-сессию во время auto-dev.

### Типичный workflow

1. Запустите backend (или helper через tmux).
2. Откройте PWA.
3. Редактируйте pipeline через Blocks и/или textarea скрипта.
4. Проверьте/сохраните pipeline.
5. Запустите runner и отслеживайте логи/статус/события.
6. Проверьте сгенерированные выходы/пакеты задач.

## 🧠 Пути runtime

Все изменяемое состояние и IO находятся в `autonovelwriter/runtime/` (игнорируется git):

| Path | Назначение |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (помещайте `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend записывает chat-сообщения) |
| `autonovelwriter/runtime/state/` | сохраненное JSON-состояние (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite-зеркало чата (дополнительно к chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | сохраненный указатель «активного проекта» |
| `autonovelwriter/runtime/tasks/` | файлы очереди задач |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | сгенерированные пакеты задач (например, из `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | логи |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | материалы проекта (входные данные) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | выходы проекта (черновики/экспорты) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | переопределения настроек написания романа на уровне проекта (например, язык романа) |
| `autonovelwriter/runtime/actions/defaults/` | шаблоны Action Library по умолчанию (считаются неизменяемыми) |
| `autonovelwriter/runtime/actions/user/` | пользовательские шаблоны Action Library (создаются через copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | зеркалируемые входы чата для ingestion в writer pipeline |

## 🧩 Pipeline Script (канонический артефакт)

Pipeline представлен на диске как форматированный скрипт:
- `autonovelwriter/runtime/state/pipeline.script`

Backend отдает его через `GET/POST /api/pipeline` как:
- `script` (канонический shell-подобный формат с строками `STEP <type>` / `DISABLED <type>`)
- JSON `pipeline` (производный, уплощенный список для простого рендера блоков)
- `pipeline_ast` (производная вложенная структура для UI циклов + отступов)

Runner исполняет шаги, полученные из того же parser/AST v2, поэтому отображение в PWA совпадает с исполняемым.
Управление потоком в runner поддерживает контейнеры v2:
- `ROUND <n>` повторяет своих потомков `n` раз.
- `FOREACH_TASK` запускает потомков один раз на каждую задачу в активном списке задач (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` запускает потомков один раз на каждый элемент в списке `payload.actions` текущей задачи (предполагается вложение под `FOREACH_TASK`).

Возобновляемость:
- Runner сохраняет возобновляемый курсор исполнения в `autonovelwriter/runtime/state/runner_state.json`.
- Курсор продвигается только после успешного завершения блока (чтобы перезапуск не пропускал незавершенную работу).
- Если канонический скрипт pipeline изменился (несовпадение hash), runner останавливается и требует перезапуска (курсор инвалидируется).
- Runner сохраняет записи `ActionResult` по шагам в `autonovelwriter/runtime/state/action_results.jsonl` и использует детерминированный `exec_id` на шаг, чтобы не дублировать уже зафиксированные результаты при перезапуске.
  - При запуске внутри `FOREACH_ACTION` в ActionResults включаются `action_index`, `action_id_ref` и `action_key`, а vars содержат `prev` плюс явные области `task.prev` и `action.prev`.

Pipeline script v2 поддерживает вложенность:
- `LOOP <n>` вводит блок цикла
- `ROUND <n>` вводит контейнер «раундов»
- `FOREACH_TASK` вводит контейнер «на каждую задачу»
- `FOREACH_ACTION` вводит контейнер «на каждое действие» (runner итерирует `task.payload.actions`)
- `IF <expr>` вводит контейнер условия (parse/render; в runner пока выполняется только then-ветка)
- `ELSE` вводит опциональную альтернативную ветку под блоком `IF`
- дочерние элементы имеют отступ 2 пробела на уровень

Валидация (без сохранения):
- `POST /api/pipeline/validate` возвращает канонический preview плюс `pipeline_ast`, warnings и errors.

PWA показывает скрипт в textarea (source of truth) и рендерит вложенные блоки из `pipeline_ast`.
Если endpoint валидации backend недоступен, PWA откатывается на локальный parser, который поддерживает те же глаголы v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Примечания по Blocks UI:
- Счетчики повторов `LOOP` и `ROUND` редактируются прямо в списке блоков; корректные правки сразу обновляют textarea канонического скрипта.
- Toolbar в Blocks может вставлять контейнеры `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` и `IF` без ручного редактирования скрипта (оборачивает выбранный блок или добавляет корректный непустой контейнер).
- Блоки можно удалять с canvas (кнопка Delete у блока; клавиша `Delete`, когда блок выбран). При удалении контейнера потомки поднимаются на уровень выше, а редактор сохраняет непустые контейнеры, чтобы избежать невалидных скриптов.
- Блоки `IF` в редакторе поддерживаются структурно валидными: `ELSE` не может сохраниться вне `IF`, а then-ветка остается непустой.
- Блоки `STEP` показывают элементы управления Action Library: селектор действия, `Customize` (копирует default action в user action и переключает на него) и `Edit` (модальное окно Action Editor для `name/tool/prompt/script`).

## 🔧 Конфигурация

### Переменные окружения

Используйте `autonovelwriter/backend/.env.example` как шаблон. Ключевые переменные backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (по умолчанию `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (по умолчанию `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (по умолчанию `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (по умолчанию `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (по умолчанию: родитель директории корня репозитория)
- `AUTONOVELWRITER_WRITER_SCRIPT` (по умолчанию `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (по умолчанию `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (по умолчанию `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (gate выполнения агента, по умолчанию отключен)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (опциональное переопределение бинарника codex)

## 🌐 Ключевые Backend API

### HTTP API

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (активный проект): `GET/POST /api/projects/settings` (переопределения на уровне проекта с семантикой наследования: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (активный проект): `GET /api/materials/index`
- Outputs index (активный проект): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (опционально: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (записывает `runtime/tasks/tasks.json` и проектный `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (обновление defaults по схеме copy-on-edit)
- Pipeline (канонический скрипт + производный JSON): `GET/POST /api/pipeline`
- Pipeline validate (только preview): `POST /api/pipeline/validate`
- Preview/load reference writer pipeline:
  - `GET /api/pipeline/reference_writer` (читает и парсит `../scripts/auto-xiyouzhiyuan-writer.sh` как reference)
  - `POST /api/pipeline/reference_writer/load` (загружает результат парсинга в runtime pipeline; исходный скрипт никогда не редактируется)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Последний PDF романа:
  - `GET /api/novel/latest` (метаданные)
  - `GET /api/novel/latest/pdf` (inline PDF stream для viewer)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (запускает `codex --version` только при включении + env gate)

### WebSocket

- Endpoint: `/ws`
- События broadcast: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Выходы runner (черновая заглушка)

Когда pipeline содержит блок `STEP write`, backend runner создаст черновой файл в:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Backend также отправляет:
- WS-событие `output_created` с `path` и `project_rel_path`
- строку `log` `[output] created: ...`

PWA включает минимальную панель Outputs, которая выводит файлы через `GET /api/outputs/index` и обновляется по `output_created`.

## 📦 Задачи runner (черновая заглушка пакетов)

Когда pipeline содержит блок `STEP meta_tasks_generate`, backend runner создаст черновой пакет задач в:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Backend отправляет:
- WS-событие `tasks_batch_created` с `batch_dir`, `tasks_jsonl` и `task_count`
- строку `log` `[tasks] created batch: ...`

PWA включает минимальную панель Task Batches, которая выводит пакеты через `GET /api/tasks/batches/index` и обновляется по `tasks_batch_created`.
Она также может показывать детали пакета (`GET /api/tasks/batches/<batch_id>`) и активировать пакет как текущий список задач для `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🤖 Настройки агента / Codex Gate

Панель Settings в PWA сохраняет настройки агента через `/api/settings` в `autonovelwriter/runtime/state/settings.json`.

Для безопасности backend не будет запускать CLI `codex`, если не выполнены оба условия:
- `settings.agent.enabled=true` и `settings.agent.sdk="codex"`
- в окружении установлено `AUTONOVELWRITER_ENABLE_CODEX=1`

Никогда не коммитьте секреты. Используйте `autonovelwriter/backend/.env.example` как шаблон локальных env vars.

## 🌍 PWA I18N (язык интерфейса)

В PWA есть легковесная встроенная система i18n.

- Принудительный язык UI: добавьте `?lang=<code>` к URL PWA (например, `?lang=ja`).
- Сохраняется отдельно для каждого браузера в localStorage: `anw_lang`.
- Поддерживаемые языки UI: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## 📚 Настройки романа (отдельно от языка UI)

Параметры написания романа сохраняются в настройках backend под `settings.novel.*` в:
- `autonovelwriter/runtime/state/settings.json`

Они намеренно **отделены** от языка UI PWA (`?lang=` / `anw_lang`).

Переопределения на уровне проекта хранятся в:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Текущие поля (редактируются в модальном окне Settings в PWA):
- `settings.novel.language` (коды в стиле BCP-47, например `en`, `ja`, `zh-Hans` и т.д.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Текущие поля project-level override (пусто/не задано = наследование глобального):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 Примеры

### Минимальный локальный запуск

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### Запуск tmux без auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Запуск файлов backend-тестов напрямую

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Запуск файла тестов логики PWA напрямую

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

`scripts/auto-autonovelwriter-development.sh` запускает возобновляемый цикл на Codex по задачам из `references/autonovelwriter_dev/` и **будет делать commit/push после каждого этапа** (plan/implement/debug/fix/i18n/summary/update_readme).

Полезные элементы управления:
- Остановиться после текущей задачи: `touch references/autonovelwriter_dev/STOP`
- Сбросить отслеживание состояния (очередь сохраняется): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Начать новую сессию Codex: `scripts/auto-autonovelwriter-development.sh --new-session`
- Безопасная практика: запускайте в чистой branch/worktree и проверяйте `references/autonovelwriter_dev/state.tsv` перед перезапуском.

## 📚 Содержимое

- `docs/autonovelwriter_spec.md`: спецификация продукта для Scratch-подобного контроллера (chat + папочный pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: авторазработка самого приложения AutoNovelWriter (цикл задач: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md`: двуязычная (EN/ZH) философия и требования для долгоживущего возобновляемого агента авторазработки.
- `docs/ORDERING_RATIONALE.md`: пример обоснования порядка для шагов, управляемых скриншотами.
- `scripts-legacy/`: старые скрипты автоматизации, сохраненные для справки, но не используемые AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: пример helper для автоматизации через Codex CLI.

### Дополнительные заметки для разработчиков

- Backend-тесты находятся в `autonovelwriter/backend/tests/`.
- Небольшой тест поведения PWA находится в `autonovelwriter/pwa/tests/`.
- Корневая директория `i18n/` существует, но сейчас пуста; переводы UI сейчас встроены в `autonovelwriter/pwa/app.js`.

## 🧯 Устранение неполадок

- `tmux not found in PATH`:
  - Установите tmux или запускайте backend/static server вручную.
- `conda not found in PATH` при использовании скриптов с `--env`:
  - Установите Miniconda/Anaconda или пропустите conda и используйте ручную установку через `pip`.
- PWA не может подключиться к backend:
  - Проверьте адрес/порт backend и endpoint WebSocket `ws://<host>:<port>/ws`.
- `POST /api/agent/test` возвращает gated/disabled:
  - Убедитесь, что выполнены `settings.agent.enabled=true`, `settings.agent.sdk="codex"` и переменная окружения `AUTONOVELWRITER_ENABLE_CODEX=1`.
- Pipeline runner останавливается после правки скрипта:
  - Это ожидаемое поведение; курсор инвалидируется при несовпадении hash скрипта pipeline и требуется перезапуск.

## 🧭 Дорожная карта

- Завершить и стабилизировать оставшиеся элементы очереди auto-dev (см. сгенерированный блок прогресса выше).
- Расширить внешние ресурсы i18n на уровне репозитория в `i18n/` (сейчас директория присутствует, но пуста).
- Расширить покрытие автоматических тестов для edge-case сценариев runner и взаимодействий PWA.
- Продолжать улучшать Action Library и workflow итераций задач/действий.

## 🤝 Участие в разработке

Контрибьюции приветствуются.

Практические рекомендации для этого репозитория:
- Начинайте с `docs/autonovelwriter_spec.md` и `docs/auto-development-guide.md`.
- Держите изменения runtime в `autonovelwriter/runtime/` (игнорируется git), а не в отслеживаемых файлах.
- Предпочитайте инкрементальные PR с воспроизводимыми командами запуска/тестов.
- Если меняете семантику pipeline или API-контракты, обновляйте README и соответствующие тесты вместе.

Примечание: на момент этого черновика отдельный `CONTRIBUTING.md` в корне репозитория не найден.

## ❤️ Sponsor & Donate

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 Лицензия

Файл/статус лицензии в текущем контексте черновика явно не указан в корне репозитория.

Примечание о допущении:
- Если планируется четко оформить open-source распространение, добавьте файл `LICENSE` в корень и обновите этот раздел соответствующим образом.
