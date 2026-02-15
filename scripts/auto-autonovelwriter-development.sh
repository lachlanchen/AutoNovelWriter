#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/auto-autonovelwriter-development.sh [options]

Auto-develops the "AutoNovelWriter" Scratch-like PWA + Tornado backend by
calling Codex non-interactively in ONE shared session, task-by-task:

  plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push

It keeps a resumable queue/state under:
  references/autonovelwriter_dev/

Options:
  --model <name>            Codex model (default: gpt-5.3-codex)
  --reasoning <level>       low|medium|high|xhigh (default: medium)
  --new-session             Start a fresh Codex session
  --reset-state             Clear task state (keeps queue)
  --batch-size <n>          Generate at most n new tasks per batch (default: 6)
  --max-batches <n>         Stop after n batches (default: 1; 0 = infinite)
  --max-tasks <n>           Stop after processing n tasks total (default: 0; 0 = infinite)
  --stop-file <path>        Stop after current task if this file exists
                            (default: references/autonovelwriter_dev/STOP)
  --no-tmux                 Do not create/manage tmux dev session
  --tmux-session <name>     tmux session name (default: autonovelwriter_dev)
  --backend-port <n>        Backend port (default: 8787)
  --pwa-port <n>            PWA dev server port (default: 5173)
  --skip-git-check          Pass --skip-git-repo-check to codex exec
  --verbose                 Verbose driver logs
  -h, --help                Show help

Stop control:
  touch references/autonovelwriter_dev/STOP

Notes:
  - This script is intentionally redundant in prompts. Each Codex step must be
    self-contained and restate the overall goal.
  - Commits/pushes are done by THIS driver, not by Codex.
  - The *app being built* also has its own pipelines (novel-writing vs app-dev)
    and a pipeline-script visualization module. Do not confuse those with the
    driver stages above.
USAGE
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
model="gpt-5.3-codex"
reasoning="medium"
new_session=0
reset_state=0
batch_size=6
max_batches=1
max_tasks=0
stop_file="references/autonovelwriter_dev/STOP"
no_tmux=0
tmux_session="autonovelwriter_dev"
backend_port=8787
pwa_port=5173
skip_git_check=0
verbose=0

while [ $# -gt 0 ]; do
  case "$1" in
    --model) model="${2:-}"; shift ;;
    --reasoning) reasoning="${2:-}"; shift ;;
    --new-session) new_session=1 ;;
    --reset-state) reset_state=1 ;;
    --batch-size) batch_size="${2:-}"; shift ;;
    --max-batches) max_batches="${2:-}"; shift ;;
    --max-tasks) max_tasks="${2:-}"; shift ;;
    --stop-file) stop_file="${2:-}"; shift ;;
    --no-tmux) no_tmux=1 ;;
    --tmux-session) tmux_session="${2:-}"; shift ;;
    --backend-port) backend_port="${2:-}"; shift ;;
    --pwa-port) pwa_port="${2:-}"; shift ;;
    --skip-git-check) skip_git_check=1 ;;
    --verbose) verbose=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

case "$reasoning" in low|medium|high|xhigh) ;; *)
  echo "Invalid --reasoning '$reasoning' (use low|medium|high|xhigh)" >&2
  exit 1
esac

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI not found in PATH." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required." >&2
  exit 1
fi

if [ "$skip_git_check" -eq 0 ]; then
  if ! git -C "$repo_root" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Not inside a Git repo: $repo_root (use --skip-git-check if intentional)" >&2
    exit 1
  fi
fi

vlog() { if [ "$verbose" -eq 1 ]; then printf '%s\n' "$*" >&2; fi; }

ref_root="references/autonovelwriter_dev"
plan_dir="$ref_root/plan"
prompt_dir="$ref_root/prompts"
log_dir="$ref_root/logs"
steps_dir="$ref_root/steps"
summary_dir="$ref_root/summaries"
tasks_dir="$ref_root/tasks"
run_log="$log_dir/auto_autonovelwriter_run.log"
session_file="$ref_root/.codex_autonovelwriter_session"
state_file="$ref_root/state.tsv"
queue_file="$tasks_dir/task_queue.jsonl"
context_doc="$ref_root/CONTEXT.md"
spec_doc="docs/autonovelwriter_spec.md"

app_root="autonovelwriter"
backend_root="$app_root/backend"
pwa_root="$app_root/pwa"
runtime_root="$app_root/runtime"

mkdir -p "$ref_root" "$plan_dir" "$prompt_dir" "$log_dir" "$steps_dir" "$summary_dir" "$tasks_dir"
mkdir -p "$(dirname "$spec_doc")"

log() {
  local msg="$*"
  printf '[%s] %s\n' "$(date +'%Y-%m-%d %H:%M:%S')" "$msg" | tee -a "$run_log" >&2
}

lock_file="$ref_root/auto-autonovelwriter-development.lock"
if command -v flock >/dev/null 2>&1; then
  exec 200>"$lock_file"
  python3 - <<'PY'
import fcntl
fd = 200
flags = fcntl.fcntl(fd, fcntl.F_GETFD)
fcntl.fcntl(fd, fcntl.F_SETFD, flags | fcntl.FD_CLOEXEC)
PY
  if ! flock -n 200; then
    echo "Another scripts/auto-autonovelwriter-development.sh is running (lock: $lock_file)" >&2
    exit 1
  fi
else
  log "flock not available; skipping single-instance lock."
fi

ensure_spec_docs() {
  if [ ! -f "$spec_doc" ]; then
    cat > "$spec_doc" <<'EOF'
# AutoNovelWriter: Product Spec (Scratch-like PWA Controller)

Goal: build a **Scratch-like PWA** that controls an automated novel-writing / app-development pipeline.
The PWA must allow the user to **interrupt** and “chip in” ideas during execution via **chat** and via a
folder-based **inbox/outbox**. The system must be resumable, observable, and operable.

## 0) Core Concepts
- **In-app pipelines (user-controlled)**:
  - **Novel pipeline**: plan -> write -> multi-aspect critique/fix -> summary/log -> commit/push.
  - **App-dev pipeline**: plan -> implement -> debug -> fix -> summary/log -> commit/push.
- **Driver stages (developer-controlled)**: this repository uses `scripts/auto-autonovelwriter-development.sh`
  to build the app using `plan -> implement -> debug -> fix -> summary -> commit+push`. Do not conflate this
  with the in-app pipelines above.
- **Pipeline Script (formatted shell-ish text)**:
  - The app must support importing a pipeline script written by other agents/tools.
  - The app must visualize that script as Scratch-like blocks (tasks/steps/actions).
  - The app must generate/export a formatted script from the block representation.

## 1) UI (Scratch-like)
- Light theme by default (no dark-first UI).
- Drag & drop “blocks” that form a pipeline (pipeline templates are built-in and editable).
- A Script panel:
  - shows the formatted pipeline script (source of truth for long-running automation)
  - `Parse Script -> Blocks` and `Render Blocks -> Script`
  - import/export script files
- Blocks are composable; users can reorder, insert, disable, and loop.
- A “while loop” mode: when the current batch finishes, generate the next batch of tasks automatically until stopped.

## 2) Chat + Folder Pipe
- A dedicated workspace folder structure:
  - `autonovelwriter/runtime/io/inbox/` (user -> system)
  - `autonovelwriter/runtime/io/outbox/` (system -> user)
  - `autonovelwriter/runtime/logs/`
  - `autonovelwriter/runtime/state/`
  - `autonovelwriter/runtime/tasks/`
- Backend monitors inbox changes (polling OK initially); UI shows chat in real-time (WebSocket).

## 3) Start/Stop/Pause + Settings
- UI buttons: Start / Pause / Resume / Stop.
- Settings:
  - Agent SDK selection: codex / copilot / gemini / claude (stub OK initially, codex first)
  - Model selection for LLM and vision model (vision can be unused initially but config must exist)
  - Paths: input/output/queue/log/summary directories, lock file path
  - Materials/workspace roots for novel projects (chapter/paragraph targeting)

## 4) Backend
- Python Tornado server.
- APIs:
  - health
  - settings get/set
  - pipeline get/set (blocks JSON)
  - pipeline script get/set (formatted text)
  - pipeline script parse/render (script <-> blocks)
  - task queue CRUD
  - run control (start/pause/resume/stop)
  - chat history
- WebSocket: push events (chat messages, task status, logs).

## 4.1) Runner Semantics (In-App)
- The novel pipeline must support loops at different granularities:
  - chapter-level refinement
  - paragraph-level refinement
  - free tasks generated from story/tone/dialogue/character/conflict/worldbuilding gaps
- Every run must be interruptible via chat + inbox/outbox, and resumable from persisted state.

## 5) PWA
- Manifest + Service Worker (cache static assets, offline shell).
- Responsive (desktop + mobile).

## 6) Development UX
- Provide a tmux dev session with two panes:
  - Pane 1: backend (`python3 -m ...` or `python3 server.py`)
  - Pane 2: PWA dev server (static is OK via `python3 -m http.server`)
EOF
  fi

  if [ ! -f "$context_doc" ]; then
    cat > "$context_doc" <<EOF
# AutoNovelWriter Dev Context (Used By Codex Prompts)

You are being invoked by: \`scripts/auto-autonovelwriter-development.sh\`.

Overall goal:
- Implement the system described in: \`$spec_doc\`.
- Tech: Python Tornado backend + Scratch-like PWA (light theme).
- Key feature: user can interrupt a running pipeline via chat UI and folder-based inbox/outbox.
- Key feature: pipeline-script visualization (formatted script <-> blocks/tasks/steps/actions).

Hard constraints:
- Keep steps small and resumable.
- Default theme is light.
- Use file-based workspace defaults under: \`$runtime_root/\` (configurable via settings).
- Provide explicit paths for logs/state/tasks/summaries.
- Do NOT commit/push in Codex steps: the outer driver commits/pushes.
- Do NOT conflate:
  - driver stages used to build this repo (plan/implement/debug/fix/summary)
  - in-app pipelines used to write/refine novels (plan/write/critique/fix/.../commit_push)
  - in-app pipelines used to develop apps (plan/implement/debug/fix/.../commit_push)

App paths (write here only):
- Backend: \`$backend_root/\`
- PWA: \`$pwa_root/\`
- Runtime defaults: \`$runtime_root/\`

Driver paths:
- Step artifacts: \`$steps_dir/\`
- Logs: \`$log_dir/\`
- Task queue: \`$queue_file\`
- State: \`$state_file\`

Acceptance baseline:
- \`python3 $backend_root/server.py --port $backend_port\` runs and serves health.
- PWA loads with light theme, shows pipeline blocks + chat panel, and connects to backend WS.
EOF
  fi
}

ensure_seed_queue() {
  if [ ! -s "$queue_file" ]; then
    cat > "$queue_file" <<'EOF'
{"id":"T001_bootstrap_backend","title":"Bootstrap Tornado backend skeleton (health, static, ws)","notes":"Create autonovelwriter/backend/server.py with Tornado app, /api/health, /api/settings, /ws events. Add requirements.txt and minimal config loading.","acceptance":["python3 autonovelwriter/backend/server.py --port 8787 works","GET /api/health returns 200 JSON","WS connects and emits a hello event"],"tags":["backend","tornado","ws"]}
{"id":"T002_bootstrap_pwa_shell","title":"Bootstrap PWA shell (light theme, manifest, service worker)","notes":"Create autonovelwriter/pwa/ static app with index.html, app.css (light theme tokens), app.js, manifest.webmanifest, service_worker.js. Connect to backend /ws and show chat panel.","acceptance":["PWA loads in browser (served by python http.server)","Light theme default with CSS variables","Chat panel shows backend hello event"],"tags":["pwa","light-theme","offline"]}
{"id":"T003_blocks_ui_v1","title":"Scratch-like pipeline blocks v1 (drag/drop, task list)","notes":"Implement drag/drop blocks UI (HTML5 DnD ok). Represent pipeline steps and allow reorder/disable. Persist pipeline as JSON via backend /api/pipeline.","acceptance":["Drag/drop reorder works","Pipeline persists and reloads","Blocks map to step types in spec"],"tags":["pwa","scratch","pipeline"]}
{"id":"T004_folder_chat_pipe","title":"Folder-based inbox/outbox + backend polling + UI sync","notes":"Implement runtime/io/inbox and outbox. Backend polls inbox, appends to chat history, emits WS events; UI can send message to backend which writes to outbox.","acceptance":["Drop a .md/.txt into inbox and it appears in UI","Sending chat from UI writes a file to outbox","All events visible via WS"],"tags":["backend","io","chat"]}
{"id":"T005_runner_start_pause_stop","title":"Task runner control (start/pause/resume/stop) + state machine","notes":"Backend task runner executes pipeline blocks over queued tasks with state persisted under runtime/state. UI controls start/pause/stop and shows live status.","acceptance":["Start/pause/resume/stop works without losing state","Task statuses persist across restart","UI shows live task progress"],"tags":["backend","runner","state"]}
{"id":"T006_agent_settings_codex_stub","title":"Agent settings + codex runner stub (no secrets committed)","notes":"Add settings UI for agent sdk + model. Backend implements codex runner stub that shells out to codex CLI (disabled by default). Provide .env.example; never commit secrets.","acceptance":["Settings persist (agent sdk/model/path)","Codex runner is stubbed + gated","No secrets in git"],"tags":["agents","settings","security"]}
EOF
  fi
}

extract_session_id_from_jsonl() {
  local json_file="$1"
  python3 - "$json_file" <<'PY'
import json, sys
sid = ""
with open(sys.argv[1], "r", encoding="utf-8") as f:
    for line in f:
        try:
            obj = json.loads(line)
        except Exception:
            continue
        if not isinstance(obj, dict):
            continue
        sid = obj.get("thread_id") or obj.get("session_id") or sid
        th = obj.get("thread")
        if not sid and isinstance(th, dict):
            sid = th.get("id") or sid
        if sid:
            break
print(sid)
PY
}

run_codex_new_session_init_from_file() {
  local prompt_file="$1"
  local json_file="$2"
  local cmd=(codex exec --json -m "$model" -c "model_reasoning_effort=\"$reasoning\"")
  if [ "$skip_git_check" -eq 1 ]; then
    cmd+=(--skip-git-repo-check)
  fi
  cmd+=(-)
  "${cmd[@]}" < "$prompt_file" > "$json_file" 2>>"$log_dir/codex_stderr.log"
}

run_codex_resume_from_file() {
  local sid="$1"
  local prompt_file="$2"
  local json_file="$3"
  local cmd=(codex exec resume "$sid" --json --full-auto -m "$model" -c "model_reasoning_effort=\"$reasoning\"")
  if [ "$skip_git_check" -eq 1 ]; then
    cmd+=(--skip-git-repo-check)
  fi
  cmd+=(-)
  "${cmd[@]}" < "$prompt_file" > "$json_file" 2>>"$log_dir/codex_stderr.log"
}

state_reset() {
  rm -f "$state_file"
}

state_mark() {
  local id="$1"
  local status="$2"
  local ts
  ts="$(date +%Y-%m-%dT%H:%M:%S%z)"
  mkdir -p "$(dirname "$state_file")"
  if [ -f "$state_file" ]; then
    # Replace any existing row for this task ID.
    grep -v "^${id}"$'\t' "$state_file" > "$state_file.tmp" || true
    mv "$state_file.tmp" "$state_file"
  fi
  printf '%s\t%s\t%s\n' "$id" "$status" "$ts" >> "$state_file"
}

git_commit_push_if_dirty() {
  local msg="$1"
  local body_file="${2:-}"
  # Include untracked files in the dirty check (git diff ignores them).
  if [ -z "$(git -C "$repo_root" status --porcelain)" ]; then
    log "No changes to commit for: $msg"
    return 0
  fi
  git -C "$repo_root" add -A
  if [ -n "$body_file" ] && [ -s "$body_file" ]; then
    local tmp_msg
    tmp_msg="$(mktemp)"
    {
      printf '%s\n\n' "$msg"
      cat "$body_file"
    } > "$tmp_msg"
    git -C "$repo_root" commit -F "$tmp_msg"
    rm -f "$tmp_msg"
  else
    git -C "$repo_root" commit -m "$msg"
  fi
  local tries=0
  while true; do
    tries=$((tries+1))
    if git -C "$repo_root" push; then
      break
    fi
    if [ "$tries" -ge 3 ]; then
      echo "git push failed after $tries attempts" >&2
      return 1
    fi
    log "git push failed; retrying ($tries/3) after 5s..."
    sleep 5
  done
}

pick_free_port() {
  python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
port = s.getsockname()[1]
s.close()
print(port)
PY
}

host_smoke_backend() {
  local server_py="$backend_root/server.py"
  if [ ! -f "$server_py" ]; then
    return 0
  fi

  # Run a real socket bind outside Codex sandbox, on a free port.
  local port
  port="$(pick_free_port)"

  local log_file="/tmp/anw_smoke_backend_${port}.log"
  local pid_file="/tmp/anw_smoke_backend_${port}.pid"
  rm -f "$pid_file" "$log_file"

  (python3 "$server_py" --host 127.0.0.1 --port "$port" >"$log_file" 2>&1 & echo $! >"$pid_file")
  sleep 0.5

  set +e
  curl -fsS "http://127.0.0.1:${port}/api/health" >/dev/null
  local curl_rc=$?
  if [ "$curl_rc" -ne 0 ]; then
    echo "[smoke] backend health failed (port $port). Last log lines:" >&2
    tail -n 80 "$log_file" >&2 || true
  fi

  python3 - <<PY >/dev/null 2>&1
import asyncio
from tornado.websocket import websocket_connect

async def main():
    c = await websocket_connect("ws://127.0.0.1:${port}/ws")
    msg = await c.read_message()
    if not msg:
        raise SystemExit(2)
    c.close()

asyncio.run(main())
PY
  local ws_rc=$?

  if [ -f "$pid_file" ]; then
    kill "$(cat "$pid_file")" >/dev/null 2>&1 || true
  fi
  rm -f "$pid_file"

  set -e

  if [ "$curl_rc" -ne 0 ] || [ "$ws_rc" -ne 0 ]; then
    return 1
  fi
  return 0
}

ensure_tmux() {
  if [ "$no_tmux" -eq 1 ]; then
    return 0
  fi
  if ! command -v tmux >/dev/null 2>&1; then
    log "tmux not found; skipping tmux dev session."
    return 0
  fi

  if ! tmux has-session -t "$tmux_session" 2>/dev/null; then
    local backend_cmd="cd \"$repo_root\" && python3 \"$backend_root/server.py\" --port \"$backend_port\""
    local pwa_cmd="cd \"$repo_root\" && python3 -m http.server \"$pwa_port\" --directory \"$pwa_root\""

    tmux new-session -d -s "$tmux_session" -n dev "bash -lc 'echo \"[backend pane] waiting for $backend_root/server.py\"; if [ -f \"$backend_root/server.py\" ]; then $backend_cmd; else while true; do sleep 3600; done; fi'"
    tmux split-window -h -t "$tmux_session:dev" "bash -lc 'echo \"[pwa pane] serving $pwa_root on :$pwa_port\"; if [ -d \"$pwa_root\" ]; then $pwa_cmd; else while true; do sleep 3600; done; fi'"
    tmux select-layout -t "$tmux_session:dev" even-horizontal >/dev/null 2>&1 || true
    log "tmux session created: $tmux_session (backend + pwa). Attach with: tmux attach -t $tmux_session"
    return 0
  fi

  # Session exists but may be missing the second pane (e.g., after a crash). Ensure 2 panes.
  local pane_count
  pane_count="$(tmux list-panes -t "$tmux_session:dev" 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$pane_count" -lt 2 ]; then
    local pwa_cmd="cd \"$repo_root\" && python3 -m http.server \"$pwa_port\" --directory \"$pwa_root\""
    tmux split-window -h -t "$tmux_session:dev" "bash -lc 'echo \"[pwa pane] serving $pwa_root on :$pwa_port\"; if [ -d \"$pwa_root\" ]; then $pwa_cmd; else while true; do sleep 3600; done; fi'"
    tmux select-layout -t "$tmux_session:dev" even-horizontal >/dev/null 2>&1 || true
  fi
}

tmux_restart_panes_if_running() {
  if [ "$no_tmux" -eq 1 ] || ! command -v tmux >/dev/null 2>&1; then
    return 0
  fi
  if ! tmux has-session -t "$tmux_session" 2>/dev/null; then
    return 0
  fi

  ensure_tmux

  local backend_cmd="cd \"$repo_root\" && python3 \"$backend_root/server.py\" --port \"$backend_port\""
  local pwa_cmd="cd \"$repo_root\" && python3 -m http.server \"$pwa_port\" --directory \"$pwa_root\""

  tmux send-keys -t "$tmux_session:dev.0" C-c >/dev/null 2>&1 || true
  tmux send-keys -t "$tmux_session:dev.0" "bash -lc 'if [ -f \"$backend_root/server.py\" ]; then $backend_cmd; else echo \"backend not ready\"; fi'" Enter || true

  # Pane 1 may not exist if tmux split failed; guard it.
  if tmux list-panes -t "$tmux_session:dev" -F '#{pane_index}' 2>/dev/null | grep -qx '1'; then
    tmux send-keys -t "$tmux_session:dev.1" C-c >/dev/null 2>&1 || true
    tmux send-keys -t "$tmux_session:dev.1" "bash -lc 'if [ -d \"$pwa_root\" ]; then $pwa_cmd; else echo \"pwa not ready\"; fi'" Enter || true
  fi
}

ensure_spec_docs
ensure_seed_queue
git_commit_push_if_dirty "AutoNovelWriter: bootstrap driver artifacts"

if [ "$reset_state" -eq 1 ]; then
  log "Resetting state file: $state_file"
  state_reset
fi

session_id=""
if [ "$new_session" -eq 0 ] && [ -f "$session_file" ]; then
  session_id="$(tr -d ' \t\r\n' < "$session_file")"
fi

if [ -z "$session_id" ]; then
  init_prompt="$prompt_dir/000_init.txt"
  init_json="$log_dir/000_init.jsonl"
  cat > "$init_prompt" <<EOF
Session initialization only.

You are being invoked by: scripts/auto-autonovelwriter-development.sh

Store these constraints for subsequent prompts:
- Goal: implement AutoNovelWriter per docs/autonovelwriter_spec.md (Scratch-like light-theme PWA + Tornado backend).
- AutoNovelWriter must support a pipeline-script visualization module (formatted script <-> blocks/tasks JSON).
- Do NOT confuse driver stages with in-app pipelines (novel-writing vs app-development).
- Work only inside this repository: $repo_root
- Always keep steps small and resumable.
- Do NOT commit/push: the outer driver will do git operations.
- Primary writable paths:
  - $backend_root/
  - $pwa_root/
  - $runtime_root/
  - $ref_root/
- Default runtime IO paths:
  - $runtime_root/io/inbox
  - $runtime_root/io/outbox
  - $runtime_root/tasks
  - $runtime_root/logs
  - $runtime_root/state
- UI theme: light by default.

Important for this initialization step:
- Do NOT run shell commands.
- Do NOT read or write any files.
- Reply with exactly: READY_AUTONOVELWRITER_SESSION
EOF
  log "Initializing Codex session for AutoNovelWriter development"
  run_codex_new_session_init_from_file "$init_prompt" "$init_json"
  if ! grep -q "READY_AUTONOVELWRITER_SESSION" "$init_json"; then
    echo "Initialization response missing READY_AUTONOVELWRITER_SESSION marker." >&2
    exit 1
  fi
  session_id="$(extract_session_id_from_jsonl "$init_json")"
  if [ -z "$session_id" ]; then
    echo "Failed to extract Codex session ID from init JSONL." >&2
    exit 1
  fi
  printf '%s\n' "$session_id" > "$session_file"
fi

log "Using Codex session: $session_id"

ensure_tmux

generate_tasks_batch() {
  local out_file="$1"
  local attempt=0
  local tmp_out
  tmp_out="$(mktemp)"

  while true; do
    attempt=$((attempt + 1))
    local ts
    ts="$(date +%Y%m%d_%H%M%S)"
    local gen_prompt="$prompt_dir/GEN_tasks_${ts}_try${attempt}.txt"
    local gen_json="$log_dir/GEN_tasks_${ts}_try${attempt}.jsonl"

    local next_num
    next_num="$(python3 - "$queue_file" <<'PY'
import json, re, sys
max_n = 0
try:
  with open(sys.argv[1], "r", encoding="utf-8") as f:
    for line in f:
      line = line.strip()
      if not line:
        continue
      try:
        obj = json.loads(line)
      except Exception:
        continue
      tid = obj.get("id") or ""
      m = re.match(r"^T(\\d+)_", tid)
      if m:
        max_n = max(max_n, int(m.group(1)))
except FileNotFoundError:
  pass
print(max_n + 1)
PY
)"

    cat > "$gen_prompt" <<EOF
You are being invoked by scripts/auto-autonovelwriter-development.sh.

Read:
- $context_doc
- $spec_doc
- $state_file (if exists)
- $queue_file

Task: propose the NEXT batch of at most $batch_size small development tasks to improve AutoNovelWriter.

Constraints:
- Tasks must be small and independently verifiable.
	- Prioritize improvements to the AutoNovelWriter app itself (PWA + backend), especially:
	  - flexible pipeline blocks with editable actions (tool selection, prompts, scripts, skills)
	  - nested rounds/loops (indentation) in pipeline representation + UI drag indent/outdent
	  - in-app meta task generation (generate next tasks from materials + feedback)
	  - materials management (multiple folders/files, standard layout, indexing)
	  - novel-writing settings (novel language + other writing UX options), separate from UI language
	  - in-app runner can actually write: produce drafts/revisions into the standardized output folders
	  - UI language (i18n): en, zh-Hans, zh-Hant, ja, ko, vi, ar, fr, es, ru, de
	  - pipeline-script visualization: formatted script <-> blocks translation + import/export
	  - observable chat + folder-based inbox/outbox interruption during runs
  - clear separation of in-app pipelines (novel-writing vs app-development vs app meta-dev)
  - standardized storage layout for: input materials, interactions, outputs, docs, references,
    scripts, tools, logs, auto-novels/projects, task management, and resume state
- Do NOT do any implementation now.
- Do NOT write any files. Do NOT run any shell commands.

Output format:
- Reply with JSONL only (one JSON object per line), no surrounding markdown, no header.
- Schema:
  {\"id\": \"T###_<slug>\", \"title\": \"...\", \"notes\": \"...\", \"acceptance\": [\"...\"], \"tags\": [\"...\"]}

Rules:
- IDs must be unique and not conflict with existing IDs in $queue_file.
- Use IDs starting from T$(printf '%03d' "$next_num")_... (increment sequentially).
- Keep titles short. Notes can be longer.
- Output at least 3 tasks.
EOF

    run_codex_resume_from_file "$session_id" "$gen_prompt" "$gen_json"

	    # Extract JSONL tasks from Codex output (agent_message text) and write them to out_file.
	    python3 - "$gen_json" "$queue_file" "$batch_size" > "$tmp_out" <<'PY'
import json
import sys
from json import JSONDecoder

gen_json, queue_file, batch_size_s = sys.argv[1], sys.argv[2], sys.argv[3]
batch_size = int(batch_size_s)

existing = set()
try:
    with open(queue_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            tid = obj.get("id")
            if tid:
                existing.add(tid)
except FileNotFoundError:
    pass

msgs = []
with open(gen_json, "r", encoding="utf-8") as f:
    for line in f:
        try:
            obj = json.loads(line)
        except Exception:
            continue
        if obj.get("type") != "item.completed":
            continue
        item = obj.get("item") or {}
        if item.get("type") == "agent_message":
            msgs.append(item.get("text") or "")

text = "\n".join(msgs)
tasks = []
seen = set()


def emit(obj):
    tid = obj.get("id") if isinstance(obj, dict) else None
    if not tid or tid in existing or tid in seen:
        return
    obj.setdefault("title", "")
    obj.setdefault("notes", "")
    obj.setdefault("acceptance", [])
    obj.setdefault("tags", [])
    tasks.append(obj)
    seen.add(tid)


dec = JSONDecoder()
i = 0
while True:
    i = text.find("{", i)
    if i < 0:
        break
    try:
        obj, end = dec.raw_decode(text[i:])
    except Exception:
        i += 1
        continue
    if isinstance(obj, list):
        for el in obj:
            if isinstance(el, dict):
                emit(el)
                if len(tasks) >= batch_size:
                    break
    elif isinstance(obj, dict):
        emit(obj)
    i += end
    if len(tasks) >= batch_size:
        break

for t in tasks:
    print(json.dumps(t, ensure_ascii=False))
PY

    if [ -s "$tmp_out" ]; then
      mkdir -p "$(dirname "$out_file")"
      mv "$tmp_out" "$out_file"
      log "Generated tasks batch in: $out_file"
      break
    fi

    if [ "$attempt" -ge 3 ]; then
      rm -f "$tmp_out"
      echo "Task generation failed after $attempt attempts (no tasks extracted). See: $gen_json" >&2
      exit 1
    fi

    log "Task generation produced no tasks; retrying (attempt $((attempt + 1))/3)..."
  done
}

iterate_tasks() {
  python3 - "$queue_file" "$state_file" <<'PY'
import json, sys, os
queue = sys.argv[1]
state = sys.argv[2]
done = set()
if os.path.exists(state):
  with open(state, "r", encoding="utf-8") as f:
    for line in f:
      parts = line.rstrip("\n").split("\t")
      if len(parts) >= 2 and parts[1] == "done":
        done.add(parts[0])
with open(queue, "r", encoding="utf-8") as f:
  for line in f:
    line = line.strip()
    if not line:
      continue
    try:
      obj = json.loads(line)
    except Exception:
      continue
    tid = obj.get("id") or ""
    title = obj.get("title") or ""
    if not tid or tid in done:
      continue
    print(json.dumps({"id": tid, "title": title}, ensure_ascii=False))
PY
}

write_prompt_for_stage() {
  local task_id="$1"
  local task_title="$2"
  local stage="$3"
  local out_prompt="$4"
  local step_dir="$steps_dir/$task_id"

  cat > "$out_prompt" <<EOF
You are being invoked by scripts/auto-autonovelwriter-development.sh (ONE shared Codex session).

Overall goal (repeat for every step):
- Build AutoNovelWriter: Scratch-like PWA controller + Python Tornado backend.
- Light theme by default.
- Must support chat + folder-based inbox/outbox interruption during a running pipeline.
- Must support UI language (i18n): en, zh-Hans, zh-Hant, ja, ko, vi, ar, fr, es, ru, de.
- Must support novel-writing settings (at least novel language), separate from UI language.
- Must support materials management (multiple folders/files) and standardized project storage.
- Must standardize and document storage and naming conventions for:
  - input materials, interactions, outputs
  - docs/references/scripts/tools/logs
  - auto-novels/projects storage
  - task management + resumable state
- Must support a pipeline-script visualization module:
  - Parse a formatted pipeline script (shell-ish text) into structured tasks/steps/actions/blocks.
  - Render the structured pipeline back into a formatted script the UI can generate/export.
- Pipeline blocks must be flexible and editable:
  - per-block action/tool selection (codex + other SDK stubs + shell scripts)
  - per-block editable prompts/templates and parameters
  - nested rounds/loops via indentation in the formatted script + UI drag indent/outdent
- Do NOT confuse driver stages (plan/implement/debug/fix/i18n/summary) with the *in-app* pipelines
  (novel-writing vs app-development vs meta-dev) that AutoNovelWriter controls.

Read these first:
- $context_doc
- $spec_doc
- README.md
- Existing code under: $backend_root/ and $pwa_root/
- Task definition JSON (notes + acceptance): $step_dir/task.json

This step:
- Task ID: $task_id
- Task title: $task_title
- Stage: $stage (strict)

Required workspace/output paths:
- Step working dir: $step_dir/
- Write your outputs (notes/plan/debug/summary) into files under $step_dir/:
  - plan: $step_dir/plan.md
  - debug: $step_dir/debug.md
  - summary: $step_dir/summary.md
  - update_readme: update repo root README.md and note changes in $step_dir/summary.md

Operational constraints:
- Do NOT commit or push. Do NOT create new remotes. The outer driver handles git.
- Prefer small, safe changes. Keep the app runnable.
- No secrets in git. If you add config, create .env.example and read env vars.

Stage-specific instructions:
EOF

  case "$stage" in
    plan)
      cat >> "$out_prompt" <<EOF
- Do NOT modify app code in this stage.
- Produce a short plan in: $step_dir/plan.md
- Plan must include:
  - a brief architecture/design note answering:
    - how this task fits the standardized app storage layout (materials/interactions/outputs/logs/projects/tasks/state)
    - what is persisted vs derived vs ephemeral, and what must be gitignored
    - what API/WS events must exist to keep the PWA observable and resumable
  - files to change/create
  - acceptance checklist
  - minimal verification commands (avoid binding TCP ports; Codex sandbox may block socket binds)
EOF
      ;;
    implement)
      cat >> "$out_prompt" <<EOF
- Implement the task. Keep scope tight and verifiable.
- Ensure runtime defaults exist under: $runtime_root/ (create dirs/files as needed).
- Avoid introducing new folders/artifacts without updating the standardized layout in docs/spec.
- When implementing pipeline behavior, treat the formatted pipeline script as the canonical artifact:
  - backend stores script + structured JSON
  - UI can import/export script and visualize it as blocks
- After implementing, run minimal verification commands:
  - Do NOT bind TCP ports or start servers inside this Codex step (sandbox may deny with PermissionError).
  - Prefer syntax/import/build checks (e.g., py_compile/compileall, eslint/typecheck, unit tests).
  - The outer driver will run real socket-binding smoke tests on the host.
- Write a brief implementation note into: $step_dir/summary.md (append section \"## Implement\").
EOF
      ;;
    debug)
      cat >> "$out_prompt" <<EOF
- Do NOT make code changes in this stage.
- Review repo changes vs acceptance and list issues in: $step_dir/debug.md
- Focus on: correctness, operability, resumability, light theme, path/config clarity,
  and the separation between:
  - driver stages (this script) vs in-app pipelines
  - pipeline script <-> blocks JSON translation
EOF
      ;;
	    fix)
	      cat >> "$out_prompt" <<EOF
- Apply fixes for issues found in $step_dir/debug.md.
- Keep fixes minimal; rerun verification commands:
  - Do NOT bind TCP ports or start servers inside this Codex step.
  - Prefer syntax/import/build checks only.
- Append a \"## Fixes\" section to: $step_dir/summary.md
EOF
	      ;;
	    i18n)
	      cat >> "$out_prompt" <<EOF
- Update UI localization for any new/changed user-facing strings introduced by this task.
- Required UI languages: en, zh-Hans, zh-Hant, ja, ko, vi, ar, fr, es, ru, de.
- If an i18n system does not exist yet, scaffold one in the PWA and migrate existing strings to keys.
- If no user-facing strings changed, explicitly note that in: $step_dir/summary.md (append section \"## I18N\").
- Keep translations short and natural; Arabic should be RTL-safe.
- Do NOT bind TCP ports or start servers inside this step.
- Append an \"## I18N\" section to: $step_dir/summary.md describing what you changed.
EOF
	      ;;
	    summary)
	      cat >> "$out_prompt" <<EOF
- Do NOT modify app code in this stage unless strictly necessary for docs/logging.
- Ensure $step_dir/summary.md exists and is coherent.
- Add a short \"## Next\" section listing 2-4 concrete follow-ups.
EOF
	      ;;
    update_readme)
      cat >> "$out_prompt" <<EOF
- Do NOT modify app code in this stage.
- Update the repo root README.md to reflect current project reality:
  - what AutoNovelWriter is
  - how to run backend + PWA locally
  - major endpoints/features shipped so far
  - the existence of the pipeline-script visualization module (even if only partially implemented)
  - the driver workflow and how to run it safely
- Keep README concise and actionable (commands + paths).
- Append a short \"## README\" note to: $step_dir/summary.md describing what you changed.
EOF
      ;;
    *)
      echo "Invalid stage: $stage" >&2
      exit 1
      ;;
  esac
}

process_one_task() {
  local task_json="$1"
  local task_id
  local task_title
  task_id="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["id"])' "$task_json")"
  task_title="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["title"])' "$task_json")"

  local step_dir="$steps_dir/$task_id"
  mkdir -p "$step_dir"

  # Materialize the full task record (notes/acceptance/tags) for the prompts to consume.
  python3 - "$queue_file" "$task_id" > "$step_dir/task.json" <<'PY'
import json, sys
queue, tid = sys.argv[1], sys.argv[2]
with open(queue, "r", encoding="utf-8") as f:
  for line in f:
    line = line.strip()
    if not line:
      continue
    try:
      obj = json.loads(line)
    except Exception:
      continue
    if obj.get("id") == tid:
      print(json.dumps(obj, ensure_ascii=False, indent=2))
      sys.exit(0)
print(json.dumps({"id": tid, "error": "task_not_found_in_queue"}, ensure_ascii=False, indent=2))
PY

  log "Processing task: $task_id — $task_title"
  state_mark "$task_id" "running"

	  local stage
	  for stage in plan implement debug fix i18n summary update_readme; do
    local pfile="$prompt_dir/${task_id}_${stage}.txt"
    local jfile="$log_dir/${task_id}_${stage}.jsonl"
    write_prompt_for_stage "$task_id" "$task_title" "$stage" "$pfile"
    log "Codex stage: $task_id/$stage"
    run_codex_resume_from_file "$session_id" "$pfile" "$jfile"

	    # Host-side smoke checks (outside Codex sandbox) for stages that can change code.
	    if [ "$stage" = "implement" ] || [ "$stage" = "fix" ] || [ "$stage" = "i18n" ]; then
	      host_smoke_backend
	      tmux_restart_panes_if_running
	    fi

    # Commit + push after ANY edit (including prompts/step artifacts), per repo philosophy.
    local tmp_body
    tmp_body="$(mktemp)"
    {
      printf 'Task ID: %s\n' "$task_id"
      printf 'Title: %s\n' "$task_title"
      printf 'Stage: %s\n\n' "$stage"
      printf 'Step dir: %s\n' "$step_dir"
      printf 'Spec: %s\n' "$spec_doc"
    } > "$tmp_body"
    git_commit_push_if_dirty "AutoNovelWriter: ${task_id} ${stage}" "$tmp_body"
    rm -f "$tmp_body"
  done

  state_mark "$task_id" "done"
  log "Task done: $task_id"
}

batch=0
tasks_processed=0
while true; do
  batch=$((batch+1))
  if [ "$max_batches" -ne 0 ] && [ "$batch" -gt "$max_batches" ]; then
    log "Reached --max-batches=$max_batches; stopping."
    break
  fi

  if [ -f "$stop_file" ]; then
    log "Stop file present ($stop_file). Stopping before starting batch $batch."
    break
  fi

	  pending_count="$(iterate_tasks | wc -l | tr -d ' ')"
	  if [ "$pending_count" -eq 0 ]; then
	    log "No pending tasks. Generating a new batch..."
	    batch_ts="$(date +%Y%m%d_%H%M%S)"
	    batch_dir="$tasks_dir/batches/batch_${batch_ts}_b${batch}"
	    mkdir -p "$batch_dir"
	    batch_file="$batch_dir/tasks.jsonl"
	    generate_tasks_batch "$batch_file"
	    cat "$batch_file" >> "$queue_file"
	    git_commit_push_if_dirty "AutoNovelWriter: append generated tasks batch"
	  fi

  log "Starting batch $batch"
  while read -r task_meta; do
    if [ -f "$stop_file" ]; then
      log "Stop file present ($stop_file). Stopping before next task."
      break
    fi
    process_one_task "$task_meta"
    tasks_processed=$((tasks_processed+1))
    if [ "$max_tasks" -ne 0 ] && [ "$tasks_processed" -ge "$max_tasks" ]; then
      log "Reached --max-tasks=$max_tasks; stopping."
      break
    fi
  done < <(iterate_tasks)
  log "Finished batch $batch"

  if [ "$max_tasks" -ne 0 ] && [ "$tasks_processed" -ge "$max_tasks" ]; then
    break
  fi
done

log "AutoNovelWriter auto-development driver finished."
