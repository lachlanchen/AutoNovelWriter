## Debug Review (T032_project_settings_extend_novel_overrides)

### Findings
- No blocking correctness issues found in current T032 implementation.

### Acceptance Check
- Backend `/api/projects/settings` supports added fields with inherit semantics:
  - Confirmed in `autonovelwriter/backend/server.py` via `_apply_project_settings_update()` and `ProjectSettingsHandler` (`novel_tone`, `novel_target_length_words`, empty/unset removes override).
- Backend range/type validation:
  - Confirmed clear validation errors for type/range in `_apply_project_settings_update()`.
- PWA Settings modal exposes inherit state:
  - Confirmed new project fields in `autonovelwriter/pwa/index.html` and blank-as-inherit behavior in `autonovelwriter/pwa/app.js`.
- i18n coverage:
  - Confirmed new project override strings exist in all required locales in `autonovelwriter/pwa/app.js`.
- Unit coverage for precedence/fallback:
  - Confirmed `autonovelwriter/backend/tests/project_settings_novel_overrides_unit_test.py` covers override precedence + inherit fallback + invalid input.
- No TCP bind checks:
  - Syntax/import/unit checks pass without starting servers.

### Operability / Resumability / Separation Checks
- Operability:
  - Existing project settings endpoint contract remains backward-compatible (`project_settings`, `effective`, `global_defaults`), with additive fields only.
- Resumability:
  - Settings persist in project state (`project_settings.json`) and are reloaded through existing API flow.
- Light theme:
  - No theme/CSS changes in this task.
- Path/config clarity:
  - No new runtime roots introduced; existing project settings path usage remains clear.
- Driver-stage vs in-app pipeline separation:
  - No changes touching driver stage semantics.
- Pipeline script <-> blocks JSON translation:
  - No parser/renderer changes in this task; existing translation paths unaffected.

### Verification Run
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/project_settings_novel_language_unit_test.py`
- `python3 autonovelwriter/backend/tests/project_settings_novel_overrides_unit_test.py`
- `node --check autonovelwriter/pwa/app.js`
- `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py`
- `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py`
- `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py`

All passed in this debug stage.

### Residual Risks
- UI-side numeric constraints can still be bypassed by direct API calls; backend validation already mitigates this (expected design).
- i18n wording quality was not linguistically reviewed by native speakers for all locales (keys are present and wired).
