# T017 Summary: Runner: meta_tasks_generate writes task batch

## Implement
- Added a runner block action `meta_tasks_generate` that creates a new batch folder under `autonovelwriter/runtime/tasks/batches/<batch_id>/`.
- Writes:
  - `tasks.jsonl` (at least 1 JSONL task; stub tasks derived from materials + recent chat tail, best-effort)
  - `manifest.json` (metadata: project/task/block/timestamps/counts/sources)
- Persists completion + `output_paths` under `autonovelwriter/runtime/state/task_status.json` for resumability (idempotent if outputs already exist).
- Observability:
  - runner log line: `[tasks] created batch: ... count=<n>`
  - WS event: `tasks_batch_created` with batch path and task count
- PWA parity:
  - added `meta_tasks_generate` to the PWA default pipeline/allowed types so offline script parsing doesn’t drop the new step type.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `node --check autonovelwriter/pwa/app.js`
- `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\npaths=s.resolve_paths(); s.ensure_runtime_dirs(paths)\nhub=s.WebSocketHub(); r=s.Runner(paths, hub)\nst={}\nres=r._write_tasks_batch_stub('task_test','meta_tasks_generate',st)\nassert res.get('ok')\nprint(res['batch_dir'], res['task_count'])\nPY`

## Fixes
- Made `meta_tasks_generate` run-session scoped: subsequent tasks reuse the first created batch (avoids creating one batch per task while `FOREACH_TASK` execution semantics are still flattened).
- If `autonovelwriter/runtime/tasks/tasks.json` is still the seeded placeholder, the generated stub tasks are promoted into `tasks.json` so the runner can pick them up next.

## I18N
- No new user-facing UI strings were introduced in this task (PWA change was adding a new internal pipeline step type to the default list).
