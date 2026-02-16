## Review (Debug)

### High
- **Saving global settings implicitly creates a project override.**
  - In `autonovelwriter/pwa/app.js`, Settings “Save” runs `saveProjectSettingsFromForm()` every time (`settingsForm` submit uses `Promise.all([saveSettingsFromForm(), saveProjectSettingsFromForm()])`).
  - `fillProjectSettingsForm()` sets the project selector to `ps.novel_language || eff.novel_language`, so when there is *no* override, the UI still shows the effective value (often the global value). On save, `POST /api/projects/settings` will persist that value into `project_settings.json`, turning a derived effective value into a hard override.
  - Impact: changing the global novel language later will no longer affect that project, even if the user never intended to “override” it.
  - Suggested fix (future): add an explicit “inherit” / “use global” option (e.g. empty value), and have POST delete `novel_language` when blank. Also consider only POSTing when the user changes the project override.

### Medium
- **Default “sensible” behavior is implemented as “inherit from global novel language”, not “inherit from UI language on first project creation”.**
  - Acceptance mentions UI-locale inheritance as an example; current behavior is: project override absent => fallback to `settings.novel.language` (or `en`). (`autonovelwriter/backend/server.py:effective_novel_language()`).
  - This is reasonable, but if the intent was first-time UI-locale seeding, it is not implemented.

- **New error message path is not localized.**
  - `autonovelwriter/pwa/app.js:1700` uses `addMsg('err', 'settings', 'cannot derive backend api url');` in `saveProjectSettingsFromForm()`.
  - Acceptance requires all new user-facing strings localized across required languages.
  - Suggested fix (future): replace with existing translated keys (or add new keys) and use `t(...)` for both title and body.

- **`novel_language` is not validated/normalized to the allowed set.**
  - Backend accepts any non-empty string and persists it (`ProjectSettingsHandler.post`).
  - Suggested fix (future): validate against the supported novel-language codes (same set as the UI selector), and reject/normalize unknown values.

### Low
- **Project settings API is scoped to “active project” by default; no query param for viewing/editing other projects.**
  - `GET /api/projects/settings` always reads `load_active_project()`.
  - `POST /api/projects/settings` allows `project_id`, but the PWA doesn’t send it and the endpoint doesn’t support `?project=...`.
  - This is fine for “minimal UI”, but becomes a limitation once project management expands.

### Notes / Non-Issues
- No TCP binding required for verification; JS syntax and Python compile checks were run in the implement stage.
- Separation between driver stages vs in-app pipeline remains intact (no new conflation introduced by this task).

