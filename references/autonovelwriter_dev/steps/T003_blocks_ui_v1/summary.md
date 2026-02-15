# T003 Summary: Scratch-like pipeline blocks v1 (drag/drop, task list)

## Implement
- Added backend pipeline persistence endpoint:
  - `GET /api/pipeline` returns current pipeline JSON (defaults to spec block list).
  - `POST /api/pipeline` persists `{blocks:[{id,type,enabled}]}` to `autonovelwriter/runtime/state/pipeline.json`.
- Replaced the pipeline placeholder UI with an interactive blocks list:
  - Drag/drop reorder (HTML5 DnD).
  - Toggle enable/disable per block.
  - Save/reset controls.
  - Shows current pipeline JSON in the UI.
- PWA loads pipeline on startup from backend; falls back to `localStorage` if backend is unreachable.

Verification notes:
- No TCP-binding tests were run in this sandbox. Syntax-only checks were used.

## Fixes
- Improved DnD operability: added a visible drop target outline and allowed dropping onto the list container to move a block to the end.
- Reduced persistence ambiguity: when backend save/load fails, the pipeline status now shows `local` (loaded/saved via `localStorage`) instead of implying backend persistence succeeded.
- Hardened `/api/pipeline` input: reject unknown block types and cap pipeline length (prevents silent typos and runaway payloads).

## Next
1. Add a visible “Tasks” panel/list (even stubbed) so T003’s title matches UI: show queued tasks and their status (will need backend task queue endpoints later).
2. Add keyboard-accessible reordering (Up/Down buttons) for non-DnD environments and mobile reliability.
3. Add versioning to persisted pipeline JSON (e.g., `{version:1, blocks:[...]}`) to support future schema changes and migrations.
4. Integrate pipeline execution controls (Start/Pause/Resume/Stop) once the runner endpoints exist (T005).
