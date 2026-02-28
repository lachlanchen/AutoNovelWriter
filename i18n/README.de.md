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

Scratch-ähnliche PWA + Tornado-Backend zur Steuerung einer automatisierten Pipeline für Romanerstellung (und App-Entwicklung).

Dieses Repository enthält außerdem `AutoAppDev/` als Submodul (wiederverwendbare Auto-Development-Skripte).

## Überblick

AutoNovelWriter bietet eine lokale Orchestrierungsschicht für:
- Das Bearbeiten eines kanonischen Pipeline-Skripts (`pipeline.script`) sowohl als Quelltext als auch über eine Block-UI.
- Die ausfallsichere/resumable Backend-Ausführung mit persistiertem Cursor und Action-Ergebnissen.
- Die Verwaltung von Projekten, Materialien, Outputs, Task-Batches und Action-Templates.
- Live-Updates per WebSocket (`/ws`) an die PWA.

Die kanonische veränderbare Runtime ist `autonovelwriter/runtime/` (gitignored).

| Bereich | Funktion |
|---|---|
| Pipeline-Authoring | Kanonisches Skript + verschachtelte Block-UI aus einer gemeinsamen Single Source of Truth bearbeiten |
| Ausführung | Resumable Runner mit persistiertem Cursor und Action-Ergebnissen |
| Projektbetrieb | Projektbezogene Materialien, Outputs, Einstellungen und Task-Batch-Aktivierung |
| Realtime-UX | `/ws`-Events für Status/Logs/Output/Tasks/Actions |

## Features

- Scratch-ähnlicher Pipeline-Editor auf Basis eines kanonischen Skripts + Parser/AST.
- Runner-Control-APIs (`start/pause/resume/stop`) mit resumable State.
- Control-Flow-Container: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Action Library mit Standard-Templates + Copy-on-Edit-Benutzer-Overrides.
- Projektbezogene Novel-Settings-Overrides mit Inherit-Semantik.
- Task-Batch-Flow für Generierung/Index/Details/Aktivierung für `FOREACH_TASK`.
- Output-Indexierung und Endpunkte zur Vorschau des neuesten Roman-PDF.
- Integrierte PWA-i18n-Dictionaries (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- tmux-Helper-Skripte und ein resumable Codex-Auto-Dev-Driver.

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
├── i18n/                          # present (currently no files)
└── AutoAppDev/                    # linked companion project
```

## ✅ Voraussetzungen

| Abhängigkeit | Erforderlich | Hinweise |
|---|---|---|
| Python `3.11+` | Ja | Empfohlene Basis |
| `pip` | Ja | Installiert Backend-Abhängigkeiten |
| `tmux` | Nein | Für das Multi-Pane-Launcher-Skript nötig |
| `conda` | Nein | Optionale Helper-Skripte |
| `node` | Nein | Optional, um PWA-Testdateien direkt auszuführen |

## ⚙️ Installation

### Option A: Conda-Helper (für dieses Repository empfohlen)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Dann mit tmux starten:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Option B: Einmaliges Setup + Start

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Option C: Manuelle pip-Installation

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

## 🚀 Nutzung

## Dev-Run (Backend + PWA)

Backend (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

Das Backend liefert standardmäßig auch die statischen PWA-Assets aus `autonovelwriter/pwa/` aus. Du kannst also öffnen:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Optional: PWA (separater statischer Dev-Server):
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

Öffne die PWA unter `http://127.0.0.1:5173` und verbinde sie mit dem Backend (Standard `ws://127.0.0.1:8787/ws`).

tmux (startet beide Panes + Log-Tail):
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda-Env-Helper:
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Das Driver-Skript des Repos (`scripts/auto-autonovelwriter-development.sh`) kann während Auto-Dev ebenfalls eine tmux-Session starten.

### Typischer Workflow

1. Backend starten (oder tmux-Helper verwenden).
2. PWA öffnen.
3. Pipeline über Blocks und/oder Script-Textarea bearbeiten.
4. Pipeline validieren/speichern.
5. Runner starten und Logs/Status/Events beobachten.
6. Generierte Outputs/Task-Batches prüfen.

## 🧠 Runtime-Pfade

Alle veränderbaren Zustände und IO liegen unter `autonovelwriter/runtime/` (von git ignoriert):

| Pfad | Zweck |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (lege `.txt`/`.md` ab) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (Backend schreibt Chat-Nachrichten) |
| `autonovelwriter/runtime/state/` | persistierter JSON-State (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite-Chat-Spiegel (zusätzlich zu chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | persistierter Zeiger auf das „aktive Projekt“ |
| `autonovelwriter/runtime/tasks/` | Task-Queue-Dateien |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | generierte Task-Batches (z. B. aus `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | Logs |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | Projektmaterialien (Inputs) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | Projektausgaben (Entwürfe/Exporte) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | projektbezogene Novel-Writing-Settings-Overrides (z. B. Novel-Sprache) |
| `autonovelwriter/runtime/actions/defaults/` | initialisierte Standard-Templates der Action Library (werden als unveränderlich behandelt) |
| `autonovelwriter/runtime/actions/user/` | Benutzer-Templates der Action Library (entstehen via Copy-on-Edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | gespiegelte Chat-Inputs für die Ingestion in der Writer-Pipeline |

## 🧩 Pipeline-Skript (kanonisches Artefakt)

Die Pipeline wird als formatiertes Skript auf der Festplatte dargestellt:
- `autonovelwriter/runtime/state/pipeline.script`

Das Backend liefert es über `GET/POST /api/pipeline` als:
- `script` (kanonisch, shell-ähnliche Zeilen `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (abgeleitet, abgeflachte Liste für einfaches Block-Rendering)
- `pipeline_ast` (abgeleitet, verschachtelte Struktur für Loops + Einrückungs-UI)

Der Runner führt Schritte aus, die aus demselben v2-Parser/AST abgeleitet sind. Dadurch entspricht das, was die PWA anzeigt, dem tatsächlich Ausgeführten.
Der Runner-Control-Flow unterstützt v2-Container:
- `ROUND <n>` wiederholt seine Kinder `n`-mal.
- `FOREACH_TASK` führt seine Kinder einmal pro Task in der aktiven Task-Liste aus (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` führt seine Kinder einmal pro Eintrag in der `payload.actions`-Liste des aktuellen Tasks aus (gedacht zur Verschachtelung unter `FOREACH_TASK`).

Resumability:
- Der Runner persistiert einen wiederaufnehmbaren Ausführungscursor in `autonovelwriter/runtime/state/runner_state.json`.
- Der Cursor rückt erst weiter, nachdem ein Block erfolgreich abgeschlossen wurde (damit Neustarts keine unfertige Arbeit überspringen).
- Wenn sich das kanonische Pipeline-Skript ändert (Hash-Mismatch), stoppt der Runner und verlangt einen Neustart (Cursor wird invalidiert).
- Der Runner persistiert pro Schritt `ActionResult`-Einträge in `autonovelwriter/runtime/state/action_results.jsonl` und verwendet eine deterministische `exec_id` pro Schritt, um bereits bestätigte Ergebnisse bei Neustarts nicht zu duplizieren.
  - Beim Ausführen innerhalb von `FOREACH_ACTION` enthalten ActionResults `action_index`, `action_id_ref` und `action_key`, und Vars enthalten `prev` plus explizite Scopes `task.prev` vs `action.prev`.

Pipeline-Skript v2 unterstützt Verschachtelung:
- `LOOP <n>` führt einen Loop-Block ein
- `ROUND <n>` führt einen „Rounds“-Containerblock ein
- `FOREACH_TASK` führt einen Pro-Task-Containerblock ein
- `FOREACH_ACTION` führt einen Pro-Action-Containerblock ein (Runner iteriert `task.payload.actions`)
- `IF <expr>` führt einen bedingten Containerblock ein (Parse/Render; Runner führt derzeit nur den Then-Branch aus)
- `ELSE` führt einen optionalen Alternativzweig unter einem `IF`-Block ein
- Kinder werden pro Ebene mit 2 Leerzeichen eingerückt

Validierung (ohne Persistenz):
- `POST /api/pipeline/validate` liefert eine kanonische Vorschau plus `pipeline_ast`, Warnings und Errors zurück.

Die PWA zeigt das Skript in einer Textarea (Source of Truth) und rendert verschachtelte Blöcke aus `pipeline_ast`.
Wenn der Backend-Validate-Endpunkt nicht erreichbar ist, fällt die PWA auf einen lokalen Parser zurück, der dieselben v2-Verben unterstützt (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Hinweise zur Blocks-UI:
- Wiederholungsanzahlen von `LOOP` und `ROUND` sind inline in der Blockliste editierbar; gültige Änderungen aktualisieren sofort die kanonische Script-Textarea.
- Die Blocks-Toolbar kann `LOOP`-, `ROUND`-, `FOREACH_TASK`-, `FOREACH_ACTION`- und `IF`-Container ohne manuelle Script-Bearbeitung einfügen (wrappt den ausgewählten Block oder hängt einen gültigen, nicht-leeren Container an).
- Blöcke können aus dem Canvas gelöscht werden (Delete-Button pro Block; Taste `Delete`, wenn ein Block ausgewählt ist). Beim Löschen von Containern werden Kinder nach oben gespliced, und der Editor hält Container nicht-leer, um ungültige Skripte zu vermeiden.
- `IF`-Blöcke bleiben im Editor strukturell gültig: `ELSE` kann nicht außerhalb eines `IF` bestehen bleiben, und der Then-Branch bleibt nicht leer.
- `STEP`-Blöcke bieten Action-Library-Steuerung: Action-Selector, `Customize` (kopiert eine Default-Action in eine User-Action und wechselt dorthin) und `Edit` (Action-Editor-Modal für `name/tool/prompt/script`).

## 🔧 Konfiguration

### Umgebungsvariablen

Nutze `autonovelwriter/backend/.env.example` als Vorlage. Wichtige vom Backend/Runtime genutzte Variablen:

- `AUTONOVELWRITER_RUNTIME_ROOT` (Standard `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (Standard `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (Standard `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (Standard `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (Standard: Parent des Repo-Roots)
- `AUTONOVELWRITER_WRITER_SCRIPT` (Standard `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (Standard `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (Standard `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (Agent-Ausführungs-Gate, standardmäßig deaktiviert)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (optional, überschreibt den Codex-Binary-Pfad)

## 🌐 Wichtige Backend-APIs

### HTTP-APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (aktives Projekt): `GET/POST /api/projects/settings` (projektbezogene Overrides mit Inherit-Semantik: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials-Index (aktives Projekt): `GET /api/materials/index`
- Outputs-Index (aktives Projekt): `GET /api/outputs/index`
- Task-Batches-Index: `GET /api/tasks/batches/index` (optional: `?project=<project_id>`)
- Task-Batch-Details: `GET /api/tasks/batches/<batch_id>`
- Task-Batch aktivieren: `POST /api/tasks/batches/<batch_id>/activate` (schreibt `runtime/tasks/tasks.json` und projektbezogenes `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (Copy-on-Edit-Update für Defaults)
- Pipeline (kanonisches Skript + abgeleitetes JSON): `GET/POST /api/pipeline`
- Pipeline-Validierung (nur Vorschau): `POST /api/pipeline/validate`
- Vorschau/Laden der Referenz-Writer-Pipeline:
  - `GET /api/pipeline/reference_writer` (liest und parst `../scripts/auto-xiyouzhiyuan-writer.sh` als Referenz)
  - `POST /api/pipeline/reference_writer/load` (lädt das Parsing-Ergebnis in die Runtime-Pipeline; bearbeitet nie das Quellskript)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Neuestes Roman-PDF:
  - `GET /api/novel/latest` (Metadaten)
  - `GET /api/novel/latest/pdf` (inline PDF-Stream für den Viewer)
- Runner-Control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent-Test (gated): `POST /api/agent/test` (führt nur `codex --version` aus, wenn aktiviert + per Env freigeschaltet)

### WebSocket

- Endpunkt: `/ws`
- Broadcast-Events: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Runner-Outputs (Draft-Stub)

Wenn die Pipeline einen `STEP write`-Block enthält, erstellt der Backend-Runner eine Stub-Entwurfsdatei unter:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Zusätzlich emittiert das Backend:
- WS-Event `output_created` mit `path` und `project_rel_path`
- eine `log`-Zeile `[output] created: ...`

Die PWA enthält ein minimales Outputs-Panel, das Dateien über `GET /api/outputs/index` auflistet und bei `output_created` aktualisiert.

## 📦 Runner-Tasks (Batch-Stub)

Wenn die Pipeline einen `STEP meta_tasks_generate`-Block enthält, erstellt der Backend-Runner einen Stub-Task-Batch unter:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Das Backend emittiert:
- WS-Event `tasks_batch_created` mit `batch_dir`, `tasks_jsonl` und `task_count`
- eine `log`-Zeile `[tasks] created batch: ...`

Die PWA enthält ein minimales Task-Batches-Panel, das Batches über `GET /api/tasks/batches/index` auflistet und bei `tasks_batch_created` aktualisiert.
Sie kann außerdem Batch-Details anzeigen (`GET /api/tasks/batches/<batch_id>`) und einen Batch aktivieren, damit er die aktuelle Task-Liste für `FOREACH_TASK` wird (`POST /api/tasks/batches/<batch_id>/activate`).

## 🤖 Agent-Einstellungen / Codex-Gate

Das PWA-Settings-Panel persistiert Agent-Einstellungen via `/api/settings` in `autonovelwriter/runtime/state/settings.json`.

Aus Sicherheitsgründen startet das Backend die `codex`-CLI nur, wenn beides erfüllt ist:
- `settings.agent.enabled=true` und `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` ist in der Umgebung gesetzt

Niemals Secrets committen. Nutze `autonovelwriter/backend/.env.example` als Vorlage für lokale Env-Variablen.

## 🌍 PWA I18N (UI-Sprache)

Die PWA hat ein leichtgewichtiges, eingebautes i18n-System.

- UI-Sprache erzwingen: `?lang=<code>` an die PWA-URL anhängen (z. B. `?lang=ja`).
- Pro Browser in localStorage gespeichert: `anw_lang`.
- Unterstützte UI-Sprachen: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## 📚 Novel-Settings (getrennt von UI-Sprache)

Präferenzen für das Roman-Schreiben werden in den Backend-Einstellungen unter `settings.novel.*` gespeichert in:
- `autonovelwriter/runtime/state/settings.json`

Diese sind absichtlich **getrennt** von der PWA-UI-Sprache (`?lang=` / `anw_lang`).

Projektbezogene Overrides werden gespeichert unter:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Aktuelle Felder (editierbar im PWA-Settings-Modal):
- `settings.novel.language` (BCP-47-ähnliche Codes wie `en`, `ja`, `zh-Hans` usw.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Aktuelle projektbezogene Override-Felder (leer/nicht gesetzt = vererben global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 Beispiele

### Minimaler lokaler Run

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### tmux-Run ohne Auto-Attach

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

### Beispiel für Skript-Automations-Helper

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

`scripts/auto-autonovelwriter-development.sh` führt einen resumable, Codex-gesteuerten Loop über Tasks unter `references/autonovelwriter_dev/` aus und **wird nach jeder Stage committen/pushen** (plan/implement/debug/fix/i18n/summary/update_readme).

Nützliche Steuerungen:
- Nach dem aktuellen Task stoppen: `touch references/autonovelwriter_dev/STOP`
- State-Tracking zurücksetzen (Queue bleibt erhalten): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Neue Codex-Session starten: `scripts/auto-autonovelwriter-development.sh --new-session`
- Sichere Praxis: in einer sauberen Branch/Worktree laufen lassen und `references/autonovelwriter_dev/state.tsv` vor dem Neustart prüfen.

## 📚 Inhalt

- `docs/autonovelwriter_spec.md`: Produktspezifikation für den Scratch-ähnlichen Controller (Chat + Folder-Pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Entwickelt die AutoNovelWriter-App selbst automatisch (Task-Loop: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md`: Zweisprachige (EN/ZH) Philosophie und Anforderungen für einen langlaufenden, resumable Auto-Development-Agenten.
- `docs/ORDERING_RATIONALE.md`: Beispielbegründung für die Reihenfolge screenshot-getriebener Schritte.
- `scripts-legacy/`: ältere Automationsskripte, aus Referenzgründen behalten, aber nicht von AutoNovelWriter genutzt.
- `examples/ralph-wiggum-example.sh`: Beispielhafter Codex-CLI-Automations-Helper.

### Zusätzliche Hinweise für Entwickler

- Backend-Tests liegen unter `autonovelwriter/backend/tests/`.
- Ein kleiner PWA-Behavior-Test liegt unter `autonovelwriter/pwa/tests/`.
- Das Root-Verzeichnis `i18n/` existiert, ist aktuell aber leer; UI-Übersetzungen sind derzeit in `autonovelwriter/pwa/app.js` eingebettet.

## 🧯 Fehlerbehebung

- `tmux not found in PATH`:
  - tmux installieren oder Backend/Static-Server manuell starten.
- `conda not found in PATH` bei Verwendung von `--env`-Skripten:
  - Miniconda/Anaconda installieren oder conda überspringen und manuell per `pip` installieren.
- PWA kann keine Verbindung zum Backend herstellen:
  - Backend-Adresse/-Port und WebSocket-Endpunkt `ws://<host>:<port>/ws` prüfen.
- `POST /api/agent/test` gibt gated/disabled zurück:
  - Sicherstellen, dass `settings.agent.enabled=true`, `settings.agent.sdk="codex"` und die Umgebung `AUTONOVELWRITER_ENABLE_CODEX=1` enthält.
- Pipeline-Runner stoppt nach Script-Bearbeitung:
  - Erwartetes Verhalten; der Cursor wird bei Pipeline-Skript-Hash-Mismatch invalidiert und ein Neustart ist erforderlich.

## 🧭 Roadmap

- Verbleibende Auto-Dev-Queue-Items abschließen und stabilisieren (siehe generierten Progress-Block oben).
- Externe i18n-Assets auf Repository-Ebene unter `i18n/` ausbauen (derzeit vorhanden, aber leer).
- Automatisierte Testabdeckung für Runner-Edge-Cases und PWA-Interaktionen erweitern.
- Action Library sowie Task/Action-Iterations-Workflows weiter verbessern.

## 🤝 Beitragen

Beiträge sind willkommen.

Pragmatische Leitlinien für dieses Repository:
- Starte mit `docs/autonovelwriter_spec.md` und `docs/auto-development-guide.md`.
- Halte Runtime-Mutationen in `autonovelwriter/runtime/` (gitignored), nicht in versionierten Dateien.
- Bevorzuge inkrementelle PRs mit reproduzierbaren Run-/Test-Kommandos.
- Bei Änderungen an Pipeline-Semantik oder API-Verträgen README und zugehörige Tests gemeinsam aktualisieren.

Hinweis: Eine dedizierte `CONTRIBUTING.md` wurde zum Zeitpunkt dieses Drafts nicht im Repository-Root gefunden.

## ❤️ Sponsor & Spenden

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 Lizenz

Der Lizenzstatus/die Lizenzdatei ist in diesem Draft-Kontext im Repository-Root nicht explizit deklariert.

Annahme-Hinweis:
- Wenn eine klare Open-Source-Weitergabe beabsichtigt ist, füge eine `LICENSE`-Datei auf Top-Level hinzu und aktualisiere diesen Abschnitt entsprechend.
