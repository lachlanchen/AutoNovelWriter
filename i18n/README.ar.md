[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>تطبيق PWA بأسلوب Scratch مع Backend مبني على Tornado للتحكم في مسار عمل مؤتمت لكتابة الروايات (وتطوير التطبيقات).</strong></p>
  <p>
    <img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white" />
    <img alt="Backend" src="https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9" />
    <img alt="Frontend" src="https://img.shields.io/badge/frontend-PWA-10b981" />
    <img alt="Realtime" src="https://img.shields.io/badge/realtime-WebSocket-06b6d4" />
    <img alt="Pipeline" src="https://img.shields.io/badge/pipeline-script%20%2B%20AST-2563eb" />
    <img alt="Runtime" src="https://img.shields.io/badge/runtime-local%20state-orange" />
    <img alt="Status" src="https://img.shields.io/badge/status-active%20development-f59e0b" />
  </p>
</div>

يتضمن هذا المستودع أيضًا `AutoAppDev/` كوحدة فرعية (submodule) تحتوي سكربتات تطوير آلي قابلة لإعادة الاستخدام.

> [!TIP]
> `README.md` هو المرجع الأساسي. الإصدارات المترجمة موجودة داخل `i18n/` ومربوطة عبر سطر خيارات اللغات الواحد في الأعلى.

| حقائق سريعة | التفاصيل |
|---|---|
| المكدس الأساسي | Backend بلغة Python + Tornado، وواجهة PWA في المتصفح |
| تجربة الاستخدام الأساسية | محرر سكربت + محرر كتل يستندان إلى مصدر pipeline أساسي واحد |
| نمط التنفيذ | مشغّل قابل للاستئناف مع مؤشر محفوظ ونتائج إجراءات محفوظة |
| الوقت الحقيقي | نقطة WebSocket على `/ws` |
| جذر وقت التشغيل القابل للتغيير | `autonovelwriter/runtime/` (متجاهل في git) |

| قيم التشغيل الافتراضية | القيمة |
|---|---|
| رابط PWA | `http://127.0.0.1:8787/` |
| رابط WebSocket | `ws://127.0.0.1:8787/ws` |
| عنوان/منفذ الـ Backend | `127.0.0.1:8787` |

## Table of Contents

- [نظرة عامة](#-نظرة-عامة)
- [الميزات](#-الميزات)
- [لمحة سريعة عن البنية](#-لمحة-سريعة-عن-البنية)
- [هيكل المشروع](#️-هيكل-المشروع)
- [المتطلبات المسبقة](#-المتطلبات-المسبقة)
- [التثبيت](#-التثبيت)
- [الاستخدام](#-الاستخدام)
- [الإعداد](#️-الإعداد)
- [واجهات Backend الأساسية](#-واجهات-backend-الأساسية)
- [مسارات وقت التشغيل](#-مسارات-وقت-التشغيل)
- [سكربت Pipeline (العنصر الأساسي)](#-سكربت-pipeline-العنصر-الأساسي)
- [مخرجات المشغّل (مسودة أولية)](#-مخرجات-المشغّل-مسودة-أولية)
- [مهام المشغّل (مسودة دفعات)](#-مهام-المشغّل-مسودة-دفعات)
- [إعدادات الوكيل / بوابة Codex](#-إعدادات-الوكيل--بوابة-codex)
- [PWA I18N (لغة الواجهة)](#-pwa-i18n-لغة-الواجهة)
- [إعدادات الرواية (منفصلة عن لغة الواجهة)](#️-إعدادات-الرواية-منفصلة-عن-لغة-الواجهة)
- [أمثلة](#-أمثلة)
- [ملاحظات التطوير](#️-ملاحظات-التطوير)
- [ملاحظات الاختبار](#-ملاحظات-الاختبار)
- [محتويات المستودع](#-محتويات-المستودع)
- [استكشاف الأخطاء وإصلاحها](#-استكشاف-الأخطاء-وإصلاحها)
- [خارطة الطريق](#️-خارطة-الطريق)
- [المساهمة](#-المساهمة)
- [Support](#-support)
- [الترخيص](#-الترخيص)

## 📌 نظرة عامة

يوفر AutoNovelWriter طبقة تنسيق محلية من أجل:
- تعديل سكربت pipeline الأساسي (`pipeline.script`) عبر النص المصدري وواجهة الكتل معًا.
- تشغيل تنفيذ Backend قابل للاستئناف مع حفظ المؤشر ونتائج الإجراءات.
- إدارة المشاريع، والمواد، والمخرجات، ودفعات المهام، وقوالب الإجراءات.
- بث التحديثات المباشرة عبر WebSocket (`/ws`) إلى PWA.

جذر وقت التشغيل الأساسي القابل للتغيير هو `autonovelwriter/runtime/` (محتوياته متجاهلة في git).

| المجال | ما الذي يفعله |
|---|---|
| تأليف الـ Pipeline | تعديل السكربت الأساسي + واجهة كتل متداخلة من مصدر حقيقة موحد |
| التنفيذ | مشغّل قابل للاستئناف مع مؤشر ونتائج إجراءات محفوظة |
| عمليات المشروع | مواد ومخرجات وإعدادات على مستوى المشروع، مع تفعيل دفعات المهام |
| تجربة وقت حقيقي | أحداث `/ws` لتحديثات الحالة/السجل/المخرجات/المهام/الإجراءات |

## ✨ الميزات

- محرر Pipeline بأسلوب Scratch مدعوم بسكربت أساسي + parser/AST.
- واجهات تحكم بالمشغّل (`start/pause/resume/stop`) مع حالة قابلة للاستئناف.
- حاويات التحكم بالتدفق: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- مكتبة إجراءات (Action Library) مع قوالب افتراضية + تجاوزات مستخدم بنمط copy-on-edit.
- تجاوزات إعدادات الرواية على مستوى المشروع مع دلالات الوراثة.
- تدفق إنشاء/فهرسة/تفاصيل/تفعيل دفعات المهام لـ `FOREACH_TASK`.
- فهرسة المخرجات ونقاط نهاية معاينة أحدث PDF للرواية.
- قواميس i18n مدمجة في PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- سكربتات مساعدة tmux ومشغّل تطوير آلي Codex قابل للاستئناف.

## 🧭 لمحة سريعة عن البنية

```text
Browser (PWA)
  ├─ pipeline editor (script + blocks)
  ├─ settings / projects / actions / tasks / outputs panels
  └─ WebSocket client (/ws)
          │
          ▼
Tornado backend (autonovelwriter/backend/server.py)
  ├─ REST APIs (/api/*)
  ├─ WebSocket broadcast hub
  ├─ parser + AST + canonical script persistence
  ├─ resumable runner + action result commit log
  └─ runtime bootstrap (dirs + defaults)
          │
          ▼
autonovelwriter/runtime/ (mutable, local-first)
  ├─ state/ (pipeline, settings, runner, chat)
  ├─ projects/<id>/ (materials, outputs, project settings)
  ├─ tasks/ (active list + generated batches)
  ├─ actions/ (defaults + user overrides)
  └─ logs/ (runner.log)
```

## 🗂️ هيكل المشروع

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
│   └── runtime/                   # mutable state/IO (contents gitignored)
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
├── i18n/
│   ├── README.ar.md
│   ├── README.de.md
│   ├── README.es.md
│   ├── README.fr.md
│   ├── README.ja.md
│   ├── README.ko.md
│   ├── README.ru.md
│   ├── README.vi.md
│   ├── README.zh-Hans.md
│   └── README.zh-Hant.md
└── AutoAppDev/                    # git submodule (git@github.com:lachlanchen/AutoAppDev.git)
```

## ✅ المتطلبات المسبقة

| الاعتمادية | مطلوبة | ملاحظات |
|---|---|---|
| Python `3.11+` | نعم | خط أساس موصى به |
| `pip` | نعم | لتثبيت اعتمادات الـ Backend |
| `tmux` | لا | مطلوب لسكربت التشغيل متعدد النوافذ |
| `conda` | لا | سكربتات مساعدة اختيارية |
| `node` | لا | اختياري لتشغيل ملف اختبارات PWA مباشرة |

## 🚀 التثبيت

| المسار | أفضلية الاستخدام | الأمر |
|---|---|---|
| الخيار A | إذا كنت تستخدم conda وتريد إعداد المستودع الجاهز | `scripts/setup_conda_env.sh --name autonovelwriter` |
| الخيار B | إذا أردت الإعداد والتشغيل بأمر واحد | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| الخيار C | إذا كنت تفضل التحكم اليدوي عبر pip | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### الخيار A: مساعد Conda (موصى به لهذا المستودع)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

ثم شغّل باستخدام tmux:

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

### اختياري: تهيئة الوحدة الفرعية

```bash
git submodule update --init --recursive
```

## 🧪 الاستخدام

| التدفق | الأمر / الرابط |
|---|---|
| تشغيل الـ Backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| فتح التطبيق | `http://127.0.0.1:8787/` |
| نقطة WebSocket | `ws://127.0.0.1:8787/ws` |
| خادم PWA ثابت اختياري | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| مشغّل tmux | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### بدء سريع (بدون tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# open http://127.0.0.1:8787/
```

### تشغيل التطوير (Backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

يقوم الـ Backend أيضًا بخدمة ملفات PWA الثابتة من `autonovelwriter/pwa/` افتراضيًا، لذا يمكنك فتح:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

اختياري: PWA (خادم تطوير ثابت منفصل):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

افتح PWA على `http://127.0.0.1:5173` ثم وجّهها إلى الـ Backend (الافتراضي `ws://127.0.0.1:8787/ws`).

tmux (تشغيل النافذتين + تتبع السجل):

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

يمكن لسكربت السائق في المستودع (`scripts/auto-autonovelwriter-development.sh`) أيضًا بدء جلسة tmux أثناء التطوير الآلي.

### سير عمل نموذجي

1. ابدأ الـ Backend (أو مساعد tmux).
2. افتح PWA.
3. عدّل الـ pipeline عبر الكتل و/أو مربع نص السكربت.
4. تحقّق من الـ pipeline واحفظه.
5. ابدأ المشغّل وراقب السجلات/الحالة/الأحداث.
6. راجع المخرجات المتولدة ودفعات المهام.

## ⚙️ الإعداد

### متغيرات البيئة

استخدم `autonovelwriter/backend/.env.example` كنموذج. أهم المتغيرات المستخدمة في الـ backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (الافتراضي `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (الافتراضي `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (الافتراضي `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (القيمة الافتراضية لعلم CLI: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (الافتراضي: المجلد الأب لجذر المستودع)
- `AUTONOVELWRITER_WRITER_SCRIPT` (الافتراضي `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (الافتراضي `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (الافتراضي `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (بوابة تنفيذ الوكيل، معطّل افتراضيًا)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (تجاوز اختياري لمسار ثنائية codex)

### خيارات CLI للسكربتات

`run_autonovelwriter_tmux.sh`:
- `--session <name>`
- `--backend-port <n>`
- `--pwa-port <n>`
- `--host <ip>`
- `--env <conda_env>`
- `--debug`
- `--kill`
- `--no-attach`

`setup_conda_env.sh`:
- `--name <env>`
- `--python <ver>`
- `--force-recreate`

`setup_and_run_autonovelwriter.sh`:
- `--env <name>`
- `--python <ver>`
- `--session <name>`
- `--backend-port <n>`
- `--pwa-port <n>`
- `--host <ip>`
- `--force-recreate`
- `--debug`
- `--kill`
- `--no-attach`

## 🔌 واجهات Backend الأساسية

| مجموعة API | نقاط النهاية الأساسية |
|---|---|
| الحالة والإعدادات | `/api/health`, `/api/settings` |
| المشاريع وإعدادات المشروع | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| Pipeline | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| المهام | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| الإجراءات | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| المشغّل | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| المخرجات ومعاينة الرواية | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| الوقت الحقيقي | `/ws` |

### واجهات HTTP

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (المشروع النشط): `GET/POST /api/projects/settings` (تجاوزات لكل مشروع مع دلالات الوراثة: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (المشروع النشط): `GET /api/materials/index`
- Outputs index (المشروع النشط): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (اختياري: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (يكتب إلى `runtime/tasks/tasks.json` و`active_tasks.json` داخل المشروع)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (تحديث copy-on-edit للقوالب الافتراضية)
- Pipeline (سكربت أساسي + JSON مشتق): `GET/POST /api/pipeline`
- Pipeline validate (معاينة فقط): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (يقرأ ويفسر `../scripts/auto-xiyouzhiyuan-writer.sh` كمرجع)
  - `POST /api/pipeline/reference_writer/load` (يحمّل النتيجة المفسّرة إلى pipeline وقت التشغيل دون تعديل السكربت الأصلي)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (بيانات وصفية)
  - `GET /api/novel/latest/pdf` (بث PDF مضمن للعارض)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (محمي ببوابة): `POST /api/agent/test` (يشغّل `codex --version` فقط عند التمكين وتفعيل متغير البيئة)

### WebSocket

- نقطة النهاية: `/ws`
- أحداث البث: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 مسارات وقت التشغيل

كل الحالة القابلة للتغيير وعمليات الإدخال/الإخراج موجودة تحت `autonovelwriter/runtime/`:

| المسار | الغرض |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (ضع ملفات `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (الـ backend يكتب رسائل الدردشة) |
| `autonovelwriter/runtime/state/` | حالة JSON محفوظة (إعدادات، pipeline، runner، chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | نسخة sqlite من الدردشة (بالإضافة إلى chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | مؤشر المشروع النشط محفوظًا |
| `autonovelwriter/runtime/tasks/` | ملفات قائمة المهام |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | دفعات مهام متولدة (مثلًا من `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | السجلات |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | مواد المشروع (مدخلات) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | مخرجات المشروع (مسودات/تصدير) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | تجاوزات إعدادات كتابة الرواية لكل مشروع (مثل لغة الرواية) |
| `autonovelwriter/runtime/actions/defaults/` | قوالب Action Library الافتراضية المُهيأة (تُعامل كغير قابلة للتعديل) |
| `autonovelwriter/runtime/actions/user/` | قوالب Action Library الخاصة بالمستخدم (تُنشأ عبر copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | مدخلات دردشة معكوسة لاستهلاك pipeline الكتابة |

## 🧩 سكربت Pipeline (العنصر الأساسي)

يتم تمثيل الـ pipeline كسكربت مُنسّق على القرص:
- `autonovelwriter/runtime/state/pipeline.script`

يقدّمه الـ Backend عبر `GET/POST /api/pipeline` بالشكل:
- `script` (أساسي، بصيغة shell-ish مثل `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (مشتق، قائمة مسطّحة لعرض الكتل البسيط)
- `pipeline_ast` (مشتق، بنية متداخلة تُستخدم للحلقات وواجهة المسافات البادئة)

يشغّل الـ runner خطوات مشتقة من parser/AST v2 نفسه، لذلك ما تعرضه PWA يطابق ما يتم تشغيله.

يدعم تدفق تحكم الـ runner حاويات v2:
- `ROUND <n>` يكرر عناصره الأبناء `n` مرة.
- `FOREACH_TASK` يشغّل عناصره الأبناء مرة لكل مهمة في قائمة المهام النشطة (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` يشغّل عناصره الأبناء مرة لكل عنصر في قائمة `payload.actions` للمهمة الحالية (ويُفترض عادة أن يكون متداخلًا تحت `FOREACH_TASK`).

قابلية الاستئناف:
- يحفظ الـ runner مؤشر تنفيذ قابلًا للاستئناف في `autonovelwriter/runtime/state/runner_state.json`.
- لا يتقدم المؤشر إلا بعد اكتمال الكتلة بنجاح (حتى لا تتخطى إعادة التشغيل عملًا غير مكتمل).
- إذا تغيّر سكربت الـ pipeline الأساسي (عدم تطابق hash)، يتوقف الـ runner ويتطلب إعادة تشغيل (يُلغى المؤشر).
- يحفظ الـ runner سجلات `ActionResult` لكل خطوة في `autonovelwriter/runtime/state/action_results.jsonl` ويستخدم `exec_id` حتميًا لكل خطوة لتجنّب تكرار النتائج الملتزم بها مسبقًا عند إعادة التشغيل.
- عند التشغيل داخل `FOREACH_ACTION`، تتضمن ActionResults القيم `action_index` و`action_id_ref` و`action_key`، وتتضمن المتغيرات `prev` بالإضافة إلى نطاقي `task.prev` و`action.prev` الصريحين.

يدعم سكربت pipeline v2 التداخل:
- `LOOP <n>` يقدّم كتلة حلقة.
- `ROUND <n>` يقدّم كتلة حاوية جولات.
- `FOREACH_TASK` يقدّم كتلة حاوية لكل مهمة.
- `FOREACH_ACTION` يقدّم كتلة حاوية لكل إجراء (الـ runner يكرّر `task.payload.actions`).
- `IF <expr>` يقدّم كتلة حاوية شرطية (parse/render؛ ينفذ الـ runner فرع then فقط حاليًا).
- `ELSE` يقدّم فرعًا بديلًا اختياريًا تحت كتلة `IF`.
- يتم إزاحة الأبناء بمقدار مسافتين لكل مستوى.

التحقق (بدون حفظ):
- `POST /api/pipeline/validate` يعيد معاينة أساسية بالإضافة إلى `pipeline_ast` والتحذيرات والأخطاء.

تعرض PWA السكربت في textarea (مصدر الحقيقة) وتعرض كتلًا متداخلة من `pipeline_ast`.
إذا تعذّر الوصول إلى نقطة نهاية التحقق في الـ Backend، ترجع PWA إلى parser محلي يدعم أفعال v2 نفسها (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

ملاحظات واجهة الكتل:
- يمكن تعديل أعداد التكرار في `LOOP` و`ROUND` مباشرة داخل قائمة الكتل؛ والتعديلات الصالحة تُحدّث مربع السكربت الأساسي فورًا.
- شريط أدوات Blocks يستطيع إدراج حاويات `LOOP` و`ROUND` و`FOREACH_TASK` و`FOREACH_ACTION` و`IF` دون تحرير السكربت يدويًا (يلف الكتلة المحددة أو يضيف حاوية صالحة غير فارغة).
- يمكن حذف الكتل من اللوحة (زر Delete لكل كتلة، أو مفتاح `Delete` عند تحديد كتلة). حذف الحاويات يرفع الأبناء للأعلى، ويحافظ المحرر على عدم فراغ الحاويات لتفادي السكربتات غير الصالحة.
- يحافظ المحرر على صحة بنية كتل `IF`: لا يمكن إبقاء `ELSE` خارج `IF`، كما يبقى فرع then غير فارغ.
- كتل `STEP` تعرض أدوات Action Library: محدد الإجراء، و`Customize` (نسخ إجراء افتراضي إلى إجراء مستخدم مع التحويل إليه)، و`Edit` (نافذة Action Editor لـ `name/tool/prompt/script`).

## 📝 مخرجات المشغّل (مسودة أولية)

عندما يحتوي الـ pipeline على كتلة `STEP write`، ينشئ مشغّل الـ backend ملف مسودة أوليًا تحت:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

كما يصدر الـ backend:
- حدث WS باسم `output_created` مع `path` و`project_rel_path`
- سطر `log` بصيغة `[output] created: ...`

تتضمن PWA لوحة Outputs بسيطة تسرد الملفات عبر `GET /api/outputs/index` وتُحدّث تلقائيًا عند `output_created`.

## 📦 مهام المشغّل (مسودة دفعات)

عندما يحتوي الـ pipeline على كتلة `STEP meta_tasks_generate`، ينشئ مشغّل الـ backend دفعة مهام أولية تحت:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

يصدر الـ backend:
- حدث WS باسم `tasks_batch_created` مع `batch_dir` و`tasks_jsonl` و`task_count`
- سطر `log` بصيغة `[tasks] created batch: ...`

تتضمن PWA لوحة Task Batches بسيطة تسرد الدفعات عبر `GET /api/tasks/batches/index` وتُحدّث تلقائيًا عند `tasks_batch_created`.
كما يمكنها عرض تفاصيل الدفعة (`GET /api/tasks/batches/<batch_id>`) وتفعيل دفعة لتصبح قائمة المهام الحالية لـ `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 إعدادات الوكيل / بوابة Codex

تقوم لوحة Settings في PWA بحفظ إعدادات الوكيل عبر `/api/settings` داخل `autonovelwriter/runtime/state/settings.json`.

للسلامة، لن يقوم الـ backend بتشغيل CLI الخاص بـ `codex` إلا عند تحقق الشرطين التاليين:
- `settings.agent.enabled=true` و`settings.agent.sdk="codex"`
- تعيين `AUTONOVELWRITER_ENABLE_CODEX=1` في البيئة

لا تقم أبدًا بعمل commit للأسرار. استخدم `autonovelwriter/backend/.env.example` كنموذج لمتغيرات البيئة المحلية.

## 🌐 PWA I18N (لغة الواجهة)

تتضمن PWA نظام i18n خفيفًا مدمجًا.

- لفرض لغة الواجهة: أضف `?lang=<code>` إلى رابط PWA (مثلًا `?lang=ja`).
- تُحفظ اللغة لكل متصفح في localStorage تحت المفتاح: `anw_lang`.
- لغات الواجهة المدعومة: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- ملفات README المترجمة على مستوى المستودع موجودة في `i18n/` ومربوطة من سطر خيارات اللغات الواحد أعلى هذا الملف.

| ملفات README المترجمة (`i18n/`) | الحالة |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | متوفرة |

## 🖋️ إعدادات الرواية (منفصلة عن لغة الواجهة)

تُخزَّن تفضيلات كتابة الرواية في إعدادات الـ backend تحت `settings.novel.*` داخل:
- `autonovelwriter/runtime/state/settings.json`

وهذه الإعدادات منفصلة عمدًا عن لغة واجهة PWA (`?lang=` / `anw_lang`).

تُخزَّن التجاوزات الخاصة بكل مشروع تحت:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

الحقول العامة الحالية (قابلة للتعديل من نافذة Settings في PWA):
- `settings.novel.language` (أكواد شبيهة BCP-47 مثل `en`, `ja`, `zh-Hans`, إلخ)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

حقول التجاوز الحالية على مستوى المشروع (فارغ/غير معيّن = يرث من العام):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 أمثلة

### تشغيل محلي بسيط

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# then open http://127.0.0.1:8787/
```

### تشغيل tmux بدون الإرفاق التلقائي

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### تشغيل ملفات اختبار Backend مباشرة

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

### سير عمل السائق (Auto-Dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Auto-Dev Progress (Generated)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

يقوم `scripts/auto-autonovelwriter-development.sh` بتشغيل حلقة قابلة للاستئناف مدفوعة بـ Codex على المهام تحت `references/autonovelwriter_dev/` ويجري commit/push بعد كل مرحلة (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

عناصر تحكم مفيدة:
- الإيقاف بعد المهمة الحالية: `touch references/autonovelwriter_dev/STOP`
- إعادة ضبط تتبع الحالة (مع إبقاء قائمة الانتظار): `scripts/auto-autonovelwriter-development.sh --reset-state`
- بدء جلسة Codex جديدة: `scripts/auto-autonovelwriter-development.sh --new-session`
- ممارسة آمنة: شغّل في فرع/بيئة عمل نظيفة وراقب `references/autonovelwriter_dev/state.tsv` قبل إعادة التشغيل

### افتراضات تشغيلية

- يفترض هذا README تطويرًا محليًا أولًا على Linux/macOS باستخدام `bash` وPython 3.11+.
- حالة وقت التشغيل تحت `autonovelwriter/runtime/` قابلة للتغيير ومن المتوقع ألّا تكون متتبعة.
- سلوك الـ pipeline الموصوف هنا يعكس التنفيذ الحالي داخل المستودع في `autonovelwriter/backend/server.py` و`autonovelwriter/pwa/app.js`.

## 🧪 ملاحظات الاختبار

لا يوجد منسق اختبارات على مستوى الجذر مثل `Makefile` أو `tox` أو `npm test` في هذا المستودع وقت كتابة هذا الملف.

نقاط دخول الاختبار العملية الحالية:

| المجال | نقطة الدخول |
|---|---|
| Backend parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| صياغة foreach-action في Backend | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| دلالات مشغّل Backend | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| تحديث Action Library في Backend | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| سلوك حذف AST في PWA | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (run individual test files)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

إذا أضفت أو غيّرت دلالات المشغّل أو صياغة الـ pipeline أو سلوك Action Library، فحدّث الاختبارات وملاحظات README/API في نفس التغيير.

## 📚 محتويات المستودع

- `docs/autonovelwriter_spec.md`: مواصفات المنتج لوحدة التحكم بأسلوب Scratch (دردشة + تمرير بالمجلدات + start/pause/stop + إعدادات).
- `scripts/auto-autonovelwriter-development.sh`: تطوير تطبيق AutoNovelWriter نفسه آليًا (حلقة مهام: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: فلسفة ومتطلبات ثنائية اللغة (EN/ZH) لوكيل تطوير آلي طويل التشغيل وقابل للاستئناف.
- `docs/ORDERING_RATIONALE.md`: مثال يشرح منطق ترتيب الخطوات المعتمدة على لقطات الشاشة.
- `scripts-legacy/`: سكربتات أتمتة أقدم محفوظة للمرجع لكنها غير مستخدمة بواسطة AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: مثال لمساعد أتمتة عبر Codex CLI.

ملاحظات إضافية للمطورين:
- اختبارات الـ backend موجودة في `autonovelwriter/backend/tests/`.
- يوجد اختبار سلوك صغير لـ PWA في `autonovelwriter/pwa/tests/`.
- المجلد `i18n/` يحتوي ملفات README المترجمة للمستودع، بينما قواميس ترجمة الواجهة مضمّنة داخل `autonovelwriter/pwa/app.js`.

## 🧯 استكشاف الأخطاء وإصلاحها

| العرض | ما يجب التحقق منه |
|---|---|
| `tmux not found in PATH` | ثبّت tmux أو شغّل خوادم backend/static يدويًا. |
| `conda not found in PATH` عند استخدام سكربتات `--env` | ثبّت Miniconda/Anaconda، أو تخطَّ conda واستخدم تثبيت `pip` اليدوي. |
| لا تستطيع PWA الاتصال بالـ backend | تحقّق من عنوان/منفذ الـ backend ونقطة WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` يرجع gated/disabled | تأكد من `settings.agent.enabled=true` و`settings.agent.sdk="codex"` وتعيين `AUTONOVELWRITER_ENABLE_CODEX=1`. |
| يتوقف مشغّل pipeline بعد تعديل السكربت | سلوك متوقع؛ يتم إبطال المؤشر عند عدم تطابق hash سكربت pipeline ويتطلب إعادة تشغيل. |
| تعمل PWA الثابتة على `:5173` لكن استدعاءات API تفشل | تأكد أن الـ backend يعمل على `:8787` (أو حدّث إعدادات الهدف للتطبيق/الخادم وفقًا لذلك). |

## 🗺️ خارطة الطريق

- إكمال وتثبيت العناصر المتبقية من قائمة auto-dev (انظر كتلة التقدم المولدة أعلاه).
- توسيع ومزامنة إصدارات README المترجمة على مستوى المستودع تحت `i18n/`.
- توسيع تغطية الاختبارات الآلية لحالات الحافة في المشغّل وتفاعلات PWA.
- مواصلة تحسين Action Library ومسارات تكرار المهام/الإجراءات.

## 🤝 المساهمة

المساهمات مرحب بها.

إرشادات عملية لهذا المستودع:
- ابدأ من `docs/autonovelwriter_spec.md` و`docs/auto-development-guide.md`.
- اجعل التغييرات التشغيلية داخل `autonovelwriter/runtime/` (المحتويات متجاهلة في git)، وليس في ملفات متتبعة.
- فضّل طلبات السحب التدريجية مع أوامر تشغيل/اختبار قابلة لإعادة التنفيذ.
- عند تغيير دلالات الـ pipeline أو عقود API، حدّث README والاختبارات ذات الصلة معًا.

ملاحظة: لم يتم العثور على ملف `CONTRIBUTING.md` مخصص في جذر المستودع وقت إعداد هذه المسودة.

## ❤️ Support

| Donate | PayPal | Stripe |
|---|---|---|
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=ko-fi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## 📄 الترخيص

ملف/حالة الترخيص غير مُعلنَين صراحةً في جذر المستودع ضمن سياق هذه المسودة.

ملاحظة افتراضية:
- إذا كنت تنوي توزيع المشروع بوضوح كمصدر مفتوح، فأضف ملف `LICENSE` على مستوى الجذر وحدّث هذا القسم وفقًا لذلك.
