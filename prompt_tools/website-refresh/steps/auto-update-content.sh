#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 5 ]]; then
  echo "Usage: $0 <repo_path> <user_prompt> <pipeline_context_file> <analysis_output_file> <materials_brief_file>"
  exit 1
fi

repo_path="$1"
user_prompt="$2"
pipeline_context_file="$3"
analysis_output_file="$4"
materials_brief_file="$5"
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
if [[ ! -s "$materials_brief_file" ]]; then
  echo "Missing materials brief file: $materials_brief_file"
  exit 1
fi

prompt_file="$(mktemp)"
trap 'rm -f "$prompt_file"' EXIT

cat > "$prompt_file" <<PROMPT
You are performing a content-only website refresh pass.

Inputs:
- Repo path: $repo_path
- User goal prompt: $user_prompt
- Pipeline context file: $pipeline_context_file
- Site analysis file: $analysis_output_file
- Materials brief file: $materials_brief_file

Required actions:
1. Read analysis + materials brief first.
2. Update website content and information architecture only:
   - hero/value proposition
   - product descriptions
   - proof/credibility copy
   - CTA language
3. Keep functionality stable; do not perform major visual redesign in this pass.

Constraints:
- Prioritize clarity and conversion-oriented messaging.
- If multilingual translation keys exist, update corresponding keys for changed high-visibility strings.
- Avoid broad unrelated edits.

Validation:
- Ensure no obvious text placeholder or broken i18n key references.
- Keep section flow coherent.

Output behavior:
- Apply edits directly to repository files.
- Print concise changed-file summary at the end.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

echo "Website content update step completed."
