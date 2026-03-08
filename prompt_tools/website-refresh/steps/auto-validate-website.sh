#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <repo_path> <pipeline_context_file>"
  exit 1
fi

repo_path="$1"
pipeline_context_file="$2"
model="${AUTO_WEBSITE_MODEL:-gpt-5.3-codex}"
reasoning_effort="${AUTO_WEBSITE_REASONING_EFFORT:-medium}"

if [[ ! -d "$repo_path" ]]; then
  echo "Repo path does not exist: $repo_path"
  exit 1
fi

changed_files="$(git -C "$repo_path" diff --name-only | tr '\n' ' ')"
if [[ -z "${changed_files// }" ]]; then
  echo "No changed files to validate."
  exit 0
fi

# Fast guard for unresolved merge markers in changed files.
if rg -n '^(<<<<<<<|=======|>>>>>>>)' $changed_files >/dev/null 2>&1; then
  echo "Validation failed: unresolved conflict markers found in changed files."
  rg -n '^(<<<<<<<|=======|>>>>>>>)' $changed_files || true
  exit 1
fi

prompt_file="$(mktemp)"
trap 'rm -f "$prompt_file"' EXIT

cat > "$prompt_file" <<PROMPT
You are validating and stabilizing website updates.

Inputs:
- Repo path: $repo_path
- Pipeline context file: $pipeline_context_file
- Changed files (from git diff): $changed_files

Required actions:
1. Review only changed website-related files.
2. Detect and fix obvious regressions:
   - syntax errors (HTML/CSS/JS)
   - broken selectors/class references
   - obvious responsive/layout breakage introduced in this run
3. Keep edits minimal and targeted.

Important:
- Do not add new features in this step.
- Focus on robustness and correctness of recent changes.
- Print a concise validation summary at the end.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

echo "Website validation step completed."
