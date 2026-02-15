# T008 Debug

## Acceptance Review
- Nested blocks render with indentation/grouping:
  - `pipeline_ast` is rendered with `LOOP` groups and an indented child `<ol>`; repeat count is shown as a badge (`xN`).
  - Visual nesting is primarily the left border + margin on `.blocks.nested`; this is readable but subtle for deep nesting.
- Indent/outdent updates script + blocks:
  - For block interactions (toggle, drag-reorder, indent/outdent): script textarea is re-rendered immediately from the in-memory AST, and the nested blocks re-render immediately.
  - For direct script edits: blocks update only after a 500ms debounced backend `/api/pipeline/validate` call and only when the script is valid (not strictly “immediate”).
- Save persists and reload restores nesting:
  - Save persists `script` (canonical) and receives `pipeline_ast` back; reload reads `pipeline_ast` from `/api/pipeline` and renders nesting.
- Drag reorder within a nesting level:
  - Drag/drop is constrained by a `parentPath` key so moves only occur among siblings; cross-level drops are ignored.

## Issues / Risks
- Indent UX is constrained:
  - `Indent` only works when the previous sibling is already a `LOOP` (it moves the node into that loop’s children). There is no UI to create a loop container or “wrap selection in LOOP”, so most indent attempts will no-op with an error message.
  - This is probably acceptable for T008’s minimal scope, but it may not match user expectations for “indent/outdent” (users may expect indentation to implicitly create a grouping/loop).
- Script-edit sync is backend-dependent:
  - When editing the script textarea, blocks are refreshed via backend validation (`/api/pipeline/validate`). If the backend is down/unreachable, the UI cannot re-derive the nested blocks from the canonical script (it only keeps the last known AST).
  - WS `pipeline_updated` currently triggers a validate round-trip to get `pipeline_ast` rather than including it in the WS payload (works, but adds latency/extra coupling).
- Path-by-index selection stability:
  - Node identity is implicit via index-path (e.g. `2.0.3`). Re-parsing the script may rebuild the AST and invalidate the currently selected key. The UI clears selection on validate/save, which avoids crashes, but selection is not stable across edits.
- Nested DOM structure + drag/drop edge cases:
  - Nested `<ol>` is rendered inside a draggable `<li>` for loop nodes. Depending on browser event bubbling, drops on child containers may also trigger parent handlers; current `dragParent` gating should mitigate, but this likely needs host-side manual testing.

## Operability / Resumability Checks
- LocalStorage caches:
  - Stores script and AST (`anw_pipeline_script`, `anw_pipeline_ast`) for best-effort offline/refresh behavior.
  - Source-of-truth remains backend `pipeline.script`; localStorage should be treated as fallback only.
- Light theme:
  - Changes remain consistent with the existing light theme tokens and layout.

## Separation Checks
- Driver stages vs in-app pipelines:
  - No coupling introduced.
- Pipeline script <-> blocks translation:
  - Script remains canonical; nested blocks are derived from `pipeline_ast` and refreshed via validate.
