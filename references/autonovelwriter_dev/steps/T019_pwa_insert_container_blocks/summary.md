# T019 Summary: PWA: insert LOOP/ROUND/FOREACH_TASK blocks

## Implement
- Added Blocks toolbar buttons to insert container blocks: `LOOP`, `ROUND`, and `FOREACH_TASK` (`autonovelwriter/pwa/index.html`).
- Implemented insertion behavior in the PWA pipeline AST editor (`autonovelwriter/pwa/app.js`):
  - If a block is selected, the new container wraps the selected block (keeps containers non-empty/valid).
  - If nothing is selected, the container is appended at root with a default child step (uses `write` if available).
  - After insertion, the canonical script textarea is re-rendered immediately from AST.
- Localized new UI strings across 11 languages and made the per-block mini Indent/Outdent + enabled/disabled labels use i18n keys.

Verification (no TCP binds):
- `node --check autonovelwriter/pwa/app.js`

