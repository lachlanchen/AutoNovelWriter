# T003 Plan: Scratch-like pipeline blocks v1 (drag/drop, task list)

## Files To Create/Change
- Backend
  - Change `autonovelwriter/backend/server.py`
    - Add `GET/POST /api/pipeline` persisted to `autonovelwriter/runtime/state/pipeline.json`.
- PWA
  - Change `autonovelwriter/pwa/index.html` to replace pipeline placeholder with a blocks list and basic controls.
  - Change `autonovelwriter/pwa/app.css` to style blocks list (light theme).
  - Change `autonovelwriter/pwa/app.js` to implement:
    - In-memory pipeline model `{blocks:[{id,type,enabled}]}`
    - HTML5 drag/drop reorder
    - Enable/disable toggle
    - Load/save via backend `/api/pipeline` (fallback to `localStorage` if backend unreachable)

## Acceptance Checklist
- [ ] Drag/drop reorder works.
- [ ] Pipeline persists and reloads (saved to backend `/api/pipeline`, reloaded on refresh).
- [ ] Blocks map to the step types in `docs/autonovelwriter_spec.md`.

## Minimal Verification Commands (No TCP Bind)
```bash
python3 -m py_compile autonovelwriter/backend/server.py
rg -n -- "\\/api\\/pipeline" autonovelwriter/backend/server.py
rg -n -- "draggable" autonovelwriter/pwa/app.js autonovelwriter/pwa/index.html
python3 - <<'PY'
from pathlib import Path
root = Path('autonovelwriter/pwa')
for p in ['index.html','app.css','app.js']:
    assert (root/p).exists(), p
print('pwa_ok')
PY
```

Notes:
- Real drag/drop + persistence requires browser + running backend; the outer driver handles those smoke tests.
