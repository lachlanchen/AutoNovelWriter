## Implement
- Backend: added `PUT /api/actions/<action_id>` for updating action templates with copy-on-edit semantics (defaults create a new user action; user actions update in-place): `autonovelwriter/backend/server.py`.
- Backend: added helper `update_action_template()` to implement the copy-on-edit vs in-place logic and persist JSON under `runtime/actions/`: `autonovelwriter/backend/server.py`.
- WS: broadcasts `action_created` on copy-on-edit and `action_updated` on in-place user updates: `autonovelwriter/backend/server.py`.
- Tests: added unit coverage for default copy-on-edit, user update-in-place, and invalid id rejection: `autonovelwriter/backend/tests/actions_library_update_unit_test.py`.

Verification (no server start):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/actions_library_unit_test.py`
- `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py`

## Fixes
- PWA: added WS handling for `action_updated` to refresh the Action Library index after in-place user action edits: `autonovelwriter/pwa/app.js`.

## I18N
- No user-facing strings were introduced or changed by this task (backend API/WS change only).

## Next
1. PWA: build a minimal Action Editor UI that uses `PUT /api/actions/<action_id>` and handles the `new_action_id` copy-on-edit response by switching references in the pipeline AST/script.
2. Backend: stabilize error responses for action updates (structured `{error_code, field}`) and add basic size limits for `prompt/script`.
3. PWA: show toast/log entries for `action_created` and `action_updated` so updates are observable without opening devtools.
4. Docs: document `PUT /api/actions/<action_id>` request/response shapes (including `{updates:{...}}` vs top-level fields) in `README.md`.

## README
- Documented `PUT /api/actions/<action_id>` and the WS event `action_updated` in the root README: `README.md`.
