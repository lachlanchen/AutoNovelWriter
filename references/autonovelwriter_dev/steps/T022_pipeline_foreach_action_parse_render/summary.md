# T022_pipeline_foreach_action_parse_render — Summary

## Implement
- Backend (`autonovelwriter/backend/server.py`): added `FOREACH_ACTION` container support to v2 parser + AST + renderer, including empty-container validation and AST traversal.
- Runner safety: treats `foreach_action` as a generic container (runs children once) so new scripts don’t crash execution (full per-action iteration is deferred).
- PWA fallback (`autonovelwriter/pwa/app.js`): added `FOREACH_ACTION` parse/render + AST normalization so offline/validate fallback stays consistent with backend.
- Added a no-server round-trip test: `autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py`.

## Fixes
- Parser clarity: updated backend comments to list all supported v2 verbs and added a non-fatal warning (`foreach_action_outside_foreach_task`) when `FOREACH_ACTION` appears outside `FOREACH_TASK` (backend + PWA fallback).
