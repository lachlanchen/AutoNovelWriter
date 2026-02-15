# T014 Plan: PWA outputs panel + WS hook

## Design Note (Storage + Persist/Derive + Observability)
- Storage fit (standard layout):
  - Outputs are persisted by the backend under:
    - `autonovelwriter/runtime/projects/<project_id>/outputs/`
  - PWA should treat outputs listing as **derived** data fetched from:
    - `GET /api/outputs/index` (active project; optional `?project=` override)
  - WS push signal for freshness:
    - `output_created` event (includes `project_id`, `path`, `project_rel_path`)
- Persisted vs derived vs ephemeral (and gitignore):
  - Persisted (gitignored): output files on disk in runtime projects.
  - Derived: PWA outputs list state from `/api/outputs/index`.
  - Ephemeral:
    - toast/log message when `output_created` arrives
    - debounce timers for refresh
    - selected row/highlight in UI
- API/WS events required for observability/resumability:
  - HTTP: `GET /api/outputs/index` (already implemented in T013).
  - WS: handle `output_created` by:
    - emitting a user-visible message (toast or chat/system line)
    - refreshing the outputs list with debounce (avoid thrashing if many files created).

## UI/UX Scope (Minimal)
- Add an “Outputs” panel near Materials/Projects (read-only list).
- Show files with:
  - relative path (project-relative)
  - size (bytes) and mtime (optional formatting; can be raw ms in v1)
- Empty state: “(no outputs yet)”.
- On `output_created`:
  - append a short toast/log: “Output created: <project_rel_path>”
  - schedule refresh (e.g., 250-500ms debounce).

## Files To Change/Create
- PWA:
  - Change: `autonovelwriter/pwa/index.html`
    - Add outputs panel container:
      - title label (`data-i18n="outputs.title"`)
      - list element (`#outputsList`)
      - optional refresh button (`#outputsRefresh`)
  - Change: `autonovelwriter/pwa/app.js`
    - Add `loadOutputsIndex()` similar to `loadMaterialsIndex()`.
    - Render function `renderOutputsIndex(obj)` populating `#outputsList`.
    - WS handler: on `output_created`, show toast/log and debounce `loadOutputsIndex()`.
    - Keep project scoping consistent with active project selector.
  - Change: `autonovelwriter/pwa/app.css`
    - Minimal styling consistent with existing light theme list UI.
- i18n:
  - Update the in-file i18n dictionaries in `autonovelwriter/pwa/app.js` for new keys across:
    - `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`.
  - Proposed keys:
    - `outputs.title`
    - `outputs.empty`
    - `outputs.created` (toast template; can be simple text + path appended)
    - `outputs.refresh` (if adding a refresh button)

## Acceptance Checklist
- Outputs list:
  - PWA shows outputs list for active project using `GET /api/outputs/index`.
  - Empty state is displayed when no files.
- WS hook:
  - Receiving `output_created` triggers:
    - a user-visible notice (toast/log)
    - outputs list refresh (debounced).
- i18n:
  - Any new UI strings are present in all 11 required locales.
- Verification:
  - `node --check autonovelwriter/pwa/app.js` passes (no server start required).

## Minimal Verification Commands (No TCP Binds)
- `node --check autonovelwriter/pwa/app.js`
- Optional i18n sanity check (no server):
  - `node -e "/* small script to assert outputs.* keys exist for REQUIRED_LANGS */"`

