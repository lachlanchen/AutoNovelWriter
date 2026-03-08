#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <repo_path> <pipeline_context_file> <baseline_untracked_file> <commit_message>"
  exit 1
fi

repo_path="$1"
pipeline_context_file="$2"
baseline_untracked_file="$3"
commit_message="$4"
model="${AUTO_WEBSITE_MODEL:-gpt-5.3-codex}"
reasoning_effort="${AUTO_WEBSITE_REASONING_EFFORT:-medium}"

if [[ ! -d "$repo_path" ]]; then
  echo "Repo path does not exist: $repo_path"
  exit 1
fi

if [[ ! -f "$baseline_untracked_file" ]]; then
  echo "Missing baseline untracked file: $baseline_untracked_file"
  exit 1
fi

prompt_file="$(mktemp)"
trap 'rm -f "$prompt_file"' EXIT

cat > "$prompt_file" <<PROMPT
You are handling a focused commit+push step for a website refresh pipeline.

Inputs:
- Repo path: $repo_path
- Pipeline context file: $pipeline_context_file
- Baseline untracked list file: $baseline_untracked_file
- Commit message: $commit_message

Required actions:
1. Stage candidate changes:
   - run: git add -A ':!*.DS_Store' ':!**/.DS_Store' ':!._*' ':!**/._*' ':!.auto-website-work/' ':!.auto-website-work/**'
2. Remove files from staging that were already untracked at pipeline start:
   - for each line in $baseline_untracked_file, run: git reset -q HEAD -- "<path>" (ignore errors)
3. If staging is empty, print "No changes to commit for step: $commit_message" and exit successfully.
4. Otherwise:
   - git commit -m "$commit_message"
   - git push

Important:
- Do not modify files unrelated to commit staging.
- Do not amend previous commits.
- Do not use force push.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

echo "Commit/push step completed for: $commit_message"
