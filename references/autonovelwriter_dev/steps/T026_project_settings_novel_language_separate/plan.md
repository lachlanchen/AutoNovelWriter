# T026_project_settings_novel_language_separate — Plan

## Goal
Add **per-project novel-writing settings** with at least `novel_language`, persisted under the project’s runtime state, and explicitly **separate** from PWA UI language (i18n).

## Architecture / Design Notes

### Fit With Standardized Storage Layout
Current global settings live at:
- `autonovelwriter/runtime/state/settings.json` (agent + novel defaults; shared)

Projects already have:
- `autonovelwriter/runtime/projects/<project_id>/state/` (project-local state)

This task introduces project-scoped novel settings at:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`
  - includes `novel_language` (and optionally future project-scoped knobs).

Precedence rules:
1. If `project_settings.json` exists, use it for project-level novel settings.
2. Otherwise, default to global `settings.novel.language` (or optionally inherit from UI only on first creation).

### Persisted vs Derived vs Ephemeral
- Persisted:
  - `runtime/projects/<project_id>/state/project_settings.json`
  - existing global `runtime/state/settings.json` remains the fallback/default source
- Derived:
  - “effective novel language” shown in UI (project override or global fallback)
- Ephemeral:
  - PWA form state before user clicks save

### What Must Be Gitignored
All project settings live under `autonovelwriter/runtime/projects/...` which is already gitignored.
No secrets expected (language codes only).

### API / WS Events For Observability + Resumability
Backend:
- `GET /api/projects/settings`
  - returns `{project_id, project_settings, effective_novel_language, global_defaults}` (minimal fields)
- `POST /api/projects/settings`
  - accepts `{project_id? (optional, defaults to active), project_settings: {novel_language}}`
  - writes `project_settings.json`
  - returns updated settings

WebSocket:
- broadcast `project_settings_updated`:
  - `{type, ts_ms, project_id, project_settings}`
  - PWA uses it to refresh UI if multiple clients are open.

Resumability:
- Runner uses project settings when generating outputs (e.g. draft headers) for the active project.
- Changing project settings mid-run should be allowed but is safest when runner is `idle` or `paused` (optional gate later).

## PWA UX (Minimal)
Keep UI language selection as-is (`?lang=` / `anw_lang` localStorage).
Add a **Project Settings** section in the Settings modal:
- A novel language selector labeled clearly as “Novel language (project)”.
- Display “Active project: <id>”.
- Save button persists to backend via `/api/projects/settings`.

Do not couple UI language changes to project novel language changes.

## Files To Change / Create (Implementation Stage)
- Backend:
  - `autonovelwriter/backend/server.py`
    - helper functions to load/save `project_settings.json`
    - handlers for `GET/POST /api/projects/settings`
    - WS event `project_settings_updated`
    - update runner draft stub to use project-level novel language (effective)
- PWA:
  - `autonovelwriter/pwa/app.js`
    - add settings UI controls for project novel language
    - wire API calls to get/set per-project settings
    - add i18n keys for new labels across required UI languages
- Tests:
  - `autonovelwriter/backend/tests/project_settings_unit_test.py` (no sockets)

## Acceptance Checklist
- [ ] Backend exposes get/set project settings including `novel_language`.
- [ ] PWA shows novel language selector separate from UI locale selector (no coupling).
- [ ] Setting persists across reloads via runtime project state.
- [ ] Default is sensible: fallback to global novel language when project file missing; once set, stays independent.
- [ ] All new user-facing strings localized across `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`.
- [ ] Verification: no TCP binds; python compile/import checks + JS syntax check pass.

## Minimal Verification Commands (No TCP Binds)
```bash
python3 -m py_compile autonovelwriter/backend/server.py
node --check autonovelwriter/pwa/app.js
python3 autonovelwriter/backend/tests/project_settings_unit_test.py
```

