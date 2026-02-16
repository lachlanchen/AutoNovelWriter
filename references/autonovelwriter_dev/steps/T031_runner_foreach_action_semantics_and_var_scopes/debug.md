# Debug (T031_runner_foreach_action_semantics_and_var_scopes)

## Acceptance Review
- Runner executes `FOREACH_ACTION` children once per entry in `task.payload.actions` / `task.actions` within `FOREACH_TASK`: **Mostly OK** (real iteration is implemented; see edge case below when actions list is missing/empty).
- ActionResult records include action-loop metadata (`phase='foreach_action'`, `action_index`, `action_id_ref`): **OK** (`autonovelwriter/backend/server.py` adds these fields and WS includes them).
- Vars include `prev` + stable per-scope namespaces (task vs action): **OK** (`vars.prev`, `vars.task.prev`, `vars.action.prev`; action-scope persisted under `vars_by_task_action`).
- Resumability/idempotency: restart should not duplicate committed ActionResults: **OK** in principle (`exec_id` includes action-loop metadata + ActionResultsStore `has(exec_id)` skip).
- Unit test for multi-action task asserts cursor advancement + ActionResult persistence + var passing: **OK** (`autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py`).
- Verification commands: **OK** (`py_compile` + unit tests pass).

## Issues (Fix Required)
1. **`STEP <action_id>` with missing/empty `task.actions` still commits a stub ActionResult.**
   - Current design resolves `<action_id>` at runtime from `ctx.action_id`. If the task has no actions, `ctx.action_id` is unset, but the runner still executes the step as a generic stub and commits an ActionResult with `action_id="<action_id>"`.
   - This breaks the intent of `<action_id>` as a placeholder and pollutes ActionResults/vars with a non-action token.
   - Files: `autonovelwriter/backend/server.py` (`Runner._run_loop`, `Runner._cursor_next_step` `_actions_for_task` fallback behavior).

2. **Empty actions list semantics are ambiguous and currently “1 iteration” rather than “0 iterations”.**
   - `_actions_for_task()` returns a single sentinel action (`__none__`) when no actions are provided, which causes `FOREACH_ACTION` children to execute once per task.
   - Acceptance wording (“once per entry in `task.actions`”) implies 0 iterations when the list is empty/missing.
   - Files: `autonovelwriter/backend/server.py` (`_actions_for_task`).

## Issues (Should Fix / Clarify)
1. **`action_index` is 0-based.**
   - This is fine, but it should be documented/standardized (PWA display vs storage). Otherwise later UI might assume 1-based indexing.
   - Files: `autonovelwriter/backend/server.py` (ctx derivation; ActionResult fields).

2. **Potential unbounded growth of `vars_by_task_action` in long runs.**
   - Action-scope vars are persisted in `runner_state.json` and keyed by `(task_id, action_key)`. Over time this can grow without limits.
   - Not blocking for this task, but a follow-up should add caps/eviction or persist only the minimum (`prev`) needed for dataflow.
   - Files: `autonovelwriter/backend/server.py` (`Runner._save_state`, `Runner._update_vars_from_action_result`).

## Separation / Canonical Script Notes
- The canonical pipeline script now permits `STEP <action_id>` as a special token; this is separate from Action Library action ids (which are restricted to `[A-Za-z0-9_-]`), so it should not collide with real actions.
- Ensure future work keeps the rule clear: script token `<action_id>` is a placeholder resolved only inside `FOREACH_TASK` + `FOREACH_ACTION`.

