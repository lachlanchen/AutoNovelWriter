## Implement
- PWA: added an Action Editor modal to view/edit an action template’s `name/tool/prompt/script`: `autonovelwriter/pwa/index.html`.
- PWA: added a STEP-level `Edit` button that opens the editor for the current `action_id`: `autonovelwriter/pwa/app.js`.
- PWA: saving calls `PUT /api/actions/<action_id>`; when the backend returns `new_action_id` (copy-on-edit), the selected STEP is switched to reference it and the canonical pipeline script is re-rendered: `autonovelwriter/pwa/app.js`.
- PWA: refreshes Action Library index after save so new user actions appear immediately: `autonovelwriter/pwa/app.js`.
- I18N: added localized strings for the editor UI across all required UI languages: `autonovelwriter/pwa/app.js`.

Verification (no server start):
- `node --check autonovelwriter/pwa/app.js`

