[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/figs/banner.png" alt="LazyingArt banner" />
</p>

# AutoNovelWriter


![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9)
![Frontend](https://img.shields.io/badge/frontend-PWA-10b981)
![Runtime](https://img.shields.io/badge/runtime-local%20state-orange)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)

واجهة PWA بأسلوب Scratch + خلفية Tornado للتحكم في خط سير كتابة روايات تلقائيًا (وأيضًا تطوير التطبيقات).

يضم هذا المستودع أيضًا `AutoAppDev/` كـ submodule (سكربتات تطوير تلقائي قابلة لإعادة الاستخدام).

## نظرة عامة

يوفر AutoNovelWriter طبقة تنسيق محلية من أجل:
- تعديل سكربت خط سير أساسي (`pipeline.script`) عبر النص المصدر وواجهة الكتل معًا.
- تشغيل خلفي قابل للاستئناف مع حفظ المؤشر ونتائج الإجراءات.
- إدارة المشاريع، والمواد، والمخرجات، ودفعات المهام، وقوالب الإجراءات.
- بث التحديثات الحية عبر WebSocket (`/ws`) إلى تطبيق PWA.

بيئة التشغيل الأساسية القابلة للتغيير هي `autonovelwriter/runtime/` (مُستبعدة من git).

| المجال | ماذا يفعل |
|---|---|
| تأليف خط السير | تعديل السكربت الأساسي + واجهة كتل متداخلة من مصدر حقيقة واحد مشترك |
| التنفيذ | مشغّل قابل للاستئناف مع مؤشر محفوظ ونتائج إجراءات |
| عمليات المشروع | مواد ومخرجات وإعدادات مقيّدة بالمشروع وتفعيل دفعات المهام |
| تجربة فورية | أحداث `/ws` لتحديثات الحالة/السجل/المخرجات/المهام/الإجراءات |

## الميزات

- محرر خط سير بأسلوب Scratch مدعوم بسكربت أساسي + parser/AST.
- واجهات تحكم بالمشغّل (`start/pause/resume/stop`) مع حالة قابلة للاستئناف.
- حاويات تدفق التحكم: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- مكتبة إجراءات Action Library بقوالب افتراضية + تجاوزات مستخدم بأسلوب copy-on-edit.
- تجاوزات إعدادات الرواية على مستوى المشروع مع دلالات الوراثة.
- تدفق توليد/فهرسة/تفاصيل/تفعيل دفعات المهام لـ `FOREACH_TASK`.
- فهرسة المخرجات ونقاط نهاية لمعاينة أحدث PDF للرواية.
- قواميس i18n مدمجة في PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- سكربتات مساعدة tmux وسائق تطوير تلقائي Codex قابل للاستئناف.

## 🗂️ بنية المشروع

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # AutoAppDev submodule declaration
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # main backend entrypoint + API/WS handlers + runner logic
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # backend unit tests
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # UI logic + embedded i18n dictionaries
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # mutable state/IO (gitignored)
├── scripts/
│   ├── run_autonovelwriter_tmux.sh
│   ├── setup_conda_env.sh
│   ├── setup_and_run_autonovelwriter.sh
│   ├── auto-autonovelwriter-development.sh
│   └── backups/
├── scripts-legacy/
├── docs/
│   ├── autonovelwriter_spec.md
│   ├── auto-development-guide.md
│   └── ORDERING_RATIONALE.md
├── references/
│   └── autonovelwriter_dev/
├── examples/
│   └── ralph-wiggum-example.sh
├── i18n/                          # present (currently no files)
└── AutoAppDev/                    # linked companion project
```

## ✅ المتطلبات المسبقة

| الاعتمادية | مطلوب | ملاحظات |
|---|---|---|
| Python `3.11+` | نعم | خط أساس موصى به |
| `pip` | نعم | لتثبيت اعتمادات الخلفية |
| `tmux` | لا | مطلوب لسكربت الإطلاق متعدد النوافذ |
| `conda` | لا | سكربتات مساعدة اختيارية |
| `node` | لا | اختياري لتشغيل ملف اختبار PWA مباشرة |

## ⚙️ التثبيت

### الخيار A: مساعد Conda (موصى به لهذا المستودع)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

ثم شغّل عبر tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### الخيار B: إعداد + تشغيل دفعة واحدة

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### الخيار C: تثبيت يدوي عبر pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

## 🚀 الاستخدام

## تشغيل التطوير (Backend + PWA)

الخلفية (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

تقوم الخلفية أيضًا بخدمة الملفات الثابتة لـ PWA من `autonovelwriter/pwa/` افتراضيًا، لذا يمكنك فتح:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

اختياري: PWA (خادم تطوير ثابت منفصل):
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

افتح PWA على `http://127.0.0.1:5173` ووجّهه إلى الخلفية (الافتراضي `ws://127.0.0.1:8787/ws`).

tmux (تشغيل اللوحتين + تتبّع السجل):
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

مساعد بيئة Conda:
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

يمكن لسكربت السائق في المستودع (`scripts/auto-autonovelwriter-development.sh`) أيضًا بدء جلسة tmux أثناء التطوير التلقائي.

### سير عمل نموذجي

1. شغّل الخلفية (أو مساعد tmux).
2. افتح PWA.
3. عدّل خط السير عبر الكتل و/أو منطقة نص السكربت.
4. تحقّق من خط السير واحفظه.
5. ابدأ المشغّل وراقب السجلات/الحالة/الأحداث.
6. راجع المخرجات ودفعات المهام المولدة.

## 🧠 مسارات التشغيل

كل الحالة القابلة للتغيير وعمليات الإدخال/الإخراج موجودة تحت `autonovelwriter/runtime/` (مستبعدة من git):

| المسار | الغرض |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | المستخدم -> النظام (ضع ملفات `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | النظام -> المستخدم (الخلفية تكتب رسائل المحادثة) |
| `autonovelwriter/runtime/state/` | حالة JSON محفوظة (الإعدادات، خط السير، المشغّل، المحادثة) |
| `autonovelwriter/runtime/state/chat.sqlite3` | مرآة محادثة sqlite (بالإضافة إلى chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | مؤشر “المشروع النشط” المحفوظ |
| `autonovelwriter/runtime/tasks/` | ملفات طابور المهام |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | دفعات مهام مولدة (مثلًا من `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | السجلات |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | مواد المشروع (مدخلات) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | مخرجات المشروع (مسودات/تصدير) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | تجاوزات إعدادات كتابة الرواية لكل مشروع (مثل لغة الرواية) |
| `autonovelwriter/runtime/actions/defaults/` | قوالب مكتبة الإجراءات الافتراضية المزروعة (تُعامل كغير قابلة للتغيير) |
| `autonovelwriter/runtime/actions/user/` | قوالب مكتبة الإجراءات الخاصة بالمستخدم (تنشأ عبر copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | مدخلات محادثة معكوسة لابتلاع خط سير الكاتب |

## 🧩 سكربت خط السير (القطعة الأساسية)

يُمثَّل خط السير كسكربت منسّق على القرص:
- `autonovelwriter/runtime/state/pipeline.script`

تقوم الخلفية بخدمته عبر `GET/POST /api/pipeline` بالشكل التالي:
- `script` (أساسي، أسطر shell-ish من نوع `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (مشتق، قائمة مسطحة لعرض كتل بسيط)
- `pipeline_ast` (مشتق، بنية متداخلة مستخدمة للحلقات وواجهة المسافات البادئة)

ينفّذ المشغّل الخطوات المشتقة من parser/AST نفسه بنسخة v2، بحيث يتطابق ما تعرضه PWA مع ما يتم تشغيله.
يدعم تدفق تحكم المشغّل حاويات v2:
- `ROUND <n>` يكرر أطفاله `n` مرة.
- `FOREACH_TASK` يشغّل أطفاله مرة لكل مهمة في قائمة المهام النشطة (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` يشغّل أطفاله مرة لكل عنصر في قائمة `payload.actions` للمهمة الحالية (مقصود أن يكون متداخلًا تحت `FOREACH_TASK`).

قابلية الاستئناف:
- يحفظ المشغّل مؤشر تنفيذ قابل للاستئناف في `autonovelwriter/runtime/state/runner_state.json`.
- لا يتقدم المؤشر إلا بعد اكتمال الكتلة بنجاح (حتى لا تتجاوز عمليات إعادة التشغيل عملًا غير مكتمل).
- إذا تغيّر سكربت خط السير الأساسي (عدم تطابق hash)، يتوقف المشغّل ويتطلب إعادة تشغيل (إبطال المؤشر).
- يحفظ المشغّل سجلات `ActionResult` لكل خطوة في `autonovelwriter/runtime/state/action_results.jsonl` ويستخدم `exec_id` حتميًا لكل خطوة لتجنب تكرار النتائج المثبتة بالفعل عند إعادة التشغيل.
  - عند التشغيل داخل `FOREACH_ACTION`، تتضمن ActionResults القيم `action_index` و`action_id_ref` و`action_key`، وتشمل المتغيرات `prev` بالإضافة إلى نطاقات صريحة `task.prev` مقابل `action.prev`.

يدعم سكربت خط السير v2 التداخل:
- `LOOP <n>` يقدّم كتلة حلقة
- `ROUND <n>` يقدّم كتلة حاوية “جولات”
- `FOREACH_TASK` يقدّم كتلة حاوية لكل مهمة
- `FOREACH_ACTION` يقدّم كتلة حاوية لكل إجراء (المشغّل يكرر `task.payload.actions`)
- `IF <expr>` يقدّم كتلة حاوية شرطية (تحليل/تصيير؛ المشغّل ينفّذ فرع then فقط حاليًا)
- `ELSE` يقدّم فرعًا بديلًا اختياريًا تحت كتلة `IF`
- يتم إزاحة الأطفال بمقدار مسافتين لكل مستوى

التحقق (بدون حفظ):
- `POST /api/pipeline/validate` يعيد معاينة أساسية بالإضافة إلى `pipeline_ast` وتحذيرات وأخطاء.

تعرض PWA السكربت في textarea (مصدر الحقيقة) وتُصيّر الكتل المتداخلة من `pipeline_ast`.
إذا تعذّر الوصول إلى نقطة تحقق الخلفية، تعود PWA إلى parser محلي يدعم الأفعال نفسها في v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

ملاحظات واجهة الكتل:
- يمكن تعديل أعداد التكرار في `LOOP` و`ROUND` مباشرة داخل قائمة الكتل؛ والتعديلات الصالحة تحدّث textarea للسكربت الأساسي فورًا.
- يمكن لشريط أدوات الكتل إدراج حاويات `LOOP` و`ROUND` و`FOREACH_TASK` و`FOREACH_ACTION` و`IF` دون تعديل السكربت يدويًا (يلف الكتلة المحددة، أو يضيف حاوية صالحة غير فارغة).
- يمكن حذف الكتل من اللوحة (زر Delete لكل كتلة؛ ولوحة المفاتيح `Delete` عند تحديد كتلة). حذف الحاويات يدمج الأطفال للأعلى، ويحافظ المحرر على الحاويات غير فارغة لتجنب سكربتات غير صالحة.
- تُحافَظ كتل `IF` على صحة بنيوية داخل المحرر: لا يمكن أن تبقى `ELSE` خارج `IF`، ويظل فرع then غير فارغ.
- كتل `STEP` تعرض عناصر تحكم Action Library: محدد إجراء، و`Customize` (نسخ إجراء افتراضي إلى إجراء مستخدم والتبديل إليه)، و`Edit` (نافذة Action Editor لـ `name/tool/prompt/script`).

## 🔧 الإعداد

### متغيرات البيئة

استخدم `autonovelwriter/backend/.env.example` كقالب. المتغيرات الأساسية المستخدمة من الخلفية/بيئة التشغيل:

- `AUTONOVELWRITER_RUNTIME_ROOT` (الافتراضي `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (الافتراضي `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (الافتراضي `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (الافتراضي `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (الافتراضي: المجلد الأب لجذر المستودع)
- `AUTONOVELWRITER_WRITER_SCRIPT` (الافتراضي `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (الافتراضي `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (الافتراضي `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (بوابة تنفيذ الوكيل، معطلة افتراضيًا)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (تجاوز اختياري لمسار codex)

## 🌐 واجهات Backend الأساسية

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (تجاوزات لكل مشروع مع دلالات الوراثة: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (اختياري: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (يكتب `runtime/tasks/tasks.json` و`active_tasks.json` الخاص بالمشروع)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (تحديث copy-on-edit للإعدادات الافتراضية)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (يقرأ ويحلل `../scripts/auto-xiyouzhiyuan-writer.sh` كمرجع)
  - `POST /api/pipeline/reference_writer/load` (يحمّل النتيجة المحللة إلى runtime pipeline؛ ولا يعدّل سكربت المصدر أبدًا)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (بيانات وصفية)
  - `GET /api/novel/latest/pdf` (تدفق PDF مضمّن للعارض)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (يشغّل `codex --version` فقط عند التمكين + بوابة البيئة)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 مخرجات المشغّل (مسودة أولية)

عندما يحتوي خط السير على كتلة `STEP write`، سينشئ مشغّل الخلفية ملف مسودة أولي تحت:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

كما تصدر الخلفية:
- حدث WS باسم `output_created` مع `path` و`project_rel_path`
- سطر `log` بالشكل `[output] created: ...`

تتضمن PWA لوحة Outputs بسيطة تعرض الملفات عبر `GET /api/outputs/index` وتُحدّث عند `output_created`.

## 📦 مهام المشغّل (مسودة دفعات)

عندما يحتوي خط السير على كتلة `STEP meta_tasks_generate`، سينشئ مشغّل الخلفية دفعة مهام أولية تحت:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

تصدر الخلفية:
- حدث WS باسم `tasks_batch_created` مع `batch_dir` و`tasks_jsonl` و`task_count`
- سطر `log` بالشكل `[tasks] created batch: ...`

تتضمن PWA لوحة Task Batches بسيطة تعرض الدفعات عبر `GET /api/tasks/batches/index` وتُحدّث عند `tasks_batch_created`.
كما يمكنها عرض تفاصيل الدفعة (`GET /api/tasks/batches/<batch_id>`) وتفعيل دفعة لتصبح قائمة المهام الحالية لـ `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🤖 إعدادات الوكيل / بوابة Codex

تحفظ لوحة Settings في PWA إعدادات الوكيل عبر `/api/settings` داخل `autonovelwriter/runtime/state/settings.json`.

لأسباب أمان، لن تقوم الخلفية بتشغيل `codex` CLI إلا إذا تحقّق الشرطان:
- `settings.agent.enabled=true` و`settings.agent.sdk="codex"`
- تم ضبط `AUTONOVELWRITER_ENABLE_CODEX=1` في البيئة

لا تقم أبدًا بعمل commit للأسرار. استخدم `autonovelwriter/backend/.env.example` كقالب لمتغيرات البيئة المحلية.

## 🌍 PWA I18N (لغة الواجهة)

تحتوي PWA على نظام i18n خفيف مدمج.

- فرض لغة الواجهة: أضف `?lang=<code>` إلى رابط PWA (مثال: `?lang=ja`).
- تُحفَظ لكل متصفح في localStorage: `anw_lang`.
- لغات الواجهة المدعومة: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## 📚 إعدادات الرواية (منفصلة عن لغة الواجهة)

تُخزَّن تفضيلات كتابة الرواية في إعدادات الخلفية تحت `settings.novel.*` في:
- `autonovelwriter/runtime/state/settings.json`

وهذه منفصلة **عن قصد** عن لغة واجهة PWA (`?lang=` / `anw_lang`).

تُخزَّن تجاوزات كل مشروع تحت:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

الحقول الحالية (قابلة للتعديل في نافذة Settings داخل PWA):
- `settings.novel.language` (أكواد شبيهة BCP-47 مثل `en`, `ja`, `zh-Hans`, إلخ)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

حقول التجاوز الحالية على مستوى المشروع (فارغ/غير مضبوط = وراثة من العام):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 أمثلة

### تشغيل محلي بسيط

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### تشغيل tmux بدون إرفاق تلقائي

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### تشغيل ملفات اختبار الخلفية مباشرة

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### تشغيل ملف اختبار منطق PWA مباشرة

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### مثال مساعد أتمتة عبر سكربت

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ ملاحظات التطوير

### سير عمل السائق (التطوير التلقائي)
<!-- AUTO_DEV_PROGRESS_START -->
### تقدم التطوير التلقائي (مولّد)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

يقوم `scripts/auto-autonovelwriter-development.sh` بتشغيل حلقة قابلة للاستئناف يقودها Codex على المهام تحت `references/autonovelwriter_dev/` و**سيقوم بعمل commit/push بعد كل مرحلة** (plan/implement/debug/fix/i18n/summary/update_readme).

عناصر تحكم مفيدة:
- الإيقاف بعد المهمة الحالية: `touch references/autonovelwriter_dev/STOP`
- إعادة ضبط تتبع الحالة (مع إبقاء قائمة الانتظار): `scripts/auto-autonovelwriter-development.sh --reset-state`
- بدء جلسة Codex جديدة: `scripts/auto-autonovelwriter-development.sh --new-session`
- ممارسة آمنة: شغّل ضمن فرع/بيئة عمل نظيفة وراقب `references/autonovelwriter_dev/state.tsv` قبل إعادة التشغيل.

## 📚 المحتويات

- `docs/autonovelwriter_spec.md`: مواصفات المنتج لمتحكم بأسلوب Scratch (دردشة + أنبوب مجلد + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: تطوير تطبيق AutoNovelWriter نفسه تلقائيًا (حلقة مهام: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md`: فلسفة ومتطلبات ثنائية اللغة (EN/ZH) لوكيل تطوير تلقائي طويل التشغيل وقابل للاستئناف.
- `docs/ORDERING_RATIONALE.md`: مثال لمبررات ترتيب خطوات معتمدة على لقطات الشاشة.
- `scripts-legacy/`: سكربتات أتمتة أقدم محفوظة للرجوع إليها ولكن غير مستخدمة من AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: مثال مساعد أتمتة لـ Codex CLI.

### ملاحظات إضافية للمطورين

- اختبارات الخلفية موجودة في `autonovelwriter/backend/tests/`.
- يوجد اختبار سلوك صغير لـ PWA في `autonovelwriter/pwa/tests/`.
- المجلد الجذري `i18n/` موجود لكنه فارغ حاليًا؛ ترجمات الواجهة مدمجة حاليًا داخل `autonovelwriter/pwa/app.js`.

## 🧯 استكشاف الأخطاء وإصلاحها

- `tmux not found in PATH`:
  - ثبّت tmux أو شغّل خوادم الخلفية/الملفات الثابتة يدويًا.
- `conda not found in PATH` عند استخدام سكربتات `--env`:
  - ثبّت Miniconda/Anaconda، أو تجاوز conda واستخدم تثبيت `pip` اليدوي.
- PWA لا يستطيع الاتصال بالخلفية:
  - تحقّق من عنوان/منفذ الخلفية ونقطة WebSocket `ws://<host>:<port>/ws`.
- `POST /api/agent/test` يعيد gated/disabled:
  - تأكد من `settings.agent.enabled=true` و`settings.agent.sdk="codex"` وكذلك متغير البيئة `AUTONOVELWRITER_ENABLE_CODEX=1`.
- يتوقف مشغّل خط السير بعد تعديل السكربت:
  - هذا سلوك متوقع؛ يتم إبطال المؤشر عند عدم تطابق hash لسكربت خط السير ويتطلب إعادة تشغيل.

## 🧭 خارطة الطريق

- إكمال وتثبيت عناصر قائمة انتظار التطوير التلقائي المتبقية (انظر كتلة التقدم المولدة أعلاه).
- توسيع أصول i18n الخارجية على مستوى المستودع تحت `i18n/` (موجود حاليًا لكنه فارغ).
- توسيع تغطية الاختبارات الآلية عبر الحالات الحدّية للمشغّل وتفاعلات PWA.
- الاستمرار في تحسين مكتبة الإجراءات وسير تكرار المهام/الإجراءات.

## 🤝 المساهمة

المساهمات مرحب بها.

إرشادات عملية لهذا المستودع:
- ابدأ من `docs/autonovelwriter_spec.md` و`docs/auto-development-guide.md`.
- أبقِ تغييرات بيئة التشغيل تحت `autonovelwriter/runtime/` (مستبعدة من git)، وليس الملفات المتتبعة.
- فضّل طلبات دمج تدريجية مع أوامر تشغيل/اختبار قابلة لإعادة الإنتاج.
- إذا غيّرت دلالات خط السير أو عقود API، حدّث README والاختبارات ذات الصلة معًا.

ملاحظة: لم يُعثر على ملف `CONTRIBUTING.md` مخصص في جذر المستودع وقت إعداد هذه المسودة.

## ❤️ الرعاية والتبرع

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 الترخيص

ملف/حالة الترخيص غير معلنَين صراحةً في جذر المستودع ضمن سياق هذه المسودة.

ملاحظة افتراضية:
- إذا كنت تنوي إعادة توزيع المشروع مفتوح المصدر بوضوح، أضف ملف `LICENSE` على مستوى الجذر وحدّث هذا القسم وفقًا لذلك.
