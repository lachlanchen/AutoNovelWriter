#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 6 ]]; then
  echo "Usage: $0 <repo_path> <user_prompt> <pipeline_context_file> <analysis_output_file> <materials_brief_file> <language_code>"
  exit 1
fi

repo_path="$1"
user_prompt="$2"
pipeline_context_file="$3"
analysis_output_file="$4"
materials_brief_file="$5"
language_code="$6"
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
You are performing a focused i18n update for one language in a website repo.

Inputs:
- Repo path: $repo_path
- User goal prompt: $user_prompt
- Pipeline context file: $pipeline_context_file
- Site analysis file: $analysis_output_file
- Materials brief file: $materials_brief_file
- Target language code: $language_code

Required actions:
1. Inspect translation structures in website files.
2. Update only the target language's strings to align with the refreshed content and materials.
3. Keep key parity with English for high-visibility website strings where feasible.

Constraints:
- Do not rewrite unrelated languages.
- Keep translation style natural and concise for the target language.
- Preserve key identifiers and JS wiring.

Validation:
- Avoid missing commas/quote errors in translation objects.
- Ensure changed keys still map to existing `data-i18n` usage.

Output behavior:
- Apply edits directly to repository files.
- Print a concise summary of target-language changes.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

echo "Website i18n update step completed for language: $language_code"
