#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/setup_conda_env.sh [options]

Creates/updates a conda env for AutoNovelWriter and installs backend deps.

Options:
  --name <env>         Conda env name (default: autonovelwriter)
  --python <ver>       Python version (default: 3.11)
  --force-recreate     Delete and recreate the env
  -h, --help           Show help

Example:
  scripts/setup_conda_env.sh --name autonovelwriter --python 3.11
USAGE
}

env_name="autonovelwriter"
py_ver="3.11"
force_recreate=0

while [ $# -gt 0 ]; do
  case "$1" in
    --name)
      env_name="${2:-}"; shift 2 ;;
    --python)
      py_ver="${2:-}"; shift 2 ;;
    --force-recreate)
      force_recreate=1; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [ -z "$env_name" ] || [ -z "$py_ver" ]; then
  echo "Missing required value." >&2
  usage
  exit 1
fi

if ! command -v conda >/dev/null 2>&1; then
  echo "conda not found in PATH. Install Miniconda/Anaconda first." >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
req_file="$repo_root/autonovelwriter/backend/requirements.txt"

if [ ! -f "$req_file" ]; then
  echo "Missing requirements file: $req_file" >&2
  exit 1
fi

if [ "$force_recreate" -eq 1 ]; then
  conda env remove -n "$env_name" -y >/dev/null 2>&1 || true
fi

if conda env list | awk '{print $1}' | grep -qx "$env_name"; then
  echo "[conda] env exists: $env_name"
else
  echo "[conda] creating env: $env_name (python=$py_ver)"
  conda create -n "$env_name" -y "python=$py_ver" pip
fi

echo "[pip] installing: $req_file"
conda run -n "$env_name" python -m pip install --upgrade pip
conda run -n "$env_name" python -m pip install -r "$req_file"

echo
echo "Ready:"
echo "  conda activate $env_name"
echo "  scripts/run_autonovelwriter_tmux.sh --env $env_name"

