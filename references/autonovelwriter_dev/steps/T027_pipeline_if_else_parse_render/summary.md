## Implement
- Backend parser: added `IF <expr>` and `ELSE` support to the v2 pipeline script grammar, producing `pipeline_ast` nodes `kind="if"` (with nested `kind="else"` child when present) and emitting validation errors for malformed conditionals.
- Backend renderer: added canonical IF/ELSE rendering with stable 2-space indentation and roundtrip stability.
- Runner: added placeholder handling for `if` containers (executes then-branch only; ELSE is skipped for now) so pipelines containing IF do not break resumability.
- PWA: updated the local fallback script parser/renderer and AST normalization to preserve IF/ELSE when the backend is unreachable, and to avoid dropping unknown nodes.
- Tests: added `autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` covering roundtrip + key validation errors (`if_missing_expr`, `else_without_if`, `if_empty`, `else_empty`).

## Fixes
- Parser now accepts `ELSE` in both common styles:
  - aligned with `IF` (canonical render), and
  - indented at the same level as the `IF` body (accepted, then canonicalized on render).
- Updated PWA local fallback parser to match backend ELSE permissiveness.
- Extended unit tests to cover indented-ELSE acceptance and canonicalization.

## I18N
- Added PWA i18n keys for conditional block verbs: `pipeline.verb_if` and `pipeline.verb_else` across all required UI languages.

## Next
1. Add UI insertion controls for `IF` and `ELSE` containers (wrap selected / append) to avoid hand-editing script.
2. Define and document expression syntax for `IF <expr>` (even if evaluation remains stubbed), and add validation for obviously-invalid expressions.
3. Implement runner semantics for IF/ELSE (evaluate expression and choose branch) with explicit vars/context available to expressions.
4. Update docs/spec/README to explicitly document accepted ELSE formatting and the canonical render form.
