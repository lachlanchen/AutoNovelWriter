# T007 Summary: Pipeline script v2 (indent + validate)

## Implement
- Extended canonical pipeline script to v2 with indentation + `LOOP <n>` blocks (2 spaces per nesting level; tabs rejected).
- Added explicit `warnings` and line-numbered `errors` (no silent ignoring).
- `/api/pipeline` now returns `pipeline_ast` (nested) plus the existing flat `pipeline.blocks` for backward compatibility.
- Added `POST /api/pipeline/validate` (no persistence) for validation/preview.
- On successful persistence, backend broadcasts WS `{type:"pipeline_updated", ...}`.
- Persisted derived cache: `autonovelwriter/runtime/state/pipeline_ast.json`.

Verification notes:
- No TCP-binding tests run in this sandbox; used syntax-only checks.

## Fixes
- Canonical rendering now preserves v1 header when no loops exist; v2 header is used only when a `LOOP` node exists in `pipeline_ast`.
- Normalized v2 `warnings` and `errors` objects to use a consistent `code` key (plus `line` and `text`).
- WS `pipeline_updated` now includes the canonical `script` and `script_hash` (SHA-256); API responses include `script_hash` on successful save and `canonical_hash` from `/api/pipeline/validate`.
