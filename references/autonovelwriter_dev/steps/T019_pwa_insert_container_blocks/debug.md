# T019 Debug: PWA: insert LOOP/ROUND/FOREACH_TASK blocks

## Acceptance Review

### 1) Insert ROUND / FOREACH_TASK from Blocks UI updates canonical script (2-space indent)
- Implemented: Blocks toolbar now has buttons to add `LOOP`, `ROUND`, `FOREACH_TASK` (`autonovelwriter/pwa/index.html`).
- `insertContainer()` mutates `pipelineAst` and immediately re-renders the canonical script textarea via `updateDerivedFromAst({ writeScript: true })`, which uses `renderScriptFromAst()` (2-space indentation).
- Validity: insertion never creates empty containers:
  - wraps the selected node, or
  - appends a container with a default child `STEP` (avoids backend empty-container validation errors if later saved).

Status: **Meets acceptance**.

### 2) Edit LOOP/ROUND repeat counts with localized invalid feedback
- Inserted `LOOP`/`ROUND` blocks are created with `repeat: 1`, so the existing repeat editor UI is exercised immediately.
- Existing repeat editor already uses localized strings (`pipeline.repeat_*`) and validation (1-10000); no regressions noted from static review.

Status: **Meets acceptance**.

### 3) I18N for new strings (11 languages, Arabic RTL-safe)
- New toolbar strings were added for all required languages:
  - `pipeline.add_loop`, `pipeline.add_round`, `pipeline.add_foreach_task`
  - and corresponding `*_title` tooltip keys.
- Additionally localized previously hard-coded per-block mini UI strings:
  - Indent/Outdent mini buttons now use `pipeline.indent(_title)` / `pipeline.outdent(_title)`.
  - enabled/disabled state uses `pipeline.state_enabled` / `pipeline.state_disabled` across languages.
- Arabic: document `dir` is already set to `rtl` when UI lang is `ar`; new button labels are short and should render safely.

Status: **Meets acceptance**.

## Issues / Risks (Non-blocking)
- UX ambiguity: “Add ROUND/LOOP/FOREACH_TASK” currently **wraps the selected block** (or appends at root if nothing selected). This is safe/valid, but some users may expect “insert sibling after selection”. If that UX is desired later, add a small placement picker (wrap vs insert-after vs insert-into).
- Crowding on small screens: three extra toolbar buttons may wrap to a second line (CSS `flex-wrap` is enabled). Usable, but consider a compact “Add…” dropdown later.
- Step toggle label: the checkbox label always shows the localized “enabled” string even when unchecked (existing pattern). Not a regression, but could be improved for clarity (“enabled/disabled” or “on/off”).

## Separation / Operability Notes
- No backend changes; pipeline canonical artifact remains the script textarea and only persists on explicit Save.
- No risk of confusing driver stages vs in-app pipelines introduced by this change.

