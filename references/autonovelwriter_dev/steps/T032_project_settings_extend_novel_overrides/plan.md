## Plan (T032_project_settings_extend_novel_overrides)

### Architecture / Design Notes
- Fits standardized storage layout by extending per-project settings persisted under:
  - `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` (gitignored under `autonovelwriter/runtime/`)
- Persisted vs derived vs ephemeral:
  - Persisted (gitignored):
    - Project overrides in `project_settings.json` (only the fields the user explicitly overrides).
    - Global defaults in `autonovelwriter/runtime/state/settings.json` (already exists).
  - Derived:
    - “Effective novel settings” is derived at read-time by merging: `project overrides -> global settings.novel.* -> hard defaults`.
    - PWA form state is derived from `/api/projects/settings` response (`project_settings` + `effective` + `global_defaults`).
  - Ephemeral:
    - PWA modal input values prior to Save.
- Inherit semantics (must be consistent across all fields):
  - Missing key or empty value => inherit from global `settings.novel.*` (do not persist an override).
  - For numeric overrides: “unset” means the key is absent (or empty string sent by PWA, mapped to “remove override”).

### Data Model (Backend)
Current: `project_settings.json` supports only `novel_language`.

Extend with a small set of per-project novel override keys (keep naming explicit and parallel to global keys):
- `novel_language` (already)
- `novel_tone` (string, optional)
- `novel_target_length_words` (int, optional)
- Optionally (if kept small but consistent with existing global settings UI):
  - `novel_pov` (string, optional)
  - `novel_tense` (string, optional)
  - `novel_chapter_count_target` (int, optional)

Add helper(s) in backend for precedence:
- `effective_novel_settings(paths, project_id) -> dict`
  - Reads global `settings.json` `novel.*`
  - Applies project overrides if present
  - Returns a normalized dict with `language/tone/target_length_words/pov/tense/chapter_count_target`

### API / WS (Observability + Resumability)
- HTTP (existing endpoint, extend payload):
  - `GET /api/projects/settings`:
    - Return `project_settings` (raw overrides)
    - Return `effective` extended to include all effective novel fields
    - Return `global_defaults` extended to include the same fields
  - `POST /api/projects/settings`:
    - Accept `project_settings` with the new keys.
    - Validation rules:
      - Strings: must be strings if provided; empty string => remove override.
      - Integers: accept int or numeric string; empty/unset => remove override; reject non-finite/negative/too-large with clear error codes.
    - Broadcast `project_settings_updated` including the extended `effective` payload (backward compatible; add keys).
- No new endpoints required; runner resumability is unaffected (but later tasks can use `effective_novel_settings()` consistently).

### PWA UI (Settings Modal)
- Extend the Project section of the Settings modal (currently only project novel language override) to include:
  - Project tone override input (blank => inherit). Show an explicit hint “leave blank to inherit” and show current effective/global value.
  - Project target length override input (blank => inherit).
  - If included: POV/tense/chapter count similarly.
- Avoid accidental override persistence:
  - On load: populate inputs from `project_settings` (not from `effective`), so blank truly means “inherit”.
  - Show effective/global values as secondary text (read-only hint), not as the input’s value.
- i18n:
  - Add new labels + inherit hint strings across required languages (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).

### Files To Change / Create
- Backend:
  - `autonovelwriter/backend/server.py`
    - Extend `ProjectSettingsHandler.get/post` to handle new keys and return extended `effective`/`global_defaults`.
    - Add `effective_novel_settings()` helper (and keep `effective_novel_language()` as a thin wrapper for compatibility).
    - Add validation helpers/constants for numeric ranges.
- PWA:
  - `autonovelwriter/pwa/index.html` (add new inputs in Settings modal Project section)
  - `autonovelwriter/pwa/app.js`
    - Extend `fillProjectSettingsForm()` and `saveProjectSettingsFromForm()`
    - Add i18n keys/translations for new UI strings
- Tests:
  - Add a new unit test or extend existing:
    - `autonovelwriter/backend/tests/project_settings_novel_overrides_unit_test.py` (new)
      - Assert precedence: project override wins; else global fallback.
      - Assert inherit behavior: empty/unset removes override.
      - Assert validation: rejects bad types/ranges with expected error codes.

### Acceptance Checklist
- Backend `/api/projects/settings` supports additional novel override fields with inherit semantics.
- Backend validates numeric ranges/types and returns clear error codes for invalid inputs.
- PWA exposes new project override fields with explicit inherit state and does not accidentally persist overrides.
- All new UI strings localized across required languages.
- Unit test covers precedence and inherit semantics.

### Minimal Verification Commands (No TCP Bind)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/project_settings_novel_language_unit_test.py`
- `python3 autonovelwriter/backend/tests/project_settings_novel_overrides_unit_test.py`
- `node --check autonovelwriter/pwa/app.js`
