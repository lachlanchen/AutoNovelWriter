## Plan (T030_pwa_action_editor_minimal)

### Architecture / Design Notes
- This is a PWA-facing feature that edits Action Library templates persisted by the backend under the standardized layout:
  - Defaults (immutable): `autonovelwriter/runtime/actions/defaults/<action_id>.json`
  - User actions (mutable): `autonovelwriter/runtime/actions/user/<action_id>.json`
- Persisted vs derived vs ephemeral:
  - Persisted: action JSON files under `runtime/actions/**` (gitignored because `autonovelwriter/runtime/` is ignored).
  - Derived: Action index list from `GET /api/actions`; pipeline script derived from `pipeline_ast` via `renderScriptFromAst()`.
  - Ephemeral: modal form state (current action fields being edited), plus the selected block path/key.
- Copy-on-edit semantics (must remain consistent with backend):
  - Editing a default action via `PUT /api/actions/<action_id>` results in a new user action id (`new_action_id`); the PWA must switch the selected STEP’s `action_id` (`n.type`) to the new id and re-render the canonical pipeline script/AST.
  - Editing a user action updates in-place; the STEP continues referencing the same id.

### API / WS Surface Needed
- Read action template for editing:
  - `GET /api/actions/<action_id>` returns the full template (`name`, `tool`, `prompt`, `script`, schemas, origin).
- Save action template edits:
  - `PUT /api/actions/<action_id>` with body `{name, tool, prompt, script}` (or `{updates:{...}}`), relying on backend copy-on-edit for defaults.
  - Response may include `new_action_id` when copy-on-edit occurs.
- Observability / multi-client:
  - Backend already broadcasts `action_created` (copy-on-edit) and `action_updated` (in-place).
  - PWA should refresh its Action Library index on both events (already done for `action_created`; T029 fix adds `action_updated`).

### UI / UX Behavior (Minimal, Light-Theme Friendly)
- Entrypoint:
  - Add an `Edit` (Action Editor) button on `STEP` blocks (near the action selector / Customize button).
  - Button enabled when the STEP has a non-empty `action_id` (`n.type`).
- Modal:
  - Add a small modal card (reuse existing modal styles from Settings):
    - Header: “Action Editor”
    - Shows current `action_id` and origin (`default` vs `user`).
    - Editable fields: `name`, `tool`, `prompt` (textarea), `script` (textarea).
    - Actions: `Save`, `Cancel/Close`.
    - Optional hint line for defaults: “Editing a default creates a user copy (copy-on-edit).”
- Save behavior:
  - Call `PUT /api/actions/<action_id>` with edited fields.
  - If response includes `new_action_id`:
    - Update the selected STEP’s `n.type = new_action_id`.
    - Mark pipeline dirty, `updateDerivedFromAst({writeScript:true})`, and re-render blocks (so canonical script reflects the new id).
  - Always refresh actions index after save (`await loadActionsIndex()`), so new user action appears in dropdown immediately.
  - Close modal on success; show an error message via existing `addMsg('err', ...)` on failure.
- No backend reachable:
  - Keep minimal: show an error and do not attempt offline persistence (the canonical storage is on backend/runtime).

### I18N
- Add i18n keys for all new user-facing strings across:
  - `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`
- Expected new keys (example set; can adjust during implement):
  - `actions.edit` / `actions.edit_title`
  - `actions.editor_title`
  - `actions.editor_action_id`
  - `actions.editor_origin_default` / `actions.editor_origin_user`
  - `actions.editor_name`, `actions.editor_tool`, `actions.editor_prompt`, `actions.editor_script`
  - `actions.editor_save`, `actions.editor_cancel`
  - `actions.editor_copy_on_edit_hint`
  - `actions.editor_save_ok` / `actions.editor_save_err` (if surfaced)

### Files To Change / Create
- `autonovelwriter/pwa/index.html`
  - Add Action Editor modal HTML (parallel to `settingsModal`).
- `autonovelwriter/pwa/app.js`
  - Render STEP-level “Edit” button.
  - Add modal open/close logic (either generalized modal helpers or ActionEditor-specific helpers).
  - Implement `loadActionForEdit(action_id)` via `GET /api/actions/<id>`.
  - Implement `saveActionEdits(action_id, fields)` via `PUT /api/actions/<id>`.
  - On copy-on-edit response: switch selected STEP’s `n.type` to `new_action_id` and re-render script/AST.
  - Add i18n keys + translations.

### Acceptance Checklist
- PWA has an Action Editor entrypoint on STEP blocks and a modal showing `name/tool/prompt/script`.
- Saving edits calls backend update endpoint (`PUT /api/actions/<action_id>`).
- If response returns `new_action_id`, the STEP’s `action_id` switches to it and the canonical pipeline script updates accordingly.
- Action list refreshes so the new user action appears without reload.
- All new UI strings localized across the required UI languages.
- Minimal verification passes without binding TCP ports.

### Minimal Verification Commands (No Server Start)
- `node --check autonovelwriter/pwa/app.js`

