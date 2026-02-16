## Implement
- Backend parser: added `IF <expr>` and `ELSE` support to the v2 pipeline script grammar, producing `pipeline_ast` nodes `kind="if"` (with nested `kind="else"` child when present) and emitting validation errors for malformed conditionals.
- Backend renderer: added canonical IF/ELSE rendering with stable 2-space indentation and roundtrip stability.
- Runner: added placeholder handling for `if` containers (executes then-branch only; ELSE is skipped for now) so pipelines containing IF do not break resumability.
- PWA: updated the local fallback script parser/renderer and AST normalization to preserve IF/ELSE when the backend is unreachable, and to avoid dropping unknown nodes.
- Tests: added `autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` covering roundtrip + key validation errors (`if_missing_expr`, `else_without_if`, `if_empty`, `else_empty`).

