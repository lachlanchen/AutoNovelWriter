#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 6 ]]; then
  echo "Usage: $0 <repo_path> <user_prompt> <pipeline_context_file> <materials_dir> <materials_markdown_dir> <materials_brief_file>"
  exit 1
fi

repo_path="$1"
user_prompt="$2"
pipeline_context_file="$3"
materials_dir="$4"
materials_markdown_dir="$5"
materials_brief_file="$6"
model="${AUTO_WEBSITE_MODEL:-gpt-5.3-codex}"
reasoning_effort="${AUTO_WEBSITE_REASONING_EFFORT:-medium}"

if [[ ! -d "$repo_path" ]]; then
  echo "Repo path does not exist: $repo_path"
  exit 1
fi
if [[ ! -d "$materials_dir" ]]; then
  echo "Materials directory does not exist: $materials_dir"
  exit 1
fi
if [[ ! -d "$materials_markdown_dir" ]]; then
  echo "Materials markdown directory does not exist: $materials_markdown_dir"
  exit 1
fi

mkdir -p "$(dirname "$materials_brief_file")"

prompt_file="$(mktemp)"
trap 'rm -f "$prompt_file"' EXIT

cat > "$prompt_file" <<PROMPT
You are preparing a concise source-of-truth brief for website updates.

Inputs:
- Repo path: $repo_path
- User goal prompt: $user_prompt
- Pipeline context file: $pipeline_context_file
- Raw materials directory: $materials_dir
- Markdown materials directory: $materials_markdown_dir

Required actions:
1. Read the materials (prioritize markdown extracts for text fidelity).
2. Distill the most current product/messaging/proof points.
3. Produce a website-focused brief in this exact file: $materials_brief_file

Output format:
- Markdown only.
- Sections:
  - Core Positioning
  - Product Lineup Facts
  - Strongest Value Propositions
  - Proof/Credibility Points
  - Messaging Guardrails (claims to avoid or soften)
  - Website Copy Blocks (hero/problem/solution/cta draft snippets)

Important:
- Do not edit website files in this step.
- Write only the brief file above.
PROMPT

cat "$prompt_file" | codex exec \
  --model "$model" \
  -c "reasoning_effort=\"$reasoning_effort\"" \
  --dangerously-bypass-approvals-and-sandbox \
  -C "$repo_path" \
  --skip-git-repo-check \
  -

if [[ ! -s "$materials_brief_file" ]]; then
  echo "Failed: materials brief file was not created: $materials_brief_file"
  exit 1
fi

echo "Materials brief written: $materials_brief_file"
