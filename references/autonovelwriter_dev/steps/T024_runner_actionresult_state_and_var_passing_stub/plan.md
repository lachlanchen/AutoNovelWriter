# T024_runner_actionresult_state_and_var_passing_stub — Plan

## Goal
Add **explicit dataflow** between actions in the runner by introducing a structured, persisted **ActionResult** per executed `STEP`, and a persisted **vars map** that the next `STEP` receives (stub plumbing only; no new real tool execution required).

This is the first step toward “Scratch variables” style execution where each action consumes prior outputs explicitly (instead of scanning folders).

## Architecture / Design Notes

### Fit With Standardized Storage Layout
This task adds runner-produced execution records under the existing runtime state area:
- `autonovelwriter/runtime/state/action_results.jsonl` (append-only ActionResult log; gitignored via `runtime/state/*`)
- (optional) `autonovelwriter/runtime/state/action_results/` (per-result JSON files if we want easier random access)

It complements existing persisted runtime state:
- pipeline canonical script: `autonovelwriter/runtime/state/pipeline.script`
- pipeline AST (derived): `autonovelwriter/runtime/state/pipeline_ast.json`
- runner cursor/resume: `autonovelwriter/runtime/state/runner_state.json`
- task list/status: `autonovelwriter/runtime/tasks/tasks.json`, `autonovelwriter/runtime/state/task_status.json`
- outputs/artifacts: `autonovelwriter/runtime/projects/<project_id>/outputs/`, task batch folders under `autonovelwriter/runtime/tasks/batches/`

### Persisted vs Derived vs Ephemeral
- Persisted:
  - ActionResult records (JSONL append-only; one record per committed step execution).
  - Runner cursor + last vars snapshot in `runner_state.json` (so restart can resume and rehydrate vars).
- Derived:
  - A “current vars” view for the running step (derived from persisted vars + current ctx).
  - Any UI summaries (e.g. last N results) derived from JSONL.
- Ephemeral:
  - In-memory runner caches (e.g. for meta task batches) remain session-scoped.

### Gitignore Requirements
- All ActionResult artifacts are under `autonovelwriter/runtime/state/` and are already ignored by repo policy.
- If we introduce a new directory under runtime (e.g. `runtime/state/action_results/`), it must stay under ignored runtime.

### Schema: ActionResult (Minimum)
Define a stable JSON object for each committed step execution:
- `id`: stable execution id (`exec_id`) derived from context (see idempotency).
- `ts_start_ms`, `ts_end_ms`
- `status`: `ok|error|skipped`
- `action_id`: the executed action id (the pipeline step token)
- `task_id`: optional (only when inside `FOREACH_TASK`)
- `phase`: `global|foreach`
- `round_index`, `round_repeat_total`
- `ast_path`: list of indices to the step node in `pipeline_ast`
- `inputs`: object (explicit inputs given to the action; initially minimal stub)
- `outputs`: object (explicit outputs; used to build vars for next step)
- `artifacts`: list of objects `{path, kind, name}` (optional; can reference outputs files/batches)
- `error`: optional error object `{code, detail}`

### Idempotency + Resumability (No Duplicate Results)
Key invariant: **cursor advances only after ActionResult is durably committed**.

Implementation approach:
- When the runner selects a pending step, compute a deterministic `exec_id` from:
  - `pipeline_hash` (already in cursor)
  - `ctx.task_id` (or global exec task id)
  - `ctx.ast_path`
  - `ctx.round_index`
- Persist the `exec_id` in `cursor.pending.exec_id`.
- Commit sequence:
  1. Write ActionResult record (append JSONL line; optionally also write `runtime/state/action_results/<exec_id>.json`).
  2. Only then call `_cursor_commit_pending()` and `_save_state()`.
- Restart behavior:
  - If `cursor.pending` exists and its `exec_id` already exists on disk, skip re-execution and only commit cursor.

This satisfies acceptance: restart does not duplicate already-committed ActionResults.

### Vars Map (Explicit Data Passing)
Persist a minimal vars snapshot in `runner_state.json`:
- `vars_global`: last committed outputs in global phase
- `vars_by_task[task_id]`: last committed outputs for that task (foreach phase)

At step selection time, include `vars` in the ctx passed to the step executor:
- `vars.run.pipeline_hash`
- `vars.ctx.ast_path`, `vars.ctx.round_index`, `vars.ctx.task_id`
- `vars.prev.action_id`
- `vars.prev.outputs` (object)
- `vars.prev.artifacts` (list)
- `vars.prev.action_result_id` (exec_id)

Stub semantics for now:
- After each step completes, set `vars.prev.outputs = action_result.outputs` and `vars.prev.artifacts = action_result.artifacts`.
- Do not attempt deep merging; “last writer wins”.

### API/WS Events For Observability + Resumability
No new PWA UI is required in this task, but the runner should emit WS events so the UI can become observable:
- `action_result_committed`:
  - `{type, ts_ms, exec_id, action_id, task_id, ast_path, status}`
- (optional) include `vars_preview` (small, redacted) if safe.

If we add REST later:
- `GET /api/run/action_results?tail=200` could stream the JSONL tail (not required for T024).

## Files To Change / Create (Implementation Stage)
- Backend:
  - `autonovelwriter/backend/server.py`
    - add ActionResult schema helpers + persistence (JSONL append, optional per-id file)
    - extend runner cursor pending with `exec_id`
    - persist vars snapshots to `runner_state.json`
    - plumb vars into step execution stubs (write/meta_tasks_generate/others)
    - emit WS `action_result_committed`
  - `autonovelwriter/backend/tests/runner_actionresult_vars_unit_test.py`
    - unit-style test using temp runtime dir; no socket binds

## Acceptance Checklist
- [ ] Define ActionResult schema: `action_id`, `inputs`, `outputs`, `artifacts[]`, timestamps, `status`.
- [ ] Runner writes ActionResult to `autonovelwriter/runtime/state/` and links it to cursor/`ast_path` (store exec_id + ast_path).
- [ ] Next step receives explicit `vars` map derived from prior ActionResult outputs (documented keys).
- [ ] Resumability: restart does not duplicate already-committed ActionResults (pending exec_id detection).
- [ ] Verification: no TCP binds; python import/compile checks and a unit-style runner test pass.

## Minimal Verification Commands (No TCP Binds)
```bash
python3 -m py_compile autonovelwriter/backend/server.py
python3 autonovelwriter/backend/tests/runner_actionresult_vars_unit_test.py
```

