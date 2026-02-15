# T006 Debug

Sandbox note: this environment may deny binding listening sockets, so end-to-end settings UI + backend validation must be checked by the outer driver on the host.

Potential issues to watch on host:
- Ensure Settings save actually persists into `autonovelwriter/runtime/state/settings.json` and reloads after backend restart.
- Confirm Codex stub does not spawn subprocess unless both UI setting + env gate are enabled.
- When gate is enabled but `codex` is not on PATH, `/api/agent/test` should return a clear error without crashing the server.
