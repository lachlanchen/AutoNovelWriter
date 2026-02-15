# T016 Summary: Blocks UI: edit loop repeat counts

## Implement
- Added inline repeat count editor for `LOOP` and `ROUND` container blocks in the PWA blocks list.
- Validates repeats as integers in `1..10000`; invalid input shows inline error and does not update the canonical script.
- On valid edits, updates `pipelineAst.repeat` and immediately re-renders the canonical pipeline script from AST.

Verification (no TCP binds):
- `node --check autonovelwriter/pwa/app.js`
