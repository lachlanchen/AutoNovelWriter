# T014 Debug: PWA outputs panel + WS hook

## Acceptance Review
- Outputs list:
  - `autonovelwriter/pwa/index.html` includes `#outputsList` and an “Outputs” label.
  - `autonovelwriter/pwa/app.js` loads outputs from `GET /api/outputs/index` and renders `files[]` (file-only) with size.
  - Empty state uses localized `outputs.empty`.
- WS hook:
  - On WS `output_created`, PWA adds a localized notice to the chat log and debounces a refresh via `scheduleOutputsRefresh()`.
  - On `project_active_changed`, PWA refreshes both materials and outputs.
- i18n:
  - New keys exist for all required UI languages: `outputs.title`, `outputs.empty`, `outputs.created`.
- Verification:
  - `node --check autonovelwriter/pwa/app.js` passes (implementation stage already ran this).

## Issues / Risks

### Medium: Outputs list is not refreshed by the periodic poller
- Materials are polled periodically; outputs are currently only refreshed on initial load, project changes, and `output_created` WS events.
- If WS is disconnected (or output is created by other means), outputs list may become stale until reload.
- Suggested improvement: add a slower outputs poll (or piggyback on materials poll every N ticks).

### Low: Only file entries are shown (dirs omitted)
- This is fine for a minimal panel, but if outputs are organized into subfolders the UI may look empty except for top-level files.
- Follow-up: optionally show dirs, or flatten to show nested file paths (already returned by API).

### Low: Outputs empty state doesn’t indicate backend connectivity
- If `/api/outputs/index` fails, the UI remains with the previous list (or empty) without a visible error.
- Follow-up: show a small warning pill or a muted “backend unreachable” note (localized).

## Notes
- Light theme preserved (reused existing `.materials` styling).
- No coupling to driver stages; this is purely in-app UI.

