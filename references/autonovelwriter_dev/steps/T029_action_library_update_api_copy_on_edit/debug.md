## Debug Review (T029_action_library_update_api_copy_on_edit)

### Findings (Ordered By Severity)

1. PWA does not yet react to `action_updated`
- Backend emits WS `action_updated` on in-place user action updates, but the PWA currently only reloads the Actions index on `action_created`.
- This is acceptable per task scope (backend-only), but it means multi-client observability is incomplete: other open PWAs will not refresh action metadata after a user action is updated unless they manually reload or trigger another refresh.
- Follow-up: add a PWA WS handler for `action_updated` to call `loadActionsIndex()` and re-render.

2. Error codes are raw exception strings (API ergonomics)
- `PUT /api/actions/<action_id>` maps `ValueError` to `{error: "<exception text>"}` (e.g. `bad_prompt`, `bad_inputs_schema`) rather than stable error codes used elsewhere.
- This is still operable and testable, but if the Action Editor UI wants to show field-specific errors, a structured `{error_code, field}` shape would be cleaner.

3. Update body shape is permissive (`{updates:{...}}` or `{...}`)
- Handler accepts either a top-level object of fields or `{updates:{...}}`. This is convenient, but should be documented to avoid confusion for clients.

4. Repo hygiene: prompt artifact in `references/autonovelwriter_dev/prompts/`
- The driver created `references/autonovelwriter_dev/prompts/T029_action_library_update_api_copy_on_edit_plan.txt` (untracked). Decide whether these prompt artifacts are meant to be committed or ignored consistently.

### Acceptance Checklist Coverage
- `PUT /api/actions/<action_id>` exists and accepts editable fields: implemented via `ActionHandler.put()` + `update_action_template()`.
- Default edit => copy-on-edit: uses `copy_default_action()`; default file remains unchanged (unit tested).
- User edit => update in-place: writes to `runtime/actions/user/<action_id>.json` (unit tested).
- WS broadcast emitted:
  - copy-on-edit: `action_created` (reused)
  - update-in-place: `action_updated` (new)
- Unit tests cover: default copy-on-edit, user update-in-place, invalid id rejection: `autonovelwriter/backend/tests/actions_library_update_unit_test.py`.
- Verification:
  - `python3 -m py_compile autonovelwriter/backend/server.py`
  - `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py`

