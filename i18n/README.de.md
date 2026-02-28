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
    <img alt="Canonical docs" src="https://img.shields.io/badge/docs-README.md-critical?style=flat" />
    <img alt="Languages" src="https://img.shields.io/badge/i18n-10%2B%20languages-8b5cf6?style=flat" />
  </p>
</div>

Dieses Repo enthält außerdem `AutoAppDev/` als Submodul (wiederverwendbare Auto-Development-Skripte).

> [!TIP]
> `README.md` ist die kanonische Basis. Lokalisierte Varianten liegen in `i18n/` und sind über die Sprach-Links-Zeile oben verknüpft.

## 🧭 Projekt-Snapshot

| Quick facts | Details |
|---|---|
| Primärer Stack | Python + Tornado-Backend, Browser-PWA-Frontend |
| Zentrale UX | Skript- + Block-Editor auf Basis einer gemeinsamen kanonischen Pipeline-Quelle |
| Ausführungsmodus | Fortsetzbarer Runner mit gespeichertem Cursor und Aktionsresultaten |
| Realtime | WebSocket-Endpunkt unter `/ws` |
| Änderbarer Runtime-Root | `autonovelwriter/runtime/` (durch `.gitignore` ausgeschlossen) |

## At-a-Glance Navigation

| 🎯 Was jetzt nutzen | 🔧 Befehl / URL |
|---|---|
| Lokale PWA öffnen | `http://127.0.0.1:8787/` |
| Live-Updates verbinden | `ws://127.0.0.1:8787/ws` |
| Backend schnell starten | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| Skriptgesteuertes Setup + Start | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

## 🔌 Start-Standardwerte

| Standardwerte | Wert |
|---|---|
| PWA-URL | `http://127.0.0.1:8787/` |
| WebSocket-URL | `ws://127.0.0.1:8787/ws` |
| Backend-Host/Port | `127.0.0.1:8787` |

## Inhaltsverzeichnis

- [Übersicht](#-übersicht)
- [Funktionen](#-funktionen)
- [Architektur auf einen Blick](#-architektur-auf-einen-blick)
- [Projektstruktur](#️-projektstruktur)
- [At-a-Glance Navigation](#at-a-glance-navigation)
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
- [Roman-Einstellungen (separat von UI-Sprache)](#️-roman-einstellungen-separat-von-ui-sprache)
- [Beispiele](#-beispiele)
- [Entwicklungshinweise](#️-entwicklungshinweise)
- [Testnotizen](#️-testnotizen)
- [Inhaltsübersicht des Repos](#-repository-inhalte)
- [Fehlerbehebung](#-fehlerbehebung)
- [Roadmap](#️-roadmap)
- [Mitmachen](#-mitmachen)
- [Support](#-support)
- [Lizenz](#-lizenz)

## 📌 Übersicht

AutoNovelWriter bietet eine lokale Orchestrierungs-Schicht für:
- das Bearbeiten eines kanonischen Pipeline-Skripts (`pipeline.script`) über Quelltext und Block-UI,
- den fortsetzbaren Ausführungsmodus mit gespeichertem Cursor und Aktionsresultaten,
- das Verwalten von Projekten, Materialien, Ausgaben, Task-Batches und Action-Templates,
- sowie Live-Updates via WebSocket (`/ws`) an die PWA.

Der veränderbare (mutable) Runtime-Root ist `autonovelwriter/runtime/` (Inhalt ist in `.gitignore`).

| Bereich | Funktion |
|---|---|
| Pipeline-Erstellung | Kanonisches Skript + verschachtelte Block-UI aus einer gemeinsamen Source of Truth |
| Ausführung | Fortsetzbarer Runner mit gespeichertem Cursor und Aktionsresultaten |
| Projekt-Operationen | Projektspezifische Materialien, Ausgaben, Einstellungen und Batch-Aktivierung |
| Realtime-UX | `/ws`-Events für Status, Logs, Ausgaben, Tasks, Actions |

## ✨ Funktionen

- Scratch-ähnlicher Pipeline-Editor, gestützt durch ein kanonisches Skript + Parser/AST.
- Runner-Kontroll-APIs (`start/pause/resume/stop`) mit fortsetzbarem Zustand.
- Kontrollfluss-Container: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Action Library mit Standardvorlagen + Copy-on-Edit-Nutzerübernahmen.
- Projektbezogene Roman-Settings-Overrides mit Vererbung.
- Task-Batch-Flow für Generierung/Index/Details/Aktivierung von `FOREACH_TASK`.
- Indexierung der Outputs und Endpunkte für die neueste Roman-PDF-Vorschau.
- Eingebettete PWA-I18N-Wörterbücher (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- tmux-Helferskripte und ein fortsetzbarer Codex-Auto-Dev-Treiber.

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
  ├─ fortsetzbarer Runner + Action-Result-Commit-Log
  └─ Runtime-Bootstrap (Verzeichnisse + Defaults)
          │
          ▼
autonovelwriter/runtime/ (mutable, local-first)
  ├─ state/ (pipeline, settings, runner, chat)
  ├─ projects/<id>/ (materials, outputs, project settings)
  ├─ tasks/ (active list + generated batches)
  ├─ actions/ (defaults + user overrides)
  └─ logs/ (runner.log)
```

## 🗂️ Projektstruktur

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # AutoAppDev Submodul-Definition
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # Haupteinstiegspunkt Backend + API/WS-Handler + Runner-Logik
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # Backend Unit-Tests
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # UI-Logik + eingebettete i18n-Wörterbücher
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # veränderlicher Runtime-State/IO (gitignored)
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
| Python `3.11+` | Ja | Empfohlene Baseline |
| `pip` | Ja | Installiert Backend-Abhängigkeiten |
| `tmux` | Nein | Für das Multi-Pane-Launcher-Skript benötigt |
| `conda` | Nein | Optionale Hilfsskripte |
| `node` | Nein | Optional für das direkte Ausführen der PWA-Testdatei |

## 🚀 Installation

| Pfad | Gut geeignet für | Befehl |
|---|---|---|
| Option A | Du verwendest conda und willst ein Repo-Setup nutzen | `scripts/setup_conda_env.sh --name autonovelwriter` |
| Option B | Du willst Setup + Start in einem Schritt | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| Option C | Du willst manuelle pip-Kontrolle | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### Option A: Conda-Helfer (für dieses Repo empfohlen)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Danach mit tmux starten:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B: Ein-Schritt-Setup + Start

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
| Optional statische PWA | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| tmux Launcher | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### Schnellstart (ohne tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# open http://127.0.0.1:8787/
```

### Entwicklungslauf (Backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

Das Backend stellt standardmäßig die statischen PWA-Assets aus `autonovelwriter/pwa/` bereit, sodass du öffnen kannst:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Optional: PWA (separater statischer Dev-Server):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

Öffne die PWA unter `http://127.0.0.1:5173` und verweise sie auf das Backend (Standard: `ws://127.0.0.1:8787/ws`).

tmux (beide Panes + Log-Tail starten):

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda-Umgebungs-Helfer:

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Das Treiberskript des Repos (`scripts/auto-autonovelwriter-development.sh`) kann während Auto-Dev ebenfalls eine tmux-Session starten.

### Typischer Workflow

1. Backend starten (oder tmux-Helfer).
2. PWA öffnen.
3. Pipeline über Blöcke und/oder Script-Textarea bearbeiten.
4. Pipeline prüfen/speichern.
5. Runner starten und Logs/Status/Events überwachen.
6. Generierte Outputs/Task-Batches prüfen.

## ⚙️ Konfiguration

### Umgebungsvariablen

Nutze `autonovelwriter/backend/.env.example` als Vorlage. Schlüsselvariablen für Backend/Runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (Default: `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (Default: `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (Default: `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (CLI-Default: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (Default: Parent des Repo-Roots)
- `AUTONOVELWRITER_WRITER_SCRIPT` (Default `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (Default `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (Default `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (Agent-Ausführungs-Gate, standardmäßig deaktiviert)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (optionale `codex`-Binary-Überschreibung)

### Skript-CLI-Optionen

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

| API-Gruppe | Primäre Endpunkte |
|---|---|
| Health & Settings | `/api/health`, `/api/settings` |
| Projekte & Projekteinstellungen | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| Tasks | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| Actions | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| Runner | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| Outputs & Romanvorschau | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| Realtime | `/ws` |

### HTTP-APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projekte: `GET /api/projects`, `POST /api/projects/active`
- Projekteinstellungen (aktives Projekt): `GET/POST /api/projects/settings` (Projekt-Overrides mit Vererbung: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (aktives Projekt): `GET /api/materials/index`
- Outputs-Index (aktives Projekt): `GET /api/outputs/index`
- Task-Batch-Index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task-Batch-Details: `GET /api/tasks/batches/<batch_id>`
- Task-Batch aktivieren: `POST /api/tasks/batches/<batch_id>/activate` (schreibt `runtime/tasks/tasks.json` und projektbezogenes `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (Copy-on-Edit-Aktualisierung für Defaults)
- Pipeline (kanonisches Skript + abgeleitetes JSON): `GET/POST /api/pipeline`
- Pipeline validieren (nur Vorschau): `POST /api/pipeline/validate`
- Referenz-Writer-Pipeline-Vorschau/Laden:
  - `GET /api/pipeline/reference_writer` (liest und parst `../scripts/auto-xiyouzhiyuan-writer.sh` als Referenz)
  - `POST /api/pipeline/reference_writer/load` (lädt geparste Ergebnisse in die Runtime-Pipeline; verändert nie das Quellskript)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Neuestes Roman-PDF:
  - `GET /api/novel/latest` (Metadaten)
  - `GET /api/novel/latest/pdf` (inline PDF-Stream für den Viewer)
- Runner-Steuerung: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent-Test (gegated): `POST /api/agent/test` (führt nur `codex --version` aus, wenn Gate aktiviert + env gesetzt)

### WebSocket

- Endpunkt: `/ws`
- Broadcast-Events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 Runtime-Pfade

Alle veränderlichen Runtime-Daten und I/O leben unter `autonovelwriter/runtime/`:

| Pfad | Zweck |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (`.txt`/`.md` ablegen) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (Backend schreibt Chat-Nachrichten) |
| `autonovelwriter/runtime/state/` | persistierter JSON-Status (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | SQLite-Chat-Spiegelung (zusätzlich zu `chat.jsonl`) |
| `autonovelwriter/runtime/state/active_project.json` | persistierter Zeiger auf aktives Projekt |
| `autonovelwriter/runtime/tasks/` | Dateien der Task-Queue |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | generierte Task-Batches (z. B. aus `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | Logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | Projektmaterialien (Inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | Projektoutputs (Drafts/Exporte) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | projektbezogene Overrides für Romaneinstellungen (z. B. Roman-Sprache) |
| `autonovelwriter/runtime/actions/defaults/` | vordefinierte Action-Library-Templates (als unveränderlich behandelt) |
| `autonovelwriter/runtime/actions/user/` | nutzerspezifische Action-Library-Templates (per Copy-on-Edit erstellt) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | gespiegelte Chat-Eingaben für Writer-Pipeline-Ingestion |

## 🧩 Pipeline-Skript (kanonisches Artefakt)

Die Pipeline ist als formatiertes Skript auf der Platte gespeichert:
- `autonovelwriter/runtime/state/pipeline.script`

Das Backend liefert sie über `GET/POST /api/pipeline` als:
- `script` (kanonisch, shell-ähnliche `STEP <type>` / `DISABLED <type>`-Zeilen)
- `pipeline` JSON (abgeleitet, abgeflachte Liste für einfache Blockdarstellung)
- `pipeline_ast` (abgeleitet, geschachtelte Struktur für Schleifen + Einrückungs-UI)

Der Runner führt Schritte aus, die aus demselben v2-Parser/AST abgeleitet sind, sodass die PWA-Anzeige exakt dem Lauf entspricht.

Runner-Steuerfluss unterstützt v2-Container:
- `ROUND <n>` wiederholt seine Kinder `n`-mal.
- `FOREACH_TASK` führt seine Kinder je Task in der aktiven Task-Liste einmal aus (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` führt seine Kinder je Eintrag in `payload.actions` des aktuellen Tasks aus (sollte typischerweise unter `FOREACH_TASK` verschachtelt sein).

Fortsetzbarkeit:
- Der Runner speichert einen fortsetzbaren Ausführungscursor in `autonovelwriter/runtime/state/runner_state.json`.
- Der Cursor wird nur nach erfolgreichem Abschluss eines Blocks vorwärts gesetzt (damit Restarts unfertige Schritte nicht überspringen).
- Wenn das kanonische Pipeline-Skript geändert wird (Hash-Mismatch), stoppt der Runner und benötigt einen Neustart (Cursor wird ungültig).
- Der Runner speichert pro Schritt `ActionResult`-Datensätze in `autonovelwriter/runtime/state/action_results.jsonl` und verwendet eine deterministische `exec_id` pro Schritt, um bereits commitete Resultate bei Restart nicht doppelt zu schreiben.
- Beim Laufen innerhalb von `FOREACH_ACTION` enthalten ActionResults `action_index`, `action_id_ref` und `action_key`, und Variablen enthalten `prev` sowie explizite Scopes `task.prev` vs. `action.prev`.

Pipeline-Skript v2 unterstützt Schachtelung:
- `LOOP <n>` führt einen Loop-Container ein.
- `ROUND <n>` führt einen Runden-Container ein.
- `FOREACH_TASK` führt einen pro-Task-Container ein.
- `FOREACH_ACTION` führt einen pro-Action-Container ein (Runner iteriert `task.payload.actions`).
- `IF <expr>` führt einen bedingten Container ein (Parse/Render; Runner führt derzeit nur den Then-Branch aus).
- `ELSE` führt einen optionalen Alternativ-Zweig unter einem `IF` ein.
- Kinder sind pro Ebene um 2 Leerzeichen eingerückt.

Validierung (ohne Persistierung):
- `POST /api/pipeline/validate` liefert eine kanonische Vorschau plus `pipeline_ast`, Warnungen und Fehler.

Die PWA zeigt das Skript in einer Textarea (Source of Truth) und rendert verschachtelte Blöcke aus `pipeline_ast`.
Wenn der Backend-Validierungsendpunkt nicht erreichbar ist, fällt die PWA auf einen lokalen Parser zurück, der dieselben v2-Verben unterstützt (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Hinweise zur Blocks-UI:
- Die Wiederholungszahlen von `LOOP` und `ROUND` sind in der Blockliste direkt bearbeitbar; gültige Änderungen aktualisieren sofort die kanonische Skript-Textarea.
- Die Block-Symbolleiste kann `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION` und `IF`-Container einfügen (ohne händisches Bearbeiten des Skripts): entweder um den ausgewählten Block wickeln, oder einen gültigen nicht-leeren Container anhängen.
- Blöcke können auf der Canvas gelöscht werden (Delete-Button je Block; Taste `Delete`, wenn ein Block ausgewählt ist). Containerlöschungen splicen Kinder nach oben, und der Editor hält Container nicht leer, um ungültige Skripte zu vermeiden.
- `IF`-Blöcke bleiben strukturell gültig im Editor: `ELSE` kann nicht außerhalb von `IF` bestehen bleiben, und der Then-Branch bleibt nicht leer.
- `STEP`-Blöcke zeigen Action-Library-Steuerelemente: Action-Selector, `Customize` (kopiert eine Default-Action in eine User-Action und wechselt dorthin) und `Edit` (Action-Editor-Modal für `name/tool/prompt/script`).

## 📝 Runner-Ausgaben (Draft-Stub)

Wenn die Pipeline einen `STEP write`-Block enthält, erstellt der Backend-Runner eine Entwurfsdatei unter:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Der Backend-Runner sendet außerdem:
- WS-Event `output_created` mit `path` und `project_rel_path`
- Eine Logzeile `[output] created: ...`

Die PWA enthält ein minimales Outputs-Panel, das Dateien über `GET /api/outputs/index` listet und bei `output_created` aktualisiert.

## 📦 Runner-Aufgaben (Batch-Stub)

Wenn die Pipeline einen `STEP meta_tasks_generate`-Block enthält, erstellt der Backend-Runner einen Task-Batch-Stub unter:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Der Backend-Runner sendet außerdem:
- WS-Event `tasks_batch_created` mit `batch_dir`, `tasks_jsonl` und `task_count`
- Eine Logzeile `[tasks] created batch: ...`

Die PWA enthält ein minimales Task-Batches-Panel, das Batches via `GET /api/tasks/batches/index` listet und bei `tasks_batch_created` aktualisiert.
Sie kann außerdem Batch-Details anzeigen (`GET /api/tasks/batches/<batch_id>`) und einen Batch aktivieren, damit er zur aktuellen Task-Liste für `FOREACH_TASK` wird (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 Agent-Einstellungen / Codex-Gate

Das PWA-Settings-Panel speichert Agent-Einstellungen über `/api/settings` in `autonovelwriter/runtime/state/settings.json`.

Aus Sicherheitsgründen startet das Backend den `codex`-CLI nicht, außer wenn beide Bedingungen erfüllt sind:
- `settings.agent.enabled=true` und `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` ist in der Umgebung gesetzt

Geheimnisse niemals committen. Nutze `autonovelwriter/backend/.env.example` als Vorlage für lokale Umgebungsvariablen.

## 🌐 PWA-I18N (UI-Sprache)

Die PWA hat ein leichtgewichtiges integriertes I18N-System.

- UI-Sprache erzwingen: `?lang=<code>` an die PWA-URL hängen (z. B. `?lang=ja`).
- Persistenz pro Browser in localStorage: `anw_lang`.
- Unterstützte UI-Sprachen: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- Repository-weite lokalisierten READMEs liegen in `i18n/` und sind über die einzelne Sprachlink-Zeile oben verknüpft.

| Locale-Dateien (`i18n/`) | Status |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | Vorhanden |

## 🖋️ Roman-Einstellungen (separat von UI-Sprache)

Schreibeinstellungen werden im Backend in `settings.novel.*` gespeichert unter:
- `autonovelwriter/runtime/state/settings.json`

Sie sind bewusst getrennt von der PWA-UI-Sprache (`?lang=` / `anw_lang`).

Projektbezogene Overrides liegen unter:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Aktuelle globale Felder (im PWA-Settings-Modal editierbar):
- `settings.novel.language` (BCP-47-ähnliche Codes wie `en`, `ja`, `zh-Hans` usw.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Aktuelle projektbezogene Override-Felder (leer/ungesetzt = vererben global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 Beispiele

### Minimaler lokaler Lauf

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### tmux-Lauf ohne Auto-Attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Backend-Testdateien direkt ausführen

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### PWA-Logik-Testdatei direkt ausführen

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Skript-Automations-Helferbeispiel

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

`scripts/auto-autonovelwriter-development.sh` führt einen fortsetzbaren Codex-gesteuerten Loop über Aufgaben in `references/autonovelwriter_dev/` aus und commit/push nach jeder Stage (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

Nützliche Steuerungen:
- Stoppe nach aktuellem Task: `touch references/autonovelwriter_dev/STOP`
- State-Tracking zurücksetzen (Queue bleibt erhalten): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Neue Codex-Session starten: `scripts/auto-autonovelwriter-development.sh --new-session`
- Best Practice: in sauberem Branch/Worktree arbeiten und `references/autonovelwriter_dev/state.tsv` prüfen, bevor neu gestartet wird

### Betriebsannahmen

- Dieses README geht von lokaler Entwicklung unter Linux/macOS mit `bash` und Python 3.11+ aus.
- Runtime-Zustand unter `autonovelwriter/runtime/` ist veränderbar und erwartet nicht versioniert zu werden.
- Das Pipeline-Verhalten hier spiegelt die aktuelle In-Repo-Implementierung in `autonovelwriter/backend/server.py` und `autonovelwriter/pwa/app.js` wider.

## 🧪 Testnotizen

Es gibt aktuell keinen Top-Level `Makefile`/`tox`/`npm test`-Orchestrator in diesem Repo.

Praktische Test-Einstiegspunkte:

| Bereich | Einstiegspunkt |
|---|---|
| Backend Parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Backend foreach-action Syntax | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Backend runner semantics | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Backend action library update | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| PWA AST delete behavior | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (einzelne Dateien ausführen)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

Wenn du Runner-Semantik, Pipeline-Syntax oder Action-Library-Verhalten änderst, aktualisiere Tests und README/API-Hinweise im selben Schritt.

## 📚 Repository-Inhalte

- `docs/autonovelwriter_spec.md`: Produktspezifikation für den Scratch-ähnlichen Controller (Chat + Ordner-Pipe + Start/Pause/Stop + Einstellungen).
- `scripts/auto-autonovelwriter-development.sh`: Auto-Entwicklung der AutoNovelWriter-App selbst (Task-Loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: Bilinguale (EN/ZH)-Philosophie und Anforderungen für einen langlebigen, fortsetzbaren Auto-Development-Agenten.
- `docs/ORDERING_RATIONALE.md`: Beispiel für Reihenfolgenbegründung in screenshot-gesteuerten Schritten.
- `scripts-legacy/`: Ältere Automatisierungsskripte als Referenz, werden von AutoNovelWriter aber nicht mehr genutzt.
- `examples/ralph-wiggum-example.sh`: Beispiel für einen Codex-CLI-Automationshelfer.

Weitere Entwicklerhinweise:
- Backend-Tests befinden sich in `autonovelwriter/backend/tests/`.
- Eine kleinere PWA-Verhaltenstestsuite liegt in `autonovelwriter/pwa/tests/`.
- `i18n/` ist mit lokalisierten Repository-READMEs befüllt, während UI-Übersetzungswörterbücher in `autonovelwriter/pwa/app.js` eingebettet sind.

## 🧯 Fehlerbehebung

| Symptom | Was prüfen |
|---|---|
| `tmux not found in PATH` | tmux installieren oder Backend/Static-Server manuell starten. |
| `conda not found in PATH` bei Nutzung von `--env`-Skripten | Miniconda/Anaconda installieren oder Conda überspringen und `pip` manuell installieren. |
| PWA kann nicht zum Backend verbinden | Backend-Adresse/Port und WebSocket-Endpunkt `ws://<host>:<port>/ws` prüfen. |
| `POST /api/agent/test` liefert gated/disabled | Sicherstellen, dass sowohl `settings.agent.enabled=true`, `settings.agent.sdk="codex"` als auch `AUTONOVELWRITER_ENABLE_CODEX=1` gesetzt sind. |
| Pipeline-Runner stoppt nach Skriptänderung | Erwartetes Verhalten: Cursor wird bei Hash-Mismatch des Pipeline-Skripts invalidiert und benötigt Neustart. |
| Statische PWA auf `:5173` funktioniert, API-Aufrufe schlagen fehl | Sicherstellen, dass das Backend auf `:8787` läuft (oder App/Backend-Ziele entsprechend anpassen). |

## 🗺️ Roadmap

- Verbleibende Auto-Dev-Queue-Items vollständig umsetzen und stabilisieren (siehe Progress-Block oben).
- Repository-weite README-Lokalisierungen in `i18n/` ausbauen und synchron halten.
- Automatisierte Testabdeckung für Runner-Edge-Cases und PWA-Interaktionen erweitern.
- Action Library und Task-/Action-Iterations-Workflows weiter verbessern.

## 🤝 Mitwirken

Beiträge sind willkommen.

Pragmatische Leitlinien für dieses Repo:
- Starte mit `docs/autonovelwriter_spec.md` und `docs/auto-development-guide.md`.
- Halte Runtime-Mutationen unter `autonovelwriter/runtime/` (Inhalte sind gitignored), nicht in versionierten Dateien.
- Bevorzuge inkrementelle PRs mit reproduzierbaren Run-/Test-Kommandos.
- Wenn du Pipeline-Semantik oder API-Verträge änderst, aktualisiere README und zugehörige Tests gemeinsam.

Hinweis: Eine dedizierte `CONTRIBUTING.md` wurde zum Zeitpunkt dieses Entwurfs im Repo-Root nicht gefunden.

---

## 📄 Lizenz

Die Lizenzdatei oder der Lizenzstatus ist im Repository-Root in diesem Kontext nicht explizit angegeben.

Annahme-Hinweis:
- Falls du eine klare Open-Source-Weiterverbreitung beabsichtigst, füge eine `LICENSE`-Datei auf Top-Level hinzu und passe diesen Abschnitt entsprechend an.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
