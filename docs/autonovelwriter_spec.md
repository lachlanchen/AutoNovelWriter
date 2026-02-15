# AutoNovelWriter: Product Spec (Scratch-like PWA Controller)

Goal: build a **Scratch-like PWA** that controls an automated novel-writing / app-development pipeline.
The PWA must allow the user to **interrupt** and “chip in” ideas during execution via **chat** and via a
folder-based **inbox/outbox**. The system must be resumable, observable, and operable.

## 1) UI (Scratch-like)
- Light theme by default (no dark-first UI).
- Drag & drop “blocks” that form a pipeline:
  - `plan -> write -> critique_story -> fix_story -> critique_tone -> fix_tone -> critique_dialogue -> fix_dialogue -> critique_character -> fix_character -> summary -> log -> commit_push`
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

## 4) Backend
- Python Tornado server.
- APIs:
  - health
  - settings get/set
  - task queue CRUD
  - run control (start/pause/resume/stop)
  - chat history
- WebSocket: push events (chat messages, task status, logs).

## 5) PWA
- Manifest + Service Worker (cache static assets, offline shell).
- Responsive (desktop + mobile).

## 6) Development UX
- Provide a tmux dev session with two panes:
  - Pane 1: backend (`python3 server.py`)
  - Pane 2: PWA dev server (static is OK via `python3 -m http.server`)

