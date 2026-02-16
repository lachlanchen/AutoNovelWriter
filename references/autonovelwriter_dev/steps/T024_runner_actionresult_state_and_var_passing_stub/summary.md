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

## Fixes
- Reduced runner overhead by making `ActionResultsStore.load_tail()` a one-time load per process (no repeated disk tail scans every step).
- Improved idempotency robustness within a long-running process by never evicting `exec_id`s from the in-memory `_ids` set; only full objects may be dropped from `_by_id` when capped.

## I18N
- No new PWA user-facing strings were introduced by T024 (runner-only state/dataflow plumbing). No localization changes required.

## Next
1. Add a minimal API to fetch ActionResults tail (e.g. `GET /api/run/action_results?tail=200`) so the PWA can show a live “Variables / ActionResults” panel without reading disk directly.
2. Make idempotency durable for large histories: write per-`exec_id` files or maintain a compact on-disk index so restarts can reliably detect already-committed results beyond the JSONL tail window.
3. Implement `FOREACH_ACTION` runner semantics: iterate `task.actions`, feed each action’s outputs into the next via the vars map, and emit one ActionResult per action execution.
4. Reduce persisted `inputs.vars` size (store only `prev` pointers and small previews; keep large data in artifacts).

## README
- Documented ActionResult persistence (`autonovelwriter/runtime/state/action_results.jsonl`) and WS `action_result_committed`.
