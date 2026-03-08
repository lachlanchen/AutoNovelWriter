#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <repo_path> <user_prompt> <pipeline_context_file> <analysis_output_file>"
  exit 1
fi

repo_path="$1"
user_prompt="$2"
pipeline_context_file="$3"
analysis_output_file="$4"
model="${AUTO_WEBSITE_MODEL:-gpt-5.3-codex}"
reasoning_effort="${AUTO_WEBSITE_REASONING_EFFORT:-medium}"

if [[ ! -d "$repo_path" ]]; then
  echo "Repo path does not exist: $repo_path"
  exit 1
fi

mkdir -p "$(dirname "$analysis_output_file")"

prompt_file="$(mktemp)"
trap 'rm -f "$prompt_file"' EXIT

cat > "$prompt_file" <<PROMPT
You are analyzing a website repository to prepare a concrete update plan.

Inputs:
- Repo path: $repo_path
- User goal prompt: $user_prompt
- Pipeline context file: $pipeline_context_file

Required actions:
1. Inspect website files and structure (HTML/CSS/JS/assets, plus references/plans if present).
2. Identify current state, messaging gaps, UI/UX issues, and responsive risks.
3. Write a factual analysis to this exact file path: $analysis_output_file

Output format requirements for $analysis_output_file:
- Markdown only.
- Sections:
  - Current Website Snapshot
  - Existing Strengths to Preserve
  - Gaps vs User Goal
  - Recommended File-Level Changes
  - Risks / Validation Checklist
- Include concrete file references (paths).

Important:
- Do not modify website files in this step.
- Write only the analysis file above.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

if [[ ! -s "$analysis_output_file" ]]; then
  echo "Failed: analysis output file was not created: $analysis_output_file"
  exit 1
fi

echo "Site analysis written: $analysis_output_file"
