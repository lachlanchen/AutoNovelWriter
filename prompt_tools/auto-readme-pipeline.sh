#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  cat <<USAGE
Usage: $0 <repo_path> <prompt> [--commit-and-push]

Example:
  $0 /path/to/repo "Write a complete and beautiful README" --commit-and-push
USAGE
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_path="$1"
user_prompt="$2"
commit_and_push="${3:-}"

if [[ ! -d "$repo_path" ]]; then
  echo "Repo path does not exist: $repo_path"
  exit 1
fi

if [[ ! -d "$repo_path/.git" ]]; then
  echo "Repo is not a git repository: $repo_path"
  exit 1
fi

# Safety guard: by default, refuse dirty tracked repos.
# Set AUTO_README_ALLOW_DIRTY=1 to bypass this guard intentionally.
if [[ "${AUTO_README_ALLOW_DIRTY:-0}" != "1" ]]; then
  if ! git -C "$repo_path" diff --quiet || ! git -C "$repo_path" diff --cached --quiet; then
    echo "Refusing to run: repo has existing tracked-file changes: $repo_path"
    echo "Please commit/stash/reset first, then rerun."
    echo "Or set AUTO_README_ALLOW_DIRTY=1 to bypass."
    exit 2
  fi
fi

auto_dir="$script_dir/auto-readme"
structure_tool="$auto_dir/auto-file-structure.sh"
write_tool="$auto_dir/auto-write-readme.sh"
beautify_tool="$auto_dir/auto-beautify.sh"
translate_tool="$auto_dir/auto-translate-readme.sh"

for f in "$structure_tool" "$write_tool" "$beautify_tool" "$translate_tool"; do
  if [[ ! -x "$f" ]]; then
    echo "Required executable missing: $f"
    exit 1
  fi
done

canonical_support_block=$'## ❤️ Support\n\n| Donate | PayPal | Stripe |\n| --- | --- | --- |\n| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |'

canonical_banner_line='[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)'
canonical_support_url_patterns='chat.lazying.art/donate\npaypal.me/RongzhouChen\nbuy.stripe.com/aFadR8gIaflgfQV6T4fw400\nimg.shields.io/badge/Donate-LazyingArt\nimg.shields.io/badge/PayPal-RongzhouChen\nimg.shields.io/badge/Stripe-Donate\ncamo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7\ncamo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21\ncamo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942'

ensure_single_banner() {
  local file="$1"
  [ -f "$file" ] || return 0

  local tmp_file="$file.auto-readme-banner"
  local tmp_file2="$file.auto-readme-banner-final"
  awk -v banner="$canonical_banner_line" '
    $0 ~ /lachlanchen\/lachlanchen\/raw\/main\/figs\/banner\.png/ {
      if (!seen_banner) {
        print banner
        seen_banner = 1
      }
      next
    }
    { print }
  ' "$file" > "$tmp_file"

  if rg -q 'lachlanchen\/lachlanchen\/raw\/main\/figs\/banner\.png' "$tmp_file"; then
    mv "$tmp_file" "$file"
    return 0
  fi

  {
    printf '%s\n\n' "$canonical_banner_line"
    cat "$tmp_file"
  } > "$tmp_file2"
  mv "$tmp_file2" "$file"
  rm -f "$tmp_file"
}

ensure_single_support_panel() {
  local file="$1"
  [ -f "$file" ] || return 0

  local tmp_file="$file.auto-readme-support"
  local tmp_file2="$file.auto-readme-support-final"
  local marker
  local -a support_patterns=()
  mapfile -t support_patterns <<< "$canonical_support_url_patterns"

  awk '
    BEGIN { in_support = 0 }
    {
      if (in_support) {
        if ($0 ~ /^## /) {
          in_support = 0
        } else {
          next
        }
      }

      if ($0 ~ /^##[[:space:]]*❤️?[[:space:]]*Support/) {
        in_support = 1
        next
      }

      print
    }
  ' "$file" > "$tmp_file"

  # Remove legacy shield-style and old support-link variants before reinsertion.
  {
    for p in "${support_patterns[@]}"; do
      printf '%s\n' "$p"
    done
  } > "$tmp_file.patterns"
  grep -Fivf "$tmp_file.patterns" "$tmp_file" > "${tmp_file}.filtered" || true
  rm -f "$tmp_file.patterns"

  marker=$(rg -n '^## .*Contact|^## .*License|^## 📬' "${tmp_file}.filtered" | head -n 1 | cut -d: -f1 || true)
  if [ -n "$marker" ] && [ "$marker" -gt 0 ]; then
    {
      head -n $((marker - 1)) "${tmp_file}.filtered"
      printf '%s\n\n' "$canonical_support_block"
      tail -n +"$marker" "${tmp_file}.filtered"
    } > "$tmp_file2"
  else
    {
      cat "${tmp_file}.filtered"
      printf '\n\n%s\n' "$canonical_support_block"
    } > "$tmp_file2"
  fi

  mv "$tmp_file2" "$file"
  rm -f "$tmp_file" "$tmp_file2" "${tmp_file}.filtered"
}

effective_prompt="$user_prompt"$'\n\nAdd or update a support section near the lower part of README. Use exactly this block and keep only one copy:\n\n'"${canonical_support_block}"

run_ts="$(date +%Y%m%d_%H%M%S)"
work_dir="$repo_path/.auto-readme-work/$run_ts"
mkdir -p "$work_dir"

readme_path="$repo_path/README.md"
structure_output_file="$work_dir/repo-structure-analysis.md"
pipeline_context_file="$work_dir/pipeline-context.md"
translation_plan_file="$work_dir/translation-plan.txt"
translated_files_file="$work_dir/translated-files.txt"

cat > "$pipeline_context_file" <<CTX
# Auto README Pipeline Context

- Run timestamp: $run_ts
- Repository path: $repo_path
- User prompt: $user_prompt
- Goal: Generate a complete, beautiful, multilingual README set.

## Step Overview
1. Analyze repository structure.
2. Create first complete README draft.
3. Beautify README with better visuals (emoji/table/badges).
4. Generate multilingual README variants.
5. Optionally commit and push changes.

## Redundant Context Notes
- Every codex step should re-read repository files and this context file.
- Each step must remain self-contained and not depend on prior session memory.
CTX

i18n_plan=$'ar|Arabic|i18n/README.ar.md\nes|Spanish|i18n/README.es.md\nfr|French|i18n/README.fr.md\nja|Japanese|i18n/README.ja.md\nko|Korean|i18n/README.ko.md\nvi|Vietnamese|i18n/README.vi.md\nzh-Hans|Chinese Simplified|i18n/README.zh-Hans.md\nzh-Hant|Chinese Traditional|i18n/README.zh-Hant.md\nde|Deutsch|i18n/README.de.md\nru|Russian|i18n/README.ru.md'

# Always run multilingual mode; create i18n when missing.
i18n_mode=1
mkdir -p "$repo_path/i18n"
printf '%s\n' "$i18n_plan" > "$translation_plan_file"

# Build canonical nav lines (no "Languages:" label).
root_nav_line='[English](README.md) · [العربية](i18n/README.ar.md) · [Español](i18n/README.es.md) · [Français](i18n/README.fr.md) · [日本語](i18n/README.ja.md) · [한국어](i18n/README.ko.md) · [Tiếng Việt](i18n/README.vi.md) · [中文 (简体)](i18n/README.zh-Hans.md) · [中文（繁體）](i18n/README.zh-Hant.md) · [Deutsch](i18n/README.de.md) · [Русский](i18n/README.ru.md)'
i18n_nav_line='[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)'

language_nav_line="$i18n_nav_line"
root_nav_block_file="$work_dir/language-nav-root.md"
i18n_nav_block_file="$work_dir/language-nav-i18n.md"
printf '%s\n' "$root_nav_line" > "$root_nav_block_file"
printf '%s\n' "$i18n_nav_line" > "$i18n_nav_block_file"

echo "[1/5] Analyze repository structure"
"$structure_tool" "$repo_path" "$effective_prompt" "$pipeline_context_file" "$structure_output_file"

echo "[2/5] Write first complete README"
"$write_tool" "$repo_path" "$effective_prompt" "$pipeline_context_file" "$structure_output_file" "$readme_path"

echo "[3/5] Beautify README"
"$beautify_tool" "$repo_path" "$effective_prompt" "$pipeline_context_file" "$readme_path"

echo "[4/5] Generate multilingual READMEs"
: > "$translated_files_file"
while IFS='|' read -r lang_code lang_label output_name; do
  if [[ -z "${output_name:-}" ]]; then
    continue
  fi
  output_path="$repo_path/$output_name"
  step_note="Translating README into $lang_label with language code $lang_code as part of multilingual batch generation."
  "$translate_tool" \
    "$repo_path" \
    "$effective_prompt" \
    "$pipeline_context_file" \
    "$readme_path" \
    "$lang_label" \
    "$lang_code" \
    "$output_path" \
    "$language_nav_line" \
    "$step_note"
  printf '%s\n' "$output_name" >> "$translated_files_file"
done < "$translation_plan_file"

echo "[5/6] Insert language link bar into all README variants"
(
  cd "$repo_path"
  files=(README.md)
  while IFS= read -r p; do
    rel="${p#"$repo_path"/}"
    files+=("$rel")
  done < <(find "$repo_path/i18n" -maxdepth 1 -type f -name 'README.*.md' | sort)
  for f in "${files[@]}"; do
    if [[ ! -f "$f" ]]; then
      continue
    fi
    nav_block="$(cat "$root_nav_block_file")"
    if [[ "$f" == i18n/* ]]; then
      nav_block="$(cat "$i18n_nav_block_file")"
    fi
    tmp_file="$(mktemp)"
    awk '
      BEGIN {
        in_block = 0
      }
      {
        if (in_block == 1) {
          block = block $0 "\n"
          if ($0 ~ /Languages|README(\.[a-zA-Z-]+)?\.md/) {
            has_lang = 1
          }
          if ($0 ~ /^<\/p>$/) {
            in_block = 0
            if (has_lang) {
              block = ""
              has_lang = 0
              next
            }
            printf "%s", block
            block = ""
          }
          next
        }
        if ($0 ~ /^<p([[:space:]][^>]*)?>$/) {
          in_block = 1
          block = $0 "\n"
          has_lang = ($0 ~ /Languages|README(\.[a-zA-Z-]+)?\.md/)
          next
        }
        if ($0 ~ /^[[:space:]]*Languages:/) { next }
        if ($0 ~ /^\*\*Languages:\*\*/) { next }
        if ($0 ~ /\[English\]\(/ && $0 ~ /README\.md/ && $0 ~ /README\./) { next }
        if ($0 ~ /(English|中文|日本語|한국어|Tiếng Việt|العربية|Français|Español|Deutsch|Русский)/ && $0 ~ /[·|]/) { next }
        if ($0 ~ /README(\.[a-zA-Z-]+)?\.md/ && $0 ~ /(English|中文|日本語|한국어|Tiếng Việt|العربية|Français|Español|Deutsch|Русский)/) { next }
        if ($0 ~ /^\["'\''!\[/) { next }
        print
      }
    ' "$f" > "$tmp_file"
    {
      printf '%s\n\n' "$nav_block"
      cat "$tmp_file"
    } > "$f"
    rm -f "$tmp_file"
  done
)

echo "[6/7] Normalize i18n/root README layout"
if [[ "$i18n_mode" -eq 1 ]]; then
  mkdir -p "$repo_path/i18n"
  while IFS= read -r p; do
    b="$(basename "$p")"
    # Keep canonical root README.md; move/merge language variants to i18n.
    if [[ "$b" == "README.md" ]]; then
      continue
    fi
    dest="$repo_path/i18n/$b"
    if [[ -f "$dest" ]]; then
      rm -f "$p"
    else
      mv "$p" "$dest"
      if ! grep -Fxq "i18n/$b" "$translated_files_file"; then
        printf 'i18n/%s\n' "$b" >> "$translated_files_file"
      fi
    fi
  done < <(find "$repo_path" -maxdepth 1 -type f -name 'README.*.md' | sort)
fi

echo "[7/8] Enforce single canonical support panel in all README variants"
ensure_single_banner "$repo_path/README.md"
ensure_single_support_panel "$repo_path/README.md"
if [ -d "$repo_path/i18n" ]; then
  while IFS= read -r p; do
    ensure_single_banner "$p"
    ensure_single_support_panel "$p"
  done < <(find "$repo_path/i18n" -maxdepth 1 -type f -name 'README.*.md' | sort)
fi

echo "[8/8] Optional commit and push"
if [[ "$commit_and_push" == "--commit-and-push" ]]; then
  (
    cd "$repo_path"
    # Ensure no pre-existing staged changes leak into this auto commit.
    git reset >/dev/null

    git add README.md i18n/README.*.md
    # Stage removals of any root README.<lang>.md files after normalization.
    if compgen -G "$repo_path/README.*.md" > /dev/null; then
      git add -A README.*.md
    fi

    # Safety guard: only allow README targets in this auto commit.
    bad_paths="$(git diff --cached --name-only | rg -v '^(README\.md|i18n/README\..*\.md)$' || true)"
    if [[ -n "$bad_paths" ]]; then
      echo "Refusing to commit unexpected staged paths:"
      echo "$bad_paths"
      exit 3
    fi

    if git diff --cached --quiet; then
      echo "No README changes to commit."
    else
      git commit -m "Add autogenerated multilingual README pipeline output"
      git push
    fi
  )
else
  echo "Skipping commit/push. Pass --commit-and-push to enable."
fi

echo "Pipeline completed. Work dir: $work_dir"
