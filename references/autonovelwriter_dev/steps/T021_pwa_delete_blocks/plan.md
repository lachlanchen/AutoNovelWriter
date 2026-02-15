# T021_pwa_delete_blocks — Plan

## Goal
Add first-class block deletion in the PWA pipeline canvas:
- Delete control per block (STEP + containers).
- Optional keyboard shortcut (Delete/Backspace).
- Keep the **formatted pipeline script** canonical: mutate `pipelineAst`, then re-render script via `renderScriptFromAst()`.

## Architecture / Design Notes

### Storage layout fit
- This task only changes the **PWA editor** behavior for the pipeline script/AST.
- Persisted artifacts remain the same:
  - Canonical pipeline script: `autonovelwriter/runtime/state/pipeline.script` (backend) and `LS_PIPELINE_SCRIPT` (browser cache).
  - Derived AST/JSON: served by backend (`/api/pipeline`) and cached in browser (`LS_PIPELINE_AST`, `LS_PIPELINE`).
- No new materials/interactions/outputs/logs/projects/tasks/state paths are introduced.

### Persisted vs derived vs ephemeral
- Persisted:
  - Pipeline script text (canonical) and the saved pipeline on backend when the user clicks `Save`.
- Derived:
  - `pipelineAst` parsed from the canonical script (backend validate endpoint or local parser fallback).
  - Flattened `pipeline.blocks` used for legacy/simple rendering.
- Ephemeral (not persisted, reset on reload):
  - Current selection (`selected` path key), drag state (`dragFrom`, `dragParent`), UI-only error display.

### Gitignore expectations
- Runtime remains gitignored (`autonovelwriter/runtime/**`).
- No new secrets/config files.
- If adding a tiny JS test file under `autonovelwriter/pwa/tests/`, it is source-controlled (not runtime).

### API / WS observability and resumability
- No new API endpoints or WS events required.
- Existing behavior is sufficient:
  - User edits locally update the script textarea immediately.
  - `Save` persists to backend; backend can broadcast `pipeline_updated` over WS.
  - Runner already guards against canonical script changes via hash mismatch; deleting blocks changes the script and should behave the same as any edit.

## UX / Semantics

### Delete semantics
- Deleting a `STEP`:
  - Remove the node from its parent `children` array.
  - If this removal makes the **parent container empty**, do **not** remove the container; instead insert a safe default child `STEP` (enabled) using the existing `defaultStepType()`.
- Deleting a container (`LOOP`/`ROUND`/`FOREACH_TASK`):
  - Default behavior: **splice children up** into the parent at the container’s index (stable order).
  - If the container has no children (should be prevented by the editor), treat it like deleting an empty container: remove the container, then ensure the parent container is non-empty (same rule as above).
- Root emptiness:
  - If deletion would make the root empty, insert a default `STEP` so the UI remains usable and the script remains valid.

### Selection after delete
- Prefer selecting:
  - the next sibling at the same level if it exists,
  - else the previous sibling,
  - else the parent container itself.

### Keyboard shortcut (optional)
- When the active element is not an `INPUT`/`TEXTAREA`/`SELECT`:
  - `Delete` and `Backspace` delete the currently selected block.
- Must not interfere with typing in the script textarea or settings inputs.

### i18n
Add new user-facing strings for all required UI languages:
- `pipeline.delete` (button label, likely short: “Delete”)
- `pipeline.delete_title` (tooltip, e.g. “Delete selected block (Del)” or “Delete this block”)
- Optional confirmation copy should be avoided for this small task; keep delete undo-free but deterministic (future task can add undo).

## Files To Change / Create (Implementation Stage)
- `autonovelwriter/pwa/app.js`
  - Add delete button in each block’s `.bactions` next to Indent/Outdent.
  - Add `deleteSelected()` + helpers:
    - `ensureNonEmptyContainers(ast)` (or targeted check) to insert default child steps rather than pruning empties.
    - container splice logic.
  - Add keyboard handler for Delete/Backspace.
  - Add i18n keys for all 11 UI languages.
- `autonovelwriter/pwa/app.css`
  - Optional: style a “danger” mini button variant (still light theme).
- (Optional but recommended) `autonovelwriter/pwa/tests/pipeline_ast_delete.test.js`
  - Node-run unit-style tests for AST deletion transforms (no DOM, no server).

## Acceptance Checklist
- [ ] Canvas shows a Delete control for each block (STEP/ROUND/LOOP/FOREACH_TASK).
- [ ] Deleting a STEP removes it and updates AST+script deterministically.
- [ ] Deleting a container splices its children into the parent (no orphan nodes) and updates AST+script.
- [ ] If deleting would produce an empty required container, insert a safe default child STEP (do not rely on pruning containers away).
- [ ] All new UI strings localized for `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`.
- [ ] No server start required; JS syntax check and a small AST transform test (unit-style) pass.

## Minimal Verification Commands (No TCP binds)
```bash
node --check autonovelwriter/pwa/app.js
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

