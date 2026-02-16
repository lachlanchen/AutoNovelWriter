## Review (Debug)

### High
- **ELSE indentation semantics are likely different from the task plan text.**
  - Implementation parses `ELSE` only when it is aligned with the `IF` header line (same indent as `IF`), not indented inside the IF block.
  - The plan text for this step mentions ELSE “at the same indentation level as the IF body”, which is more Python-like (`ELSE` at one indent deeper than `IF`).
  - Risk: if the intended grammar is “indented ELSE”, user scripts will fail with `else_without_if`.
  - Suggested decision/fix: explicitly choose one grammar and document it (and make backend + PWA fallback match). If “indented ELSE” is desired, adjust parsing/renderer and tests accordingly.

### Medium
- **AST shape differs from the task’s example shape.**
  - Task notes suggest an AST like `{kind:'if', expr, then_children, else_children}`.
  - Implementation uses `{kind:'if', expr, children:[...then..., {kind:'else', children:[...]}]}`.
  - This is internally consistent (backend + PWA fallback), but may complicate future tooling that expects separate `then_children`/`else_children`.

- **Runner context / path stability relies on ELSE always being the last child.**
  - Runner skips ELSE by filtering `if.children` in `_frame_children()` and assumes then-children are contiguous at indices `0..n-1`.
  - This is true for the current parser/renderer, but should be treated as an invariant going forward.

### Low
- **PWA blocks list shows `IF <expr>` / `ELSE` as raw text (not i18n’d).**
  - Likely acceptable since these are pipeline language verbs, but they are still user-facing strings in the UI.
  - If the product goal is fully localized UI labels even for verbs, add i18n keys in a later i18n stage (optional).

### Acceptance Coverage Check
- Parser accepts `IF <expr>` + `ELSE` and returns an `if` node: implemented.
- Renderer emits canonical IF/ELSE with 2-space indentation: implemented.
- Roundtrip unit test for nesting under ROUND/FOREACH_TASK/FOREACH_ACTION: added and passes.
- Validate endpoint reports helpful errors: implemented (`if_missing_expr`, `else_without_if`, `if_empty`, `else_empty`, `else_duplicate`).
- No TCP binds: verification commands are syntax/test only.

