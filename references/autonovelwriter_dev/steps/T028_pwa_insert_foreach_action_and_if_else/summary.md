## Implement
- PWA: added Blocks toolbar buttons to insert `FOREACH_ACTION` and `IF` containers (wrap selected block or append a valid container to the root): `autonovelwriter/pwa/index.html`.
- PWA: extended `insertContainer()` to support `foreach_action` and `if` (IF inserts an `ELSE` branch with placeholder steps by default): `autonovelwriter/pwa/app.js`.
- PWA: updated delete semantics so deleting an `IF` splices up then/else bodies without leaving a standalone `ELSE`; also enforces IF validity (then-branch non-empty, ELSE kept last and non-empty when present): `autonovelwriter/pwa/app.js`.
- I18N: added toolbar label/title keys for the new buttons across all required UI languages: `autonovelwriter/pwa/app.js`.

Verification (no server start):
- `node --check autonovelwriter/pwa/app.js`

## Fixes
- Hardened IF/ELSE invariants after UI mutations (drag reorder, indent/outdent, delete) by normalizing the AST so `ELSE` cannot persist outside an `IF` and remains structurally valid for script render/validate: `autonovelwriter/pwa/app.js`.

## I18N
- Added localized toolbar strings for the new `Add FOREACH_ACTION` and `Add IF` buttons (label + tooltip) across all required UI languages: `autonovelwriter/pwa/app.js`.

## Next
1. Make `ELSE` manipulation more intuitive: add an explicit “Remove ELSE branch” action that drops else-body steps instead of splicing them into the then-branch.
2. Add UI for editing `IF` expressions (`expr`) inline, with immediate script re-render + validate.
3. Tighten UX constraints around `ELSE`: prevent dragging/outdenting `ELSE` outside its owning `IF` (or show a warning and auto-fix with a clear toast).
4. Decide how to handle `references/autonovelwriter_dev/prompts/*.txt` artifacts (commit vs gitignore) to keep the repo clean.

## README
- Updated Blocks UI notes to reflect that the toolbar can insert `FOREACH_ACTION` and `IF`, and that the editor normalizes IF/ELSE structure: `README.md`.
