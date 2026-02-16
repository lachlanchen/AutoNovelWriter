## Implement
- Backend: added project-scoped novel language settings persisted at `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`, with `project_settings.novel_language` overriding global `runtime/state/settings.json` (`settings.novel.language`).
- Backend: added `GET/POST /api/projects/settings` to read/update project settings and broadcast `project_settings_updated` over WS.
- Runner: draft header now uses the project’s effective novel language (project override wins; else global; else `en`).
- PWA: Settings modal now includes a Project section showing active project and a per-project novel language override selector; refreshes on project changes and `project_settings_updated`.
- Runtime defaults: `ensure_runtime_dirs()` now creates a minimal `runtime/state/settings.json` (gitignored) if missing, so there is always a concrete global novel language default.
- Tests: added a unit-style test for project override precedence (`autonovelwriter/backend/tests/project_settings_novel_language_unit_test.py`).

## Fixes
- PWA: added an explicit “use global default” option for per-project novel language; UI now shows inherit vs override, avoiding accidental “override = effective”.
- Backend: `POST /api/projects/settings` now treats empty `novel_language` as “inherit” (removes override) and validates `novel_language` against the supported codes.
- PWA: localized the backend-URL error path used by project settings save.

## I18N
- Added `project.novel_language_inherit` (new selector option label) across all required UI languages.
- Added `errors.backend_api_url` (used when the PWA cannot derive the backend API URL) across all required UI languages.

## Next
1. Add a clear “project override enabled” toggle (or show effective vs override) so it’s obvious when a project is inheriting global settings.
2. Add a small PWA indicator for the effective novel language used by the runner (to help debugging when overrides exist).
3. Extend project settings to more novel-writing preferences (tone/length/etc) while keeping UI language separate.
4. Add a backend GET option to view settings for a specified project id (not only the active project).
