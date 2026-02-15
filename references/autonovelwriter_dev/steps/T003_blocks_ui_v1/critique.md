# T003 Critique: Scratch-like pipeline blocks v1 (drag/drop, task list)

## Acceptance Check
- Drag/drop reorder:
  - Implemented via HTML5 DnD in `autonovelwriter/pwa/app.js` (`dragstart` + `drop` handlers on each block).
  - Likely OK for a first pass, but real behavior needs a browser check (sandbox avoids TCP binds).
- Pipeline persists and reloads:
  - Backend persistence exists: `GET/POST /api/pipeline` in `autonovelwriter/backend/server.py` persisted to `autonovelwriter/runtime/state/pipeline.json`.
  - PWA loads pipeline on startup from backend, with `localStorage` fallback (`anw_pipeline`).
- Block types map to spec:
  - Default pipeline includes the types listed in `docs/autonovelwriter_spec.md` (`plan`, `write`, `critique_*`, `fix_*`, `summary`, `log`, `commit_push`).

## Issues / Risks
- DnD reorder correctness edge cases:
  - Reorder is implemented as “drop onto an item index” with an `insertAt` adjustment when dragging down. This can still feel unintuitive without a visible drop indicator or explicit “insert before/after” behavior (especially when dropping onto the last item).
  - No support for keyboard reordering; acceptable for v1, but DnD alone can be brittle on mobile.
- Persistence ambiguity (server vs localStorage):
  - The UI always writes `localStorage` on save, even if the backend POST fails. That’s good for offline use, but it can mask server save failures and lead to divergence between browser state and `pipeline.json` on disk.
  - Status pill shows `dirty/saved`, but a failed backend save still leaves local state “updated”; consider surfacing “saved locally only”.
- Backend validation is minimal:
  - `POST /api/pipeline` validates `blocks` is a list and each block has a `type`, but it does not restrict `type` to known values. That’s fine for flexibility, but it can allow typos to persist silently.
  - No size limits; a malicious client could write an extremely large pipeline JSON (low risk in local dev, but worth noting).
- “Task list” not implemented:
  - Task title mentions “task list”, but acceptance criteria only covers blocks reorder/persist/spec mapping. If a visible task list is expected, it’s currently missing.

## Operability / Path Clarity
- API URL derivation:
  - `autonovelwriter/pwa/app.js` derives API base from the WS URL (ws->http). This is pragmatic, but it assumes the API is on the same host:port as WS (true today).
  - Works better now that WS URL can be persisted via click-to-set.
- Runtime file location:
  - Pipeline persists into `autonovelwriter/runtime/state/pipeline.json`, which matches the runtime defaults and is `.gitignore`d (good).

## Resumability
- Pipeline persistence to disk enables resume across restarts (good).
- No versioning/migration for pipeline format yet (OK for v1; may matter once block schema evolves).

