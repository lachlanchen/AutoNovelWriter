# T011 Debug: Runner writes drafts/revisions to outputs (stub)

## Acceptance Review
- Output file creation:
  - `Runner._write_draft_stub()` writes `draft_<task_id>_<timestamp>_<suffix>.md` under:
    - `autonovelwriter/runtime/projects/<active_project>/outputs/`
  - Content includes a stub header + `settings.novel.*` snapshot.
- Observability:
  - Emits WS event `output_created` with `{project_id, task_id, block, path}`.
  - Emits `log` event line: `[output] created: <path>`.
- Persistence:
  - Updates `autonovelwriter/runtime/state/task_status.json` with:
    - `st[task_id].blocks.write = {status:"done", ts_ms, output_paths:[...]}`
  - Idempotency check skips re-writing if `blocks.write.status=="done"` and the referenced file exists.

## Issues / Risks

### High: Runner uses legacy pipeline parser (v1) not v2 AST/script
- In `Runner._run_loop()`, blocks are derived via `parse_pipeline_script(script)` (v1 flat parser).
- The canonical pipeline artifact used elsewhere is v2 (`parse_pipeline_script_v2` + persisted `pipeline_ast`).
- Impact:
  - Runner semantics can diverge from what the PWA shows/edits (especially with `LOOP <n>` nesting + indentation).
  - Resumability/observability is weaker if UI and runner disagree about the block list/order.
- Fix suggestion (next stage): switch runner to v2 parsing and execute from the derived flattened order of `pipeline_ast` (ignoring `LOOP` repeat counts for now, or implementing repeat counts deterministically).

### Medium: Task marked done even if write fails
- If `_write_draft_stub()` were to error/raise (disk full/permissions), the current control flow still proceeds and ultimately marks the task `done`.
- Impact: task status can falsely report completion, violating “reflects the write step completion”.
- Fix suggestion: catch exceptions in `_write_draft_stub()` and mark `blocks.write.status="error"` and/or keep task in `running`/`error` state without finalizing to `done`.

### Medium: Persisted output path is absolute-only
- `output_paths` stores `str(out_path)` (absolute path). This is fine for a single-host setup but makes portability harder and complicates future APIs/UI.
- Suggestion: store both `project_rel_path` (e.g. `outputs/<file>`) and absolute path for debugging, or store project-relative only and derive absolute from `projects_root`.

### Low: No UI handling for `output_created`
- Acceptance doesn’t require PWA updates, but for operability it may be useful for the PWA to surface a clickable hint (or at least a chat/system message) when an output is created.

## Notes
- Light theme unaffected (backend-only change).
- No new runtime top-level directories introduced; outputs live under the existing standardized project layout.

