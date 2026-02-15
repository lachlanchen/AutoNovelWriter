# T010 Debug: Novel settings (language + UX options)

## Acceptance Review
- Settings persist under `settings.novel.*` and survive backend restart:
  - Backend defaults exist in `autonovelwriter/backend/server.py` (`default_settings()["novel"]`).
  - `/api/settings` POST accepts `novel` and writes `autonovelwriter/runtime/state/settings.json` via `save_settings()`.
  - `GET /api/settings` reloads from disk (`load_settings()`) so the UI sees persisted values.
- Changing UI language does not change novel language setting and vice versa:
  - UI language is PWA-only (`?lang=` / `localStorage.anw_lang`) in `autonovelwriter/pwa/app.js`.
  - Novel language is stored in backend settings at `settings.novel.language` and edited via the Settings modal.
  - No coupling code found between `UI_LANG` and `novelLanguage`.
- PWA displays and edits novel settings via `/api/settings`:
  - Settings modal contains a “Novel” section in `autonovelwriter/pwa/index.html` and is wired in `autonovelwriter/pwa/app.js` (`fillSettingsForm()` / `saveSettingsFromForm()`).
  - i18n keys for the new labels/placeholders exist for all required UI languages in `autonovelwriter/pwa/app.js`.

## Issues / Risks

### High: `/api/settings` POST can clobber out-of-band changes (stale in-memory settings)
- `SettingsHandler.post()` merges the incoming `body.{paths,agent,novel}` into `self._settings` (initialized from startup) and then writes the full dict back to disk.
- If `settings.json` is modified externally (or by another process/request path) after server startup and before this POST, those changes can be lost because `post()` does not reload from disk before merging.
- Impact: violates “resumability” expectations for settings as a persistent source of truth (especially once multiple UI tabs or future per-project settings exist).
- Suggested fix (next stage): in `SettingsHandler.post()`, reload `self._settings` from disk (similar to `get()`), then apply shallow-merge, then save.

### Medium: No schema/validation for novel settings payload
- Backend accepts any dict under `novel` and persists it; values can be wrong types/invalid ranges.
- PWA sends sanitized ints for `target_length_words` and `chapter_count_target`, but other clients could write nonsense and the UI will display it as strings.
- Suggested follow-up: add minimal validation/normalization (e.g., clamp ints >= 0; coerce strings; allowlist known keys).

### Low: Novel language dropdown is constrained to the 11 UI locales
- `novelLanguage` options mirror required UI languages, which is convenient but may be overly restrictive for novel writing (e.g., Italian) and can mislead users into thinking novel language must match UI language.
- Not an acceptance failure; consider expanding later or making it a free-form BCP-47 input.

### Low: No WS event for settings updates
- Not required by acceptance, but for observability/resumability it would be useful for multi-tab UIs (or future runner usage of novel settings) to receive `settings_updated` events.

## Notes (Non-Issues Observed)
- Light theme unaffected (no theme changes in this task).
- Runtime settings file does not exist until first save; backend creates directories on startup (`ensure_runtime_dirs()`).

