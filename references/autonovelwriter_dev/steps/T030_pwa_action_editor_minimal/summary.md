## Implement
- PWA: added an Action Editor modal to view/edit an action template’s `name/tool/prompt/script`: `autonovelwriter/pwa/index.html`.
- PWA: added a STEP-level `Edit` button that opens the editor for the current `action_id`: `autonovelwriter/pwa/app.js`.
- PWA: saving calls `PUT /api/actions/<action_id>`; when the backend returns `new_action_id` (copy-on-edit), the selected STEP is switched to reference it and the canonical pipeline script is re-rendered: `autonovelwriter/pwa/app.js`.
- PWA: refreshes Action Library index after save so new user actions appear immediately: `autonovelwriter/pwa/app.js`.
- I18N: added localized strings for the editor UI across all required UI languages: `autonovelwriter/pwa/app.js`.

Verification (no server start):
- `node --check autonovelwriter/pwa/app.js`

## Fixes
- Disabled Action Editor saving until the action template is successfully loaded; on load failure the modal closes and a localized error is shown: `autonovelwriter/pwa/app.js`.
- Hardened copy-on-edit switching: only applies `new_action_id` if the saved `pathKey` still points to the same STEP (its current `action_id` matches): `autonovelwriter/pwa/app.js`.
- Ensured pipeline UI refreshes after in-place action updates by re-rendering after action index reload: `autonovelwriter/pwa/app.js`.
- Localized remaining Action Editor strings (error messages, tool placeholder, modal aria-label): `autonovelwriter/pwa/app.js`, `autonovelwriter/pwa/index.html`.

## I18N
- Added i18n keys for new Action Editor strings introduced in fixes (tool placeholder + load/save/selection error messages) across: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`: `autonovelwriter/pwa/app.js`.

## Next
1. Add a per-action schema editor for declared inputs/outputs/artifacts (and show those on STEP blocks) to move toward explicit dataflow.
2. Add a minimal ActionResult viewer panel (per-run/per-step) so users can inspect inputs/outputs without opening files.
3. Add a pipeline-safe “Replace action id” operation that updates all STEP references when an action is renamed/superseded.
4. Add keyboard focus trapping + ESC close for modals (Settings + Action Editor) for better accessibility and mobile UX.
