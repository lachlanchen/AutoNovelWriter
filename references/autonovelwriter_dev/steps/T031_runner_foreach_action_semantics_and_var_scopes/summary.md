## Implement
- Runner: implemented real `FOREACH_ACTION` iteration over `task.actions` / `task.payload.actions`, setting `ctx.action_id`, `ctx.action_index`, `ctx.action_key`, and phase `foreach_action`: `autonovelwriter/backend/server.py`.
- Runner: added action-scope vars (`vars_by_task_action`) alongside task/global vars, with explicit `vars.task.prev` vs `vars.action.prev` and `vars.prev` bound to the current scope: `autonovelwriter/backend/server.py`.
- Runner: strengthened resumability by including action-loop metadata in deterministic `exec_id` derivation and persisting action-scope vars to `runner_state.json`: `autonovelwriter/backend/server.py`.
- Runner: added a placeholder `STEP <action_id>` behavior to execute the current `FOREACH_ACTION` action id so the default Scratch-like layout can run end-to-end: `autonovelwriter/backend/server.py`.
- Tests: added a unit test that runs the runner over a task with multiple actions and asserts ActionResult metadata + vars behavior: `autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py`.

Verification (no server start):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/runner_actionresult_vars_unit_test.py`
- `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py`

## Fixes
- Adjusted `FOREACH_ACTION` semantics to do **zero iterations** when the task has no `actions` list (so it truly runs once per entry): `autonovelwriter/backend/server.py`.
- Prevented `STEP <action_id>` from executing/committing an ActionResult unless a real `ctx.action_id` is present (avoids polluting results/vars with the placeholder token): `autonovelwriter/backend/server.py`.
- Added a regression unit test for the empty-actions case to ensure no ActionResults are committed: `autonovelwriter/backend/tests/runner_foreach_action_empty_actions_unit_test.py`.

## I18N
- No user-facing PWA strings were added/changed in this task (runner semantics + backend-only state/WS metadata changes only).
