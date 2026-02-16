## Plan (T029_action_library_update_api_copy_on_edit)

### Architecture / Design Notes
- Fits the standardized storage layout under `autonovelwriter/runtime/actions/`:
  - Defaults: `autonovelwriter/runtime/actions/defaults/<action_id>.json` (immutable templates).
  - User actions: `autonovelwriter/runtime/actions/user/<action_id>.json` (mutable; created via copy-on-edit).
- Persisted vs derived vs ephemeral:
  - Persisted: action JSON files under `runtime/actions/defaults/` and `runtime/actions/user/` (gitignored because `runtime/` is ignored).
  - Derived: `/api/actions` index response derived by scanning the two folders; no extra cache required.
  - Ephemeral: request body / in-memory action dict during update.
- Copy-on-edit behavior:
  - If updating a `default` action, create a **new** `user` action file (do not mutate defaults) and return `new_action_id` + created action.
  - If updating a `user` action, update the existing user file in-place and return the updated action.
- Observability / resumability:
  - Broadcast WS events so open PWAs can refresh action lists without reload.
  - Keep event payloads small and deterministic: include `action_id`, `origin`, and `base_action_id` when copy-on-edit occurs.

### API / WS Surface
- Add endpoint:
  - `PUT /api/actions/<action_id>`
  - Body: JSON object with editable fields (all optional):
    - `name` (string)
    - `tool` (string)
    - `prompt` (string)
    - `script` (string)
    - `inputs_schema` (object/dict)
    - `outputs_schema` (object/dict)
- Response:
  - Default edited (copy-on-edit): `{ ok: true, new_action_id, action }`
  - User edited (in-place): `{ ok: true, action }`
- WS broadcasts:
  - On copy-on-edit: reuse existing `action_created` (already handled by PWA) with `action_id` and `base_action_id`.
  - On user update-in-place: new event `action_updated` with `action_id`.
    - (Future PWA improvement can listen for `action_updated` and refresh index.)

### Validation / Safety
- Reject bad ids using existing `_is_safe_action_id()` (path parameter only; ignore/strip any `id` fields in body).
- Shallow type checks:
  - `name/tool/prompt/script`: must be strings if present (optionally trim).
  - `inputs_schema/outputs_schema`: must be dicts if present.
- Keep changes bounded:
  - Optional: limit string sizes (e.g. 200k) to avoid accidental huge writes.
- Semantics for missing action:
  - If `action_id` does not exist in defaults or user: `404 not_found`.

### Implementation Approach (Backend)
- Add a pure helper to keep tests simple and avoid needing real HTTP:
  - `update_action_template(paths, action_id, updates) -> dict`
    - Loads via `get_action()` (to determine origin).
    - If origin `default`: call `copy_default_action(..., overrides=updates)` and return `{action, new_action_id}`.
    - If origin `user`: update `runtime/actions/user/<action_id>.json` in-place and return `{action}`.
- Add new Tornado handler `ActionUpdateHandler`:
  - `put(self, action_id)`:
    - parse JSON
    - validate
    - call helper
    - broadcast appropriate WS event(s)
    - return JSON response
- Wire route into `make_app()`:
  - Add `(r"/api/actions/([A-Za-z0-9_-]+)", ActionGetHandler/ActionUpdateHandler...)`
  - Preferred: extend `ActionGetHandler` to implement `put()` (minimal new class footprint), but keep helper function regardless for testability.

### Files To Change / Create
- Backend:
  - `autonovelwriter/backend/server.py`
    - add helper `update_action_template(...)`
    - add/extend handler for `PUT /api/actions/<action_id>`
    - add WS broadcast `action_updated` for user updates
- Tests:
  - Add `autonovelwriter/backend/tests/actions_library_update_unit_test.py`
    - covers:
      - default update triggers copy-on-edit and does not mutate defaults
      - user update modifies user file in-place
      - invalid id rejected

### Acceptance Checklist
- `PUT /api/actions/<action_id>` exists and accepts editable fields: `name/tool/prompt/script/inputs_schema/outputs_schema`.
- Updating a default action creates a new user action file and returns `new_action_id` + created action; default file unchanged.
- Updating a user action updates the user file in-place and returns the updated action.
- WS broadcast emitted:
  - copy-on-edit: `action_created` (existing)
  - update-in-place: `action_updated` (new)
- Unit tests cover: default copy-on-edit, user update, invalid id rejection.
- Verification passes without binding TCP ports.

### Minimal Verification Commands (No Server Start)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/actions_library_unit_test.py`
- `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py`

