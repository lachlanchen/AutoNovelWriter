# T023_action_library_minimal_api_copy_on_edit — Plan

## Goal
Introduce an **Action Library** with:
- A standardized runtime storage layout for actions (defaults vs user).
- Minimal backend APIs to list/get actions and to copy-on-edit a default action into a user action.
- Minimal PWA wiring to let a STEP block reference/switch an `action_id` (no execution semantics yet).

## Architecture / Design Notes

### How This Fits The Standardized Storage Layout
This task adds a new runtime “library” namespace under the existing runtime root:
- `autonovelwriter/runtime/actions/` (action templates + metadata; gitignored)

It complements existing standardized areas:
- materials: `autonovelwriter/runtime/projects/<project_id>/materials/`
- interactions: `autonovelwriter/runtime/projects/<project_id>/interactions/` + `autonovelwriter/runtime/io/*`
- outputs: `autonovelwriter/runtime/projects/<project_id>/outputs/`
- logs/state/tasks: `autonovelwriter/runtime/logs/`, `autonovelwriter/runtime/state/`, `autonovelwriter/runtime/tasks/`

### Persisted vs Derived vs Ephemeral
- Persisted:
  - Action templates on disk (JSON): defaults + user actions.
  - Pipeline canonical script which references `action_id` (see “Pipeline reference” below).
- Derived:
  - `actions/index` response payloads (computed by scanning runtime dirs).
- Ephemeral:
  - PWA selection state / editor UI state.

### What Must Be Gitignored
- `autonovelwriter/runtime/actions/**` is mutable and must be gitignored (no secrets).
- Defaults are “immutable templates” by convention; enforcement is done by API behavior (no writes to defaults dir).

### Pipeline Reference (Keep App Runnable)
To keep the formatted pipeline script canonical and still allow pipeline blocks to reference actions:
- Short-term plan: represent a step’s action via `action_id` **without breaking existing scripts**:
  - Defaults will be created for existing built-in steps (`plan`, `write`, `meta_tasks_generate`, etc.) so existing scripts continue to work.
  - When a user copies/edits a default action, the pipeline should switch to reference the new `action_id`.
  - Implementation detail (next stage): either
    - broaden `STEP <token>` validation to accept arbitrary `action_id` and resolve to a template (recommended), or
    - add a v2 extension like `STEP <builtin_type> ACTION <action_id>` and persist it in the canonical script.
  - In this task we keep execution semantics unchanged; runner behavior for user actions is wiring-only.

### API/WS Events Needed For Observability + Resumability
Minimal REST APIs:
- `GET /api/actions`:
  - returns list of actions with metadata: `id`, `name`, `origin` (`default|user`), plus placeholder `inputs_schema`/`outputs_schema`.
- `GET /api/actions/<action_id>`:
  - returns full action template: tool binding + prompt/script fields.
- `POST /api/actions/<action_id>/copy`:
  - if `<action_id>` is a default action, create a new user action (copy-on-edit) and return `{new_action_id, action}`.
  - must not mutate default action files.

Optional (nice-to-have) WS event:
- `actions_updated` or `action_created` broadcast after copy so the PWA refreshes without polling.

Resumability impact:
- Action templates are persisted; pipeline script references are persisted.
- Runner cursor hash invalidation remains correct when canonical script changes due to switching action ids.

## Data Model (Minimal)
Action template JSON (one file per action), example fields:
- `id` (string, stable action_id)
- `name` (string)
- `origin` (default|user) (derived from location; can also be stored)
- `base_action_id` (optional; for copies)
- `tool` (e.g. `codex_prompt`, `shell`, `stub`)
- `prompt` (string; optional)
- `script` (string; optional)
- `inputs_schema` (object placeholder)
- `outputs_schema` (object placeholder)

## Runtime Layout (Defaults vs User)
Under `AUTONOVELWRITER_RUNTIME_ROOT`:
- `autonovelwriter/runtime/actions/defaults/<action_id>.json`
- `autonovelwriter/runtime/actions/user/<action_id>.json`

Defaults seeding:
- On backend startup (or `ensure_runtime_dirs()`), seed a small set of default actions if missing (id matches existing built-in step ids).

## Files To Change / Create (Implementation Stage)
- Backend:
  - `autonovelwriter/backend/server.py`
    - extend `resolve_paths()` + `ensure_runtime_dirs()` for `actions/` dirs
    - implement list/get/copy endpoints
    - implement default action seeding
  - (new) `autonovelwriter/backend/tests/actions_library_unit_test.py`
    - no server bind; calls helper functions directly and uses temp dirs
- PWA:
  - `autonovelwriter/pwa/app.js`
    - minimal actions dropdown for STEP blocks (select action_id)
    - invoke copy-on-edit when editing a default (or when user chooses “Customize…”)
  - `autonovelwriter/pwa/index.html` (if a panel/modal is needed)
  - i18n keys for any new labels/buttons (all required UI languages)

## Acceptance Checklist
- [ ] Runtime has clear actions layout: defaults vs user (gitignored; no secrets).
- [ ] API list actions returns metadata: id, name, origin, inputs/outputs schema placeholder.
- [ ] API get action returns full template (tool binding + prompt/script fields).
- [ ] Copy-on-edit: editing a default action creates a new user action and returns new `action_id` (no mutation of defaults).
- [ ] PWA can switch a STEP block from one `action_id` to another (wiring only; no execution).
- [ ] Any new user-facing strings are localized for: en, zh-Hans, zh-Hant, ja, ko, vi, ar, fr, es, ru, de.

## Minimal Verification Commands (No TCP binds)
```bash
python3 -m py_compile autonovelwriter/backend/server.py
node --check autonovelwriter/pwa/app.js
python3 autonovelwriter/backend/tests/actions_library_unit_test.py
```

