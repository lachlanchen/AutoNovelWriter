# T010 Plan: Novel settings (separate from UI language)

## Design Note (Storage + Persist/Derive + Observability)
- Storage fit:
  - Persist novel-writing preferences under backend settings at `autonovelwriter/runtime/state/settings.json` in a dedicated namespace: `settings.novel.*`.
  - Keep UI language selection separate from novel language:
    - UI language stays as a PWA concern (query/localStorage), not stored under `settings.novel`.
    - Novel language is stored under `settings.novel.language` and may be used by runner/prompt templates later.
  - Project scoping:
    - For v1, store novel settings globally in `settings.json`.
    - Follow-up (later): allow per-project overrides under `autonovelwriter/runtime/projects/<project_id>/state/novel_settings.json` (not in this task).
- Persisted vs derived vs ephemeral:
  - Persisted (disk, gitignored): `runtime/state/settings.json` includes `novel` dict.
  - Derived: none required; UI displays stored values.
  - Ephemeral: current form edits before saving; UI language is transient/persistent in browser only.
- API/WS events for observability/resumability:
  - Reuse existing `GET /api/settings` and `POST /api/settings` (shallow-merge) to read/write `settings.novel`.
  - Optional (nice-to-have): WS `settings_updated` event. Not required for acceptance if UI refetches after save.

## Files To Change/Create
- Backend:
  - Change: `autonovelwriter/backend/server.py`
    - Extend `default_settings()` to include a `novel` namespace with defaults:
      - `language` (e.g. `"en"`)
      - `tone` (e.g. `"neutral"`)
      - `target_length_words` (int)
      - `pov` (e.g. `"third_limited"`)
      - `tense` (e.g. `"past"`)
      - `chapter_count_target` (int, optional)
    - Ensure `SettingsHandler.post()` allows shallow-merge of `novel` dict (add `"novel"` to allowed keys).
- PWA:
  - Change: `autonovelwriter/pwa/index.html` (Settings modal)
    - Add a small “Novel” section with inputs:
      - Novel language (select)
      - Tone (select/text)
      - Target length (number)
      - POV (select)
      - Tense (select)
  - Change: `autonovelwriter/pwa/app.js`
    - Populate the novel settings form from `/api/settings`.
    - Save novel settings via `POST /api/settings` with `{ novel: {...} }`.
    - Keep UI language controls separate (do not couple to `settings.novel.language`).
    - Add i18n keys for new labels (11 required UI languages).
- Docs:
  - Change: `docs/autonovelwriter_spec.md` (Settings section: explicitly separate UI language vs novel language).
  - Change: `README.md` (brief note: novel language is stored under settings and independent of UI `?lang=`).

## Acceptance Checklist
- Persistence:
  - Novel settings are stored under `settings.novel.*` in `runtime/state/settings.json`.
  - Values survive backend restart (`GET /api/settings` returns them).
- Separation:
  - Changing UI language via `?lang=` / `anw_lang` does not alter `settings.novel.language`.
  - Editing `settings.novel.language` does not change UI language.
- PWA:
  - Settings modal displays current novel settings and can edit + save them via `/api/settings`.

## Minimal Verification Commands (No TCP Binds)
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `node --check autonovelwriter/pwa/app.js`
- `rg -n \"settings\\.novel|\\bnovel\\b\" autonovelwriter/backend/server.py autonovelwriter/pwa/index.html autonovelwriter/pwa/app.js docs/autonovelwriter_spec.md README.md`
