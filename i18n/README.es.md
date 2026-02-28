[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/figs/banner.png" alt="LazyingArt banner" />
</p>

# AutoNovelWriter

Opciones de idioma: **English (this draft)**. El espacio de trabajo i18n existe en `i18n/`; las variantes localizadas de README deben generarse una por una en pasos posteriores.

![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9)
![Frontend](https://img.shields.io/badge/frontend-PWA-10b981)
![Runtime](https://img.shields.io/badge/runtime-local%20state-orange)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)

PWA estilo Scratch + backend Tornado para controlar un pipeline automatizado de escritura de novelas (y desarrollo de apps).

Este repositorio también incluye `AutoAppDev/` como submódulo (scripts reutilizables de desarrollo automático).

## Overview

AutoNovelWriter proporciona una capa local de orquestación para:
- Editar un script de pipeline canónico (`pipeline.script`) tanto desde texto fuente como desde una interfaz de bloques.
- Ejecutar backend reanudable con cursor persistido y resultados de acciones.
- Gestionar proyectos, materiales, salidas, lotes de tareas y plantillas de acciones.
- Transmitir actualizaciones en vivo vía WebSocket (`/ws`) a la PWA.

El runtime mutable canónico es `autonovelwriter/runtime/` (ignorado por git).

| Area | What it does |
|---|---|
| Pipeline authoring | Edit canonical script + nested block UI from one shared source of truth |
| Execution | Resumable runner with persisted cursor and action results |
| Project ops | Project-scoped materials, outputs, settings, and task-batch activation |
| Realtime UX | `/ws` events for status/log/output/task/action updates |

## Features

- Editor de pipeline estilo Scratch respaldado por script canónico + parser/AST.
- APIs de control del runner (`start/pause/resume/stop`) con estado reanudable.
- Contenedores de flujo de control: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Biblioteca de acciones con plantillas predeterminadas + sobrescrituras de usuario al copiar/editar.
- Sobrescrituras de configuración de novela por proyecto con semántica de herencia.
- Flujo de generación/índice/detalle/activación de lotes de tareas para `FOREACH_TASK`.
- Endpoints de indexación de salidas y vista previa del PDF más reciente de la novela.
- Diccionarios i18n integrados en la PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Scripts auxiliares de tmux y un controlador reanudable de auto-desarrollo con Codex.

## 🗂️ Estructura del Proyecto

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

## ✅ Requisitos Previos

| Dependency | Required | Notes |
|---|---|---|
| Python `3.11+` | Yes | Recommended baseline |
| `pip` | Yes | Install backend dependencies |
| `tmux` | No | Needed for multi-pane launcher script |
| `conda` | No | Optional helper scripts |
| `node` | No | Optional for running PWA test file directly |

## ⚙️ Instalación

### Opción A: helper de Conda (recomendado para este repositorio)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Luego ejecuta con tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Opción B: configuración + ejecución en un solo paso

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Opción C: instalación manual con pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

## 🚀 Uso

## Dev Run (Backend + PWA)

Backend (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

El backend también sirve por defecto los recursos estáticos de la PWA desde `autonovelwriter/pwa/`, así que puedes abrir:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Opcional: PWA (servidor estático de desarrollo separado):
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

Abre la PWA en `http://127.0.0.1:5173` y apúntala al backend (por defecto `ws://127.0.0.1:8787/ws`).

tmux (inicia ambos paneles + cola de logs):
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Helper para entorno Conda:
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

El script driver del repositorio (`scripts/auto-autonovelwriter-development.sh`) también puede iniciar una sesión tmux durante el auto-desarrollo.

### Flujo de trabajo típico

1. Inicia el backend (o el helper de tmux).
2. Abre la PWA.
3. Edita el pipeline mediante bloques y/o textarea de script.
4. Valida/guarda el pipeline.
5. Inicia el runner y monitoriza logs/estado/eventos.
6. Revisa las salidas generadas/lotes de tareas.

## 🧠 Rutas de Runtime

Todo el estado mutable y la E/S viven bajo `autonovelwriter/runtime/` (ignorado por git):

| Path | Purpose |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (drop `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend writes chat messages) |
| `autonovelwriter/runtime/state/` | persisted JSON state (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite chat mirror (in addition to chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | persisted “active project” pointer |
| `autonovelwriter/runtime/tasks/` | task queue files |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | generated task batches (e.g. from `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | project materials (inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | project outputs (drafts/exports) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | per-project novel-writing settings overrides (e.g. novel language) |
| `autonovelwriter/runtime/actions/defaults/` | seeded default Action Library templates (treated as immutable) |
| `autonovelwriter/runtime/actions/user/` | user Action Library templates (created via copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | mirrored chat inputs for writer pipeline ingestion |

## 🧩 Script de Pipeline (Artefacto Canónico)

El pipeline se representa como un script formateado en disco:
- `autonovelwriter/runtime/state/pipeline.script`

El backend lo sirve vía `GET/POST /api/pipeline` como:
- `script` (canónico, líneas tipo shell-ish `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (derivado, lista aplanada para renderizado simple de bloques)
- `pipeline_ast` (derivado, estructura anidada usada para bucles + UI por indentación)

El runner ejecuta pasos derivados del mismo parser/AST v2, así que lo que muestra la PWA coincide con lo que se ejecuta.
El flujo de control del runner soporta contenedores v2:
- `ROUND <n>` repite sus hijos `n` veces.
- `FOREACH_TASK` ejecuta sus hijos una vez por tarea en la lista de tareas activa (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` ejecuta sus hijos una vez por entrada en la lista `payload.actions` de la tarea actual (pensado para anidarse bajo `FOREACH_TASK`).

Reanudabilidad:
- El runner persiste un cursor de ejecución reanudable en `autonovelwriter/runtime/state/runner_state.json`.
- El cursor solo avanza después de que un bloque se complete correctamente (así los reinicios no omiten trabajo sin terminar).
- Si el script canónico del pipeline cambia (hash mismatch), el runner se detiene y requiere reinicio (cursor invalidado).
- El runner persiste registros `ActionResult` por paso en `autonovelwriter/runtime/state/action_results.jsonl` y usa un `exec_id` determinista por paso para evitar duplicar resultados ya confirmados al reiniciar.
  - Al ejecutar dentro de `FOREACH_ACTION`, los ActionResults incluyen `action_index`, `action_id_ref` y `action_key`, y las variables incluyen `prev` más ámbitos explícitos `task.prev` vs `action.prev`.

La v2 del script de pipeline soporta anidamiento:
- `LOOP <n>` introduce un bloque de bucle
- `ROUND <n>` introduce un bloque contenedor de “rondas”
- `FOREACH_TASK` introduce un bloque contenedor por tarea
- `FOREACH_ACTION` introduce un bloque contenedor por acción (el runner itera `task.payload.actions`)
- `IF <expr>` introduce un bloque contenedor condicional (parse/render; por ahora el runner ejecuta solo la rama then)
- `ELSE` introduce una rama alternativa opcional bajo un bloque `IF`
- los hijos se indentan con 2 espacios por nivel

Validación (sin persistencia):
- `POST /api/pipeline/validate` devuelve una vista previa canónica más `pipeline_ast`, advertencias y errores.

La PWA muestra el script en un textarea (fuente de verdad) y renderiza bloques anidados desde `pipeline_ast`.
Si el endpoint de validación del backend no está disponible, la PWA usa un parser local de respaldo que soporta los mismos verbos v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Notas de la UI de bloques:
- Los contadores de repetición de `LOOP` y `ROUND` se editan en línea en la lista de bloques; las ediciones válidas actualizan de inmediato el textarea del script canónico.
- La barra de herramientas de Blocks puede insertar contenedores `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` e `IF` sin editar el script manualmente (envuelve el bloque seleccionado o agrega un contenedor válido no vacío).
- Los bloques se pueden eliminar del lienzo (botón Delete por bloque; tecla `Delete` cuando un bloque está seleccionado). Al eliminar contenedores, los hijos se integran en el nivel superior, y el editor mantiene los contenedores no vacíos para evitar scripts inválidos.
- Los bloques `IF` se mantienen estructuralmente válidos en el editor: `ELSE` no puede persistir fuera de un `IF`, y la rama then permanece no vacía.
- Los bloques `STEP` exponen controles de Action Library: selector de acción, `Customize` (copia una acción por defecto a una acción de usuario y cambia a ella) y `Edit` (modal Action Editor para `name/tool/prompt/script`).

## 🔧 Configuración

### Variables de entorno

Usa `autonovelwriter/backend/.env.example` como plantilla. Variables clave usadas por backend/runtime:

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

## 🌐 APIs Backend Clave

### APIs HTTP

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (per-project overrides with inherit semantics: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (writes `runtime/tasks/tasks.json` and project `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (copy-on-edit update for defaults)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (reads and parses `../scripts/auto-xiyouzhiyuan-writer.sh` as reference)
  - `POST /api/pipeline/reference_writer/load` (loads parsed result into runtime pipeline; never edits source script)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (inline PDF stream for viewer)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (runs `codex --version` only when enabled + env gate)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Salidas del Runner (Borrador Stub)

Cuando el pipeline contiene un bloque `STEP write`, el runner del backend creará un archivo de borrador stub en:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

El backend también emite:
- evento WS `output_created` con `path` y `project_rel_path`
- una línea `log` `[output] created: ...`

La PWA incluye un panel mínimo de Outputs que lista archivos vía `GET /api/outputs/index` y se actualiza en `output_created`.

## 📦 Tareas del Runner (Batch Stub)

Cuando el pipeline contiene un bloque `STEP meta_tasks_generate`, el runner del backend creará un lote de tareas stub en:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

El backend emite:
- evento WS `tasks_batch_created` con `batch_dir`, `tasks_jsonl` y `task_count`
- una línea `log` `[tasks] created batch: ...`

La PWA incluye un panel mínimo de Task Batches que lista lotes vía `GET /api/tasks/batches/index` y se actualiza en `tasks_batch_created`.
También puede mostrar detalles del lote (`GET /api/tasks/batches/<batch_id>`) y activar un lote para convertirlo en la lista de tareas actual de `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🤖 Configuración del Agente / Puerta de Codex

El panel Settings de la PWA persiste la configuración del agente vía `/api/settings` en `autonovelwriter/runtime/state/settings.json`.

Por seguridad, el backend no iniciará el CLI `codex` salvo que se cumplan ambas condiciones:
- `settings.agent.enabled=true` y `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` esté definido en el entorno

Nunca hagas commit de secretos. Usa `autonovelwriter/backend/.env.example` como plantilla para variables de entorno locales.

## 🌍 PWA I18N (Idioma de UI)

La PWA tiene un sistema i18n integrado y ligero.

- Forzar idioma de UI: agrega `?lang=<code>` a la URL de la PWA (por ejemplo `?lang=ja`).
- Persistencia por navegador en localStorage: `anw_lang`.
- Idiomas de UI soportados: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## 📚 Configuración de Novela (Separada del Idioma de UI)

Las preferencias de escritura de novela se almacenan en la configuración del backend bajo `settings.novel.*` en:
- `autonovelwriter/runtime/state/settings.json`

Esto se mantiene intencionalmente **separado** del idioma de UI de la PWA (`?lang=` / `anw_lang`).

Las sobrescrituras por proyecto se almacenan en:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Campos actuales (editables en el modal Settings de la PWA):
- `settings.novel.language` (códigos tipo BCP-47 como `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Campos actuales de sobrescritura a nivel proyecto (vacío/sin definir = hereda global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 Ejemplos

### Ejecución local mínima

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### Ejecución con tmux sin auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Ejecutar archivos de prueba del backend directamente

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Ejecutar archivo de prueba lógica de PWA directamente

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Ejemplo de helper de automatización por script

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Notas de Desarrollo

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

`scripts/auto-autonovelwriter-development.sh` ejecuta un bucle reanudable guiado por Codex sobre tareas en `references/autonovelwriter_dev/` y **hará commit/push tras cada etapa** (plan/implement/debug/fix/i18n/summary/update_readme).

Controles útiles:
- Detener tras la tarea actual: `touch references/autonovelwriter_dev/STOP`
- Reiniciar seguimiento de estado (mantiene la cola): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Iniciar una sesión nueva de Codex: `scripts/auto-autonovelwriter-development.sh --new-session`
- Práctica segura: ejecutar en una rama/worktree limpia y monitorizar `references/autonovelwriter_dev/state.tsv` antes de reiniciar.

## 📚 Contenido

- `docs/autonovelwriter_spec.md`: Especificación del producto para el controlador estilo Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Auto-desarrolla la app AutoNovelWriter (bucle de tareas: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md`: Filosofía y requisitos bilingües (EN/ZH) para un agente de auto-desarrollo reanudable y de larga duración.
- `docs/ORDERING_RATIONALE.md`: Ejemplo de razonamiento para secuenciar pasos guiados por capturas de pantalla.
- `scripts-legacy/`: scripts de automatización antiguos, conservados como referencia pero no usados por AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Ejemplo de helper de automatización con Codex CLI.

### Notas adicionales para desarrolladores

- Las pruebas backend viven en `autonovelwriter/backend/tests/`.
- Una prueba pequeña de comportamiento de PWA vive en `autonovelwriter/pwa/tests/`.
- El directorio raíz `i18n/` existe pero actualmente está vacío; las traducciones de UI están actualmente embebidas en `autonovelwriter/pwa/app.js`.

## 🧯 Solución de Problemas

- `tmux not found in PATH`:
  - Instala tmux o ejecuta backend/servidores estáticos manualmente.
- `conda not found in PATH` al usar scripts con `--env`:
  - Instala Miniconda/Anaconda, o salta conda y usa instalación manual con `pip`.
- La PWA no puede conectarse al backend:
  - Verifica dirección/puerto del backend y endpoint WebSocket `ws://<host>:<port>/ws`.
- `POST /api/agent/test` devuelve gated/disabled:
  - Asegura `settings.agent.enabled=true`, `settings.agent.sdk="codex"` y entorno `AUTONOVELWRITER_ENABLE_CODEX=1`.
- El runner del pipeline se detiene tras editar el script:
  - Comportamiento esperado; el cursor se invalida por hash mismatch del script del pipeline y requiere reinicio.

## 🧭 Hoja de Ruta

- Completar y estabilizar los elementos restantes de la cola auto-dev (ver bloque de progreso generado arriba).
- Ampliar los recursos i18n externalizados a nivel repositorio en `i18n/` (actualmente existe pero vacío).
- Ampliar la cobertura de pruebas automatizadas para casos límite del runner e interacciones de la PWA.
- Seguir mejorando la Action Library y los flujos de iteración de tareas/acciones.

## 🤝 Contribuir

Las contribuciones son bienvenidas.

Guía pragmática para este repositorio:
- Empieza por `docs/autonovelwriter_spec.md` y `docs/auto-development-guide.md`.
- Mantén las mutaciones de runtime bajo `autonovelwriter/runtime/` (ignorado por git), no en archivos rastreados.
- Prefiere PRs incrementales con comandos de ejecución/prueba reproducibles.
- Si cambias semánticas del pipeline o contratos de API, actualiza README y pruebas relacionadas de forma conjunta.

Nota: no se encontró un `CONTRIBUTING.md` dedicado en la raíz del repositorio en el momento de este borrador.

## ❤️ Sponsor & Donate

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 Licencia

El archivo/estado de licencia no está declarado explícitamente en la raíz del repositorio en este contexto de borrador.

Nota de suposición:
- Si quieres dejar clara la redistribución open-source, agrega un archivo `LICENSE` en la raíz y actualiza esta sección en consecuencia.
