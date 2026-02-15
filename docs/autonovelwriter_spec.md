# AutoNovelWriter: Product Spec (Scratch-like PWA Controller)

Goal: build a **Scratch-like PWA** that controls an automated novel-writing / app-development pipeline.
The PWA must allow the user to **interrupt** and “chip in” ideas during execution via **chat** and via a
folder-based **inbox/outbox**. The system must be resumable, observable, and operable.

## 0) Core Concepts
- **In-app pipelines (user-controlled)**:
  - **Novel pipeline**: plan -> write -> multi-aspect critique/fix -> summary/log -> commit/push.
  - **App-dev pipeline**: plan -> implement -> debug -> fix -> summary/log -> commit/push.
- **Driver stages (developer-controlled)**: this repository uses `scripts/auto-autonovelwriter-development.sh`
  to build the app using `plan -> implement -> debug -> fix -> summary -> commit+push`. Do not conflate this
  with the in-app pipelines above.
- **Pipeline Script (formatted shell-ish text)**:
  - The app must support importing a pipeline script written by other agents/tools.
  - The app must visualize that script as Scratch-like blocks (tasks/steps/actions).
  - The app must generate/export a formatted script from the block representation.

## 1) UI (Scratch-like)
- Light theme by default (no dark-first UI).
- Drag & drop “blocks” that form a pipeline (pipeline templates are built-in and editable).
- A Script panel:
  - shows the formatted pipeline script (source of truth for long-running automation)
  - `Parse Script -> Blocks` and `Render Blocks -> Script`
  - import/export script files
- Blocks are composable; users can reorder, insert, disable, and loop.
- A “while loop” mode: when the current batch finishes, generate the next batch of tasks automatically until stopped.

## 2) Chat + Folder Pipe
- A dedicated workspace folder structure:
  - `autonovelwriter/runtime/io/inbox/` (user -> system)
  - `autonovelwriter/runtime/io/outbox/` (system -> user)
  - `autonovelwriter/runtime/logs/`
  - `autonovelwriter/runtime/state/`
  - `autonovelwriter/runtime/tasks/`
- Backend monitors inbox changes (polling is OK initially); UI shows chat in real-time (WebSocket).

## 3) Start/Stop/Pause + Settings
- UI buttons: Start / Pause / Resume / Stop.
- Settings:
  - Agent SDK selection: codex / copilot / gemini / claude (stub OK initially, codex first)
  - Model selection for LLM and vision model (vision can be unused initially but config must exist)
  - Paths: input/output/queue/log/summary directories, lock file path
  - Materials/workspace roots for novel projects (chapter/paragraph targeting)

## 4) Backend
- Python Tornado server.
- APIs:
  - health
  - settings get/set
  - pipeline get/set (blocks JSON)
  - pipeline script get/set (formatted text)
  - pipeline script parse/render (script <-> blocks)
  - task queue CRUD
  - run control (start/pause/resume/stop)
  - chat history
- WebSocket: push events (chat messages, task status, logs).

## 4.1) Runner Semantics (In-App)
- The novel pipeline must support loops at different granularities:
  - chapter-level refinement
  - paragraph-level refinement
  - free tasks generated from story/tone/dialogue/character/conflict/worldbuilding gaps
- Every run must be interruptible via chat + inbox/outbox, and resumable from persisted state.

## 5) PWA
- Manifest + Service Worker (cache static assets, offline shell).
- Responsive (desktop + mobile).

## 6) Development UX
- Provide a tmux dev session with two panes:
  - Pane 1: backend (`python3 server.py`)
  - Pane 2: PWA dev server (static is OK via `python3 -m http.server`)
