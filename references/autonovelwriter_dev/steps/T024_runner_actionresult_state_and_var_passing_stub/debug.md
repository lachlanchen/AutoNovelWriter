# T024_runner_actionresult_state_and_var_passing_stub — Debug Review

## High
- **ActionResults tail is loaded every loop iteration**
  - `await self._action_results.load_tail(...)` runs inside the main `while True` loop.
  - Risk: unnecessary disk reads each step; could become expensive once `action_results.jsonl` grows.
  - Suggested fix: load tail once at runner start (or every N steps / on file mtime change), and/or persist an in-memory index across the run loop.

## Medium
- **ActionResultsStore eviction is arbitrary and potentially confusing**
  - When `_by_id` exceeds `max_in_memory`, it drops an arbitrary key from the dict.
  - Risk: `has(exec_id)` could return false for older exec_ids in long sessions until the next `load_tail()` repopulates, impacting idempotency.
  - Suggested fix: make eviction deterministic (LRU-ish) or avoid eviction and instead rely on `load_tail()` + a larger cap; or store only `ids` set and drop full objects.

## Medium
- **Potential duplication of previous ActionResults on restart if JSONL is large**
  - Idempotency relies on tail-loading a bounded window (`limit_bytes`) rather than full-file indexing.
  - If `action_results.jsonl` exceeds the tail window, old `exec_id`s may not be recognized and could re-run.
  - This is acceptable for a stub milestone but should be called out as a limitation.
  - Suggested fix: persist a compact index (e.g. `action_results_index.json`) or store per-exec_id files.

## Low
- **Logging and WS payload sizes**
  - `ActionResult.inputs.vars` includes the full `vars` map (including previous outputs/artifacts). This can get large over time.
  - WS event `action_result_committed` is already small, but persisted JSONL could balloon quickly.
  - Suggested fix: store a reduced `vars` snapshot (or store only `prev` pointers) and keep large artifacts out of the vars map.

## Acceptance Coverage Check
- ActionResult schema exists (action_id, inputs/outputs/artifacts, timestamps, status): implemented.
- ActionResult is persisted under `runtime/state/` and linked to `ast_path` + `exec_id`: implemented.
- Next step receives explicit vars map derived from prior outputs: implemented (`inputs.vars`).
- Resumability avoids duplication: implemented via deterministic `exec_id` + store check, with a known tail-window limitation noted above.
- Verification without TCP binds: `py_compile` and `runner_actionresult_vars_unit_test.py` pass.

## Separation / Clarity
- Driver stages vs in-app runner semantics: no conflation introduced; this change is purely runner state/dataflow plumbing.
- Pipeline script remains canonical; ActionResults are runtime artifacts derived from executing the pipeline.

