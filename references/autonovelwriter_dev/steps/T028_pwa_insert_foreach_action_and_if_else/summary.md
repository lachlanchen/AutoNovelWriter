## Implement
- PWA: added Blocks toolbar buttons to insert `FOREACH_ACTION` and `IF` containers (wrap selected block or append a valid container to the root): `autonovelwriter/pwa/index.html`.
- PWA: extended `insertContainer()` to support `foreach_action` and `if` (IF inserts an `ELSE` branch with placeholder steps by default): `autonovelwriter/pwa/app.js`.
- PWA: updated delete semantics so deleting an `IF` splices up then/else bodies without leaving a standalone `ELSE`; also enforces IF validity (then-branch non-empty, ELSE kept last and non-empty when present): `autonovelwriter/pwa/app.js`.
- I18N: added toolbar label/title keys for the new buttons across all required UI languages: `autonovelwriter/pwa/app.js`.

Verification (no server start):
- `node --check autonovelwriter/pwa/app.js`

