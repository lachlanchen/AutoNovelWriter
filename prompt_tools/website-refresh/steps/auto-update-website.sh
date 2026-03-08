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
reasoning_effort="${AUTO_WEBSITE_REASONING_EFFORT:-high}"

if [[ ! -d "$repo_path" ]]; then
  echo "Repo path does not exist: $repo_path"
  exit 1
fi

if [[ ! -s "$analysis_output_file" ]]; then
  echo "Missing analysis output file: $analysis_output_file"
  exit 1
fi

prompt_file="$(mktemp)"
trap 'rm -f "$prompt_file"' EXIT

cat > "$prompt_file" <<PROMPT
You are updating a website repository based on an explicit goal and a prior analysis.

Inputs:
- Repo path: $repo_path
- User goal prompt: $user_prompt
- Pipeline context file: $pipeline_context_file
- Analysis file: $analysis_output_file

Required actions:
1. Read the analysis file and repository files before editing.
2. Implement the highest-impact website updates that satisfy the user goal.
3. Keep edits focused and production-safe.

Constraints:
- Prioritize landing-page quality: clarity, modern UI polish, responsive stability.
- Preserve existing functioning features unless goal requires change.
- If you change translatable UI strings, update corresponding translation keys where available.
- Avoid unrelated file churn.

Validation requirements:
- Verify no obvious HTML/CSS/JS syntax breakage in edited files.
- Ensure desktop + mobile layout remains coherent.

Output behavior:
- Apply edits directly to repository files.
- At the end, print a concise summary with changed file paths and why.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

echo "Website update step completed."
