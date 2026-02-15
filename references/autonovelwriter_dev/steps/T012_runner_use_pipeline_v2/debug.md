# T012 Debug: Runner executes v2 pipeline script/AST

## Acceptance Review
- Runner uses v2 pipeline parsing to derive enabled steps:
  - `Runner._run_loop()` calls `parse_pipeline_script_v2(script)` and derives `blocks` from the returned `pipeline.blocks`.
- Deterministic flattened order matching AST preorder:
  - Flattening is via `_flatten_ast_steps()` inside `parse_pipeline_script_v2`, which does a deterministic preorder walk and ignores `LOOP repeat` counts (treats loops as grouping).
- Sandbox-safe verification exists:
  - Helper `flatten_enabled_steps_from_script_v2()` enables a no-server unit-style flatten-order check.

## Issues / Risks

### Medium: LOOP repeat counts are ignored by runner
- Current behavior matches acceptance notes (“ignore repeat counts initially”), but it means nested rounds/loops in the UI do not actually repeat in execution.
- Follow-up: implement repeat semantics deterministically (and persist loop counters/pointers for resumability).

### Medium: Fatal pipeline parse errors fall back to default pipeline (may surprise user)
- On v2 parse errors, runner logs errors and then executes `default_pipeline()` rather than stopping the run or surfacing a terminal run/task error.
- Impact: user may believe they are running their edited pipeline but actually run the default.
- Follow-up: prefer transitioning the runner/task to an `error` state and require user correction (or only run the last-known-good canonical pipeline hash).

### Low: `pipeline_ast` is currently unused in the runner loop
- Not a bug, but a missed opportunity for richer semantics (loops, grouping) and clearer logging (e.g., log the flattened list derived from AST vs pipeline.blocks).

### Context note (not part of T012 acceptance)
- The “Scratch program” default canvas layout with `ROUND` / `FOREACH_TASK` is not implemented by this task (it requires extending the script grammar and UI).

## Non-Issues Observed
- Separation between driver stages and in-app pipeline steps remains intact (no new terminology introduced).
- Light theme unaffected (backend-only change).

