# T015 Plan: Pipeline script ROUND/FOREACH_TASK parse + render

## Design Note (Storage + Persist/Derive + Observability)
- Storage fit (standard layout):
  - Canonical artifact remains the formatted pipeline script:
    - `autonovelwriter/runtime/state/pipeline.script`
  - Backend derives and persists caches (gitignored runtime):
    - `autonovelwriter/runtime/state/pipeline_ast.json` (nested AST)
    - `autonovelwriter/runtime/state/pipeline.json` (flattened `pipeline.blocks`)
- Persisted vs derived vs ephemeral (and gitignore):
  - Persisted: `pipeline.script` (canonical), plus any runner/task state already under `runtime/state/`.
  - Derived: `pipeline_ast.json`, `pipeline.json` (both can be regenerated from script).
  - Ephemeral: validation responses, WS events.
- API/WS events needed for observability/resumability:
  - HTTP:
    - `POST /api/pipeline/validate` must accept scripts containing `ROUND` and `FOREACH_TASK` and return `pipeline_ast` + canonical preview.
    - `GET/POST /api/pipeline` must round-trip canonical script and derived AST.
  - WS:
    - existing `pipeline_updated` event remains the primary push signal after `POST /api/pipeline`.

## Grammar + AST Design (v2.1)
Goal: support the “Scratch-like default layout” verbs while keeping the script canonical and round-trippable.

- New verbs:
  - `ROUND <n_rounds>`: structured loop with repeat count.
  - `FOREACH_TASK`: structured loop that iterates the current task list (repeat semantics are not numeric).
- Indentation:
  - Same v2 rule: 2 spaces per nesting level, no tabs, no indent jumps.
- AST:
  - Keep existing kinds: `root`, `step`, `loop` (numeric repeat).
  - Add **dedicated kinds** to avoid overloading numeric repeat:
    - `round` node: `{kind:"round", repeat:int, children:[...]}` (repeat must be int >= 1).
    - `foreach_task` node: `{kind:"foreach_task", children:[...]}`.
  - Update traversal helpers:
    - `_flatten_ast_steps()` must walk `round` and `foreach_task` like `loop`.
    - `_ast_has_loop()` must treat `round`/`foreach_task` as loop-like so header stays v2.
- Renderer:
  - `render_pipeline_script_from_ast()` must preserve these constructs:
    - emit `ROUND <n>` for `kind:"round"`
    - emit `FOREACH_TASK` for `kind:"foreach_task"`
  - Canonicalization rules:
    - preserve indentation
    - normalize keyword case to uppercase

## Validation Rules (Structured Errors/Warnings)
- Errors (examples):
  - bad indentation (tabs, odd spaces, indent jumps): existing codes.
  - `ROUND` missing/invalid repeat count: new `round_missing_repeat`, `round_repeat_not_int`, `round_repeat_out_of_range`.
  - empty containers:
    - `round_empty`, `foreach_task_empty` (parallel to current `loop_empty`).
- Warnings:
  - unknown verbs remain warnings (existing `unknown_verb`) and must not be silent.
  - unknown step types remain warnings (existing `unknown_type`).

## Scope / Interaction With Runner + PWA
- Runner:
  - Runner already uses v2 parser; once `_flatten_ast_steps()` walks the new node kinds, runner will execute the flattened steps in preorder.
  - LOOP/ROUND repeat semantics can still be ignored for now; this task is parse/render/validate correctness.
- PWA:
  - Current blocks UI likely only understands `kind:"loop"` and `kind:"step"`.
  - This task can ship backend support first; follow-up task should update PWA rendering + indent/outdent to treat `round`/`foreach_task` as group blocks.

## Files To Change/Create
- Backend:
  - Change: `autonovelwriter/backend/server.py`
    - Extend `parse_pipeline_script_v2()` to parse `ROUND` / `FOREACH_TASK` into the new AST kinds.
    - Extend `render_pipeline_script_from_ast()` to emit `ROUND` / `FOREACH_TASK`.
    - Update `_flatten_ast_steps()` and `_ast_has_loop()` to traverse new kinds.
    - Add/adjust error codes for structured validation.
- Tests (recommended, minimal, no server):
  - Add a unit-style script/test that asserts:
    - parse -> render -> parse round-trips (AST kinds preserved)
    - flatten order matches AST preorder
    - invalid indentation and bad ROUND counts error out with correct codes

## Acceptance Checklist
- Parser:
  - Accepts `ROUND <n>` and `FOREACH_TASK` with 2-space indentation and produces a nested AST.
- Renderer:
  - Round-trips AST back into canonical script with `ROUND` / `FOREACH_TASK` preserved.
- Validation:
  - Rejects bad indentation and unknown verbs with structured errors/warnings (existing behavior + new codes for ROUND/FOREACH_TASK).

## Minimal Verification Commands (No TCP Binds)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- Unit-style check (example outline):
  - `python3 - <<'PY'\nfrom autonovelwriter.backend import server as s\nscript='''ROUND 2\n  STEP plan\n  FOREACH_TASK\n    STEP write\n    STEP summary\n'''\np, ast, w, e = s.parse_pipeline_script_v2(script)\nassert not e\ncanon = s.render_pipeline_script_from_ast(ast)\nassert 'ROUND 2' in canon and 'FOREACH_TASK' in canon\np2, ast2, w2, e2 = s.parse_pipeline_script_v2(canon)\nassert not e2\nPY`

