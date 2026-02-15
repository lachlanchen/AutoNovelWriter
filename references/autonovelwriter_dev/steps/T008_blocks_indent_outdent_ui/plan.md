# T008 Plan: Blocks UI indent/outdent + nested render

## Design Note (Storage + Persist/Derive + Observability)
- Storage fit:
  - Canonical pipeline artifact remains the formatted script at `autonovelwriter/runtime/state/pipeline.script`.
  - Nested structure is derived as `pipeline_ast` and may be cached at `autonovelwriter/runtime/state/pipeline_ast.json`.
  - The PWA renders and edits nesting by operating on `pipeline_ast` in-memory and immediately re-rendering the canonical script into the script textarea.
- Persisted vs derived vs ephemeral:
  - Persisted (disk, gitignored): `runtime/state/pipeline.script` (canonical), `runtime/state/pipeline_ast.json` (cache), other runtime state.
  - Derived (in-memory/UI): `pipeline.blocks` flattened view for backward compatibility, nested render tree from `pipeline_ast`.
  - Ephemeral (browser): drag state, selection state, localStorage caches (best-effort, not source of truth).
  - Gitignore: everything under `autonovelwriter/runtime/` (already expected) including `pipeline.script` and caches.
- API/WS events needed for observable/resumable UI:
  - `GET /api/pipeline` must be treated as source of truth for `{script, pipeline_ast, script_hash?, warnings, errors}`.
  - `POST /api/pipeline` (with `{script}`) persists; on success WS `pipeline_updated` should contain `{script, script_hash, warnings}` so the UI can update without a refetch.
  - Optional (nice-to-have for UX): `POST /api/pipeline/validate` used client-side before save to surface indentation/loop errors without persisting.
  - Existing runner/chat WS events remain unchanged (this task is pipeline visualization/editing only).

## Files To Change/Create
- Change: `autonovelwriter/pwa/app.js`
  - Fetch and store `pipeline_ast` from `/api/pipeline`.
  - Render nested blocks from `pipeline_ast` (loop groups + child lists).
  - Add selection model (active node) and per-node indent/outdent actions.
  - Keep script textarea canonical: any AST edit re-renders script into textarea; any script edit re-validate/parse (via backend validate endpoint) and re-renders blocks.
  - Restrict drag reorder to siblings (same parent list) initially.
- Change: `autonovelwriter/pwa/index.html`
  - Add small UI controls near “Blocks”: indent/outdent buttons (operate on selected node) + hint for keyboard shortcuts.
- Change: `autonovelwriter/pwa/app.css`
  - Visual nested indentation, loop grouping (repeat badge), selected node highlight, and compact per-block control buttons.

## Implementation Steps (High Level)
1. Data model in PWA:
   - Introduce `pipelineAst` (root node) alongside existing `pipeline` flat structure.
   - On load: prefer backend `/api/pipeline` and capture `script`, `pipeline_ast`, `warnings`, `errors`.
2. Nested renderer:
   - Render `root.children[]` as an ordered list.
   - `step` nodes render as draggable items with enable toggle (existing enabled state) and indent/outdent controls.
   - `loop` nodes render as a group header (`LOOP n`) with a nested `<ol>` for children.
3. Edit operations on AST:
   - Maintain a stable “path” to a node (array of child indices) so selection, indent/outdent, and DnD can operate deterministically.
   - Indent:
     - If previous sibling is a `loop`, move the selected node into that loop’s `children` (append).
     - Otherwise no-op (and log a UI message) to keep behavior predictable/minimal.
   - Outdent:
     - If parent is a `loop`, move the node to become a sibling immediately after that loop in the parent list.
     - Otherwise no-op.
   - After each operation: re-render script from AST (client-side render that matches backend formatting: 2-space indents, `LOOP n`, `STEP/DISABLED`), update textarea, mark dirty, and update derived flat preview (optional).
4. Script textarea sync:
   - On textarea change (debounced): call `POST /api/pipeline/validate` with `{script}`.
   - If ok: accept returned `pipeline_ast` and re-render nested blocks; if not ok: keep current blocks but show validation errors in the chat/log area (do not auto-save).
5. Save:
   - Continue using `POST /api/pipeline` with `{script: pipelineScript.value}` as the primary persistence path.
   - On success: update local `pipelineAst` from response, set status saved.
6. Drag reorder (same nesting level only):
   - Allow dragging within the same `<ol>` container; disallow cross-container drops.
   - Ensure reorder updates AST sibling list, then re-render script and UI.

## Acceptance Checklist
- Nested blocks render clearly:
  - `LOOP n` groups with visible indentation and children list.
  - Steps inside loops appear visually nested.
- Indent/outdent works:
  - Button clicks and keyboard shortcuts (`Tab` indent, `Shift+Tab` outdent) move the selected node only when valid.
  - Script textarea updates immediately to the canonical formatted script after indent/outdent.
- Persistence:
  - Save persists script+derived JSON; reload (`GET /api/pipeline`) restores the same nesting (`pipeline_ast`).
- Drag reorder safety:
  - Drag reorder works among siblings within the same nesting level.
  - Cross-level drops are blocked (no structure corruption).

## Minimal Verification Commands (No TCP Binds)
- `node --check autonovelwriter/pwa/app.js` (if Node is available)
- `rg -n \"pipeline_ast|LOOP|Shift\\+Tab|Tab\" autonovelwriter/pwa/app.js`
