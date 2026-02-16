# T024_runner_actionresult_state_and_var_passing_stub — Summary

## Implement
- Added runner ActionResult persistence (append-only) at `autonovelwriter/runtime/state/action_results.jsonl`.
- Introduced deterministic per-step `exec_id` (derived from pipeline hash + task/global scope + round index + AST path) to support idempotency on restart.
- Runner now:
  - commits an ActionResult record per executed STEP (including `inputs.vars`, `outputs`, `artifacts`, timestamps, status)
  - persists `vars_global` / `vars_by_task` snapshots in `autonovelwriter/runtime/state/runner_state.json`
  - computes a `vars` map for each execution from the previous ActionResult outputs and supplies it to the step as explicit inputs (stub plumbing)
  - emits WS event `action_result_committed` for observability
- Added a unit-style test (no sockets): `autonovelwriter/backend/tests/runner_actionresult_vars_unit_test.py`.

