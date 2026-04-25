# AutoNovelWriter Webapp Architecture and Autopilot Reference

This document records the current browser app design, backend API shape, Codex agent flow, Autopilot Loop schema, and design philosophy. It is intended as a future maintenance reference for AutoNovelWriter and for any related novel-writing automation work in `VoidAbyss`.

## Purpose

AutoNovelWriter is a local PWA plus Tornado backend for interactive and autonomous novel writing. The browser is not only a chat box. It is a control surface where the user can:

- capture story material in a Beats Board,
- preview and continue drafts in Draft Studio,
- inspect and steer an autonomous writing loop,
- edit a Scratch-like pipeline in Autopilot Setup,
- monitor fast and long-running Codex sessions,
- keep durable files for materials, interactions, loop scripts, drafts, logs, and pipeline state.

The core rule is that free-form chat can suggest changes, but executable or semi-executable structure must pass a strict grammar before the app accepts it.

## Important Files

| File | Responsibility |
|---|---|
| `backend/app.py` | Tornado routes, chat handler, novel preview endpoints, Codex orchestration, loop validation |
| `backend/pipeline_parser.py` | Deterministic AAPS v1 parser and validation errors |
| `backend/pipeline_shell_import.py` | Import `# AAPS:` annotations from shell scripts |
| `pwa/index.html` | Browser layout: topbar, bottom tabs, setup canvas, chat areas, monitor popover |
| `pwa/styles.css` | Responsive layout, bottom navigation, mobile topbar collapse, panel sizing |
| `pwa/app.js` | Frontend state, tab switching, chat submission, preview loading, monitor toggles, AAPS export |
| `pwa/service-worker.js` | PWA shell cache. It must be bumped when changing shell behavior |
| `scripts/run_autonovelwriter_tmux.sh` | Starts backend, PWA static server, and log tail in one tmux session |

## Runtime Paths

The backend computes paths in `_novel_paths(runtime_dir)`:

| Path | Meaning |
|---|---|
| `runtime/novel/materials/` | Durable story material, such as `beats_board.md` and `story_state.md` |
| `runtime/novel/interactions/` | Per-message browser interaction records |
| `runtime/novel/outputs/chapters/` | Draft chapter or scene outputs |
| `runtime/novel/loop/proposed.aaps` | Assistant-proposed Autopilot Loop script |
| `runtime/novel/loop/accepted.aaps` | Last grammar-accepted loop script |
| `runtime/novel/loop/validation.json` | Validation result for proposed or accepted loop |
| `runtime/novel/state/codex_agent_state.json` | Reply/writer/loop status and last options |
| `runtime/novel/state/codex_reply_session.txt` | Reused quick reply Codex session id |
| `runtime/novel/state/codex_writer_session.txt` | Reused assistant/writer Codex session id |
| `../references/xiyouzhiyuan/input/` | Default external input folder mirrored from browser chat |

Most `runtime/` contents are operational state and are expected to be gitignored.

## Browser Layout

The PWA uses four bottom tabs:

1. `Beats Board`
2. `Draft Studio`
3. `Autopilot Loop`
4. `Autopilot Setup`

The bottom tabs are full width, mobile-app style. The idea is that writing tools should feel like a working app, not a landing page.

### Beats Board

Top area: preview of beats, names, motifs, relationships, and material state.

Bottom area: chat log and input. Chat submissions are prefixed to tell the assistant to organize the note into durable material.

### Draft Studio

Top area: latest draft or story-state preview.

Bottom area: chat log and input. Chat submissions ask the assistant to continue or revise prose naturally.

### Autopilot Loop

Top area: current accepted or proposed AAPS loop script plus validation status.

Bottom area: chat log and input. If the user asks to change the loop, the assistant must write a complete AAPS v1 script to `runtime/novel/loop/proposed.aaps`. The backend parses it before accepting it.

### Autopilot Setup

This tab contains the original Scratch-like three-column editor:

- Blocks palette,
- Program canvas,
- right panel for Status, Inbox, Logs, Actions, and Script.

It also has a setup chat area below the three columns. The `Agent` monitor button is in the Program panel header, immediately before `Clear`.

## Mobile Header

On small screens the header collapses controls:

- first row: logo/title plus `Settings`,
- second row, only when expanded: Agent, Model, Reply reasoning, Assistant reasoning, Language, Start/Pause/Resume/Stop, Theme.

`pwa/app.js` updates the CSS variable `--topbar-h` through `setViewportVars()` so workspace heights adapt when the settings row opens or closes.

## Agent Monitor

The monitor is a shared popover. It is opened by any button with `data-agent-monitor`.

It displays `/api/novel/agent/status`, including:

- whether Codex browser agents are enabled,
- reply session id, model, reasoning, state, last result,
- writer session id, model, reasoning, state, last result,
- last selected browser settings,
- loop validation status,
- important runtime paths.

Current defaults:

- quick reply: `gpt-5.5`, `medium`,
- assistant writer: `gpt-5.5`, `high`.

## Codex Agent Flow

The browser chat posts to `POST /api/chat` with:

```json
{
  "content": "user-visible instruction",
  "agent_options": {
    "mode": "beats|draft|loop|setup",
    "reply_model": "gpt-5.5",
    "reply_reasoning": "medium",
    "assistant_model": "gpt-5.5",
    "assistant_reasoning": "high",
    "assistant_enabled": true
  }
}
```

The backend immediately:

1. stores the user chat message,
2. stores an inbox message,
3. writes an interaction file,
4. returns a short mechanical acknowledgement as a toast-style `notice`,
5. queues the assistant task if enabled,
6. runs the quick reply session.

The quick reply session must answer soon and must not edit files. The assistant/writer session can do durable work: update material files, write drafts, propose loop scripts, commit and push tracked changes if appropriate.

Fixed acknowledgements are intentionally not durable chat messages. The chat stream should contain the user's messages, real quick replies, real writer summaries, and meaningful outbox messages. See `references/ui_layout_chat_update_notes.md` for the latest layout, live-sync, and toast behavior notes.

The reason for two sessions is latency and separation of responsibility:

- reply session: conversational feedback, low risk, quick browser UX,
- assistant session: file edits, writing, loop updates, longer running work.

## Backend API Reference

### Health and Config

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Backend and storage health |
| `GET` | `/api/version` | Version metadata |
| `GET/POST` | `/api/config` | Agent/model UI config |

### Browser Novel Workspace

| Method | Endpoint | Purpose |
|---|---|---|
| `GET/POST` | `/api/chat` | Browser chat history and new messages |
| `GET` | `/api/novel/agent/status` | Reply/writer/loop monitor state |
| `GET` | `/api/novel/preview` | Beats, story state, latest draft, loop script, loop validation |
| `POST` | `/api/novel/codex/reply` | Synchronous quick Codex reply API |
| `POST` | `/api/novel/codex/assistant` | Queue assistant task explicitly |
| `GET/POST` | `/api/inbox` | Runtime inbox messages |
| `GET` | `/api/outbox` | Assistant or pipeline outbox messages |

### Pipeline and AAPS

| Method | Endpoint | Purpose |
|---|---|---|
| `GET/POST` | `/api/scripts` | Store/load pipeline scripts |
| `GET` | `/api/scripts/<id>` | Retrieve a script |
| `POST` | `/api/scripts/parse` | Parse AAPS v1 into IR |
| `POST` | `/api/scripts/import-shell` | Extract `# AAPS:` lines from shell script |
| `POST` | `/api/scripts/parse-llm` | Gated LLM conversion to AAPS |
| `GET/POST` | `/api/pipeline` | Current pipeline state |
| `GET` | `/api/pipeline/status` | Current pipeline process status |
| `POST` | `/api/pipeline/start` | Start configured pipeline process |
| `POST` | `/api/pipeline/pause` | Pause pipeline |
| `POST` | `/api/pipeline/resume` | Resume pipeline |
| `POST` | `/api/pipeline/stop` | Stop pipeline |

### Actions and Logs

| Method | Endpoint | Purpose |
|---|---|---|
| `GET/POST` | `/api/actions` | Action library list/create |
| `GET/PUT/DELETE` | `/api/actions/<id>` | Action details/update/delete |
| `POST` | `/api/actions/<id>/clone` | Copy readonly default action before editing |
| `POST` | `/api/actions/update-readme` | Common update README action |
| `GET` | `/api/logs` | Buffered logs |
| `GET` | `/api/logs/tail` | Log tail |

## Autopilot Loop Schema

Autopilot loop scripts use AAPS v1. AAPS is a deterministic text format that maps to canonical IR:

```text
AUTOAPPDEV_PIPELINE 1

TASK {"id":"t1","title":"Write chapter loop","meta":{"purpose":"novel_autopilot"}}
  STEP {"id":"s1","title":"Plan chapter","block":"plan"}
    ACTION {"id":"a1","kind":"codex_exec","params":{"prompt":"Plan the next chapter from current materials."}}
  STEP {"id":"s2","title":"Write prose","block":"work"}
    ACTION {"id":"a1","kind":"codex_exec","params":{"prompt":"Write the selected paragraph or scene."}}
  STEP {"id":"s3","title":"Critique story","block":"debug"}
    ACTION {"id":"a1","kind":"codex_exec","params":{"prompt":"Critique plot, character, style, and clarity harshly."}}
  STEP {"id":"s4","title":"Fix prose","block":"fix"}
    ACTION {"id":"a1","kind":"codex_exec","params":{"prompt":"Apply the critique and improve the draft."}}
  STEP {"id":"s5","title":"Summarize and commit","block":"summary"}
    ACTION {"id":"a1","kind":"note","params":{"text":"Summarize changed artifacts and update status."}}
  STEP {"id":"s6","title":"Commit and push","block":"commit_push"}
    ACTION {"id":"a1","kind":"note","params":{"text":"Commit and push tracked changes."}}
```

### Parser Rules

`backend/pipeline_parser.py` enforces:

- first non-comment line must be exactly `AUTOAPPDEV_PIPELINE 1`,
- statements must be `TASK`, `STEP`, or `ACTION`,
- each statement is followed by a JSON object,
- optional numeric prefixes are accepted, such as `1.2 STEP {...}`,
- `TASK` requires `id` and `title`,
- `STEP` requires `id`, `title`, and `block`,
- `ACTION` requires `id` and `kind`,
- `meta` and `params` must be JSON objects if present,
- `STEP` must appear after a `TASK`,
- `ACTION` must appear after a `STEP`,
- duplicate ids are rejected within their scope,
- allowed `STEP.block` values are `plan`, `work`, `debug`, `fix`, `summary`, and `commit_push`.

### Loop Acceptance Flow

1. Assistant writes a full candidate to `runtime/novel/loop/proposed.aaps`.
2. Backend calls `parse_aaps_v1`.
3. If parsing succeeds:
   - copy proposed text to `runtime/novel/loop/accepted.aaps`,
   - store a pipeline script through storage,
   - write `runtime/novel/loop/validation.json`,
   - mark loop state as accepted.
4. If parsing fails:
   - write validation error JSON,
   - mark loop state as invalid,
   - ask the assistant for one repair pass,
   - re-run validation once.

The frontend never loads random free-form loop edits. The loop must become valid AAPS before it is accepted.

## Frontend Data Flow

Key functions in `pwa/app.js`:

- `setNovelTab(key)`: switches bottom tabs, persists the selected tab, refreshes preview.
- `novelAgentOptions(mode)`: reads model and reasoning controls and sends them with chat.
- `submitNovelText(prefix, textarea)`: prefixes the user text by workspace intent, posts to `/api/chat`, refreshes chat/status/preview.
- `loadNovelPreview()`: pulls `/api/novel/preview` and fills Beats, Draft, and Loop preview panes.
- `loadChat()`: merges chat and outbox messages and renders them into all relevant workspace chat logs.
- `refreshNovelAgentStatus()`: fills the Agent Monitor.
- `setViewportVars()`: measures the topbar and updates `--topbar-h`.

The browser intentionally mirrors the same chat history in multiple tabs. The active tab changes the instruction prefix and `agent_options.mode`, not the underlying conversation stream.

## PWA Cache Strategy

The service worker previously used cache-first shell assets. That caused normal refreshes to show stale UI while hard refresh showed the new UI.

Current strategy:

- cache name is versioned, currently `autoappdev-shell-v11`,
- install precaches shell files,
- activate deletes older shell caches,
- navigation is network-first with cached shell fallback,
- shell assets such as `index.html`, `styles.css`, `app.js`, `api-client.js`, and `i18n.js` are network-first with cache fallback,
- `app.js` registers the service worker, calls `registration.update()`, and reloads once on `controllerchange`.

When changing PWA shell behavior, bump `CACHE_NAME`.

## Tmux Startup

Use:

```bash
./scripts/run_autonovelwriter_tmux.sh --kill --no-attach --enable-codex --skip-setup
```

The script starts:

- backend at `http://127.0.0.1:8788`,
- static PWA server at `http://127.0.0.1:5173`,
- backend log tail,
- Codex browser agents when `--enable-codex` is present.

Default agent environment:

```bash
AUTONOVELWRITER_CODEX_REPLY_MODEL=gpt-5.5
AUTONOVELWRITER_CODEX_REPLY_REASONING=medium
AUTONOVELWRITER_CODEX_WRITER_MODEL=gpt-5.5
AUTONOVELWRITER_CODEX_WRITER_REASONING=high
AUTONOVELWRITER_ENABLE_CODEX=1
```

## Design Philosophy

### Separate Chat From Structure

The user can write freely in chat. The system can save and interpret that freedom, but it must not turn arbitrary prose into executable structure without validation. AAPS is the boundary between creative chat and structured automation.

### Fast Reply, Durable Assistant

The browser should respond quickly. A slow file-editing agent should not block the chat UX. The reply session exists to acknowledge and clarify. The assistant session exists to do durable writing and organization.

### Preview Above, Chat Below

For writing tabs, the user should see the current artifact first, then talk about it. This keeps the mental model simple:

- top: what exists now,
- bottom: what I want to change.

### Bottom Navigation

The PWA should feel like a tool that can be used repeatedly on desktop and mobile. The four primary modes live in a full-width bottom nav, similar to common mobile apps.

### Setup Is Still First-Class

The Scratch-like editor was not removed. It lives in `Autopilot Setup` because it is an advanced control surface rather than the first screen for writing. It remains available for visual pipeline editing and AAPS import/export.

### Mobile Controls Must Collapse

Model and runtime controls are useful but not primary writing content. On mobile they collapse behind `Settings` so they do not overlap the logo/title or crowd the writing workspace.

### Cache Must Not Hide Development Changes

PWA caching is useful, but it must never make normal refresh appear broken. For local development and active iteration, shell assets should be network-first.

## Maintenance Checklist

When changing the webapp:

1. Update the relevant source:
   - layout: `pwa/index.html`,
   - behavior: `pwa/app.js`,
   - responsive design: `pwa/styles.css`,
   - backend API: `backend/app.py`,
   - schema: `backend/pipeline_parser.py`.
2. If shell assets changed, consider bumping `CACHE_NAME` in `pwa/service-worker.js`.
3. Run:

```bash
python3 -m py_compile backend/app.py
node --check pwa/app.js
bash -n scripts/run_autonovelwriter_tmux.sh
```

4. Restart:

```bash
./scripts/run_autonovelwriter_tmux.sh --kill --no-attach --enable-codex --skip-setup
```

5. Smoke test:

```bash
curl -sS http://127.0.0.1:8788/api/health
curl -sS http://127.0.0.1:8788/api/novel/agent/status
curl -sS http://127.0.0.1:8788/api/novel/preview
```

6. Commit and push the app repo, then commit and push the parent `VoidAbyss` submodule pointer.
