## Debug Review (T028_pwa_insert_foreach_action_and_if_else)

### Findings (Ordered By Severity)

1. ELSE can become invalid via drag-reorder / indent/outdent
- In the blocks UI, `ELSE` is treated like a normal container node and can be dragged/reordered within an `IF`, or outdented outside an `IF`.
- `renderScriptFromAst()` treats the first `else` child as the else-branch and stops collecting then-children at that point. If the user drags `ELSE` above all then-steps, the generated script becomes:
  - `IF <expr>` followed immediately by `ELSE ...` with no then-body, which should fail validation (`if_empty`).
- `fixIfNode()` enforces “ELSE last” and “IF has at least one then-step”, but it is only invoked on insert (`insertContainer('if')`) and after deletion when the parent is an `if`. It is not invoked on:
  - drag-reorder (`moveWithinParent()`),
  - indent/outdent mutations (`indentSelected()`, `outdentSelected()`),
  - arbitrary AST changes from script parse/validate refreshes.
- Impact: user can create an invalid pipeline script from the visual editor without an immediate structural guard, leading to backend validation errors / runner mismatch.
- References: `autonovelwriter/pwa/app.js` (`moveWithinParent()`, `indentSelected()`, `outdentSelected()`, `fixIfNode()`, `renderScriptFromAst()`).

2. Deleting ELSE splices ELSE-body into THEN-body (surprising semantics)
- `deleteSelected()` treats `else` as a generic container and splices its children upward into the parent container.
- If the parent container is an `if`, deleting `ELSE` moves its body steps into the IF’s then-branch (because the ELSE wrapper is removed and children are inserted inline).
- This behavior matches “ELSE removable” mechanically, but is potentially surprising: many users expect deleting ELSE to drop the else-branch entirely, not convert it into then-steps.
- References: `autonovelwriter/pwa/app.js` (`deleteSelected()`, `isContainerNode()`).

3. Toolbar density on small screens
- Two more toolbar buttons were added next to existing ones. On narrow viewports, the toolbar may wrap aggressively or overflow depending on existing CSS rules.
- Not a correctness issue, but could impact usability on mobile.
- References: `autonovelwriter/pwa/index.html` (pipeline toolbar buttons).

4. Repo hygiene: untracked prompt artifact
- `references/autonovelwriter_dev/prompts/T028_pwa_insert_foreach_action_and_if_else_debug.txt` is present but currently untracked.
- If prompts are intended to be versioned, it should be added by the driver; otherwise this path may need to be gitignored.

### Acceptance Checklist Coverage (What Looks OK)
- Buttons exist for inserting `FOREACH_ACTION` and `IF`: `autonovelwriter/pwa/index.html`.
- Insertion wraps selected or appends root, and updates canonical script via `updateDerivedFromAst({writeScript:true})`: `autonovelwriter/pwa/app.js`.
- IF insertion includes ELSE by default and ensures non-empty branches (placeholder STEP): `autonovelwriter/pwa/app.js`.
- Deleting an `IF` does not leave a raw `ELSE` node at the parent level (splices else-body up): `autonovelwriter/pwa/app.js`.
- I18N keys exist for all required UI languages for the new buttons: `autonovelwriter/pwa/app.js`.
- Minimal verification (syntax): `node --check autonovelwriter/pwa/app.js` passes.

