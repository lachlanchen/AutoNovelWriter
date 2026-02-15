# AutoNovelWriter Dev Context (Used By Codex Prompts)

You are being invoked by: `scripts/auto-autonovelwriter-development.sh`.

Overall goal:
- Implement the system described in: `docs/autonovelwriter_spec.md`.
- Tech: Python Tornado backend + Scratch-like PWA (light theme).
- Key feature: user can interrupt a running pipeline via chat UI and folder-based inbox/outbox.

Hard constraints:
- Keep steps small and resumable.
- Default theme is light.
- Use file-based workspace defaults under: `autonovelwriter/runtime/` (configurable via settings).
- Provide explicit paths for logs/state/tasks/summaries.
- Do NOT commit/push in Codex steps: the outer driver commits/pushes.

App paths (write here only):
- Backend: `autonovelwriter/backend/`
- PWA: `autonovelwriter/pwa/`
- Runtime defaults: `autonovelwriter/runtime/`

Driver paths:
- Step artifacts: `references/autonovelwriter_dev/steps/`
- Logs: `references/autonovelwriter_dev/logs/`
- Task queue: `references/autonovelwriter_dev/tasks/task_queue.jsonl`
- State: `references/autonovelwriter_dev/state.tsv`

Acceptance baseline:
- `python3 autonovelwriter/backend/server.py --port 8787` runs and serves health.
- PWA loads with light theme, shows pipeline blocks + chat panel, and connects to backend WS.
