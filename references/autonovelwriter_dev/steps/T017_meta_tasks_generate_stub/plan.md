# T017 Plan: Runner: meta_tasks_generate writes task batch

## Architecture / Design Note

### Fit With Standardized Storage Layout
- Materials (inputs): `autonovelwriter/runtime/projects/<project_id>/materials/`
- Interactions (inputs): `autonovelwriter/runtime/state/chat.jsonl` (recent chat), plus optional file signals in `autonovelwriter/runtime/io/inbox/` + `autonovelwriter/runtime/io/outbox/`
- Tasks (this feature): create a new batch folder under runtime tasks:
  - `autonovelwriter/runtime/tasks/batches/<batch_id>/tasks.jsonl` (generated tasks)
  - `autonovelwriter/runtime/tasks/batches/<batch_id>/manifest.json` (metadata: project_id, sources, counts, timestamps)
- State/logs:
  - Persist completion + output paths under `autonovelwriter/runtime/state/task_status.json` for the current task and `meta_tasks_generate` block.
  - Append human-readable lines to `autonovelwriter/runtime/logs/runner.log`.

Important separation:
- These batches live under `autonovelwriter/runtime/` and must not touch `references/autonovelwriter_dev/tasks/task_queue.jsonl` (driver’s dev-task queue).

### Persisted vs Derived vs Ephemeral
- Persisted:
  - Batch outputs on disk (`runtime/tasks/batches/...`)
  - Per-task/per-block status (`runtime/state/task_status.json`)
- Derived:
  - Task list content is “derived” from current materials + recent interactions (stub content is OK initially).
- Ephemeral:
  - In-memory snippets of materials/chat used to produce the stub list

Gitignore expectations:
- All of `autonovelwriter/runtime/` remains gitignored (including generated batches and manifests).

### API/WS Events For Observability + Resumability
Runner-generated signals (needed so the PWA can stay observable without polling):
- `log` (existing): include `[tasks] created batch: <path> count=<n>`
- New WS event (proposed): `tasks_batch_created`
  - fields: `project_id`, `task_id`, `block:"meta_tasks_generate"`, `batch_id`, `batch_dir`, `tasks_jsonl`, `task_count`
- `task_status` (existing): mark block completion and include `output_paths` for the batch files so it’s resumable after restart.

No new HTTP endpoints required for this stub (batch is created by runner action).

## Files To Change / Create
- `autonovelwriter/backend/server.py`
  - Add runner action handler for block type `meta_tasks_generate`.
  - Implement `_write_tasks_batch_stub(task_id, block_type, st)`:
    - idempotent if already completed and outputs still exist
    - create `runtime/tasks/batches/<batch_id>/`
    - write `tasks.jsonl` with at least 1 task line (JSON object per line)
    - write `manifest.json` with metadata + counts
    - update `task_status.json` for the current task/block with `status:"done"` and `output_paths`
    - broadcast `tasks_batch_created` and log the path/count
- Runtime defaults (if needed):
  - Ensure `autonovelwriter/runtime/tasks/batches/` exists (created on demand).

## Acceptance Checklist
- Pipeline block `STEP meta_tasks_generate` creates:
  - a new folder under `autonovelwriter/runtime/tasks/batches/`
  - at least one `.jsonl` file (tasks list) inside it
- Observability:
  - Runner log line includes created batch path and task count
  - WS event includes created batch path and task count
- Resumability:
  - `autonovelwriter/runtime/state/task_status.json` records `meta_tasks_generate` completion with `output_paths`
  - Re-running the same task/block is idempotent (does not duplicate batch if already completed and outputs exist)
- Driver separation:
  - No writes under `references/autonovelwriter_dev/` (driver queue untouched)

## Minimal Verification Commands (No TCP Binds)
- Syntax/import:
  - `python3 -m py_compile autonovelwriter/backend/server.py`
- Focused unit-style check (no server bind):
  - `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\npaths=s.resolve_paths(); s.ensure_runtime_dirs(paths)\n# Instantiate runner and call the stub method directly in a small harness once implemented.\nprint('ok')\nPY`
