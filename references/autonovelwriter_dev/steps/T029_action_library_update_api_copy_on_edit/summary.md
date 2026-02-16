## Implement
- Backend: added `PUT /api/actions/<action_id>` for updating action templates with copy-on-edit semantics (defaults create a new user action; user actions update in-place): `autonovelwriter/backend/server.py`.
- Backend: added helper `update_action_template()` to implement the copy-on-edit vs in-place logic and persist JSON under `runtime/actions/`: `autonovelwriter/backend/server.py`.
- WS: broadcasts `action_created` on copy-on-edit and `action_updated` on in-place user updates: `autonovelwriter/backend/server.py`.
- Tests: added unit coverage for default copy-on-edit, user update-in-place, and invalid id rejection: `autonovelwriter/backend/tests/actions_library_update_unit_test.py`.

Verification (no server start):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/actions_library_unit_test.py`
- `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py`

