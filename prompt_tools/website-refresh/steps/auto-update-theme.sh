#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 6 ]]; then
  echo "Usage: $0 <repo_path> <user_prompt> <pipeline_context_file> <analysis_output_file> <materials_brief_file> <theme_name>"
  exit 1
fi

repo_path="$1"
user_prompt="$2"
pipeline_context_file="$3"
analysis_output_file="$4"
materials_brief_file="$5"
theme_name="$6"
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
You are performing a focused theme update for one theme variant in a website repo.

Inputs:
- Repo path: $repo_path
- User goal prompt: $user_prompt
- Pipeline context file: $pipeline_context_file
- Site analysis file: $analysis_output_file
- Materials brief file: $materials_brief_file
- Target theme: $theme_name

Required actions:
1. Identify style rules and behavior for the target theme.
2. Improve this theme only:
   - color consistency
   - typography readability
   - section spacing and hierarchy
   - animation polish
   - component coherence (header, cards, buttons, carousels)
3. Keep other themes stable and avoid regressions.

Constraints:
- Do not introduce breaking JS or class-name changes without updating references.
- Maintain responsive behavior on mobile and desktop.
- Keep visual language premium and consistent with product positioning.

Validation:
- Ensure no obvious CSS syntax issues.
- Verify target theme's header/hero/store/product sections remain readable.

Output behavior:
- Apply edits directly to repository files.
- Print a concise summary of target-theme changes.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

echo "Website theme update step completed for theme: $theme_name"
