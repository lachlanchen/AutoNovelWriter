# T019 Plan: PWA: insert LOOP/ROUND/FOREACH_TASK blocks

## Architecture / Design Note

### Fit With Standardized Storage Layout
- This task is **PWA-only UX** for editing the in-app pipeline; it does not introduce new runtime folders.
- Canonical pipeline artifact remains the formatted script persisted by the backend at:
  - `autonovelwriter/runtime/state/pipeline.script` (gitignored)
- The PWA edits a derived nested structure in-memory (`pipelineAst`) and immediately re-renders the canonical script into the Script textarea; persistence to disk remains via existing backend endpoint:
  - `POST /api/pipeline` (backend writes `pipeline.script` + derived `pipeline_ast.json`)

### Persisted vs Derived vs Ephemeral (and gitignore)
- Persisted (gitignored, backend-managed):
  - `autonovelwriter/runtime/state/pipeline.script` (canonical)
  - `autonovelwriter/runtime/state/pipeline_ast.json` (derived cache for UI)
- Persisted (browser-local, PWA-managed):
  - localStorage cached pipeline script/AST (existing `LS_PIPELINE_SCRIPT`, `LS_PIPELINE_AST`)
- Derived:
  - The Blocks list is rendered from `pipelineAst`.
  - The script textarea is rendered from `pipelineAst` (AST -> script) on each edit.
- Ephemeral:
  - Current selection (`selected` path key), drag state, and insertion UI state (e.g. “insert after selection”).

### API / WS Events Needed (Observability + Resumability)
- No new backend APIs required.
- Existing behaviors must remain correct:
  - `POST /api/pipeline/validate` continues to be used to refresh Blocks view from the canonical script (and is the source of truth when backend is reachable).
  - WS `pipeline_updated` keeps the PWA synced if another client edits pipeline.
- PWA-only: insertion should mark pipeline state as `dirty` (existing pill) until the user clicks Save.

## UX / Semantics (Tight Scope)
- Add an “Insert” control group in the **Blocks** toolbar (next to Indent/Outdent/Save/Reset) to insert:
  - `LOOP`
  - `ROUND`
  - `FOREACH_TASK`
- Placement rule (to keep scripts valid and behavior predictable):
  1. If a block is selected: **wrap the selected block** inside the new container.
     - This guarantees the container is non-empty (backend rejects empty containers).
  2. If no block is selected: append the container at the root with a single default child step (e.g. `STEP write`), so it’s still valid.
- Repeat initialization:
  - `LOOP` and `ROUND` default `repeat=1` and reuse the existing inline repeat editor.
  - `FOREACH_TASK` has no repeat and shows the existing foreach badge.
- After insertion:
  - Update selection to the inserted container (or its child, if wrapping) and update indent button enabled-state (existing `updateIndentButtons()`).

## Files To Change / Create (Implement Stage)
- `autonovelwriter/pwa/index.html`
  - Add buttons/menu for inserting container blocks in the Blocks toolbar.
  - Ensure `data-i18n`, `data-i18n-title`, and `data-i18n-aria-label` are used for any new strings.
- `autonovelwriter/pwa/app.js`
  - Add insertion functions:
    - `insertContainer(kind)` where `kind in ('loop','round','foreach_task')`
    - helper to “wrap selected” vs “append with default child”
  - Reuse existing update flow:
    - `setPipeStatus('dirty')`
    - `updateDerivedFromAst({ writeScript: true })`
    - `renderPipeline()`
  - Localize any newly introduced strings and (optionally) convert the per-block mini “Indent/Outdent/enabled” labels to use existing i18n keys while touching the same UI area.
- `autonovelwriter/pwa/app.css`
  - Minimal styling for the new insert controls consistent with existing toolbar buttons.

## Acceptance Checklist
- Insert containers:
  - From Blocks UI, user can insert `ROUND` and `FOREACH_TASK`; script textarea updates immediately with correct 2-space indentation.
  - Inserted containers never produce empty-container scripts (backend would reject); wrapping/placeholder behavior ensures validity.
- Repeat editing:
  - `LOOP`/`ROUND` repeat counts are editable inline; invalid values show localized inline feedback (existing behavior; must remain working for newly inserted blocks).
- Editing operations remain correct:
  - Indent/outdent works with inserted containers.
  - Drag reorder works for inserted containers at the same parent level.
- I18N:
  - All new UI strings are added for: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de` and Arabic remains RTL-safe.

## Minimal Verification Commands (No TCP Binds)
- JavaScript syntax check:
  - `node --check autonovelwriter/pwa/app.js`
- Optional quick grep to ensure i18n keys exist for all languages:
  - `rg -n \"pipeline\\.insert\" autonovelwriter/pwa/app.js`
