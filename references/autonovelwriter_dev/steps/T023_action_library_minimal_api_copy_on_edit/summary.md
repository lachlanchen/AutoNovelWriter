# T023_action_library_minimal_api_copy_on_edit — Summary

## Implement
- Backend Action Library storage under `autonovelwriter/runtime/actions/{defaults,user}/` (created via `ensure_runtime_dirs()`), with best-effort seeding of default action templates on startup.
- Backend APIs:
  - `GET /api/actions` (index: `id`, `name`, `origin`, `inputs_schema`, `outputs_schema`)
  - `GET /api/actions/<action_id>` (full action template)
  - `POST /api/actions/<action_id>/copy` (copy-on-edit: creates a new user action, never mutates defaults; broadcasts WS `action_created`)
- Pipeline script parsing now accepts safe arbitrary `STEP <action_id>` tokens (warns on unknown ids but keeps them), so pipelines can reference newly-created user action ids without breaking the canonical script.
- PWA wiring:
  - Loads Action Library index and uses it to populate a per-STEP `action_id` selector (localized).
  - Adds a per-STEP “Customize” button that calls the copy API for default actions and switches the STEP to the returned `new_action_id`.
  - Refreshes the Action Library index on WS `action_created` so new user actions are selectable without reload.
- Repo hygiene:
  - `autonovelwriter/runtime/actions/*` gitignored.
  - Spec updated to document the Action Library runtime layout.
- Added a non-socket backend unit-style test: `autonovelwriter/backend/tests/actions_library_unit_test.py`.

## Fixes
- Fixed a backend `NameError` where `parse_pipeline_script_v2()` referenced `is_safe_step_token` that was accidentally defined under the `__main__` block. Moved `is_safe_step_token()` to module scope in `autonovelwriter/backend/server.py`.
- Reduced noisy `unknown_action_id` warnings for valid Action Library entries:
  - Backend now filters `unknown_action_id` warnings if the `action_id` exists in `runtime/actions/{defaults,user}` before returning/logging warnings.
  - PWA script parser treats action ids present in the loaded `/api/actions` index as known (so copied user action ids don’t trigger `unknown_action_id` warnings locally).
