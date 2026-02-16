## Implement
- Extended backend project settings support in `autonovelwriter/backend/server.py` for per-project novel overrides with inherit semantics:
  - Added `novel_tone` and `novel_target_length_words` alongside existing `novel_language`.
  - Added `effective_novel_settings()` and `_global_novel_defaults()` so effective values are derived consistently from `project_settings` over global defaults.
  - Extended `GET /api/projects/settings` to return expanded `effective` and `global_defaults` fields.
  - Extended `POST /api/projects/settings` validation and merge via `_apply_project_settings_update()`:
    - Empty string/unset removes override (inherit global).
    - `novel_target_length_words` enforces numeric type/range (`1000..5000000`) with clear error codes.
    - `novel_tone` validates type and max length.
- Updated Settings modal UI in `autonovelwriter/pwa/index.html` and `autonovelwriter/pwa/app.js`:
  - Added project override inputs for tone and target words.
  - Kept inherit behavior explicit: blank input = inherit.
  - Added effective/global hint values shown in the modal for tone and target words.
- Added localization keys for new project override strings across all required UI languages (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Added backend unit test `autonovelwriter/backend/tests/project_settings_novel_overrides_unit_test.py` covering:
  - precedence (project override wins over global),
  - inherit fallback when override is cleared,
  - validation errors for invalid type/range.

Verification (no TCP bind):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/project_settings_novel_language_unit_test.py`
- `python3 autonovelwriter/backend/tests/project_settings_novel_overrides_unit_test.py`
- `node --check autonovelwriter/pwa/app.js`
