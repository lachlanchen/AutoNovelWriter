## Plan (T028_pwa_insert_foreach_action_and_if_else)

### Architecture / Design Notes
- This is a PWA-only change: add toolbar actions that mutate the in-memory `pipelineAst`, immediately re-render the canonical script textarea via `renderScriptFromAst()`, and rely on existing `/api/pipeline` save/load for persistence.
- Storage layout fit:
  - Canonical pipeline script persisted by backend at `autonovelwriter/runtime/state/pipeline.script` (gitignored).
  - Derived `pipeline_ast.json` and `pipeline.json` persisted by backend under `autonovelwriter/runtime/state/` (gitignored).
  - PWA caches ephemeral UI state and last-seen pipeline in `localStorage` (`anw_pipeline_*` keys).
- Persisted vs derived vs ephemeral:
  - Persisted: pipeline script/ast/json via backend endpoints; no new runtime files required.
  - Derived: `pipeline` flattened list derived from `pipelineAst`.
  - Ephemeral: selection, drag state, and unsaved localStorage cache.
- API/WS needed:
  - No new endpoints. Continue using `GET/POST /api/pipeline` and `POST /api/pipeline/validate`.
  - Existing WS event `pipeline_updated` is sufficient for cross-client updates.

### UI Behavior (Insert Containers)
- Add Blocks toolbar buttons:
  - `Add FOREACH_ACTION`:
    - Wrap-selected: replace selected node with `{kind:'foreach_action', children:[selected]}`.
    - Append-root: append `{kind:'foreach_action', children:[{kind:'step', type: defaultStepType(), enabled:true}]}`.
  - `Add IF` (creates IF with default ELSE branch):
    - Default expression: keep simple and valid, e.g. `true` (string stored as `expr`).
    - Wrap-selected: selected node becomes the first then-child; else-branch gets a placeholder STEP so backend validation does not error with `else_empty`.
    - Append-root: then-branch gets a placeholder STEP; else-branch gets a placeholder STEP.
    - “Optional ELSE” requirement is satisfied by inserting ELSE by default and allowing the user to delete the ELSE node (leaving IF-only).
- After insertion:
  - mark pipeline as dirty, `removeEmptyContainers(pipelineAst)`, `updateDerivedFromAst({writeScript:true})`, and `renderPipeline()` (same pattern as existing `insertContainer()`).

### Delete Semantics (Avoid Invalid ELSE Outside IF)
- Current delete behavior “splices children up” needs an IF-specific rule:
  - Deleting an `if` node must splice up its then-children and else-children, but must NOT leave a raw `else` node at the parent level (that would produce invalid scripts: `ELSE` without `IF`).
  - Deleting an `else` node should splice up its children into the IF’s `children` list (effectively removing the ELSE wrapper).
  - Ensure non-empty constraints remain true:
    - IF must have at least one then-child (`if_empty` is a fatal validation error).
    - ELSE must not exist with empty children (`else_empty` is a fatal validation error).
  - Keep keyboard Delete behavior unchanged (still calls `deleteSelected()`).

### I18N
- Add new i18n keys for toolbar buttons (label + title), across all required UI languages:
  - `pipeline.add_foreach_action`, `pipeline.add_foreach_action_title`
  - `pipeline.add_if`, `pipeline.add_if_title`
- Reuse existing `pipeline.verb_if` / `pipeline.verb_else` keys (already added in T027) for block labels.

### Files To Change
- `autonovelwriter/pwa/index.html`
  - Add toolbar buttons with ids: `pipeAddForeachAction`, `pipeAddIf`.
- `autonovelwriter/pwa/app.js`
  - Add DOM bindings for the new buttons.
  - Extend `insertContainer()` (or add a new helper like `insertForeachAction()` / `insertIfElse()`) to implement wrap+append.
  - Update `deleteSelected()` to special-case `if` and `else` kinds to avoid emitting invalid scripts.
  - Add i18n keys + translations for the new toolbar buttons/titles.

### Acceptance Checklist
- Blocks toolbar has buttons to insert `FOREACH_ACTION` and `IF` (IF includes ELSE by default; ELSE removable by deleting the ELSE node).
- Insertion works for wrap-selected and append-root cases; canonical script textarea updates immediately.
- Deleting IF/ELSE and FOREACH_ACTION containers is predictable:
  - IF delete splices branch children without leaving ELSE at parent level.
  - ELSE delete removes ELSE wrapper and splices its children.
  - No invalid empty containers are generated (IF has then-child; ELSE has children if present).
- Keyboard Delete continues to work for selected blocks.
- New UI strings localized across: en, zh-Hans, zh-Hant, ja, ko, vi, ar, fr, es, ru, de.

### Minimal Verification Commands (No Server Start)
- `node --check autonovelwriter/pwa/app.js`

