# Website Refresh Prompt Tool

This tool is modeled after the `AutoAppDev` prompt-pipeline pattern and is designed for repeatable website updates.

## Files

- `prompt_tools/website-refresh/pipeline.sh`
- `prompt_tools/website-refresh/steps/auto-site-analysis.sh`
- `prompt_tools/website-refresh/steps/auto-update-website.sh`

## Usage

```bash
prompt_tools/website-refresh/pipeline.sh \
  /path/to/repo \
  "Refresh landing page copy, layout, and mobile UX" \
  --commit-and-push
```

## Behavior

1. Analyze current site + references and write analysis to:
   - `.auto-website-work/<timestamp>/site-analysis.md`
2. Run a focused website-update codex pass.
3. Optionally commit and push all generated changes (excluding common OS artifacts).

## Notes

- By default, the pipeline refuses dirty tracked repos.
- Set `AUTO_WEBSITE_ALLOW_DIRTY=1` to bypass intentionally.
- Model/reasoning controls:
  - `AUTO_WEBSITE_MODEL` (default: `gpt-5.3-codex`)
  - `AUTO_WEBSITE_REASONING_EFFORT` (default: `medium` for analysis; `high` for update step)
