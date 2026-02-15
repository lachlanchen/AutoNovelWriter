# T021_pwa_delete_blocks — Debug Review

## Acceptance Coverage
- Delete control per block: implemented via a per-node mini button in `autonovelwriter/pwa/app.js`.
- STEP delete updates AST + script deterministically: `deleteSelected()` mutates `pipelineAst` then calls `updateDerivedFromAst({ writeScript: true })`.
- Container delete splices children into parent: container nodes are replaced by `...node.children` via `splice`.
- “Never empty container” rule: after deletion, `ensureNonEmptyChildren(container)` inserts a default STEP when the parent `children` array becomes empty (covers nested containers and root).
- i18n: added `pipeline.delete` and `pipeline.delete_title` for all required UI languages.
- Verification: `node --check autonovelwriter/pwa/app.js` and `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` pass.

## Issues / Risks
- **Backspace shortcut may be surprising**: `Backspace` deletes the selected block when focus isn’t in an input/textarea/select. This is consistent with “keyboard shortcut optional”, but could conflict with user expectations on some platforms (even though most browsers no longer navigate back on Backspace). If this causes UX complaints, consider gating to `Delete` only or requiring a modifier.
- **Test logic duplication**: `autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` re-implements deletion helpers instead of importing from `app.js` (which isn’t modular). This is fine for a small unit-style test, but it can drift if deletion semantics evolve.
- **No cleanup of pre-existing invalid AST**: `deleteSelected()` ensures the *parent* container isn’t empty, but it doesn’t attempt to prune/repair unrelated empty containers that might already exist in `pipelineAst` (e.g., from corrupted localStorage). This task doesn’t create empties, so it’s low risk; just note that a “repair AST” helper might be useful later.

## Operability / Resumability Notes
- This change only affects the PWA editor. It preserves the separation between:
  - driver stages (plan/implement/debug/...) and in-app pipelines (blocks/script),
  - canonical script (source of truth) vs derived AST/JSON.
- Runner behavior remains correct: script edits will change the pipeline hash; resumability guard should stop/invalidate as before.

## Repo Hygiene
- `git status` shows an untracked prompt artifact: `references/autonovelwriter_dev/prompts/T021_pwa_delete_blocks_debug.txt` (likely driver-generated). No action taken in this stage.

