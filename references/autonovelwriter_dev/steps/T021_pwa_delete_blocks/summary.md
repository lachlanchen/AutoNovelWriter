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

## I18N
- Added localized UI strings for the new Delete action: `pipeline.delete` and `pipeline.delete_title` in all required UI languages (en, zh-Hans, zh-Hant, ja, ko, vi, ar, fr, es, ru, de).

## Next
1. Add an undo/redo stack for pipeline AST edits (delete/indent/outdent/insert).
2. Add `FOREACH_ACTION` container support in script parse/render and the PWA insert toolbar.
3. Add Action Library and make STEP blocks reference `action_id` (copy-on-edit semantics).
4. Add a “batch details + activate” flow in Task Batches panel (view manifest, set active batch for FOREACH_TASK).

## README
- Documented block deletion in `README.md` under “Blocks UI notes” (Delete button + `Delete` key; container delete splices children and keeps containers non-empty).
