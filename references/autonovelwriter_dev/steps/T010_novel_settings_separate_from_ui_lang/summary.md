# T010 Summary: Novel settings (language + UX options)

## Implement
- Backend:
  - Added `settings.novel.*` defaults in `autonovelwriter/backend/server.py` (language/tone/target length/POV/tense/chapter target).
  - Extended `/api/settings` POST shallow-merge to accept the `novel` namespace.
- PWA:
  - Added a “Novel” section to the Settings modal with editable fields for novel language, tone, target length, POV, tense, and target chapters.
  - Settings are persisted via `/api/settings` as `{ novel: {...} }`.
  - UI language remains controlled by PWA i18n (`?lang=` / `anw_lang`) and is not coupled to `settings.novel.language`.
- Docs:
  - Updated `docs/autonovelwriter_spec.md` to explicitly separate UI language from novel-writing settings.

Verification (no TCP binds):
- `python3 -m py_compile autonovelwriter/backend/server.py`
- `node --check autonovelwriter/pwa/app.js`

## Fixes
- Backend: changed `/api/settings` POST to reload settings from disk before shallow-merge/save, avoiding clobbering out-of-band changes (`autonovelwriter/backend/server.py`).
