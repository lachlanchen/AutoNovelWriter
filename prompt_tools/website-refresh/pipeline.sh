#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  cat <<USAGE
Usage: $0 <repo_path> <prompt> [--materials-dir <path>] [--materials-markdown-dir <path>] [--commit-and-push]

Example:
  $0 /path/to/repo "Refresh landing page messaging and mobile layout" \
    --materials-dir /path/to/repo/references \
    --materials-markdown-dir /path/to/repo/references_markdown \
    --commit-and-push
USAGE
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_path="$1"
user_prompt="$2"
commit_and_push=""
materials_dir=""
materials_markdown_dir=""

shift 2
while [[ $# -gt 0 ]]; do
  case "$1" in
    --materials-dir)
      materials_dir="${2:-}"
      shift 2
      ;;
    --materials-markdown-dir)
      materials_markdown_dir="${2:-}"
      shift 2
      ;;
    --commit-and-push)
      commit_and_push="--commit-and-push"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

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
materials_brief_tool="$tool_dir/steps/auto-materials-brief.sh"
content_update_tool="$tool_dir/steps/auto-update-content.sh"
design_update_tool="$tool_dir/steps/auto-update-design.sh"
language_update_tool="$tool_dir/steps/auto-update-language.sh"
theme_update_tool="$tool_dir/steps/auto-update-theme.sh"
validate_tool="$tool_dir/steps/auto-validate-website.sh"
commit_push_tool="$tool_dir/steps/auto-commit-push.sh"

for f in "$analyze_tool" "$materials_brief_tool" "$content_update_tool" "$design_update_tool" "$language_update_tool" "$theme_update_tool" "$validate_tool" "$commit_push_tool"; do
  if [[ ! -x "$f" ]]; then
    echo "Required executable missing: $f"
    exit 1
  fi
done

if [[ -z "$materials_dir" ]]; then
  materials_dir="$repo_path/references"
fi
if [[ -z "$materials_markdown_dir" ]]; then
  materials_markdown_dir="$repo_path/references_markdown"
fi

if [[ ! -d "$materials_dir" ]]; then
  echo "Materials directory does not exist: $materials_dir"
  exit 1
fi
if [[ ! -d "$materials_markdown_dir" ]]; then
  echo "Materials markdown directory does not exist: $materials_markdown_dir"
  exit 1
fi

languages_raw="${AUTO_WEBSITE_LANGUAGES:-en zh-Hans zh-Hant ja ko vi ar fr es}"
themes_raw="${AUTO_WEBSITE_THEMES:-light dark}"
read -r -a language_list <<< "$languages_raw"
read -r -a theme_list <<< "$themes_raw"

run_ts="$(date +%Y%m%d_%H%M%S)"
work_dir="$repo_path/.auto-website-work/$run_ts"
mkdir -p "$work_dir"

pipeline_context_file="$work_dir/pipeline-context.md"
analysis_output_file="$work_dir/site-analysis.md"
materials_brief_file="$work_dir/materials-brief.md"
baseline_untracked_file="$work_dir/baseline-untracked.txt"

git -C "$repo_path" ls-files --others --exclude-standard > "$baseline_untracked_file"

stage_and_push_step() {
  local step_message="$1"
  if [[ "$commit_and_push" != "--commit-and-push" ]]; then
    return 0
  fi

  "$commit_push_tool" "$repo_path" "$pipeline_context_file" "$baseline_untracked_file" "$step_message"
}

cat > "$pipeline_context_file" <<CTX
# Auto Website Refresh Pipeline Context

- Run timestamp: $run_ts
- Repository path: $repo_path
- User goal prompt: $user_prompt
- Materials directory: $materials_dir
- Materials markdown directory: $materials_markdown_dir
- Language update loop: ${language_list[*]}
- Theme update loop: ${theme_list[*]}

## Step Overview
1. Analyze current website structure/content and existing references.
2. Build a concise brief from source materials.
3. Apply base content updates (copy and information architecture).
4. Apply visual design updates (style/layout/animation baseline).
5. Run i18n updates in a language loop.
6. Run theme refinements in a theme loop.
7. Validate changed website files.
8. Optionally commit and push.

## Rules
- Keep edits focused on website-related files.
- Preserve existing technical correctness and working functionality.
- Keep responsive behavior stable for desktop and mobile.
- Keep changes steady and incremental by phase.
CTX

echo "[1/8] Analyze current website"
"$analyze_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$analysis_output_file" "$materials_dir" "$materials_markdown_dir"

echo "[2/8] Build materials brief"
"$materials_brief_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$materials_dir" "$materials_markdown_dir" "$materials_brief_file"

echo "[3/8] Apply content updates"
"$content_update_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$analysis_output_file" "$materials_brief_file"
stage_and_push_step "auto website: content update"

echo "[4/8] Apply design updates"
"$design_update_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$analysis_output_file" "$materials_brief_file"
stage_and_push_step "auto website: design update"

echo "[5/8] Update i18n by language loop"
for lang in "${language_list[@]}"; do
  if [[ -n "$lang" ]]; then
    echo "  - language: $lang"
    "$language_update_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$analysis_output_file" "$materials_brief_file" "$lang"
    stage_and_push_step "auto website: i18n update ($lang)"
  fi
done

echo "[6/8] Update themes by theme loop"
for theme in "${theme_list[@]}"; do
  if [[ -n "$theme" ]]; then
    echo "  - theme: $theme"
    "$theme_update_tool" "$repo_path" "$user_prompt" "$pipeline_context_file" "$analysis_output_file" "$materials_brief_file" "$theme"
    stage_and_push_step "auto website: theme update ($theme)"
  fi
done

echo "[7/8] Validate website updates"
"$validate_tool" "$repo_path" "$pipeline_context_file"
stage_and_push_step "auto website: validation fixes"

echo "[8/8] Optional commit and push"
if [[ "$commit_and_push" == "--commit-and-push" ]]; then
  stage_and_push_step "auto website: final pipeline sweep"
else
  echo "Skipping commit/push. Pass --commit-and-push to enable."
fi

echo "Pipeline completed. Work dir: $work_dir"
