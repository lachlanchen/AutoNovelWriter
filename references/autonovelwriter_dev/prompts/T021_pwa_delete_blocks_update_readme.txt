You are being invoked by scripts/auto-autonovelwriter-development.sh (ONE shared Codex session).

Overall goal (repeat for every step):
- Build AutoNovelWriter: Scratch-like PWA controller + Python Tornado backend.
- Light theme by default.
- Must support chat + folder-based inbox/outbox interruption during a running pipeline.
- Must support UI language (i18n): en, zh-Hans, zh-Hant, ja, ko, vi, ar, fr, es, ru, de.
- Must support novel-writing settings (at least novel language), separate from UI language.
- Must support materials management (multiple folders/files) and standardized project storage.
- Must standardize and document storage and naming conventions for:
  - input materials, interactions, outputs
  - docs/references/scripts/tools/logs
  - auto-novels/projects storage
  - task management + resumable state
- Must support a pipeline-script visualization module:
  - Parse a formatted pipeline script (shell-ish text) into structured tasks/steps/actions/blocks.
  - Render the structured pipeline back into a formatted script the UI can generate/export.
- Default pipeline canvas layout (first load) must look like a Scratch program with indentation:
  ROUND <n_rounds>
    STEP meta_tasks_generate
    FOREACH_TASK
      FOREACH_ACTION
        STEP <action_id>
- The above layout must remain fully changeable by the user (edit rounds, edit meta-task prompts, reorder/disable blocks).
- The pipeline language and UI must support:
  - metatasks action: STEP meta_tasks_generate (produces explicit task+artifact outputs)
  - for-loops: ROUND / LOOP / FOREACH_TASK / FOREACH_ACTION
  - if/else: IF / ELSE blocks (Scratch-like conditional container)
- Action Library semantics (Scratch-like “My Blocks”):
  - default actions are immutable templates
  - when a user edits a default action, create a new action (copy-on-edit) and switch references
  - blocks reference an action_id, not a hard-coded built-in behavior
- Explicit dataflow between actions:
  - each action execution must emit/persist a structured ActionResult (inputs + outputs + artifacts)
  - the next action consumes prior outputs explicitly (like Scratch variables), not by scanning folders
- Pipeline blocks must be flexible and editable:
  - per-block action/tool selection (codex + other SDK stubs + shell scripts)
  - per-block editable prompts/templates and parameters
  - nested rounds/loops via indentation in the formatted script + UI drag indent/outdent
- Do NOT confuse driver stages (plan/implement/debug/fix/i18n/summary) with the *in-app* pipelines
  (novel-writing vs app-development vs meta-dev) that AutoNovelWriter controls.

Read these first:
- references/autonovelwriter_dev/CONTEXT.md
- docs/autonovelwriter_spec.md
- README.md
- Existing code under: autonovelwriter/backend/ and autonovelwriter/pwa/
- Reference only: AutoAppDev/ (vendored submodule; similar patterns, different product)
- Task definition JSON (notes + acceptance): references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/task.json

This step:
- Task ID: T021_pwa_delete_blocks
- Task title: PWA: delete blocks (and containers)
- Stage: update_readme (strict)

Required workspace/output paths:
- Step working dir: references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/
- Write your outputs (notes/plan/debug/summary) into files under references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/:
  - plan: references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/plan.md
  - debug: references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/debug.md
  - summary: references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/summary.md
  - update_readme: update repo root README.md and note changes in references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/summary.md

Operational constraints:
- Do NOT commit or push. Do NOT create new remotes. The outer driver handles git.
- Prefer small, safe changes. Keep the app runnable.
- No secrets in git. If you add config, create .env.example and read env vars.

Stage-specific instructions:
- Do NOT modify app code in this stage.
- Update the repo root README.md to reflect current project reality:
  - what AutoNovelWriter is
  - how to run backend + PWA locally
  - major endpoints/features shipped so far
  - the existence of the pipeline-script visualization module (even if only partially implemented)
  - the driver workflow and how to run it safely
- Do NOT remove or manually edit the AUTO_DEV_PROGRESS markers in README.md; that section is overwritten by the driver.
- Keep README concise and actionable (commands + paths).
- Append a short \"## README\" note to: references/autonovelwriter_dev/steps/T021_pwa_delete_blocks/summary.md describing what you changed.
