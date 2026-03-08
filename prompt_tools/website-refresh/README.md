# Website Refresh Prompt Tool

This tool is modeled after the `AutoAppDev` prompt-pipeline pattern and is designed for repeatable website updates.

## Files

- `prompt_tools/website-refresh/pipeline.sh`
- `prompt_tools/website-refresh/steps/auto-site-analysis.sh`
- `prompt_tools/website-refresh/steps/auto-materials-brief.sh`
- `prompt_tools/website-refresh/steps/auto-update-content.sh`
- `prompt_tools/website-refresh/steps/auto-update-design.sh`
- `prompt_tools/website-refresh/steps/auto-validate-website.sh`
- `prompt_tools/website-refresh/steps/auto-commit-push.sh`

## Usage

```bash
prompt_tools/website-refresh/pipeline.sh \
  /path/to/repo \
  "Refresh landing page copy, layout, and mobile UX" \
  --materials-dir /path/to/repo/references \
  --materials-markdown-dir /path/to/repo/references_markdown \
  --commit-and-push
```

## Behavior

1. Analyze current site + references and write analysis to:
   - `.auto-website-work/<timestamp>/site-analysis.md`
2. Build a concise materials brief:
   - `.auto-website-work/<timestamp>/materials-brief.md`
3. Run content pass (copy + information architecture).
4. Run design pass (style/layout/theme/animation).
5. Run validation/fix pass.
6. Optionally commit/push after each mutating step using the codex commit/push step tool.

## Notes

- By default, the pipeline refuses dirty tracked repos.
- Set `AUTO_WEBSITE_ALLOW_DIRTY=1` to bypass intentionally.
- Model/reasoning controls:
  - `AUTO_WEBSITE_MODEL` (default: `gpt-5.3-codex`)
  - `AUTO_WEBSITE_REASONING_EFFORT` (default: `medium`)
