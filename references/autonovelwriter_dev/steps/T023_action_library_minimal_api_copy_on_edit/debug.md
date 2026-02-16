# T023_action_library_minimal_api_copy_on_edit — Debug Review

## High
- **Noisy `unknown_action_id` warnings for valid user actions**
  - Backend `parse_pipeline_script_v2()` warns `unknown_action_id` whenever `STEP <token>` is not in `PIPELINE_BLOCK_TYPES`, even if `<token>` exists in the Action Library on disk.
  - PWA `parseScriptToAst()` similarly warns via `ALLOWED_TYPES` (builtins) and cannot currently consult `/api/actions`.
  - Impact: as soon as a pipeline STEP switches to a copied user action id (e.g. `write__user__...`), pipeline validate/load will likely show warnings even though the action id is valid and intentional.
  - Suggested fix (follow-up): resolve action ids against `runtime/actions/{defaults,user}` in backend validation (or allow any safe token without warning), and have the PWA validate against `actionsIndex` when available.

## Medium
- **Copy-on-edit is implemented as “copy”, not “edit”**
  - Acceptance says “edit default action does not mutate it; creates a new user action and returns new id (copy-on-edit)”.
  - Current API surface is `POST /api/actions/<id>/copy` (good), but there is no user-action update endpoint yet, so “editing” beyond copying is not possible in-app.
  - Impact: OK for this milestone, but “copy-on-edit” semantics will feel incomplete until user actions can be edited (PUT/PATCH) and the PWA can open an editor.

## Low
- **PWA “Customize” button behavior**
  - Button is always rendered for STEP blocks and is disabled unless the current selection is a default action (reasonable).
  - When backend is unavailable (no `/api/actions`), the selector still works for the current id, but the “Customize” affordance will remain disabled because `actionsById` is empty.
  - Impact: acceptable, but worth ensuring the UI communicates why it’s disabled (future UX polish).

## Acceptance Coverage Check
- Runtime actions layout exists and is documented: `autonovelwriter/runtime/actions/{defaults,user}/` (dirs created at runtime; spec updated).
- APIs exist: list/get/copy (copy-on-edit) and defaults are not mutated.
- PWA can switch a STEP block `action_id` (via selector) and can create a user copy and switch (Customize).
- i18n: new user-facing strings for the action selector/customize are localized for all required UI languages.

## Separation / Clarity
- Driver stages vs in-app pipelines: unchanged; no new conflation introduced.
- Pipeline script remains canonical; action ids are referenced directly as `STEP <action_id>` tokens (works, but see warning issue above).

