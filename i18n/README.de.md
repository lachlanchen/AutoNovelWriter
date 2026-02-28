[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>Scratch-ähnliche PWA + Tornado-Backend zur Steuerung einer automatisierten Pipeline für das Schreiben von Romanen (und App-Entwicklung).</strong></p>
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

Dieses Repository enthält außerdem `AutoAppDev/` als Submodul (wiederverwendbare Auto-Development-Skripte).

> [!TIP]
> `README.md` ist die kanonische Basis. Lokalisierte Varianten liegen in `i18n/` und sind über die Sprach-Link-Zeile oben verknüpft.

| Kurzinfo | Details |
|---|---|
| Primärer Stack | Python + Tornado Backend, PWA-Frontend im Browser |
| Kern-UX | Skript- + Block-Editor auf einer gemeinsamen kanonischen Quelle |
| Ausführungsmodus | Resumierbarer Runner mit persistiertem Cursor und Aktionsresultaten |
| Echtzeit | WebSocket-Endpunkt unter `/ws` |
| Änderbarer Runtime-Root | `autonovelwriter/runtime/` (gitignore) |

| Standardwerte beim Start | Wert |
|---|---|
| PWA-URL | `http://127.0.0.1:8787/` |
| WebSocket-URL | `ws://127.0.0.1:8787/ws` |
| Backend-Host/Port | `127.0.0.1:8787` |

## Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Funktionen](#-funktionen)
- [Architektur auf einen Blick](#️-architektur-auf-einen-blick)
- [Projektstruktur](#️-projektstruktur)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Nutzung](#-nutzung)
- [Konfiguration](#️-konfiguration)
- [Wichtige Backend-APIs](#-wichtige-backend-apis)
- [Runtime-Pfade](#-runtime-pfade)
- [Pipeline-Skript (kanonisches Artefakt)](#-pipeline-skript-kanonisches-artefakt)
- [Runner-Ausgaben (Entwurfs-Stub)](#-runner-ausgaben-entwurfs-stub)
- [Runner-Aufgaben (Batch-Stub)](#-runner-aufgaben-batch-stub)
- [Agent-Einstellungen / Codex-Gate](#-agent-einstellungen--codex-gate)
- [PWA-I18N (UI-Sprache)](#-pwa-i18n-ui-sprache)
- [Roman-Einstellungen (getrennt von UI-Sprache)](#️-roman-einstellungen-getrennt-von-ui-sprache)
- [Beispiele](#-beispiele)
- [Entwicklungshinweise](#️-entwicklungshinweise)
- [Testnotizen](#-testnotizen)
- [Repository-Inhalte](#-repository-inhalte)
- [Fehlerbehebung](#-fehlerbehebung)
- [Roadmap](#️-roadmap)
- [Mitwirken](#-mitwirken)
- [Support](#-support)
- [Lizenz](#-lizenz)

## 📌 Überblick

AutoNovelWriter stellt eine lokale Orchestrierungsschicht für Folgendes bereit:
- Bearbeiten eines kanonischen Pipeline-Skripts (`pipeline.script`) sowohl über Quelltext als auch Block-UI.
- Ausführung des Backends resumierbar mit persistiertem Cursor und gespeicherten Aktionsresultaten.
- Verwaltung von Projekten, Materialien, Ausgaben, Task-Batches und Action-Templates.
- Live-Updates per WebSocket (`/ws`) an die PWA.

Die kanonische mutable Runtime ist `autonovelwriter/runtime/` (inhaltlich gitignored).

| Bereich | Aufgabe |
|---|---|
| Pipeline-Authoring | Kanonisches Skript + verschachtelte Block-UI aus einer gemeinsamen Source of Truth |
| Ausführung | Resumierbarer Runner mit persistiertem Cursor und Aktionsresultaten |
| Projektvorgänge | Projektbezogene Materialien, Ausgaben, Einstellungen und Batch-Aktivierung |
| Echtzeit-UX | `/ws`-Events für Status, Log, Ausgabe, Tasks und Actions |

## ✨ Funktionen

- Scratch-ähnlicher Pipeline-Editor auf Basis eines kanonischen Skripts + Parser/AST.
- Runner-Control-APIs (`start/pause/resume/stop`) mit resumable State.
- Control-Flow-Container: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Action Library mit Standardvorlagen + Copy-on-Edit-Overrides durch Nutzer.
- Projektbezogene Novel-Settings-Overrides mit Vererbung.
- Task-Batch-Flow für Generierung/Index/Details/Aktivierung für `FOREACH_TASK`.
- Indexierung von Outputs und Endpunkte für die Vorschau des neuesten Roman-PDFs.
- Eingebettete PWA-i18n-Dictionaries (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- tmux-Helferskripte und ein resumierbarer Codex-Auto-Dev-Treiber.

## 🧭 Architektur auf einen Blick

```text
Browser (PWA)
  ├─ Pipeline-Editor (Skript + Blöcke)
  ├─ Einstellungen / Projekte / Actions / Tasks / Outputs-Panels
  └─ WebSocket-Client (/ws)
          │
          ▼
Tornado-Backend (autonovelwriter/backend/server.py)
  ├─ REST-APIs (/api/*)
  ├─ WebSocket-Broadcast-Hub
  ├─ Parser + AST + persistiertes kanonisches Skript
  ├─ resumierbarer Runner + Protokoll der Aktionsresultate
  └─ Runtime-Bootstrap (Verzeichnisse + Defaults)
          │
          ▼
autonovelwriter/runtime/ (mutable, lokal-first)
  ├─ state/ (pipeline, settings, runner, chat)
  ├─ projects/<id>/ (materials, outputs, project settings)
  ├─ tasks/ (aktive Liste + generierte Batches)
  ├─ actions/ (defaults + user overrides)
  └─ logs/ (runner.log)
```

## 🗂️ Projektstruktur

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

## ✅ Voraussetzungen

| Abhängigkeit | Erforderlich | Hinweis |
|---|---|---|
| Python `3.11+` | Ja | Empfohlene Basis |
| `pip` | Ja | Installation von Backend-Abhängigkeiten |
| `tmux` | Nein | Für das multi-pane Launcher-Skript |
| `conda` | Nein | Optionale Hilfsskripte |
| `node` | Nein | Optional für das direkte Ausführen der PWA-Testdatei |

## 🚀 Installation

| Pfad | Beste Wahl für | Befehl |
|---|---|---|
| Option A | Du nutzt conda und willst die repo-interne Einrichtung | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Du willst Setup + Start in einem Schritt | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Du bevorzugst manuelle pip-Kontrolle | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Conda-Hilfsskript (für dieses Repo empfohlen)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Dann mit tmux starten:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B: Setup + Start in einem Befehl

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Option C: Manuelle pip-Installation

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

### Optional: Submodul initialisieren

```bash
git submodule update --init --recursive
```

## 🧪 Nutzung

| Ablauf | Befehl / URL |
|---|---|
| Backend starten | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| App öffnen | `http://127.0.0.1:8787/` |
| WebSocket-Endpunkt | `ws://127.0.0.1:8787/ws` |
| Optionales statisches PWA-Serving | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| tmux-Launcher | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Schnellstart (ohne tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# öffne http://127.0.0.1:8787/
```

### Dev-Run (Backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

Das Backend stellt standardmäßig auch die statischen PWA-Assets aus `autonovelwriter/pwa/` bereit, so dass du öffnen kannst:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Optional: PWA (separater statischer Dev-Server):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Öffne die PWA unter `http://127.0.0.1:5173` und zeige auf das Backend (Standard: `ws://127.0.0.1:8787/ws`).

tmux (startet beide Panes + Log-Tail):

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda-Umgebungshelper:

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Das Treiberskript des Repos (`scripts/auto-autonovelwriter-development.sh`) kann während Auto-Dev ebenfalls eine tmux-Session starten.

### Typischer Workflow

1. Backend starten (oder tmux-Helfer verwenden).
2. PWA öffnen.
3. Pipeline über Blöcke und/oder Script-Textarea bearbeiten.
4. Pipeline prüfen/speichern.
5. Runner starten und Logs/Status/Events beobachten.
6. Generierte Outputs/Task-Batches prüfen.

## ⚙️ Konfiguration

### Umgebungsvariablen

Nutze `autonovelwriter/backend/.env.example` als Vorlage. Wichtige vom Backend/Runtime genutzte Variablen:

- `AUTONOVELWRITER_RUNTIME_ROOT` (Standard `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (Standard `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (Standard `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (CLI-Standard: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (Standard: Elternverzeichnis des Repository-Roots)
- `AUTONOVELWRITER_WRITER_SCRIPT` (Standard `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (Standard `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (Standard `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (Ausführungs-Gate für Agent, standardmäßig deaktiviert)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (optionaler Override für den Codex-Binärpfad)

### CLI-Optionen der Skripte

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

## 🔌 Wichtige Backend-APIs

| API-Gruppe | Hauptendpunkte |
|---|---|
| Health & Einstellungen | `/api/health`, `/api/settings` |
| Projekte & Projekteinstellungen | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tasks | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Actions | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Outputs & Novel-Vorschau | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| Echtzeit | `/ws` |

### HTTP-APIs

- Health: `GET /api/health`
- Einstellungen: `GET/POST /api/settings`
- Projekte: `GET /api/projects`, `POST /api/projects/active`
- Projekteinstellungen (aktives Projekt): `GET/POST /api/projects/settings` (projektbezogene Overrides mit Vererbung: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materialien-Index (aktives Projekt): `GET /api/materials/index`
- Outputs-Index (aktives Projekt): `GET /api/outputs/index`
- Task-Batch-Index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task-Batch-Details: `GET /api/tasks/batches/<batch_id>`
- Task-Batch aktivieren: `POST /api/tasks/batches/<batch_id>/activate` (schreibt `runtime/tasks/tasks.json` und projektbezogenes `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (Copy-on-Edit-Update für Defaults)
- Pipeline (kanonisches Skript + abgeleitetes JSON): `GET/POST /api/pipeline`
- Pipeline-Validierung (nur Vorschau): `POST /api/pipeline/validate`
- Referenz-Writer-Pipeline-Vorschau/Laden:
  - `GET /api/pipeline/reference_writer` (liest und parst `../scripts/auto-xiyouzhiyuan-writer.sh` als Referenz)
  - `POST /api/pipeline/reference_writer/load` (lädt das geparste Ergebnis in die Runtime-Pipeline; Quelle bleibt unverändert)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Neuestes Roman-PDF:
  - `GET /api/novel/latest` (Metadaten)
  - `GET /api/novel/latest/pdf` (inline PDF-Stream für Viewer)
- Runner-Steuerung: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent-Test (gated): `POST /api/agent/test` (führt nur `codex --version` aus, wenn aktiviert + Env-Gate)

### WebSocket

- Endpunkt: `/ws`
- Broadcast-Events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Runtime-Pfade

Alle veränderbaren Zustände und IO liegen unter `autonovelwriter/runtime/`:

| Pfad | Zweck |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (Textdateien `.txt`/`.md` ablegen) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (Backend schreibt Chat-Nachrichten) |
| `autonovelwriter/runtime/state/` | persistierter JSON-State (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | SQLite-Chatspiegel (zusätzlich zu `chat.jsonl`) |
| `autonovelwriter/runtime/state/active_project.json` | persistierter Verweis auf das aktive Projekt |
| `autonovelwriter/runtime/tasks/` | Task-Queue-Dateien |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | generierte Task-Batches (z. B. aus `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | Logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | Projektmaterialien (Inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | Projektausgaben (Entwürfe/Exporte) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | projektbezogene Novel-Einstellungen-Overrides (z. B. Novel-Sprache) |
| `autonovelwriter/runtime/actions/defaults/` | initial bereitgestellte Action-Library-Templates (als unveränderlich behandelt) |
| `autonovelwriter/runtime/actions/user/` | Nutzer-Action-Library-Templates (per Copy-on-Edit erstellt) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | gespiegelte Chat-Inputs für den Writer-Pipeline-Eingang |

## 🧩 Pipeline-Skript (kanonisches Artefakt)

Die Pipeline wird als formatiertes Skript auf Platte abgelegt:
- `autonovelwriter/runtime/state/pipeline.script`

Das Backend liefert sie per `GET/POST /api/pipeline` als:
- `script` (kanonisch, shell-ähnliche Zeilen `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (abgeleitet, abgeflachte Liste für einfache Block-Renderung)
- `pipeline_ast` (abgeleitet, verschachtelte Struktur für Schleifen + Einrückungs-UI)

Der Runner führt Schritte aus, die aus demselben v2-Parser/AST abgeleitet sind. Dadurch stimmt das, was die PWA anzeigt, mit dem tatsächlichen Ablauf überein.

Runner-Control-Flow unterstützt v2-Container:
- `ROUND <n>` wiederholt seine Kinder `n`-mal.
- `FOREACH_TASK` führt seine Kinder einmal pro Task in der aktiven Task-Liste aus (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` führt seine Kinder einmal pro Eintrag in `payload.actions` des aktuellen Tasks aus (ideal verschachtelt unter `FOREACH_TASK`).

Resumability:
- Der Runner persistiert einen resumierbaren Ausführungscursor in `autonovelwriter/runtime/state/runner_state.json`.
- Der Cursor wird erst nach erfolgreichem Abschluss eines Blocks weitergesetzt (damit Neustarts unvollständige Schritte nicht überspringen).
- Wenn sich das kanonische Pipeline-Skript ändert (Hash-Mismatch), stoppt der Runner und verlangt einen Neustart (Cursor wird invalidiert).
- Der Runner persistiert pro Schritt `ActionResult`-Datensätze in `autonovelwriter/runtime/state/action_results.jsonl` und nutzt eine deterministische `exec_id` pro Schritt, um bereits bestätigte Ergebnisse bei Neustarts nicht doppelt zu schreiben.
- Beim Ausführen innerhalb von `FOREACH_ACTION` enthalten ActionResults `action_index`, `action_id_ref` und `action_key`, und Variablen beinhalten `prev` sowie explizite Scopes `task.prev` versus `action.prev`.

Pipeline-Skript v2 unterstützt Verschachtelung:
- `LOOP <n>` führt einen Loop-Block ein
- `ROUND <n>` führt einen Runden-Containerblock ein
- `FOREACH_TASK` führt einen Pro-Task-Containerblock ein
- `FOREACH_ACTION` führt einen Pro-Action-Containerblock ein (Runner iteriert `task.payload.actions`)
- `IF <expr>` führt einen bedingten Containerblock ein (Parsing/Render, Runner führt aktuell nur den Then-Branch aus)
- `ELSE` führt einen optionalen Alternativ-Zweig unter einem `IF` ein
- Kinder werden pro Ebene um 2 Leerzeichen eingerückt.

Validierung (ohne Persistenz):
- `POST /api/pipeline/validate` liefert eine kanonische Vorschau plus `pipeline_ast`, Warnungen und Fehler.

Die PWA zeigt das Skript in einer Textarea (Source of Truth) und rendert verschachtelte Blöcke aus `pipeline_ast`.
Wenn der Backend-Validierungs-Endpunkt nicht erreichbar ist, fällt die PWA auf einen lokalen Parser zurück, der dieselben v2-Verben unterstützt (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Hinweise zur Blocks-UI:
- Die Wiederholungszahlen von `LOOP` und `ROUND` sind direkt in der Blockliste editierbar; gültige Änderungen aktualisieren sofort die kanonische Skript-Textarea.
- Die Blocks-Leiste kann `LOOP`-, `ROUND`-, `FOREACH_TASK`-, `FOREACH_ACTION`- und `IF`-Container einfügen, ohne das Skript manuell zu bearbeiten (umfasst den ausgewählten Block oder hängt einen gültigen, nicht-leeren Container an).
- Blöcke können in der Canvas gelöscht werden (Delete-Button pro Block; Taste `Delete`, wenn ein Block ausgewählt ist). Beim Löschen von Containern werden Kinder nach oben gespliced, und der Editor hält Container nicht leer, um ungültige Skripte zu vermeiden.
- `IF`-Blöcke bleiben strukturell konsistent: `ELSE` kann nicht außerhalb eines `IF` bestehen bleiben, und der Then-Branch bleibt nicht leer.
- `STEP`-Blöcke bieten Action-Library-Bedienelemente: Action-Selector, `Customize` (kopiert eine Default-Action in eine User-Action und wechselt dorthin) und `Edit` (Action-Editor-Modal für `name/tool/prompt/script`).

## 📝 Runner-Ausgaben (Draft-Stub)

Wenn die Pipeline einen `STEP write`-Block enthält, erstellt der Backend-Runner eine Stub-Entwurfsdatei unter:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Der Backend-Runner emittiert außerdem:
- WS-Event `output_created` mit `path` und `project_rel_path`
- Eine `log`-Zeile `[output] created: ...`

Die PWA enthält ein Minimal-Outputs-Panel, das Dateien via `GET /api/outputs/index` auflistet und bei `output_created` aktualisiert.

## 📦 Runner-Aufgaben (Batch-Stub)

Wenn die Pipeline einen `STEP meta_tasks_generate`-Block enthält, erstellt der Backend-Runner einen Stub-Task-Batch unter:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Der Backend-Runner emittiert außerdem:
- WS-Event `tasks_batch_created` mit `batch_dir`, `tasks_jsonl` und `task_count`
- Eine `log`-Zeile `[tasks] created batch: ...`

Die PWA enthält ein minimales Task-Batches-Panel, das Batches via `GET /api/tasks/batches/index` auflistet und bei `tasks_batch_created` aktualisiert.
Es kann außerdem Batch-Details anzeigen (`GET /api/tasks/batches/<batch_id>`) und einen Batch aktivieren, damit er zur aktuellen Task-Liste für `FOREACH_TASK` wird (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Agent-Einstellungen / Codex-Gate

Das PWA-Settings-Panel speichert Agenteneinstellungen via `/api/settings` in `autonovelwriter/runtime/state/settings.json`.

Zur Sicherheit startet das Backend den `codex` CLI nicht, außer wenn beide Bedingungen erfüllt sind:
- `settings.agent.enabled=true` und `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` ist in der Umgebung gesetzt

Niemals Geheimnisse committen. Nutze `autonovelwriter/backend/.env.example` als Vorlage für lokale Umgebungsvariablen.

## 🌐 PWA I18N (UI-Sprache)

Die PWA verfügt über ein leichtgewichtiges eingebautes i18n-System.

- UI-Sprache erzwingen: `?lang=<code>` an die PWA-URL anhängen (z. B. `?lang=ja`).
- Im Browser persistiert in localStorage: `anw_lang`.
- Unterstützte UI-Sprachen: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Repository-lokalisierte README-Dateien liegen in `i18n/` und sind in der Sprachlink-Zeile oben verlinkt.

| README-Locale in `i18n/` | Status |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Vorhanden |

## 🖋️ Roman-Einstellungen (getrennt von UI-Sprache)

Schreibpräferenzen werden in den Backend-Einstellungen unter `settings.novel.*` gespeichert in:
- `autonovelwriter/runtime/state/settings.json`

Sie sind absichtlich **getrennt** von der PWA-UI-Sprache (`?lang=` / `anw_lang`).

Projektbezogene Overrides werden gespeichert unter:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Aktuelle globale Felder (editierbar im PWA-Settings-Modal):
- `settings.novel.language` (BCP-47-ähnliche Codes wie `en`, `ja`, `zh-Hans` usw.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Aktuelle projektbezogene Override-Felder (leer/nicht gesetzt = global erben):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Beispiele

### Minimaler lokaler Lauf

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# dann öffne http://127.0.0.1:8787/
```

### tmux-Lauf ohne Auto-Attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Backend-Testdateien direkt ausführen

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py
```

### PWA-Logikdatei direkt ausführen

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Beispiel eines Skript-Automations-Helpers

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Entwicklungshinweise

### Driver-Workflow (Auto-Dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Auto-Dev Progress (Generated)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` führt einen resumierbaren, Codex-gesteuerten Loop über Aufgaben in `references/autonovelwriter_dev/` aus und committed/pusht nach jeder Stage (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Nützliche Steuerungen:
- Nach aktuellem Task stoppen: `touch references/autonovelwriter_dev/STOP`
- State-Tracking zurücksetzen (Queue bleibt bestehen): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Neue Codex-Session starten: `scripts/auto-autonovelwriter-development.sh --new-session`
- Sichere Praxis: im sauberen Branch/Worktree arbeiten und `references/autonovelwriter_dev/state.tsv` vor dem Neustart prüfen.

## Operative Annahmen

- Diese README geht von lokaler Entwicklung unter Linux/macOS mit `bash` und Python 3.11+ aus.
- Der Runtime-Zustand unter `autonovelwriter/runtime/` ist veränderbar und wird voraussichtlich nicht versioniert.
- Das in dieser README beschriebene Pipeline-Verhalten entspricht der aktuellen In-Repo-Implementierung in `autonovelwriter/backend/server.py` und `autonovelwriter/pwa/app.js`.

## 🧪 Testnotizen

Es gibt keinen übergeordneten `Makefile`/`tox`/`npm test`-Orchestrator im Repository zum Zeitpunkt des Schreibens.

Praktische Test-Einstiegspunkte:

| Bereich | Einstiegspunkt |
|---|---|
| Backend Parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Backend Foreach-Action-Syntax | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Backend Runner-Semantik | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Backend Action-Library-Update | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| PWA AST-Löschverhalten | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (Einzeldateien ausführen)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

Wenn du Runner-Semantik, Pipeline-Syntax oder Action-Library-Verhalten änderst, aktualisiere bitte Tests und README/API-Notizen im gleichen Schritt.

## 📚 Repository-Inhalte

- `docs/autonovelwriter_spec.md`: Produktspezifikation für den Scratch-ähnlichen Controller (Chat + Folder-Pipe + start/pause/stop + Einstellungen).
- `scripts/auto-autonovelwriter-development.sh`: Entwickelt die AutoNovelWriter-App selbst automatisch (Task-Loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: Bilingualer (EN/ZH) Leitfaden und Anforderungen für einen langfristigen, resumierbaren Auto-Development-Agenten.
- `docs/ORDERING_RATIONALE.md`: Beispielbegründung für die Reihenfolge screenshot-gesteuerter Schritte.
- `scripts-legacy/`: Ältere Automationsskripte als Referenz, werden aber nicht mehr von AutoNovelWriter verwendet.
- `examples/ralph-wiggum-example.sh`: Beispiel für einen Codex-CLI-Automations-Helper.

### Zusätzliche Hinweise für Entwickler

- Backend-Tests liegen unter `autonovelwriter/backend/tests/`.
- Ein kleiner PWA-Behavior-Test liegt unter `autonovelwriter/pwa/tests/`.
- `i18n/` enthält lokalisierte Repository-READMEs, während die UI-Übersetzungs-Dictionaries in `autonovelwriter/pwa/app.js` eingebettet sind.

## 🧯 Fehlerbehebung

- `tmux not found in PATH`:
  - tmux installieren oder Backend/Static-Server manuell starten.
- `conda not found in PATH` bei Nutzung der `--env`-Skripte:
  - Miniconda/Anaconda installieren oder Conda überspringen und `pip` manuell verwenden.
- Die PWA kann keine Verbindung zum Backend herstellen:
  - Backend-Adresse/-Port und WebSocket-Endpunkt `ws://<host>:<port>/ws` prüfen.
- `POST /api/agent/test` liefert gated/disabled:
  - `settings.agent.enabled=true`, `settings.agent.sdk="codex"` und Umgebung `AUTONOVELWRITER_ENABLE_CODEX=1` sicherstellen.
- Runner stoppt nach Skriptbearbeitung:
  - Erwartetes Verhalten; der Cursor wird bei Hash-Mismatch des Pipeline-Skripts invalidiert und ein Neustart ist erforderlich.
- Statische PWA auf `:5173` läuft, aber API-Aufrufe scheitern:
  - Sicherstellen, dass das Backend auf `:8787` läuft (oder PWA/Backend-Targets entsprechend anpassen).

## 🗺️ Roadmap

- Verbleibende Auto-Dev-Queue-Items abschließen und stabilisieren (siehe Progress-Block oben).
- Repository-weit lokalisierte README-Varianten unter `i18n/` erweitern und synchron halten.
- Testabdeckung für Runner-Edge-Cases und PWA-Interaktionen erweitern.
- Action Library sowie Task-/Action-Iterierungs-Workflows weiter verbessern.

## 🤝 Mitwirken

Beiträge sind willkommen.

Pragmatische Leitlinien für dieses Repository:
- Starte mit `docs/autonovelwriter_spec.md` und `docs/auto-development-guide.md`.
- Halte Runtime-Mutationen in `autonovelwriter/runtime/` (Inhalte gitignored), nicht in versionierten Dateien.
- Bevorzuge inkrementelle PRs mit reproduzierbaren Run-/Test-Befehlen.
- Bei Änderungen an Pipeline-Semantik oder API-Verträgen README und relevante Tests gemeinsam aktualisieren.

Hinweis: Zum Zeitpunkt dieses Drafts wurde keine dedizierte `CONTRIBUTING.md` im Repository-Root gefunden.

## ❤️ Support

| Donate | PayPal | Stripe |
|---|---|---|
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=ko-fi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 Lizenz

Der Lizenzstatus bzw. die Lizenzdatei ist im Repository-Root in diesem Kontext nicht explizit dokumentiert.

Hinweis zur Annahme:
- Wenn du eine klare Open-Source-Weitergabe beabsichtigst, füge eine `LICENSE`-Datei auf Top-Level hinzu und passe diesen Abschnitt entsprechend an.
