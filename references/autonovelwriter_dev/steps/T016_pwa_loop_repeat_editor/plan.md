# T016 Plan: Blocks UI: edit loop repeat counts

## Architecture / Design Note

### Fit With Standardized Storage Layout
- Persisted (canonical):
  - `autonovelwriter/runtime/state/pipeline.script` (formatted pipeline script; source of truth)
  - `autonovelwriter/runtime/state/pipeline.json` and/or `pipeline_ast.json` (derived cached representations used for UI/runner; backend already serves/accepts these via `/api/pipeline`)
- Derived:
  - `pipeline_ast` in API responses (nested structure for indentation/containers like `LOOP`, `ROUND`, `FOREACH_TASK`)
  - `pipeline` flattened JSON (blocks list) derived from AST for simpler views
- Ephemeral:
  - PWA in-memory `pipelineAst`
  - PWA localStorage caches (`anw_pipeline_ast`, `anw_pipeline_script`, `anw_pipeline`) for offline continuity

Gitignore expectations:
- Everything under `autonovelwriter/runtime/` is mutable runtime state and must remain gitignored.
- PWA localStorage is per-browser and not part of repo state.

### Persisted vs Derived vs Ephemeral (Repeat Editing)
- The repeat count is stored in container AST nodes:
  - `kind:"loop"` uses `repeat`
  - `kind:"round"` uses `repeat`
- Editing repeat in the Blocks UI updates in-memory `pipelineAst`, then re-renders the canonical script via `renderScriptFromAst(pipelineAst)` and marks pipeline as dirty.
- Persistence occurs only on explicit Save (`POST /api/pipeline`), which returns canonical script + normalized AST for storage in `autonovelwriter/runtime/state/`.

### API/WS Observability + Resumability Requirements
No new endpoints required if we reuse existing flow:
- `POST /api/pipeline` persists updated script/AST and returns canonical script + `pipeline_ast`.
- `POST /api/pipeline/validate` optionally used for immediate feedback (especially when backend is reachable).
- WS `pipeline_updated` must continue to exist so other tabs/clients can refresh pipeline state after saves.

Client-side UX for editability/feedback:
- While editing repeat counts, avoid breaking the “script is canonical” rule by always deriving script from AST immediately after a valid edit.
- Invalid input should be blocked (clamp) or displayed with clear inline feedback without writing invalid canonical script.

## Files To Change / Create
- `autonovelwriter/pwa/app.js`
  - Add an editable repeat control for `loop`/`round` nodes in the blocks list (inline numeric input or small modal).
  - Validate repeats as integer `>= 1` (and likely `<= 10000` to match backend validator).
  - On valid change: update node.repeat, call `setPipeStatus('dirty')`, `updateDerivedFromAst({ writeScript: true })`, and `renderPipeline()`.
  - Add user-visible feedback for invalid input (inline error text near the input, or input validity styling).
  - Ensure keyboard accessibility:
    - Tab focuses the input; Enter commits; Escape reverts (if using modal).
    - Do not hijack Tab-indent behavior when focus is in the repeat input (already respected for `INPUT`).
- `autonovelwriter/pwa/app.css`
  - Minimal styling for the repeat input and invalid state (keep light theme).
- `autonovelwriter/pwa/app.js` (i18n dictionary)
  - Add i18n keys for any new labels/tooltips/errors for 11 UI languages.
- `references/autonovelwriter_dev/steps/T016_pwa_loop_repeat_editor/summary.md`
  - Append implement notes, verification, and i18n summary in later stages.

## Acceptance Checklist
- Blocks UI:
  - LOOP and ROUND blocks expose an editable repeat count.
  - Changing repeat updates the canonical script textarea immediately (no Save required to see it).
- Validation:
  - Non-integers, empty values, or values `< 1` are prevented or show immediate, user-visible feedback.
  - Values above the allowed max are clamped or rejected consistently with backend rules (prefer `<= 10000`).
- Accessibility:
  - Repeat editing is keyboard-operable and does not interfere with block indent/outdent shortcuts.
- i18n:
  - All new UI strings are localized across: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`.

## Minimal Verification Commands (No TCP Binds)
- JS syntax:
  - `node --check autonovelwriter/pwa/app.js`
- Optional quick grep sanity:
  - `rg -n "repeat" autonovelwriter/pwa/app.js | head`
