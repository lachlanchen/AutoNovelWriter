# Debug (T030_pwa_action_editor_minimal)

## Acceptance Review
- Action Editor entrypoint exists on STEP blocks (`Edit` button) and opens a modal: OK (`autonovelwriter/pwa/app.js`, `autonovelwriter/pwa/index.html`).
- Saving calls backend update endpoint `PUT /api/actions/<action_id>` and handles copy-on-edit `new_action_id`: OK (calls `PUT`, switches `node.type`, rewrites canonical script via `updateDerivedFromAst({writeScript:true})`, re-renders).
- Action list refreshes so a new user action appears without page reload: Mostly OK (does `await loadActionsIndex()` and re-renders on copy-on-edit path).
- New UI strings localized across required languages: Partially OK (core labels/buttons have keys; some new user-facing strings are still hard-coded English).
- `node --check autonovelwriter/pwa/app.js` should pass: previously verified in implement stage.

## Issues (Fix Required)
1. **Action Editor can open with blank fields and still allow Save after load failure (destructive).**
   - `openActionEditorForStep()` opens the modal, then `loadActionForEdit()`; if load fails it logs an error but leaves the form populated with empty strings.
   - User can hit Save and the `PUT` body will overwrite `name/tool/prompt/script` with empty strings (for user actions) or create an empty copy (for defaults).
   - Files: `autonovelwriter/pwa/app.js` (`openActionEditorForStep`, `saveActionEdits`).

2. **Copy-on-edit switching can target the wrong STEP if the pipeline changes while the modal is open (stale `pathKey`).**
   - The editor stores `{pathKey, action_id}` at open time. If the user drags/reorders/indents/outdents/deletes blocks before saving, `pathKey` may now point to a different node.
   - Current logic only checks `node.kind === 'step'` before mutating `node.type = newId`; it does not verify it is still the same step/action.
   - Files: `autonovelwriter/pwa/app.js` (`actionEditorState`, `saveActionEdits`).

3. **Not all new user-facing strings are i18n’d (violates “all new UI strings localized”).**
   - Hard-coded error strings shown to users:
     - `load failed: <action_id>`
     - `cannot switch step to new_action_id (selection invalid)`
   - Also the modal `aria-label="Action Editor"` and `placeholder="builtin"` are user-visible/AT-visible strings and currently not localized.
   - Files: `autonovelwriter/pwa/app.js`, `autonovelwriter/pwa/index.html`.

## Issues (Should Fix)
1. **After editing a user action in-place (no `new_action_id`), UI does not re-render pipeline blocks.**
   - `saveActionEdits()` refreshes the actions index, but does not call `renderPipeline()` unless a `new_action_id` is returned.
   - Result: the STEP action dropdown may continue showing stale names until the next render.
   - Files: `autonovelwriter/pwa/app.js` (`saveActionEdits`, `loadActionsIndex`).

2. **Error surfacing uses non-localized “who/channel” labels.**
   - `addMsg('err', 'actions', ...)` uses a raw `'actions'` label; other parts use `t('tasks_batches.title')`, etc.
   - Not strictly part of acceptance, but it is user-facing and affects i18n completeness/consistency.
   - Files: `autonovelwriter/pwa/app.js`.

## Operability / Resumability Notes
- Pipeline canonical script is rewritten only on copy-on-edit switching; that’s correct for keeping script canonical, but it makes correctness of `pathKey` (above) important for resumability and avoiding accidental pipeline edits.
- No TCP bind required for this feature; it relies on existing `/api/actions/<id>` endpoints.

## Separation Checks
- No direct confusion observed between driver stages and in-app pipeline concepts in the Action Editor UI; the editor operates only on Action Library templates and pipeline AST/script references.

