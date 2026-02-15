#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/run_autonovelwriter_tmux.sh [options]

Starts a tmux session and launches:
  - Tornado backend (default :8787)
  - PWA static server (default :5173)
  - Runner log tail

Options:
  --session <name>       tmux session name (default: autonovelwriter_app)
  --backend-port <n>     backend port (default: 8787)
  --pwa-port <n>         PWA port (default: 5173)
  --host <ip>            bind host (default: 127.0.0.1)
  --env <conda_env>      conda env to run under (uses `conda run`)
  --debug                pass --debug to backend
  --kill                 kill existing session and recreate
  --no-attach            do not attach
  -h, --help             show help

Examples:
  scripts/run_autonovelwriter_tmux.sh
  scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
USAGE
}

session="autonovelwriter_app"
backend_port="8787"
pwa_port="5173"
host="127.0.0.1"
conda_env=""
debug=0
kill_existing=0
attach=1

while [ $# -gt 0 ]; do
  case "$1" in
    --session) session="${2:-}"; shift 2 ;;
    --backend-port) backend_port="${2:-}"; shift 2 ;;
    --pwa-port) pwa_port="${2:-}"; shift 2 ;;
    --host) host="${2:-}"; shift 2 ;;
    --env) conda_env="${2:-}"; shift 2 ;;
    --debug) debug=1; shift ;;
    --kill) kill_existing=1; shift ;;
    --no-attach) attach=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [ -z "$session" ]; then
  echo "--session cannot be empty" >&2
  exit 1
fi

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux not found in PATH." >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if tmux has-session -t "$session" 2>/dev/null; then
  if [ "$kill_existing" -eq 1 ]; then
    tmux kill-session -t "$session"
  else
    if [ "$attach" -eq 1 ]; then
      exec tmux attach -t "$session"
    fi
    echo "tmux session already running: $session" >&2
    exit 0
  fi
fi

backend_cmd=(python3 autonovelwriter/backend/server.py --host "$host" --port "$backend_port")
if [ "$debug" -eq 1 ]; then
  backend_cmd+=(--debug)
fi

pwa_cmd=(python3 -m http.server "$pwa_port" --bind "$host" --directory autonovelwriter/pwa)
log_cmd=(bash -lc "mkdir -p autonovelwriter/runtime/logs && : > autonovelwriter/runtime/logs/runner.log && tail -n +1 -f autonovelwriter/runtime/logs/runner.log")

if [ -n "$conda_env" ]; then
  if ! command -v conda >/dev/null 2>&1; then
    echo "conda not found in PATH (but --env was provided)." >&2
    exit 1
  fi
  backend_cmd=(conda run -n "$conda_env" python autonovelwriter/backend/server.py --host "$host" --port "$backend_port")
  if [ "$debug" -eq 1 ]; then
    backend_cmd+=(--debug)
  fi
  pwa_cmd=(conda run -n "$conda_env" python -m http.server "$pwa_port" --bind "$host" --directory autonovelwriter/pwa)
fi

tmux new-session -d -s "$session" -c "$repo_root" "bash"
tmux rename-window -t "$session:0" "autonovelwriter"
tmux set-option -t "$session" -g mouse on

# Pane 0: backend
tmux send-keys -t "$session:0.0" "cd \"$repo_root\"" C-m
tmux send-keys -t "$session:0.0" "echo \"[backend] http://$host:$backend_port (health: /api/health, ws: /ws)\"" C-m
tmux send-keys -t "$session:0.0" "${backend_cmd[*]}" C-m

# Pane 1: PWA server
tmux split-window -h -t "$session:0" -c "$repo_root" "bash"
tmux send-keys -t "$session:0.1" "cd \"$repo_root\"" C-m
tmux send-keys -t "$session:0.1" "echo \"[pwa]     http://$host:$pwa_port (static: autonovelwriter/pwa/)\"" C-m
tmux send-keys -t "$session:0.1" "${pwa_cmd[*]}" C-m

# Pane 2: log tail
tmux split-window -v -t "$session:0.1" -c "$repo_root" "bash"
tmux send-keys -t "$session:0.2" "cd \"$repo_root\"" C-m
tmux send-keys -t "$session:0.2" "echo \"[logs]   tail -f autonovelwriter/runtime/logs/runner.log\"" C-m
tmux send-keys -t "$session:0.2" "${log_cmd[*]}" C-m

tmux select-layout -t "$session:0" tiled
tmux display-message -t "$session" "AutoNovelWriter: PWA http://$host:$pwa_port  |  backend http://$host:$backend_port"

if [ "$attach" -eq 1 ]; then
  exec tmux attach -t "$session"
fi

