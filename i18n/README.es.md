[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

# AutoNovelWriter

![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9)
![Frontend](https://img.shields.io/badge/frontend-PWA-10b981)
![Runtime](https://img.shields.io/badge/runtime-local%20state-orange)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)
![WebSocket](https://img.shields.io/badge/realtime-WebSocket-06b6d4)
![Pipeline](https://img.shields.io/badge/pipeline-script%20%2B%20AST-2563eb)

PWA tipo Scratch + backend Tornado para controlar un pipeline automatizado de escritura de novelas (y desarrollo de apps).

Este repositorio también incluye `AutoAppDev/` como submódulo (scripts reutilizables de autodesarrollo).

| Datos rápidos | Detalles |
|---|---|
| Stack principal | Backend en Python + Tornado, frontend PWA en navegador |
| UX principal | Editor de scripts + bloques respaldado por una única fuente canónica del pipeline |
| Modo de ejecución | Runner reanudable con cursor persistido y resultados de acciones |
| Tiempo real | Endpoint WebSocket en `/ws` |
| Raíz mutable en runtime | `autonovelwriter/runtime/` (ignorada por git) |

## 📌 Resumen

AutoNovelWriter proporciona una capa local de orquestación para:
- Editar un script canónico de pipeline (`pipeline.script`) tanto desde texto fuente como desde UI por bloques.
- Ejecutar backend reanudable con cursor persistido y resultados de acciones.
- Gestionar proyectos, materiales, salidas, lotes de tareas y plantillas de acciones.
- Transmitir actualizaciones en vivo vía WebSocket (`/ws`) hacia la PWA.

La raíz canónica mutable de runtime es `autonovelwriter/runtime/` (su contenido está ignorado por git).

| Área | Qué hace |
|---|---|
| Autoría del pipeline | Edita script canónico + UI de bloques anidados desde una fuente de verdad compartida |
| Ejecución | Runner reanudable con cursor persistido y resultados de acciones |
| Operaciones de proyecto | Materiales, salidas, configuración y activación de lotes de tareas por proyecto |
| UX en tiempo real | Eventos `/ws` para estado/log/salida/tarea/acción |

## ✨ Funcionalidades

- Editor de pipeline tipo Scratch respaldado por un script canónico + parser/AST.
- APIs de control del runner (`start/pause/resume/stop`) con estado reanudable.
- Contenedores de control de flujo: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Biblioteca de Acciones con plantillas por defecto + overrides de usuario mediante copy-on-edit.
- Overrides de configuración de novela por proyecto con semántica de herencia.
- Flujo de generación/índice/detalles/activación de lotes de tareas para `FOREACH_TASK`.
- Indexado de salidas y endpoints de vista previa del PDF de novela más reciente.
- Diccionarios i18n integrados en la PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Scripts auxiliares de tmux y un driver reanudable de autodesarrollo con Codex.

## 🗂️ Estructura del proyecto

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # Declaración del submódulo AutoAppDev
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # Punto de entrada principal del backend + handlers API/WS + lógica del runner
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # Pruebas unitarias del backend
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # Lógica UI + diccionarios i18n embebidos
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # Estado/IO mutables (contenido ignorado por git)
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
└── AutoAppDev/                    # Submódulo git (git@github.com:lachlanchen/AutoAppDev.git)
```

## ✅ Requisitos previos

| Dependencia | Obligatoria | Notas |
|---|---|---|
| Python `3.11+` | Sí | Línea base recomendada |
| `pip` | Sí | Instalar dependencias del backend |
| `tmux` | No | Necesario para el script lanzador con múltiples paneles |
| `conda` | No | Scripts auxiliares opcionales |
| `node` | No | Opcional para ejecutar directamente el archivo de pruebas de la PWA |

## 🚀 Instalación

### Opción A: helper de Conda (recomendada para este repo)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Luego ejecuta con tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Opción B: setup + ejecución en un solo paso

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Opción C: instalación manual con pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

### Opcional: inicializar submódulo

```bash
git submodule update --init --recursive
```

## 🧪 Uso

### Ejecución de desarrollo (Backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

El backend también sirve por defecto los assets estáticos de la PWA desde `autonovelwriter/pwa/`, así que puedes abrir:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Opcional: PWA (servidor estático de desarrollo separado):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Abre la PWA en `http://127.0.0.1:5173` y apúntala al backend (por defecto `ws://127.0.0.1:8787/ws`).

tmux (lanza ambos paneles + seguimiento de logs):

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Helper para entorno Conda:

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# en un solo paso:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

El script driver del repositorio (`scripts/auto-autonovelwriter-development.sh`) también puede iniciar una sesión tmux durante el autodesarrollo.

### Flujo de trabajo típico

1. Iniciar el backend (o helper de tmux).
2. Abrir la PWA.
3. Editar el pipeline con Bloques y/o textarea de script.
4. Validar/guardar el pipeline.
5. Iniciar el runner y monitorizar logs/estado/eventos.
6. Revisar salidas y lotes de tareas generados.

## 📁 Rutas de runtime

Todo el estado mutable y el IO viven bajo `autonovelwriter/runtime/`:

| Ruta | Propósito |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | usuario -> sistema (soltar `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | sistema -> usuario (el backend escribe mensajes de chat) |
| `autonovelwriter/runtime/state/` | estado JSON persistido (configuración, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | espejo sqlite del chat (además de chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | puntero persistido al proyecto activo |
| `autonovelwriter/runtime/tasks/` | archivos de cola de tareas |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | lotes de tareas generados (por ejemplo desde `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | materiales del proyecto (entradas) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | salidas del proyecto (borradores/exportaciones) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | overrides de configuración de novela por proyecto (por ejemplo idioma de novela) |
| `autonovelwriter/runtime/actions/defaults/` | plantillas por defecto sembradas en la Biblioteca de Acciones (tratadas como inmutables) |
| `autonovelwriter/runtime/actions/user/` | plantillas de usuario en la Biblioteca de Acciones (creadas vía copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | entradas de chat reflejadas para ingestión del pipeline de escritor |

## 🧩 Script de pipeline (artefacto canónico)

El pipeline se representa como un script formateado en disco:
- `autonovelwriter/runtime/state/pipeline.script`

El backend lo sirve vía `GET/POST /api/pipeline` como:
- `script` (canónico, líneas estilo shell `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (derivado, lista aplanada para renderizado simple por bloques)
- `pipeline_ast` (derivado, estructura anidada usada para loops + UI con indentación)

El runner ejecuta pasos derivados del mismo parser/AST v2, por lo que lo que muestra la PWA coincide con lo que se ejecuta.

El control de flujo del runner soporta contenedores v2:
- `ROUND <n>` repite sus hijos `n` veces.
- `FOREACH_TASK` ejecuta sus hijos una vez por tarea en la lista activa (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` ejecuta sus hijos una vez por entrada en la lista `payload.actions` de la tarea actual (pensado para anidarse bajo `FOREACH_TASK`).

Reanudabilidad:
- El runner persiste un cursor de ejecución reanudable en `autonovelwriter/runtime/state/runner_state.json`.
- El cursor solo avanza después de que un bloque termine correctamente (así los reinicios no saltan trabajo sin terminar).
- Si el script canónico del pipeline cambia (hash mismatch), el runner se detiene y requiere reinicio (cursor invalidado).
- El runner persiste registros `ActionResult` por paso en `autonovelwriter/runtime/state/action_results.jsonl` y usa un `exec_id` determinista por paso para evitar duplicar resultados ya confirmados al reiniciar.
- Al ejecutar dentro de `FOREACH_ACTION`, los ActionResults incluyen `action_index`, `action_id_ref` y `action_key`, y las vars incluyen `prev` además de ámbitos explícitos `task.prev` vs `action.prev`.

El script de pipeline v2 soporta anidación:
- `LOOP <n>` introduce un bloque de loop.
- `ROUND <n>` introduce un bloque contenedor de rondas.
- `FOREACH_TASK` introduce un bloque contenedor por tarea.
- `FOREACH_ACTION` introduce un bloque contenedor por acción (el runner itera `task.payload.actions`).
- `IF <expr>` introduce un bloque contenedor condicional (parse/render; por ahora el runner ejecuta solo la rama then).
- `ELSE` introduce una rama alternativa opcional bajo un bloque `IF`.
- Los hijos se indenta con 2 espacios por nivel.

Validación (sin persistencia):
- `POST /api/pipeline/validate` devuelve una vista previa canónica más `pipeline_ast`, advertencias y errores.

La PWA muestra el script en un textarea (fuente de verdad) y renderiza bloques anidados desde `pipeline_ast`.
Si no se puede alcanzar el endpoint de validación del backend, la PWA usa un parser local de respaldo que soporta los mismos verbos v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Notas de la UI de bloques:
- Los conteos de repetición de `LOOP` y `ROUND` se pueden editar en línea en la lista de bloques; las ediciones válidas actualizan inmediatamente el textarea canónico del script.
- La barra de herramientas de Bloques puede insertar contenedores `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` e `IF` sin editar manualmente el script (envuelve el bloque seleccionado o añade un contenedor válido no vacío).
- Los bloques pueden borrarse del lienzo (botón Delete por bloque; tecla `Delete` cuando un bloque está seleccionado). Al borrar contenedores, sus hijos se reinsertan en el nivel superior, y el editor mantiene contenedores no vacíos para evitar scripts inválidos.
- Los bloques `IF` se mantienen estructuralmente válidos en el editor: `ELSE` no puede persistir fuera de un `IF`, y la rama then permanece no vacía.
- Los bloques `STEP` exponen controles de la Biblioteca de Acciones: selector de acción, `Customize` (copiar una acción por defecto a una acción de usuario y cambiar), y `Edit` (modal del Editor de Acciones para `name/tool/prompt/script`).

## ⚙️ Configuración

### Variables de entorno

Usa `autonovelwriter/backend/.env.example` como plantilla. Variables clave usadas por backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (por defecto `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (por defecto `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (por defecto `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (valor por defecto de la bandera CLI: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (por defecto: padre de la raíz del repositorio)
- `AUTONOVELWRITER_WRITER_SCRIPT` (por defecto `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (por defecto `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (por defecto `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (gate de ejecución del agente, deshabilitado por defecto)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (override opcional para el binario de codex)

### Opciones CLI de scripts

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

## 🔌 APIs clave del backend

### APIs HTTP

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Configuración de proyecto (proyecto activo): `GET/POST /api/projects/settings` (overrides por proyecto con semántica de herencia: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Índice de materiales (proyecto activo): `GET /api/materials/index`
- Índice de salidas (proyecto activo): `GET /api/outputs/index`
- Índice de lotes de tareas: `GET /api/tasks/batches/index` (opcional: `?project=<project_id>`)
- Detalles de lote de tareas: `GET /api/tasks/batches/<batch_id>`
- Activar lote de tareas: `POST /api/tasks/batches/<batch_id>/activate` (escribe `runtime/tasks/tasks.json` y `active_tasks.json` del proyecto)
- Biblioteca de Acciones: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (actualización copy-on-edit para defaults)
- Pipeline (script canónico + JSON derivado): `GET/POST /api/pipeline`
- Validación de pipeline (solo vista previa): `POST /api/pipeline/validate`
- Vista previa/carga de pipeline de escritor de referencia:
  - `GET /api/pipeline/reference_writer` (lee y parsea `../scripts/auto-xiyouzhiyuan-writer.sh` como referencia)
  - `POST /api/pipeline/reference_writer/load` (carga el resultado parseado en el pipeline de runtime; nunca edita el script fuente)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- PDF de novela más reciente:
  - `GET /api/novel/latest` (metadatos)
  - `GET /api/novel/latest/pdf` (stream PDF inline para visor)
- Control del runner: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Prueba de agente (con gate): `POST /api/agent/test` (ejecuta `codex --version` solo cuando está habilitado + gate de entorno)

### WebSocket

- Endpoint: `/ws`
- Eventos broadcast: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📝 Salidas del runner (stub de borrador)

Cuando el pipeline contiene un bloque `STEP write`, el runner del backend creará un archivo de borrador stub en:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

El backend también emite:
- Evento WS `output_created` con `path` y `project_rel_path`
- Una línea de `log` `[output] created: ...`

La PWA incluye un panel mínimo de Outputs que lista archivos vía `GET /api/outputs/index` y se refresca en `output_created`.

## 📦 Tareas del runner (stub de lotes)

Cuando el pipeline contiene un bloque `STEP meta_tasks_generate`, el runner del backend creará un lote de tareas stub en:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

El backend emite:
- Evento WS `tasks_batch_created` con `batch_dir`, `tasks_jsonl` y `task_count`
- Una línea de `log` `[tasks] created batch: ...`

La PWA incluye un panel mínimo de Task Batches que lista lotes vía `GET /api/tasks/batches/index` y se refresca en `tasks_batch_created`.
También puede mostrar detalles del lote (`GET /api/tasks/batches/<batch_id>`) y activar un lote para convertirlo en la lista de tareas actual de `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Configuración de agente / gate de Codex

El panel de Settings de la PWA persiste la configuración del agente vía `/api/settings` en `autonovelwriter/runtime/state/settings.json`.

Por seguridad, el backend no iniciará el CLI `codex` a menos que se cumplan ambas condiciones:
- `settings.agent.enabled=true` y `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` esté definido en el entorno

Nunca subas secretos al repositorio. Usa `autonovelwriter/backend/.env.example` como plantilla para variables locales.

## 🌐 PWA I18N (idioma de la UI)

La PWA tiene un sistema i18n ligero integrado.

- Forzar idioma de UI: añade `?lang=<code>` a la URL de la PWA (por ejemplo `?lang=ja`).
- Persistido por navegador en localStorage: `anw_lang`.
- Idiomas de UI compatibles: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Los README localizados a nivel repositorio viven actualmente en `i18n/` y están enlazados desde la única línea de opciones de idioma al inicio de este archivo.

## 🖋️ Configuración de novela (separada del idioma de la UI)

Las preferencias de escritura de novela se guardan en la configuración del backend bajo `settings.novel.*` en:
- `autonovelwriter/runtime/state/settings.json`

Esto está intencionalmente separado del idioma de UI de la PWA (`?lang=` / `anw_lang`).

Los overrides por proyecto se guardan en:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Campos globales actuales (editables en el modal Settings de la PWA):
- `settings.novel.language` (códigos tipo BCP-47 como `en`, `ja`, `zh-Hans`, etc.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Campos actuales de override a nivel proyecto (vacío/no definido = hereda global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Ejemplos

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

### Ejecutar directamente el archivo de pruebas de lógica PWA

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Ejemplo de helper de automatización con scripts

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

`scripts/auto-autonovelwriter-development.sh` ejecuta un bucle reanudable guiado por Codex sobre tareas en `references/autonovelwriter_dev/` y hará commit/push después de cada etapa (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Controles útiles:
- Detener tras la tarea actual: `touch references/autonovelwriter_dev/STOP`
- Reiniciar seguimiento de estado (mantiene la cola): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Iniciar una sesión nueva de Codex: `scripts/auto-autonovelwriter-development.sh --new-session`
- Práctica segura: ejecutar en una rama/worktree limpia y monitorizar `references/autonovelwriter_dev/state.tsv` antes de reiniciar

## 📚 Contenido del repositorio

- `docs/autonovelwriter_spec.md`: Especificación de producto para el controlador tipo Scratch (chat + pipe de carpetas + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Autodesarrolla la app AutoNovelWriter (bucle de tareas: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: Filosofía y requisitos bilingües (EN/ZH) para un agente de autodesarrollo de larga duración y reanudable.
- `docs/ORDERING_RATIONALE.md`: Ejemplo de justificación para secuenciar pasos guiados por capturas.
- `scripts-legacy/`: Scripts de automatización antiguos mantenidos como referencia pero no usados por AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Ejemplo de helper de automatización con CLI de Codex.

Notas adicionales para desarrolladores:
- Las pruebas de backend viven en `autonovelwriter/backend/tests/`.
- Una prueba pequeña de comportamiento PWA vive en `autonovelwriter/pwa/tests/`.
- `i18n/` contiene archivos README localizados del repositorio, mientras que los diccionarios de traducción de la UI están embebidos en `autonovelwriter/pwa/app.js`.

## 🧯 Solución de problemas

- `tmux not found in PATH`:
  - Instala tmux o ejecuta backend/servidores estáticos manualmente.
- `conda not found in PATH` al usar scripts con `--env`:
  - Instala Miniconda/Anaconda, o evita conda y usa instalación manual con `pip`.
- La PWA no puede conectar con el backend:
  - Verifica dirección/puerto del backend y el endpoint WebSocket `ws://<host>:<port>/ws`.
- `POST /api/agent/test` devuelve gated/disabled:
  - Asegúrate de que estén ambos `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, y la variable de entorno `AUTONOVELWRITER_ENABLE_CODEX=1`.
- El runner del pipeline se detiene tras editar el script:
  - Comportamiento esperado; el cursor se invalida cuando hay hash mismatch del script del pipeline y requiere reinicio.

## 🗺️ Hoja de ruta

- Completar y estabilizar los elementos restantes de la cola auto-dev (ver bloque de progreso generado arriba).
- Expandir y mantener sincronizadas las variantes README i18n a nivel repositorio bajo `i18n/`.
- Ampliar la cobertura de pruebas automatizadas en casos límite del runner e interacciones de la PWA.
- Seguir mejorando la Biblioteca de Acciones y los flujos de iteración tarea/acción.

## 🤝 Contribuciones

Las contribuciones son bienvenidas.

Guía pragmática para este repositorio:
- Empieza por `docs/autonovelwriter_spec.md` y `docs/auto-development-guide.md`.
- Mantén las mutaciones de runtime en `autonovelwriter/runtime/` (contenido ignorado por git), no en archivos versionados.
- Prefiere PRs incrementales con comandos de ejecución/prueba reproducibles.
- Si cambias semántica de pipeline o contratos de API, actualiza README y pruebas relacionadas en conjunto.

Nota: no se encontró un `CONTRIBUTING.md` dedicado en la raíz del repositorio en el momento de este borrador.

## ❤️ Support

| Donate | PayPal | Stripe |
|---|---|---|
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=ko-fi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 Licencia

El archivo/estado de licencia no está declarado explícitamente en la raíz del repositorio en este contexto de borrador.

Nota de suposición:
- Si deseas dejar clara la redistribución de código abierto, añade un archivo `LICENSE` en la raíz y actualiza esta sección en consecuencia.
