# T007 Plan: Pipeline script v2 (indent + validate)

## Architecture / Design Note

### Fit With Standardized Storage Layout
This task touches **pipeline representation** only and stores it under the existing runtime state root:
- Canonical pipeline script: `autonovelwriter/runtime/state/pipeline.script`
- Derived caches (optional but useful for speed/debug):
  - `autonovelwriter/runtime/state/pipeline.json` (flat list for backward compatibility)
  - `autonovelwriter/runtime/state/pipeline_ast.json` (nested structure produced by v2 parser)

It does **not** change materials/interactions/outputs layout yet, but it must remain compatible with the standardized layout goal:
- Materials/inputs: future `.../projects/<project>/materials/` (out of scope)
- Interactions: `.../runtime/io/inbox|outbox` + `.../runtime/state/chat.jsonl` (already)
- Outputs: future `.../projects/<project>/outputs/` (out of scope)
- Logs: `.../runtime/logs/` (already)
- Tasks/resume: `.../runtime/tasks/` + `.../runtime/state/*` (already)

### Persisted vs Derived vs Ephemeral
- Persisted (source of truth): `pipeline.script`.
- Derived (can be regenerated any time): `pipeline.json`, `pipeline_ast.json`, and parse warnings/errors.
- Ephemeral: in-memory parse results and transient validation output.

All files under `autonovelwriter/runtime/` must remain **gitignored** (already enforced by `.gitignore`).

### API / WS For Observability + Resumability
Backend must remain resumable and observable without requiring the PWA to guess:
- `GET /api/pipeline` returns:
  - `script` (canonical)
  - `pipeline` (flat list, backwards-compatible)
  - `pipeline_ast` (nested representation for v2)
  - `warnings` (non-fatal)
- `POST /api/pipeline` accepts `script` (canonical), validates, and persists.
  - On success: broadcasts WS `{type:"pipeline_updated", ts_ms, script_hash, warnings}`.
  - On failure: returns 400 with `{errors:[{line, error, text}]}` and does NOT mutate persisted script.
- Add `POST /api/pipeline/validate` (no persistence) to support PWA live validation.

## Script v2 Specification (Minimal)
Maintain v1 compatibility while adding indentation-based nesting:
- v1 (still valid):
  - `STEP <type>`
  - `DISABLED <type>`
- v2 additions:
  - `LOOP <n>` starts a loop block; its children are the following indented lines.
  - Indentation: 2 spaces per nesting level (tabs rejected).

Example:
```
# AutoNovelWriter pipeline script v2
STEP plan
LOOP 3
  STEP write
  DISABLED critique_story
STEP summary
```

Structured JSON (nested) proposal (returned as `pipeline_ast`):
- Step: `{kind:"step", type:"write", enabled:true}`
- Loop: `{kind:"loop", repeat:3, children:[...]}`

Additionally return/maintain the existing flat list `pipeline.blocks` for current PWA compatibility.

## Files To Change/Create
- Backend
  - Change `autonovelwriter/backend/server.py`
    - Update parser/render to support v2 loops + indentation.
    - Add explicit validation with line-numbered `errors` and non-fatal `warnings`.
    - Add `POST /api/pipeline/validate`.
    - Add derived cache writes (optional): `pipeline_ast.json`.
    - Emit WS `pipeline_updated` event on successful persistence.
- Step artifacts
  - Create `references/autonovelwriter_dev/steps/T007_pipeline_script_v2_indent/debug.md`
  - Create `references/autonovelwriter_dev/steps/T007_pipeline_script_v2_indent/summary.md`
- README (later stage `update_readme`)
  - Expand Pipeline Script section with v2 nesting + loop syntax and validation behavior.

## Acceptance Checklist
- [ ] `POST /api/pipeline` with v1 script still returns ok and preserves behavior.
- [ ] `POST /api/pipeline` with v2 indented script returns ok and derived JSON includes nesting (`pipeline_ast`).
- [ ] `GET /api/pipeline` returns canonical script that round-trips back to the same derived JSON (for supported constructs).
- [ ] Invalid indent / unknown verbs produce 400 OR warnings with line numbers (no silent ignoring).

## Minimal Verification Commands (No TCP Bind)
```bash
python3 -m py_compile autonovelwriter/backend/server.py

# Ensure new endpoint and tokens exist
rg -n -- "/api/pipeline/validate|LOOP|pipeline_ast" autonovelwriter/backend/server.py

# Ensure runtime state paths used are under runtime/state
rg -n -- "pipeline\\.script|pipeline_ast\\.json" autonovelwriter/backend/server.py

# Step artifacts exist
ls -la references/autonovelwriter_dev/steps/T007_pipeline_script_v2_indent/
```
