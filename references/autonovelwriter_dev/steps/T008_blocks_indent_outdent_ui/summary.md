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
