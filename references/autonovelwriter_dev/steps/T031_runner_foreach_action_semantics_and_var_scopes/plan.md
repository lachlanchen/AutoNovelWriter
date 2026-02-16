## Plan (T031_runner_foreach_action_semantics_and_var_scopes)

### Architecture / Design Notes
- Fits the standardized runtime layout by extending runner state under `autonovelwriter/runtime/state/`:
  - Inputs: active tasks list `autonovelwriter/runtime/tasks/tasks.json` (populated by batch activation) where each task may include `payload.actions` (list of action refs).
  - State: `autonovelwriter/runtime/state/runner_state.json` cursor + vars (gitignored).
  - Outputs: append-only ActionResults `autonovelwriter/runtime/state/action_results.jsonl` (gitignored).
- Persisted vs derived vs ephemeral:
  - Persisted (gitignored):
    - Runner cursor (`runner_state.json.cursor`) so restarts resume exactly.
    - Vars maps (`runner_state.json.vars_*`) so downstream steps consume explicit prior outputs without rescanning folders.
    - ActionResults (`action_results.jsonl`) as the canonical execution log for idempotency + UI observability.
  - Derived:
    - `exec_id` is derived deterministically from ctx (pipeline_hash + ast_path + task + round + foreach_action metadata).
  - Ephemeral:
    - In-memory caches (action results tail index, meta batch cache) and transient local variables in the run loop.
- Semantics to implement:
  - `FOREACH_TASK`: already iterates runnable tasks (skips `error`).
  - `FOREACH_ACTION` (new real semantics):
    - Only meaningful inside a `FOREACH_TASK` task context.
    - For the current task, read `task.payload.actions` as a list of action refs (string action ids and/or dict refs).
    - Iterate action refs in order; for each action, execute `FOREACH_ACTION` children.
    - Provide an *action-scope* vars namespace that is stable for that `(task_id, action_key)` pair, plus a task-scope namespace.
  - Placeholder support (recommended, minimal): if a STEP token is exactly `<action_id>`, execute the current `ctx.action_id` from the `FOREACH_ACTION` loop (so the documented default canvas layout can work end-to-end).

### Runner State / Vars Model
- Extend persisted vars to include action-scope:
  - `vars_global`: run-global (existing)
  - `vars_by_task[task_id]`: task-scope (existing)
  - `vars_by_task_action[task_id][action_key]`: action-scope (new)
- Vars returned to a step (`ActionResult.inputs.vars`) should be explicit and stable:
  - `vars.ctx` includes: `task_id`, `phase`, `round_index`, `round_repeat_total`, `ast_path`, plus `action_index`, `action_id`, `action_key` when inside `FOREACH_ACTION`.
  - `vars.prev` stays as a convenience alias for the current scope’s previous result (action-scope when in `FOREACH_ACTION`, else task/global).
  - Add `vars.task.prev` and `vars.action.prev` so downstream steps can explicitly choose task-level vs action-level “previous” outputs.
- Update rules after each committed ActionResult:
  - Always update task-scope `prev` when `task_id` is set.
  - Additionally update action-scope `prev` when `action_key` is set.

### Resumability / Idempotency
- Update `_exec_id_for_ctx()` payload to include `action_index` and `action_key` (or `action_id`) when present, so each `(task, action loop iteration, ast_path)` has a unique deterministic exec_id.
- Cursor frames:
  - Add fields for `foreach_action`: `action_i`, `action_ref`, `action_key` (plus `child_i`), and advance deterministically like `foreach_task`.
  - Ensure cursor only advances after `_cursor_commit_pending()` (already the invariant).

### API / WS Observability
- No new HTTP APIs required.
- Extend existing WS event(s) in a backward-compatible way:
  - `action_result_committed`: include optional `action_index`, `action_id_ref`, `action_key` (or a nested `foreach_action` object) so PWA can show per-action-loop progress without reading files.
  - `run_status`: optionally include current `action_index/action_id` in the cursor context when inside `FOREACH_ACTION`.

### Files To Change / Create
- Backend runner implementation:
  - `autonovelwriter/backend/server.py`
    - `Runner._cursor_next_step()` (real `foreach_action` iteration)
    - `Runner._exec_id_for_ctx()` (include foreach_action metadata)
    - `Runner._vars_for_ctx()` + `Runner._update_vars_from_action_result()` (task vs action scope + `prev` aliasing)
    - `Runner.__init__()` + `Runner._save_state()` (persist/load `vars_by_task_action`)
    - `Runner._run_loop()` ActionResult shaping (add action-loop metadata, phase `foreach_action` when applicable, placeholder `<action_id>` substitution)
- Tests:
  - Add `autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py`
    - Simulate one task with `payload.actions=[...]`
    - Pipeline script includes `FOREACH_TASK -> FOREACH_ACTION -> STEP <action_id>`
    - Assert:
      - ctx has `action_index/action_id`
      - exec_id differs per action iteration
      - ActionResults persisted contain foreach_action metadata
      - vars passing: `task.prev` persists across action iterations, `action.prev` is per-action

### Acceptance Checklist
- Runner executes `FOREACH_ACTION` children once per entry in `task.payload.actions` (within `FOREACH_TASK`) and sets `ctx.action_id`/`ctx.action_index`.
- ActionResult records include action-loop metadata (`phase='foreach_action'`, `action_index`, `action_id_ref`/`action_key`).
- Vars include `prev` plus stable `task` vs `action` namespaces so downstream steps consume outputs explicitly (no folder scanning).
- Restart/resume is idempotent (exec_id includes action-loop metadata; committed ActionResults are not duplicated).
- Unit test covers multi-action task cursor advancement + persistence + var plumbing.

### Minimal Verification Commands (No Server Start / No TCP Bind)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 autonovelwriter/backend/tests/runner_actionresult_vars_unit_test.py`
- `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py`
