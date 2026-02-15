# T021_pwa_delete_blocks — Summary

## Implement
- Added a per-block **Delete** action in the pipeline canvas (STEP + container blocks).
- Delete semantics:
  - STEP: removes the node; if the parent container would become empty, inserts a safe default STEP to keep scripts valid.
  - Containers (LOOP/ROUND/FOREACH_TASK): deletes the container by splicing its children into the parent at the same index.
- Added keyboard shortcut: `Delete` deletes the currently selected block (ignored while typing in inputs/textareas).
- Added i18n keys for Delete across all required UI languages.
- Added a small Node unit-style test: `autonovelwriter/pwa/tests/pipeline_ast_delete.test.js`.

## Fixes
- Changed the keyboard shortcut to use `Delete` only (not `Backspace`) to reduce accidental deletes; updated the tooltip translations accordingly.
