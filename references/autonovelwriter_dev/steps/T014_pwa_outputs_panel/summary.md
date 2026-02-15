# T014 Summary: PWA outputs panel + WS hook

## Implement
- Added an Outputs panel to the PWA (`autonovelwriter/pwa/index.html`) that lists active-project outputs from `GET /api/outputs/index`.
- Implemented outputs rendering and loading in `autonovelwriter/pwa/app.js` (empty state + size display).
- Wired WS `output_created` events to:
  - show a localized notice in the chat log
  - refresh the outputs list with debounce.
- Added i18n keys for the new UI strings across all required UI languages.

Verification (no TCP binds):
- `node --check autonovelwriter/pwa/app.js`

## Fixes
- Added a slow outputs poll (with backoff) so the outputs list stays fresh even when WS is disconnected (`autonovelwriter/pwa/app.js`).

## I18N
- Added localized UI strings for the Outputs panel across all required UI languages (`outputs.title`, `outputs.empty`, `outputs.created`) in `autonovelwriter/pwa/app.js`.

## Next
1. Add output file viewing/download (read-only) with safe path validation, or a “copy path” affordance in the PWA.
2. Improve outputs list UX: show mtime, sort toggle, and optionally include directories.
3. Integrate runner status with outputs (link `task_id` + block -> created output).

## README
- Noted in `README.md` that the PWA includes a minimal Outputs panel which lists files via `GET /api/outputs/index` and refreshes on `output_created`.
