# T008 Summary: Blocks UI indent/outdent + nested render

## Implement
- Updated the PWA pipeline panel to render nested blocks from backend `pipeline_ast` (loops render as grouped containers with indented children).
- Added per-block indent/outdent controls plus global `Indent`/`Outdent` buttons; added keyboard shortcuts: `Tab` (indent) and `Shift+Tab` (outdent) for the selected block.
- Script textarea remains the canonical artifact: AST edits (indent/outdent, drag reorder, enable toggle) immediately re-render the canonical script into the textarea; manual script edits trigger debounced backend validation to refresh the nested blocks view without persisting.
- Drag reorder is constrained to siblings within the same nesting level (cross-level drops are ignored).

Files changed:
- `autonovelwriter/pwa/index.html`
- `autonovelwriter/pwa/app.js`
- `autonovelwriter/pwa/app.css`

Verification (no TCP binds):
- `node --check autonovelwriter/pwa/app.js`
- `python3 -m py_compile autonovelwriter/backend/server.py`

## Fixes
- Made `Indent` always actionable by wrapping the selected node in a neutral `LOOP 1` when no preceding `LOOP` exists (preserves semantics while enabling indentation-driven nesting).
- Prevented generation of invalid empty loops by pruning empty `LOOP` nodes after outdent/moves.
- Added a local v2 script parser fallback so the blocks view can update from the canonical script even if `/api/pipeline/validate` is unreachable; backend validation is still used when available.

## I18N
- Scaffolded a minimal PWA i18n system in `autonovelwriter/pwa/app.js` with language detection via `?lang=` / localStorage (`anw_lang`) / browser locale.
- Migrated the new `Indent`/`Outdent` UI strings and core UI labels/tooltips/placeholders to `data-i18n*` keys in `autonovelwriter/pwa/index.html`.
- Added translations for required UI languages: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL via `dir=rtl`), `fr`, `es`, `ru`, `de`.

## Next
1. Add explicit loop editing in the Blocks UI: create/delete loop blocks, edit repeat count, and “wrap selection in LOOP N” (so indent/outdent isn’t the only way to form loops).
2. Include `pipeline_ast` in WS `pipeline_updated` (or add a lightweight `/api/pipeline/ast` endpoint) to avoid validate round-trips and improve resilience when backend validation is slow.
3. Make selection stable with node IDs (persisted in AST) instead of index-path keys; keep selection across reorder/validate.
4. Expand i18n coverage to dynamic runtime messages (e.g., `addMsg` titles/bodies) and add a language switcher in Settings.
