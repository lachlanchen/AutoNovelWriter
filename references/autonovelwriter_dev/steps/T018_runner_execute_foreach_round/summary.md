# T018 Summary: Runner: execute ROUND/FOREACH_TASK semantics

## Implement
- Replaced flatten-only runner execution with a cursor-driven AST executor:
  - `ROUND <n>` repeats its children `n` times.
  - `FOREACH_TASK` executes its children per task (task context), while steps outside run in global context.
- Persisted a resumable execution cursor in `autonovelwriter/runtime/state/runner_state.json`:
  - includes `pipeline_hash` and an execution `stack` of container frames with indices.
  - cursor is saved after each block so pause/restart can resume without repeating work.
- Observability:
  - `run_status` now includes cursor context fields (`phase`, `round_index`, `round_repeat_total`, `ast_path`).
  - `runner.log` lines include round/phase/task context for each executed block.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\npaths=s.resolve_paths(); s.ensure_runtime_dirs(paths)\nhub=s.WebSocketHub(); r=s.Runner(paths, hub)\nscript='''# AutoNovelWriter pipeline script v2\nROUND 2\n  STEP meta_tasks_generate\n  FOREACH_TASK\n    STEP write\n'''\n_, ast, w, e = s.parse_pipeline_script_v2(script)\nassert not e\ns._save_json(s.Path(paths['tasks_json']), [{'id':'t1','title':'T1','payload':{}},{'id':'t2','title':'T2','payload':{}}])\nst={}\nr._cursor=r._init_cursor(r._pipeline_hash(script))\nseq=[]\nfor _ in range(20):\n  nxt=r._cursor_next_step(ast,r._load_tasks(),st)\n  if not nxt: break\n  c=nxt['ctx']; seq.append((c['round_index'],c['phase'],c.get('task_id'),nxt['node']['type']))\n  r._cursor_commit_pending()  # simulate successful completion\nassert seq==[(0,'global',None,'meta_tasks_generate'),(0,'foreach','t1','write'),(0,'foreach','t2','write'),(1,'global',None,'meta_tasks_generate'),(1,'foreach','t1','write'),(1,'foreach','t2','write')]\nprint('ok')\nPY`

## Fixes
- Fixed resumability correctness: the runner now records a `cursor.pending` step and only advances the cursor after the block completes successfully (prevents skipping unfinished blocks after restart).
- Improved observability: `run_status.ast_path` now points at the active pending step node path while a block is in-flight.
- Added container context to `task_status` WS broadcasts (`pipeline_hash`, `phase`, `round_index`, `round_repeat_total`; plus `block` on `running`/`error`).

## I18N
- No new/changed PWA user-facing strings in this task (backend-only runner semantics/WS payload changes), so no translation updates were required.

## Next
1. Decide and implement the `FOREACH_TASK` policy for tasks with status `done` (skip vs rerun-per-round), and align `task_status.json` semantics accordingly.
2. Emit a structured WS event when the pipeline script hash changes and the resume cursor is invalidated (so the PWA can surface a clear “restart required” message).
3. Update the PWA to display the new `task_status` context fields (`round_index`, `phase`, `block`) and show the current `run_status.ast_path` in the pipeline UI for better observability.
4. Add a minimal unit test (no socket bind) that simulates a crash between “start” and “done” and verifies the pending-step resume behavior.

## README
- Updated `README.md` to reflect that the runner now executes v2 `ROUND`/`FOREACH_TASK` semantics and persists a resumable cursor (`runner_state.json`) that only advances after successful block completion.
