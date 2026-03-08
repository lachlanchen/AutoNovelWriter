#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  cat <<USAGE
Usage: $0 <repo_path> <prompt> [--commit-and-push]

Example:
  $0 /path/to/repo "Refresh landing page messaging and mobile layout" --commit-and-push
USAGE
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_path="$1"
user_prompt="$2"
commit_and_push="${3:-}"

if [[ ! -d "$repo_path" ]]; then
  echo "Repo path does not exist: $repo_path"
  exit 1
fi

if [[ ! -d "$repo_path/.git" ]]; then
  echo "Repo is not a git repository: $repo_path"
  exit 1
fi

# Safety guard: by default, refuse dirty tracked repos.
# Set AUTO_WEBSITE_ALLOW_DIRTY=1 to bypass intentionally.
if [[ "${AUTO_WEBSITE_ALLOW_DIRTY:-0}" != "1" ]]; then
  if ! git -C "$repo_path" diff --quiet || ! git -C "$repo_path" diff --cached --quiet; then
    echo "Refusing to run: repo has existing tracked-file changes: $repo_path"
    echo "Please commit/stash/reset first, then rerun."
    echo "Or set AUTO_WEBSITE_ALLOW_DIRTY=1 to bypass."
    exit 2
  fi
fi

tool_dir="$script_dir"
analyze_tool="$tool_dir/steps/auto-site-analysis.sh"
update_tool="$tool_dir/steps/auto-update-website.sh"

for f in "$analyze_tool" "$update_tool"; do
  if [[ ! -x "$f" ]]; then
    echo "Required executable missing: $f"
    exit 1
  fi
done

run_ts="$(date +%Y%m%d_%H%M%S)"
work_dir="$repo_path/.auto-website-work/$run_ts"
mkdir -p "$work_dir"

pipeline_context_file="$work_dir/pipeline-context.md"
analysis_output_file="$work_dir/site-analysis.md"

cat > "$pipeline_context_file" <<CTX
# Auto Website Refresh Pipeline Context

- Run timestamp: $run_ts
- Repository path: $repo_path
- User goal prompt: $user_prompt

## Step Overview
1. Analyze current website structure/content and existing references.
2. Apply website updates with concrete file edits.
3. Optionally commit and push.

## Rules
- Keep edits focused on website-related files.
- Preserve existing technical correctness and working functionality.
- Keep responsive behavior stable for desktop and mobile.
CTX

echo "[1/3] Analyze current website"
"$analyze_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$analysis_output_file"

echo "[2/3] Apply website updates"
"$update_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$analysis_output_file"

echo "[3/3] Optional commit and push"
if [[ "$commit_and_push" == "--commit-and-push" ]]; then
  (
    cd "$repo_path"
    git add -A \
      ':!*.DS_Store' \
      ':!**/.DS_Store' \
      ':!._*' \
      ':!**/._*'

    if git diff --cached --quiet; then
      echo "No changes to commit."
    else
      git commit -m "Apply auto website refresh pipeline output"
      git push
    fi
  )
else
  echo "Skipping commit/push. Pass --commit-and-push to enable."
fi

echo "Pipeline completed. Work dir: $work_dir"
