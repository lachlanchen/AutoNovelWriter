# T022_pipeline_foreach_action_parse_render — Summary

## Implement
- Backend (`autonovelwriter/backend/server.py`): added `FOREACH_ACTION` container support to v2 parser + AST + renderer, including empty-container validation and AST traversal.
- Runner safety: treats `foreach_action` as a generic container (runs children once) so new scripts don’t crash execution (full per-action iteration is deferred).
- PWA fallback (`autonovelwriter/pwa/app.js`): added `FOREACH_ACTION` parse/render + AST normalization so offline/validate fallback stays consistent with backend.
- Added a no-server round-trip test: `autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py`.

## Fixes
- Parser clarity: updated backend comments to list all supported v2 verbs and added a non-fatal warning (`foreach_action_outside_foreach_task`) when `FOREACH_ACTION` appears outside `FOREACH_TASK` (backend + PWA fallback).

## I18N
- Added `pipeline.verb_foreach_action` label (shown in blocks UI) for all required UI languages. The label stays `FOREACH_ACTION` (pipeline verb) in every locale for consistency with the script language.

## Next
1. Implement real runner semantics for `FOREACH_ACTION` (iterate `task.actions`, propagate explicit ActionResult dataflow).
2. Add PWA toolbar insertion for `FOREACH_ACTION` (wrap selected or append a valid container).
3. Add UI affordances to surface parser warnings (e.g., show `foreach_action_outside_foreach_task` in the pipeline panel instead of only console/log).
4. Extend round-trip fixtures to cover disabled steps and mixed nesting (ROUND + LOOP + FOREACH_*).

## README
- Updated `README.md` to document `FOREACH_ACTION` support in the pipeline script (parse/render + fallback parser), and noted runner semantics are still a placeholder.
