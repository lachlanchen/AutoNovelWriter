[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)




[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>PWA tipo Scratch + backend Tornado para controlar una canalización automatizada de escritura de novelas (y de desarrollo de apps).</strong></p>
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

Este repositorio también incluye `AutoAppDev/` como submódulo (scripts reutilizables de autodesarrollo).

> [!TIP]
> `README.md` es la base canónica. Las variantes localizadas viven en `i18n/` y se enlazan desde la única línea de opciones de idioma al inicio.

## 🧭 Resumen del proyecto

| Quick facts | Details |
|---|---|
| Pila principal | Backend Python + Tornado, frontend PWA en navegador |
| UX principal | Editor de script + bloques respaldado por una fuente canónica única del pipeline |
| Modo de ejecución | Runner reanudable con cursor persistente y resultados de acciones |
| Tiempo real | Endpoint WebSocket en `/ws` |
| Raíz mutable del runtime | `autonovelwriter/runtime/` (en Git)

## Navegación rápida

| 🎯 Qué usar ahora | 🔧 Comando / URL |
|---|---|
| Abrir la PWA local | `http://127.0.0.1:8787/` |
| Conectar actualizaciones en vivo | `ws://127.0.0.1:8787/ws` |
| Iniciar backend rápido | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Ejecutar instalación + arranque | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

## 🔌 Valores de inicio

| Valor por defecto | Valor |
|---|---|
| URL de la PWA | `http://127.0.0.1:8787/` |
| URL de WebSocket | `ws://127.0.0.1:8787/ws` |
| Host/puerto del backend | `127.0.0.1:8787` |

## Tabla de contenidos

- Resumen del proyecto
- Funcionalidades
- Arquitectura de un vistazo
- Estructura del proyecto
- Navegación rápida
- Requisitos previos
- Instalación
- Uso
- Configuración
- APIs principales del backend
- Rutas de runtime
- Script del pipeline (artefacto canónico)
- Salidas del runner (borrador)
- Tareas del runner (lote)
- Configuración de agente / gate de Codex
- i18n de la PWA (idioma de UI)
- Ajustes de novela (separados del idioma de UI)
- Ejemplos
- Notas de desarrollo
- Notas de pruebas
- Contenido del repositorio
- Solución de problemas
- Hoja de ruta
- Contribuir
- Soporte
- Licencia

## 📌 Visión general

AutoNovelWriter ofrece una capa local de orquestación para:
- Editar un script canónico de pipeline (`pipeline.script`) mediante texto fuente o UI de bloques.
- Ejecutar el backend de forma reanudable con cursor persistente y resultados de acciones.
- Gestionar proyectos, materiales, salidas, lotes de tareas y plantillas de acciones.
- Enviar actualizaciones en vivo por WebSocket (`/ws`) a la PWA.

El runtime mutable canónico es `autonovelwriter/runtime/` (su contenido no se versiona).

| Área | Qué hace |
|---|---|
| Edición del pipeline | Edita script canónico + UI anidada de bloques desde una sola fuente |
| Ejecución | Runner reanudable con cursor persistente y resultados de acciones |
| Operación del proyecto | Materiales, salidas, ajustes y activación de lote por proyecto |
| UX en tiempo real | Eventos `/ws` para estado/log/salida/tarea/acción |

## ✨ Características

- Editor de pipeline tipo Scratch con script canónico + parser/AST.
- APIs de control del runner (`start/pause/resume/stop`) con estado reanudable.
- Contenedores de control de flujo: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Biblioteca de acciones con plantillas por defecto y sobrescritura de usuario mediante copy-on-edit.
- Sobrescrituras de configuración de novela por proyecto con semántica de herencia.
- Flujo de generación/índice/detalles/activación de lotes para `FOREACH_TASK`.
- Indexado de salidas y endpoints de vista previa del PDF de novela más reciente.
- Diccionarios i18n integrados en la PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Scripts auxiliares de `tmux` y un driver de codex/autodesarrollo reanudable.

## 🧭 Arquitectura de un vistazo

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

## 🗂️ Estructura del proyecto

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

## ✅ Requisitos previos

| Dependencia | Requerido | Notas |
|---|---|---|
| Python `3.11+` | Sí | Baseline recomendado |
| `pip` | Sí | Instala dependencias del backend |
| `tmux` | No | Necesario para script lanzador con múltiples paneles |
| `conda` | No | Scripts auxiliares opcionales |
| `node` | No | Opcional para ejecutar archivo de prueba PWA directamente |

## 🚀 Instalación

| Camino | Cuándo usar | Comando |
|---|---|---|
| Opción A | Usas conda y quieres la configuración del repositorio | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Opción B | Quieres setup + arranque en un solo paso | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Opción C | Prefieres controlar `pip` manualmente | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Opción A: Helper de Conda (recomendado para este repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Luego ejecuta con tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Opción B: Setup + ejecución en un solo paso

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Opción C: Instalación manual con pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

### Opcional: inicializar submódulo

```bash
git submodule update --init --recursive
```

## 🧪 Uso

| Flujo | Comando / URL |
|---|---|
| Iniciar backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Abrir app | `http://127.0.0.1:8787/` |
| Endpoint WebSocket | `ws://127.0.0.1:8787/ws` |
| PWA estática opcional | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| Lanzador de tmux | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Inicio rápido (sin tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# abre http://127.0.0.1:8787/
```

### Ejecución de desarrollo (backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

El backend también sirve los assets estáticos de la PWA desde `autonovelwriter/pwa/` por defecto, así que puedes abrir:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Opcional: PWA en servidor estático de desarrollo por separado:

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Abre la PWA en `http://127.0.0.1:5173` y configúrala contra el backend (por defecto `ws://127.0.0.1:8787/ws`).

tmux (lanzar ambos paneles + seguimiento de logs):

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Helper de entorno Conda:

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

El script de driver del repositorio (`scripts/auto-autonovelwriter-development.sh`) también puede iniciar una sesión de tmux durante el autodesarrollo.

### Flujo típico

1. Inicia backend (o helper de tmux).
2. Abre la PWA.
3. Edita el pipeline con bloques y/o área de texto del script.
4. Valida y guarda el pipeline.
5. Inicia el runner y observa logs/estado/eventos.
6. Revisa salidas generadas y lotes de tareas.

## ⚙️ Configuración

### Variables de entorno

Usa `autonovelwriter/backend/.env.example` como plantilla. Variables clave usadas por backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (por defecto `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (por defecto `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (por defecto `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (valor por defecto de CLI: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (por defecto: padre de la raíz del repo)
- `AUTONOVELWRITER_WRITER_SCRIPT` (por defecto `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (por defecto `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (por defecto `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (puerta de ejecución del agente, deshabilitada por defecto)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (override opcional del binario `codex`)

### Opciones de CLI de scripts

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

## 🔌 APIs principales del backend

| Grupo de API | Endpoints principales |
|---|---|
| Salud y ajustes | `/api/health`, `/api/settings` |
| Proyectos y ajustes | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tareas | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Acciones | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Salidas y vista previa de novela | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| Tiempo real | `/ws` |

### APIs HTTP

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Proyectos: `GET /api/projects`, `POST /api/projects/active`
- Ajustes del proyecto (proyecto activo): `GET/POST /api/projects/settings` (sobrescrituras por proyecto con herencia: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Índice de materiales (proyecto activo): `GET /api/materials/index`
- Índice de salidas (proyecto activo): `GET /api/outputs/index`
- Índice de lotes: `GET /api/tasks/batches/index` (opcional: `?project=<project_id>`)
- Detalles de lote: `GET /api/tasks/batches/<batch_id>`
- Activar lote: `POST /api/tasks/batches/<batch_id>/activate` (escribe `runtime/tasks/tasks.json` y `active_tasks.json` del proyecto)
- Biblioteca de acciones: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (actualización copy-on-edit de defaults)
- Pipeline (script canónico + JSON derivado): `GET/POST /api/pipeline`
- Validación de pipeline (solo vista previa): `POST /api/pipeline/validate`
- Vista previa/carga del pipeline de escritura de referencia:
  - `GET /api/pipeline/reference_writer` (lee y parsea `../scripts/auto-xiyouzhiyuan-writer.sh` como referencia)
  - `POST /api/pipeline/reference_writer/load` (carga el resultado parseado en el runtime del pipeline; nunca edita el script fuente)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- PDF más reciente:
  - `GET /api/novel/latest` (metadatos)
  - `GET /api/novel/latest/pdf` (stream PDF inline para visor)
- Control del runner: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Prueba de agente (con gate): `POST /api/agent/test` (ejecuta `codex --version` solo cuando está habilitado + gate de entorno)

### WebSocket

- Endpoint: `/ws`
- Eventos broadcast: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Rutas de runtime

Todo el estado mutable y el IO viven en `autonovelwriter/runtime/`:

| Ruta | Uso |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | usuario -> sistema (arrastra `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | sistema -> usuario (backend escribe mensajes de chat) |
| `autonovelwriter/runtime/state/` | estado JSON persistente (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | espejo SQLite del chat (además de `chat.jsonl`) |
| `autonovelwriter/runtime/state/active_project.json` | puntero persistente del proyecto activo |
| `autonovelwriter/runtime/tasks/` | archivos de cola de tareas |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | lotes de tareas generados (p. ej. desde `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | materiales del proyecto (entradas) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | salidas del proyecto (borradores/exportaciones) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | sobrescrituras de ajustes de novela por proyecto (p. ej. idioma de novela) |
| `autonovelwriter/runtime/actions/defaults/` | plantillas por defecto de Action Library (tratadas como inmutables) |
| `autonovelwriter/runtime/actions/user/` | plantillas de usuario de Action Library (creadas via copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | entradas de chat espejadas para ingestión del pipeline del escritor |

## 🧩 Script del pipeline (artefacto canónico)

El pipeline se representa como un script formateado en disco:
- `autonovelwriter/runtime/state/pipeline.script`

El backend lo expone vía `GET/POST /api/pipeline` como:
- `script` (canónico, estilo shell `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (derivado, lista aplanada para renderizado simple de bloques)
- `pipeline_ast` (derivado, estructura anidada usada para loops + UI de indentación)

El runner ejecuta pasos derivados del mismo parser/AST v2, por lo que lo que muestra la PWA coincide con lo que realmente se ejecuta.

El control de flujo del runner soporta contenedores v2:
- `ROUND <n>` repite sus hijos `n` veces.
- `FOREACH_TASK` ejecuta sus hijos una vez por tarea en la lista activa (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` ejecuta sus hijos una vez por elemento en `payload.actions` de la tarea actual (pensado para anidarse bajo `FOREACH_TASK`).

Reanudabilidad:
- El runner persiste un cursor de ejecución reanudable en `autonovelwriter/runtime/state/runner_state.json`.
- El cursor solo avanza cuando un bloque termina correctamente (los reinicios no se saltan trabajo pendiente).
- Si cambia el script canónico del pipeline (discrepancia de hash), el runner se detiene y requiere reinicio (cursor invalidado).
- El runner guarda `ActionResult` por paso en `autonovelwriter/runtime/state/action_results.jsonl` y usa un `exec_id` determinista por paso para evitar duplicar resultados ya comprometidos al reiniciar.
- Al ejecutarse dentro de `FOREACH_ACTION`, `ActionResults` incluye `action_index`, `action_id_ref` y `action_key`, y variables con `prev` más ámbitos explícitos `task.prev` y `action.prev`.

El `pipeline` v2 soporta anidamiento:
- `LOOP <n>` introduce un bloque de bucle.
- `ROUND <n>` introduce un bloque contenedor de rondas.
- `FOREACH_TASK` introduce un contenedor por tarea.
- `FOREACH_ACTION` introduce un contenedor por acción (el runner itera `task.payload.actions`).
- `IF <expr>` introduce un contenedor condicional (parse/render; el runner ejecuta solo la rama `then` por ahora).
- `ELSE` introduce una rama alternativa opcional bajo un bloque `IF`.
- Los hijos se indentan con 2 espacios por nivel.

Validación (sin persistencia):
- `POST /api/pipeline/validate` devuelve una vista previa canónica junto a `pipeline_ast`, warnings y errores.

La PWA muestra el script en una textarea (fuente de verdad) y renderiza bloques anidados desde `pipeline_ast`.
Si el endpoint de validación del backend no está disponible, la PWA usa un parser local de respaldo que soporta los mismos verbos v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Notas de UI de bloques:
- Los conteos de repetición de `LOOP` y `ROUND` se editan inline en la lista de bloques; los cambios válidos actualizan inmediatamente la textarea canónica.
- La barra de herramientas de bloques puede insertar `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` y `IF` sin editar manualmente el script (envuelve el bloque seleccionado o añade un contenedor no vacío válido).
- Los bloques se pueden borrar del lienzo (botón Delete por bloque; tecla `Delete` con bloque seleccionado). Al borrar contenedores, los hijos se reinsertan por arriba y el editor mantiene contenedores no vacíos para evitar scripts inválidos.
- Los bloques `IF` se mantienen estructuralmente válidos en el editor: `ELSE` no puede vivir fuera de un `IF`, y la rama `then` permanece no vacía.
- Los bloques `STEP` muestran controles de la Action Library: selector de acción, `Customize` (copiar una acción por defecto a una acción de usuario y cambiar), y `Edit` (modal de Action Editor para `name/tool/prompt/script`).

## 📝 Salidas del runner (borrador)

Cuando el pipeline contiene un bloque `STEP write`, el runner del backend crea un archivo de borrador stub en:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

El backend también emite:
- Evento WS `output_created` con `path` y `project_rel_path`
- Una línea de `log`: `[output] created: ...`

La PWA incluye un panel mínimo de Outputs que lista archivos vía `GET /api/outputs/index` y se actualiza al recibir `output_created`.

## 📦 Tareas del runner (lote)

Cuando el pipeline contiene un bloque `STEP meta_tasks_generate`, el runner del backend crea un lote de tareas stub en:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

El backend emite:
- Evento WS `tasks_batch_created` con `batch_dir`, `tasks_jsonl` y `task_count`
- Una línea de `log`: `[tasks] created batch: ...`

La PWA incluye un panel mínimo de Task Batches que lista lotes vía `GET /api/tasks/batches/index` y refresca con `tasks_batch_created`.
También puede mostrar detalles del lote (`GET /api/tasks/batches/<batch_id>`) y activar un lote para que sea la lista actual de tareas de `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Configuración de agente / gate de Codex

El panel de Settings de la PWA guarda ajustes del agente vía `/api/settings` en `autonovelwriter/runtime/state/settings.json`.

Por seguridad, el backend no lanza la CLI `codex` a menos que ambas condiciones sean ciertas:
- `settings.agent.enabled=true` y `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` esté definido en el entorno

No guardes secretos en el repositorio. Usa `autonovelwriter/backend/.env.example` como plantilla para variables locales.

## 🌐 I18n de la PWA (idioma de la UI)

La PWA incluye un sistema i18n ligero.

- Forzar idioma de UI: añade `?lang=<code>` a la URL de la PWA (por ejemplo `?lang=ja`).
- Persistencia por navegador en localStorage: `anw_lang`.
- Idiomas de UI soportados: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Los README localizados del repositorio viven hoy en `i18n/` y se enlazan desde la única línea de opciones de idioma al inicio de este archivo.

| Archivos de README en `i18n/` | Estado |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Presentes |

## 🖋️ Ajustes de novela (separados del idioma de UI)

Las preferencias de escritura de novelas se guardan en la configuración del backend bajo `settings.novel.*` en:
- `autonovelwriter/runtime/state/settings.json`

Estas se separan intencionalmente del idioma de la UI de la PWA (`?lang=` / `anw_lang`).

Las sobrescrituras por proyecto se guardan en:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Campos globales actuales (editables en el modal de Settings de la PWA):
- `settings.novel.language` (códigos tipo BCP-47 como `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Campos actuales de sobrescritura por proyecto (vacío/no definido = hereda global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Ejemplos

### Ejecución local mínima

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# luego abre http://127.0.0.1:8787/
```

### Ejecución con tmux sin auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Ejecutar pruebas del backend directamente

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Ejecutar prueba JS de lógica PWA directamente

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Ejemplo de helper de automatización por script

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Notas de desarrollo

### Flujo del driver (Auto-Dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Progreso de Auto-Dev (generado)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` ejecuta un bucle reanudable controlado por Codex sobre tareas en `references/autonovelwriter_dev/` y hará commit/push tras cada etapa (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Controles útiles:
- Detener tras la tarea actual: `touch references/autonovelwriter_dev/STOP`
- Reiniciar seguimiento de estado (manteniendo la cola): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Iniciar una nueva sesión de Codex: `scripts/auto-autonovelwriter-development.sh --new-session`
- Práctica segura: ejecuta en una rama/worktree limpia y revisa `references/autonovelwriter_dev/state.tsv` antes de reiniciar

### Supuestos operativos

- Este README asume desarrollo local-first en Linux/macOS con `bash` y Python 3.11+.
- El estado de runtime en `autonovelwriter/runtime/` es mutable y se espera que sea sin track.
- El comportamiento del pipeline reflejado aquí corresponde al estado actual en `autonovelwriter/backend/server.py` y `autonovelwriter/pwa/app.js`.

## 🧪 Notas de pruebas

No hay un orquestador de nivel raíz `Makefile`/`tox`/`npm test` en este repositorio en el momento de esta versión.

Puntos de entrada prácticos:

| Área | Punto de entrada |
|---|---|
| Parser/AST del backend | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Sintaxis foreach-action backend | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Semántica del runner | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Actualización de biblioteca de acciones | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| Borrado de AST en PWA | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (ejecutar archivos de prueba individuales)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

Si añades o cambias semántica del runner, sintaxis del pipeline o comportamiento de la biblioteca de acciones, actualiza pruebas y notas de README/API en el mismo cambio.

## 📚 Contenido del repositorio

- `docs/autonovelwriter_spec.md`: especificación del producto para el controlador estilo Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: auto-desarrolla la app AutoNovelWriter (bucle de tareas: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: filosofía y requisitos bilingües (EN/ZH) para un agente de auto-desarrollo de larga duración y reanudable.
- `docs/ORDERING_RATIONALE.md`: ejemplo de justificación para ordenar pasos guiados por capturas.
- `scripts-legacy/`: scripts antiguos de automatización mantenidos como referencia y no usados por AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: ejemplo de helper de automatización con CLI de Codex.

Notas adicionales para desarrolladores:
- Las pruebas del backend están en `autonovelwriter/backend/tests/`.
- Hay una prueba pequeña de comportamiento PWA en `autonovelwriter/pwa/tests/`.
- `i18n/` contiene README localizados del repositorio; los diccionarios de traducción de la UI están embebidos en `autonovelwriter/pwa/app.js`.

## 🧯 Solución de problemas

| Síntoma | Qué revisar |
|---|---|
| `tmux not found in PATH` | Instala tmux o ejecuta backend/servidores estáticos manualmente. |
| `conda not found in PATH` al usar scripts con `--env` | Instala Miniconda/Anaconda, o salta conda y usa instalación manual con `pip`. |
| La PWA no puede conectar con el backend | Verifica dirección/puerto del backend y el endpoint WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` devuelve gated/disabled | Asegúrate de que estén: `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, y entorno `AUTONOVELWRITER_ENABLE_CODEX=1`. |
| El runner se detiene tras editar el script | Comportamiento esperado; el cursor se invalida por mismatch de hash del script del pipeline y requiere reinicio. |
| La PWA estática en `:5173` funciona pero las llamadas API fallan | Confirma que el backend corre en `:8787` (o ajusta la configuración destino app/backend). |

## 🗺️ Hoja de ruta

- Completar y estabilizar items restantes de auto-dev (ver bloque de progreso generado arriba).
- Ampliar y mantener sincronizadas las variantes de README i18n del repositorio en `i18n/`.
- Ampliar cobertura de pruebas automatizadas en casos límites del runner y en interacciones de PWA.
- Seguir mejorando la Action Library y los flujos de iteración tarea/acción.

## 🤝 Contribuciones

Las contribuciones son bienvenidas.

Guía práctica para este repositorio:
- Empieza desde `docs/autonovelwriter_spec.md` y `docs/auto-development-guide.md`.
- Mantén mutaciones de runtime en `autonovelwriter/runtime/` (contenido sin track), no en archivos versionados.
- Prefiere PRs incrementales con comandos reproducibles de ejecución/prueba.
- Si cambias semántica de pipeline o contratos de API, actualiza README y pruebas relacionadas en conjunto.

Nota: no se encontró un `CONTRIBUTING.md` dedicado en la raíz del repositorio en el contexto de este borrador.

---

## 📄 Licencia

El archivo/estado de licencia no está declarado explícitamente en la raíz del repositorio en este contexto de borrador.

Nota de supuesto:
- Si quieres redistribución open-source de forma explícita, añade un `LICENSE` en raíz y actualiza esta sección acorde.




## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
