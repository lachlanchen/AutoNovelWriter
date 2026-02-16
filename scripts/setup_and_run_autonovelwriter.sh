#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/setup_and_run_autonovelwriter.sh [options]

Creates/updates conda env, installs deps, then starts AutoNovelWriter in tmux.

Options:
  --env <name>           Conda env name (default: autonovelwriter)
  --python <ver>         Python version (default: 3.11)
  --session <name>       tmux session name (default: autonovelwriter_app)
  --backend-port <n>     backend port (default: 8787)
  --pwa-port <n>         pwa port (default: 5173)
  --host <ip>            host bind (default: 127.0.0.1)
  --force-recreate       recreate conda env
  --debug                backend debug mode
  --kill                 kill existing tmux session with same name
  --no-attach            do not attach tmux
  -h, --help             show help

Example:
  scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
USAGE
}

env_name="autonovelwriter"
py_ver="3.11"
session="autonovelwriter_app"
backend_port="8787"
pwa_port="5173"
host="127.0.0.1"
force_recreate=0
debug=0
kill_existing=0
attach=1

while [ $# -gt 0 ]; do
  case "$1" in
    --env) env_name="${2:-}"; shift 2 ;;
    --python) py_ver="${2:-}"; shift 2 ;;
    --session) session="${2:-}"; shift 2 ;;
    --backend-port) backend_port="${2:-}"; shift 2 ;;
    --pwa-port) pwa_port="${2:-}"; shift 2 ;;
    --host) host="${2:-}"; shift 2 ;;
    --force-recreate) force_recreate=1; shift ;;
    --debug) debug=1; shift ;;
    --kill) kill_existing=1; shift ;;
    --no-attach) attach=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1
      ;;
  esac
done

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
setup_cmd=("$repo_root/scripts/setup_conda_env.sh" "--name" "$env_name" "--python" "$py_ver")
run_cmd=(
  "$repo_root/scripts/run_autonovelwriter_tmux.sh"
  "--env" "$env_name"
  "--session" "$session"
  "--backend-port" "$backend_port"
  "--pwa-port" "$pwa_port"
  "--host" "$host"
)

if [ "$force_recreate" -eq 1 ]; then
  setup_cmd+=("--force-recreate")
fi
if [ "$debug" -eq 1 ]; then
  run_cmd+=("--debug")
fi
if [ "$kill_existing" -eq 1 ]; then
  run_cmd+=("--kill")
fi
if [ "$attach" -eq 0 ]; then
  run_cmd+=("--no-attach")
fi

"${setup_cmd[@]}"
"${run_cmd[@]}"

