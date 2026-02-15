# T018 Debug: Runner: execute ROUND/FOREACH_TASK semantics

## What Looks Good
- `ROUND <n>` and `FOREACH_TASK` container execution is implemented in the runner via `Runner._cursor_next_step()` and a persisted cursor stack in `autonovelwriter/runtime/state/runner_state.json` (`autonovelwriter/backend/server.py`).
- `meta_tasks_generate` is executed in global context (when placed outside `FOREACH_TASK`) and uses a per-round execution key (`__global_round_<i>_of_<n>`) so it can run once per round.
- Logging now includes container context (`round=x/y phase=... task=... block=...`), and `run_status` includes cursor context fields.

## Issues / Risks

### 1) Resume Cursor Advances *Before* Block Execution (Can Skip Work After Restart)
- In `Runner._cursor_next_step()`, when a `step` node is selected, the parent frame’s `child_i` is incremented **before** the block is executed.
- If the process crashes/restarts after the cursor is advanced (and possibly persisted) but before the block finishes, the next run will continue from the subsequent node, potentially **skipping** the unfinished block entirely.

Why this matters for acceptance:
- Acceptance requires: “after process restart, continues from the next unfinished (round, task, block)”.
- With pre-advance, a block can be neither “done” in `task_status.json` nor re-attempted due to the cursor already moving past it.

Concrete repro (conceptual):
1. Start a run; observe log line: `block=write start`.
2. Kill process before `block=write done` and before output/status is recorded.
3. Restart; runner resumes at the next node (cursor already advanced), leaving the `write` block unfinished with no output.

### 2) `run_status.ast_path` Is Not The Current Step’s Path (Telemetry Ambiguity)
- `_emit_status()` builds `run_status` from `_cursor_context()`, which reports `ast_path` and `child_i` from the **top cursor frame** (typically a container like `foreach_task`), not the specific `step` node currently executing.
- The per-step `ctx["ast_path"]` computed inside `_cursor_next_step()` is not surfaced in the emitted `run_status` payload.

Impact:
- Debugging/resume UIs can’t reliably point to “the exact block” in the script/AST that is running.
- This also makes it harder to verify resume correctness externally.

### 3) `task_status` WS Events Don’t Include Container Context
- `_task_mark_running/_task_mark_done/_task_mark_error` broadcast `{type:"task_status", task_id, status, ...}` without `round_index`, `phase`, `block`, or `pipeline_hash`.
- Acceptance asks for WS `run_status`/`task_status` to reflect container context. `run_status` does, but `task_status` currently does not.

### 4) `FOREACH_TASK` Reruns “done” Tasks (UI Status Churn, Relies On Per-Block Idempotency)
- `foreach_task` selection does not skip tasks with overall status `"done"`; it will execute children again unless each block’s own idempotency skips.
- Additionally `_task_mark_running()` will change a task from `"done"` to `"running"` (it only preserves `"running"`/`"error"`), which can create confusing UI “done -> running -> done” churn across rounds.

This might be intended (rerun per round), but if not, the runner needs a clear policy:
- Either “each ROUND is a full rerun” (then task status should be scoped per round/execution key), or
- “done tasks are skipped” (then selection should treat `"done"` as non-runnable).

### 5) Cursor Invalidation Behavior Is Safe But Abrupt (No UX Hook Yet)
- If the pipeline script changes, the runner logs a message and stops run, clearing cursor. This is safe, but the user has no structured WS event describing “cursor invalidated” vs generic idle.

## Acceptance Check (Current State)
- `ROUND 2` + `STEP meta_tasks_generate` + `FOREACH_TASK` children:
  - Likely correct: `meta_tasks_generate` runs once per round (global exec key), `write` runs in task context.
- Cursor persistence:
  - Cursor is persisted, but pre-advancing introduces “skip unfinished work” risk after restart (see Issue 1).
- Observability:
  - `runner.log` and `run_status` include round/phase/task/block context.
  - `task_status` WS lacks container context (see Issue 3).

## Suggested Fix Direction (For T018 Fix Stage)
- Make cursor advancement atomic with block success:
  - Option A: store a “current step pointer” (`pending_step`) in the cursor and only increment `child_i` after success.
  - Option B: do not mutate cursor in `_cursor_next_step()`; instead return a “proposal” and commit cursor after success.
  - In either approach, persist cursor frequently, but ensure a restart retries any step not marked done in `task_status.json`.
- Emit `run_status.ast_path` for the *actual executing node* (the returned step’s `node_path`) and include it in saved state if useful.
- Add minimal container context to `task_status` events (at least `round_index`, `phase`, and `pipeline_hash`; optionally `block` when transitioning running/done/error).
- Decide and document `FOREACH_TASK` policy for `"done"` tasks:
  - Skip done tasks by default, or
  - Scope task status per round/execution (so “done” is per round).

