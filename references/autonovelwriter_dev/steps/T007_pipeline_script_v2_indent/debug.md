# T007 Debug

## Acceptance Review (Code-Level)
- v1 compatibility:
  - Parser still accepts `STEP <type>` / `DISABLED <type>` lines; header comments are ignored, so v1 scripts should parse.
  - Canonicalization now renders a v2 header (`# ... v2`) even when no loops are used (likely OK but note it changes the stored header format).
- v2 nesting:
  - `LOOP <n>` is supported with 2-space indentation per nesting level.
  - Returned shapes:
    - `pipeline_ast` (nested)
    - `pipeline.blocks` (flat list derived by flattening the AST; loop structure is not representable in `blocks`).
- Validation:
  - `POST /api/pipeline` returns 400 when `errors` exist (indentation/tab/loop repeat).
  - `POST /api/pipeline/validate` returns 400 on `errors` and includes line-numbered error objects.

## Issues / Risks
- Observability gap vs plan:
  - WS `pipeline_updated` event does not include a `script_hash` or the canonical script; it only includes `warnings`. UI can still refetch `/api/pipeline`, but the event is less self-contained.
- Warning/error schema drift:
  - v2 parser uses `warnings` entries with key `warning`, while earlier v1 warnings used key `error`. This is fine internally, but downstream UI should not assume a single key name.
- GET behavior with invalid on-disk scripts:
  - `GET /api/pipeline` always returns 200 and includes `errors` if the on-disk script is invalid (e.g., manually edited). It also overwrites derived caches (`pipeline.json`, `pipeline_ast.json`) from that invalid script. That’s probably acceptable, but it’s worth noting for operability.
- Header upgrade could surprise users:
  - Persisted canonical script now has v2 header even for v1-only content. If external tools key off the header string, this may be a behavior change.
- Flat list loses loop semantics:
  - `pipeline.blocks` cannot represent loops; only `pipeline_ast` can. Any existing UI/runner logic still using `blocks` will behave like a flattened sequence, not a looped structure.

## Separation Checks
- Driver stages vs in-app pipelines:
  - No coupling to driver stages was introduced here (good).
- Pipeline script <-> blocks translation:
  - Canonical artifact is the script; `pipeline_ast` is the structured translation; `pipeline.blocks` remains a backward-compatible derived view.

## Host-Side Smoke Tests (Outer Driver)
1. POST a v1 script and verify it persists and reloads unchanged in semantics (even if header upgrades).
2. POST a v2 script with a loop and verify:
   - `pipeline_ast` shows a loop with children
   - `pipeline.blocks` is flattened in order
3. POST a script with a tab-indented child line; expect 400 with `tab_indent_not_allowed`.
4. Verify the UI remains stable when `/api/pipeline` returns `warnings` and that runner behavior is not accidentally interpreting flattened `blocks` as looped execution.
