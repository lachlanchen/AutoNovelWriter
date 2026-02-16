## Implement
- Backend: added project-scoped novel language settings persisted at `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`, with `project_settings.novel_language` overriding global `runtime/state/settings.json` (`settings.novel.language`).
- Backend: added `GET/POST /api/projects/settings` to read/update project settings and broadcast `project_settings_updated` over WS.
- Runner: draft header now uses the project’s effective novel language (project override wins; else global; else `en`).
- PWA: Settings modal now includes a Project section showing active project and a per-project novel language override selector; refreshes on project changes and `project_settings_updated`.
- Runtime defaults: `ensure_runtime_dirs()` now creates a minimal `runtime/state/settings.json` (gitignored) if missing, so there is always a concrete global novel language default.
- Tests: added a unit-style test for project override precedence (`autonovelwriter/backend/tests/project_settings_novel_language_unit_test.py`).
