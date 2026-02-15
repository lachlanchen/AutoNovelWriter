# T016 Debug: Blocks UI: edit loop repeat counts

## Acceptance Review
- Change repeat updates canonical script immediately:
  - PASS: editing the repeat input for `LOOP`/`ROUND` updates `pipelineAst.repeat` and calls `updateDerivedFromAst({ writeScript: true })`, which rewrites the canonical script textarea from AST.
- Invalid repeats prevented/validated with visible feedback:
  - PASS: non-integer / empty / out-of-range values show an inline error (`pipeline.repeat_err`) and do not mutate AST/script; blur snaps back to the last valid value.
- New strings localized for 11 UI languages:
  - PASS: added `pipeline.repeat_aria`, `pipeline.repeat_title`, `pipeline.repeat_err` across `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`.

## Issues / Risks

### Low: Focused repeat input does not visually “select” the block
- `focus` sets `selected` but does not re-render the list (re-render would drop focus), so the orange selected outline may not appear unless the user also clicks the block body.
- Impact: mild UX confusion; does not affect correctness (indent/outdent buttons become enabled via `updateIndentButtons()`).
- Possible follow-up: add a focus ring style on `.repeat-input:focus` or apply a CSS class on the parent `li` without full re-render.

### Low: Live validation can show error while typing
- Because `input` commits on each keystroke, intermediate states like clearing the field briefly show the error.
- This satisfies “validated with feedback” but could be softened (e.g., validate on blur/Enter only).

### Low: Backend/PWA parity relies on shared max range
- PWA clamps/validates to `1..10000`, matching current backend validation behavior.
- If backend constraints change, UI and server could diverge; consider exposing limits from backend in `/api/pipeline` metadata later.

## Notes
- Light theme preserved (minor CSS additions only).
- Canonical artifact rule preserved: script is always derived from AST after valid edits; persistence remains explicit via Save.
