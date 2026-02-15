# T005 Debug

## Sandbox Note
This environment may deny binding listening sockets, so end-to-end runner checks must be done by the outer driver on the host.

## Acceptance Review (Code-Level)
- Start/pause/resume/stop:
  - Implemented via `POST /api/run/start|pause|resume|stop` + `GET /api/run/status`.
  - Runner emits WS `run_status` transitions; PWA renders the runner pill and reacts to WS `run_status`.
- State persistence across restart:
  - Runner state persisted to `autonovelwriter/runtime/state/runner_state.json`.
  - Per-task statuses persisted to `autonovelwriter/runtime/state/task_status.json`.
  - On backend restart, if last status was `running`, runner comes up as `paused` (safer than auto-run).
- Live UI progress:
  - WS `task_status` and `log` are emitted; PWA appends them into the chat log.

## Issues / Risks
- Runner concurrency / multiple loops:
  - `Runner.start()` and `Runner.resume()` both `spawn_callback(self._run_loop)`. `_run_loop` early-exits if status isn’t `running`, but there’s no explicit “single active loop” guard across rapid start/resume calls; could lead to overlapping loops briefly.
- Pause/stop responsiveness:
  - Stub work uses `sleep(0.25)` per block. Pause/stop will only be observed between these awaits. Fine for stub, but real work units will need cooperative cancellation checkpoints.
- Task queue modeling is minimal:
  - Tasks are seeded into `autonovelwriter/runtime/tasks/tasks.json` if empty, but there is no CRUD API yet and no schema/versioning. This may diverge from the eventual “task queue CRUD” in the spec.
- UI feedback is chat-log based:
  - `task_status` and `log` are rendered into the chat log, which can get noisy. A dedicated runner panel would be more operable.
- Pipeline script <-> JSON translation limitations:
  - Script format only supports `STEP <type>` and `DISABLED <type>`; it cannot represent block IDs distinct from type, parameters, loops, or nested structures yet.
  - `parse_pipeline_script()` silently ignores unknown types and unknown verbs; this is forgiving but can hide user mistakes. Consider returning errors/warnings to the UI.
  - There is no explicit `{version:...}` in the script besides the header comment; future migrations will need a stronger mechanism.
- Separation concerns:
  - Driver stages remain out-of-band (good).
  - The in-app pipeline is now backed by a “canonical” script artifact, but only for the linear list of block types; future “while loop mode” and composable blocks will require extending this format carefully.

## Manual Host-Side Smoke Test (Outer Driver)
1. Start backend + PWA via tmux panes.
2. Open PWA, confirm runner status pill updates (idle -> running -> paused -> running -> idle).
3. Click Start; observe WS `run_status`, `task_status`, and `log` events streaming.
4. Pause and Resume mid-run; confirm state persists after restarting backend (status comes back paused, tasks keep their statuses).
