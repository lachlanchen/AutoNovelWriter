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
You are performing a design/system website refresh pass.

Inputs:
- Repo path: $repo_path
- User goal prompt: $user_prompt
- Pipeline context file: $pipeline_context_file
- Site analysis file: $analysis_output_file
- Materials brief file: $materials_brief_file

Required actions:
1. Read analysis + materials brief and current website files.
2. Update visual/system aspects:
   - style and spacing hierarchy
   - layout responsiveness (desktop/tablet/mobile)
   - animation polish (subtle, meaningful)
   - theme and color consistency
   - typography/font treatment
3. Preserve content accuracy from previous pass and keep functionality stable.

Constraints:
- Keep design modern, premium, and intentional.
- Avoid introducing broken interactions or inaccessible contrast.
- Prefer incremental refactors over risky rewrites.

Validation:
- Check for obvious HTML/CSS/JS syntax issues.
- Ensure major sections still render coherently on mobile and desktop.

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

echo "Website design update step completed."
