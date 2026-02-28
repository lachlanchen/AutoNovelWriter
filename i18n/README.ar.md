[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)




[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>واجهة PWA على نمط Scratch + backend مبني على Tornado للتحكم في خط أنابيب تلقائي لكتابة الروايات (وتطوير التطبيقات).</strong></p>
  <p>
    <img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white" />
    <img alt="Backend" src="https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9" />
    <img alt="Frontend" src="https://img.shields.io/badge/frontend-PWA-10b981" />
    <img alt="Realtime" src="https://img.shields.io/badge/realtime-WebSocket-06b6d4" />
    <img alt="Pipeline" src="https://img.shields.io/badge/pipeline-script%20%2B%20AST-2563eb" />
    <img alt="Runtime" src="https://img.shields.io/badge/runtime-local%20state-orange" />
    <img alt="Status" src="https://img.shields.io/badge/status-active%20development-f59e0b" />
    <img alt="Canonical docs" src="https://img.shields.io/badge/docs-README.md-critical?style=flat" />
    <img alt="Languages" src="https://img.shields.io/badge/i18n-10%2B%20languages-8b5cf6?style=flat" />
  </p>
</div>

هذا المستودع يضم أيضًا `AutoAppDev/` كوحدة فرعية (سكربتات تطوير آلي قابلة لإعادة الاستخدام).

> [!TIP]
> `README.md` هو المرجع القياسي. الإصدارات المحلية توجد في `i18n/` ومربوطة بسطر واحد لاختيار اللغة في الأعلى.

## 🧭 لمحة المشروع

| حقائق سريعة | التفاصيل |
|---|---|
| المكدس الأساسي | Python + backend Tornado، واجهة PWA داخل المتصفح |
| تجربة المستخدم الأساسية | محرر سكربت + محرر كتل يعتمد على مصدر واحد موحد للخط |
| نمط التنفيذ | مشغل قابل للاستئناف مع مؤشر التنفيذ ونتائج الإجراءات المحفوظة |
| الوقت الفعلي | نقطة نهاية WebSocket على `/ws` |
| جذر زمن التشغيل القابل للتعديل | `autonovelwriter/runtime/` (غير متتبع في git) |
## نظرة سريعة على التنقل

| 🎯 ماذا تستخدم الآن | 🔧 الأمر / الرابط |
|---|---|
| افتح PWA محليًا | `http://127.0.0.1:8787/` |
| فعّل التحديثات المباشرة | `ws://127.0.0.1:8787/ws` |
| ابدأ الـ backend بسرعة | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| نفّذ الإعداد والتشغيل معًا | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

> [!TIP]
> أسرع طريقة بدء محلية:
> 1. `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill`
> 2. افتح `http://127.0.0.1:8787/`
> 3. فعّل تحديثات WebSocket عبر `ws://127.0.0.1:8787/ws`

## 🔌 قيم الإطلاق الافتراضية

| قيم الإطلاق | القيمة |
|---|---|
| رابط PWA | `http://127.0.0.1:8787/` |
| رابط WebSocket | `ws://127.0.0.1:8787/ws` |
| منفذ/مضيف backend | `127.0.0.1:8787` |

## جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [الميزات](#-الميزات)
- [نظرة تقنية سريعة](#-نظرة-تقنية-سريعة)
- [هيكل المشروع](#️-هيكل-المشروع)
- [المسارات السريعة للتنقل](#-المسارات-السريعة-للتنقل)
- [المتطلبات المسبقة](#-المتطلبات-المسبقة)
- [التثبيت](#-التثبيت)
- [الاستخدام](#-الاستخدام)
- [الإعدادات](#️-الإعدادات)
- [واجهات backend الأساسية](#-واجهات-backend-الأساسية)
- [مسارات زمن التشغيل](#-مسارات-زمن-التشغيل)
- [سكربت خط الأنابيب (الأصل المرجعي)](#-سكربت-خط-الأنابيب-الأصل-المرجعي)
- [مخرجات المشغّل (مسودة)](#-مخرجات-المشغل-مسودة)
- [مهام المشغّل (دفعات)](#-مهام-المشغل-دفعات)
- [إعدادات الوكيل / بوابة Codex](#-إعدادات-الوكيل--بوابة-codex)
- [I18N واجهة PWA](#-i18n-واجهة-pwa)
- [إعدادات الرواية (منفصلة عن لغة الواجهة)](#️-إعدادات-الرواية-منفصلة-عن-لغة-الواجهة)
- [أمثلة](#-أمثلة)
- [ملاحظات التطوير](#️-ملاحظات-التطوير)
- [ملاحظات الاختبار](#-ملاحظات-الاختبار)
- [محتويات المستودع](#-محتويات-المستودع)
- [استكشاف الأخطاء وإصلاحها](#-استكشاف-الأخطاء-وإصلاحها)
- [خريطة الطريق](#️-خريطة-الطريق)
- [المساهمة](#-المساهمة)
- [الدعم](#-support)
- [الترخيص](#-ترخيص)

## 📌 نظرة عامة

يوفّر AutoNovelWriter طبقة تنسيق محلية لـ:
- تعديل سطور خط الأنابيب المرجعي (`pipeline.script`) عبر النص المصدري وواجهة الكتل.
- تشغيل backend قابل للاستئناف مع مؤشر تنفيذ ونتائج إجراءات محفوظة.
- إدارة المشاريع، والمواد، والمخرجات، ودفعات المهام، وقوالب الإجراءات.
- بث التحديثات المباشرة عبر WebSocket (`/ws`) إلى PWA.

الـ runtime المحلي القابل للتعديل هو `autonovelwriter/runtime/` (المحتوى فيه غير مُتتبع في Git).

| المجال | ما يفعله |
|---|---|
| تأليف خط الأنابيب | تعديل السكربت المرجعي + واجهة الكتل المتداخلة من مصدر حقيقة موحد |
| التنفيذ | مشغل قابل للاستئناف مع مؤشر تنفيذ ونتائج محفوظة |
| عمليات المشروع | إدارة الملفات/المخرجات/الإعدادات على مستوى المشروع وتفعيل دفعات المهام |
| تجربة الوقت الفعلي | أحداث `/ws` للحالة/السجل/المخرجات/المهام/الإجراءات |

## ✨ الميزات

- محرر pipeline بنمط Scratch مع سكربت مرجعي + parser/AST.
- واجهات تحكم المشغّل (`start/pause/resume/stop`) مع حالة قابلة للاستئناف.
- حاويات منطق التحكم: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- مكتبة إجراءات بقوالب افتراضية + تجاوزات المستخدم عبر آلية copy-on-edit.
- إعدادات كتابة الرواية قابلة للتجاوز على مستوى المشروع مع منطق الوراثة.
- توليد وفهرسة وتفاصيل وتفعيل دفعات المهام لـ `FOREACH_TASK`.
- فهرسة المخرجات ونقاط نهاية لمعـاينة أحدث PDF للرواية.
- قواميس i18n مدمجة في الواجهة (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- سكربتات مساعدة لـ tmux وسائق Codex Auto-Dev قابل للاستئناف.

## 🧭 مخطط معماري سريع

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

| الاعتماد | مطلوب | ملاحظات |
|---|---|---|
| Python `3.11+` | نعم | الحد الأدنى الموصى به |
| `pip` | نعم | لتثبيت تبعيات backend |
| `tmux` | لا | مطلوب لسكربت المشغل متعدد الألواح |
| `conda` | لا | للسكربتات المساعدة الاختيارية |
| `node` | لا | اختياري لتشغيل ملف اختبار PWA مباشرة |

## 🚀 التثبيت

| المسار | الأفضل متى | الأمر |
|---|---|---|
| الخيار A | تستخدم conda وتريد الإعداد المقدم من المستودع | `scripts/setup_conda_env.sh --name autonovelwriter` |
| الخيار B | تريد الإعداد + التشغيل في أمر واحد | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| الخيار C | تفضّل التحكم اليدوي عبر pip | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### الخيار A: مساعد Conda (موصى به لهذا المستودع)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

ثم شغّل عبر tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### الخيار B: إعداد وتشغيل في خطوة واحدة

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### الخيار C: تثبيت pip يدوي

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
| بدء backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| فتح التطبيق | `http://127.0.0.1:8787/` |
| نقطة WebSocket | `ws://127.0.0.1:8787/ws` |
| PWA ثابتة اختياريًا | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| مشغل tmux | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### بداية سريعة (بدون tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# ثم افتح http://127.0.0.1:8787/
```

### تشغيل للتطوير (backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

backend يخدم أيضًا أصول PWA الثابتة من `autonovelwriter/pwa/` افتراضيًا، لذلك يمكنك فتح:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

اختياري: تشغيل PWA عبر خادم static منفصل:

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

افتح PWA على `http://127.0.0.1:5173` ووجّهه إلى backend الافتراضي `ws://127.0.0.1:8787/ws`.

tmux (لتشغيل backend وPWA + تتبع السجلات):

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

إعداد conda:

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# تشغيل فوري:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

السكربت `scripts/auto-autonovelwriter-development.sh` يمكنه أيضًا بدء جلسة tmux أثناء auto-dev.

### سير العمل النموذجي

1. ابدأ الـ backend (أو مساعد tmux).
2. افتح PWA.
3. عدّل خط الأنابيب عبر الكتل و/أو مربع النص.
4. تحقق من صحة السكربت واحفظه.
5. ابدأ المشغّل وراقب السجلات/الحالات/الأحداث.
6. راجع المخرجات ودفعات المهام المولّدة.

## ⚙️ الإعدادات

### متغيرات البيئة

استخدم `autonovelwriter/backend/.env.example` كقالب. المتغيرات الأساسية المستخدمة من قبل backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (الافتراضي `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (الافتراضي `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (الافتراضي `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (افتراضي علم CLI: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (الافتراضي: أم المشروع)
- `AUTONOVELWRITER_WRITER_SCRIPT` (الافتراضي `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (الافتراضي `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (الافتراضي `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (بوابة تنفيذ agent، معطلة افتراضياً)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (تجاوز ثنائي أو ملف تنفيذ codex اختياري)

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

| مجموعة API | نقاط النهاية الرئيسية |
|---|---|
| الصحة والإعدادات | `/api/health`, `/api/settings` |
| المشاريع وإعدادات المشروع | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| خط الأنابيب | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| المهام | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| الإجراءات | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| المشغّل | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| المخرجات ومعاينة الرواية | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| الوقت الفعلي | `/ws` |

### واجهات HTTP

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (تجاوزات لكل مشروع مع منطق الوراثة: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (اختياري: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (يكتب `runtime/tasks/tasks.json` و `project active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (copy-on-edit لتحديث القوالب)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (يقرأ ويفسر `../scripts/auto-xiyouzhiyuan-writer.sh` كمرجع)
  - `POST /api/pipeline/reference_writer/load` (يحمل النتيجة في runtime pipeline؛ لا يعدّل السكربت المصدري)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (تدفق PDF inline للعرض)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (يشغّل `codex --version` فقط عند التفعيل + بوابة البيئة)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 مسارات زمن التشغيل

جميع حالة/IO المتغيرة موجودة داخل `autonovelwriter/runtime/`:

| المسار | الغرض |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (إسقاط ملفات `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (يكتب backend الرسائل هنا) |
| `autonovelwriter/runtime/state/` | حالات JSON محفوظة (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | sqlite chat mirror (إضافة إلى chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | مؤشر المشروع النشط المحفوظ |
| `autonovelwriter/runtime/tasks/` | ملفات قوائم المهام |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | دفعات المهام المولّدة (مثل `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | السجلات |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | مواد المشروع (المدخلات) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | مخرجات المشروع (المسودات/التصدير) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | تعديلات إعدادات الكتابة حسب المشروع (مثل لغة الرواية) |
| `autonovelwriter/runtime/actions/defaults/` | قوالب مكتبة الإجراءات الافتراضية (معاملة كموجود ثابت) |
| `autonovelwriter/runtime/actions/user/` | قوالب مكتبة الإجراءات التي ينشئها المستخدم (بـ copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | إدخالات محاكاة المحادثة لبدء خط كتابة الرواية |

## 🧩 سكربت خط الأنابيب (النسخة المرجعية)

يمثل الخط كـ سكربت منسق على القرص:
- `autonovelwriter/runtime/state/pipeline.script`

backend يخدمه عبر `GET/POST /api/pipeline` كالتالي:
- `script` (سكربت مرجعي، أسطر shell-ish `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (قائمة مسطحة مشتقة للعرض البسيط في الكتل)
- `pipeline_ast` (هيكل متداخل مشتق يُستخدم للحلقات + واجهة المسافات)

المشغّل ينفذ الخطوات المشتقة من نفس parser/AST v2 بحيث يظهر في PWA نفس ما ينفذ فعليًا.

منطق التحكم في المشغّل يدعم حاويات v2:
- `ROUND <n>` يكرر عناصره الفرعية `n` مرات.
- `FOREACH_TASK` ينفذ عناصره الفرعية مرة لكل مهمة في قائمة المهام النشطة (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` ينفذ عناصره الفرعية مرة لكل عنصر في `payload.actions` للمهمة الحالية (من المتوقع أن يكون متداخلًا ضمن `FOREACH_TASK`).

الاستئناف:
- المشغّل يحفظ مؤشر تنفيذ استئنافًا في `autonovelwriter/runtime/state/runner_state.json`.
- يتحرك المؤشر فقط بعد إتمام بلوك بنجاح (حتى لا تُتجاوز الأعمال غير المكتملة عند إعادة التشغيل).
- إذا تغيّر سكربت الخط المرجعي (اختلاف hash)، يتوقف المشغّل ويطلب إعادة تشغيل (إبطال للمؤشر).
- يحفظ المشغّل سجلات `ActionResult` لكل خطوة في `autonovelwriter/runtime/state/action_results.jsonl` ويستخدم `exec_id` ثابتًا لكل خطوة لتجنب تكرار الالتزام عند إعادة التشغيل.
- أثناء `FOREACH_ACTION`، تتضمن ActionResults: `action_index`, `action_id_ref`, `action_key`، كما تشمل المتغيرات `prev` مع نطاقات `task.prev` و `action.prev` صريحة.

خطوط pipeline v2 تدعم التداخل:
- `LOOP <n>` يفتح block للحلقة.
- `ROUND <n>` يفتح block جولات.
- `FOREACH_TASK` يفتح block لكل مهمة.
- `FOREACH_ACTION` يفتح block لكل إجراء داخل المهمة (المشغّل يكرّر `task.payload.actions`).
- `IF <expr>` يفتح block شرطي (parse/render؛ المشغّل ينفذ فقط فرع then حاليًا).
- `ELSE` يفتح الفرع البديل اختياريًا تحت `IF`.
- المسافة البادئة للطفل تكون بمقدار 2 مسافة لكل مستوى.

التحقق (بدون حفظ):
- `POST /api/pipeline/validate` يعيد معاينة معيارية + `pipeline_ast` + تحذيرات وأخطاء.

تعرض PWA السكربت في textarea (مصدر الحقيقة) وتعرض الكتل المتداخلة من `pipeline_ast`.
إذا كانت نقطة التحقق backend غير متاحة، تستخدم PWA parser محليًا يدعم نفس أفعال v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

ملاحظات واجهة الكتل:
- قيم تكرار `LOOP` و`ROUND` قابلة للتحرير مباشرة داخل القائمة؛ التعديلات الفورية تُحدث textarea السكربت المرجعي.
- شريط أدوات الكتل يمكنه إدراج `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF` بدون تحرير النص يدويًا (يغلف الكتلة المحددة أو يضيف حاوية صالحة غير فارغة).
- يمكن حذف الكتل من اللوحة (زر حذف لكل بلوك؛ زر `Delete` للوحة المفاتيح عند التحديد). حذف حاوية يزيل جميع أطفالها، ويمنع المكرر الفارغ للحفاظ على سلامة السكربت.
- تبقى `IF` صحيحة بنيويًا في المحرر: `ELSE` لا يوجد خارج `IF`، والفرع then لا يصبح فارغًا.
- بلوكات `STEP` تعرض أدوات مكتبة الإجراءات: اختيار الإجراء، `Customize` (نسخ إجراء افتراضي إلى مستخدم وتبديل)، و`Edit` (نافذة محرر الإجراء لحقول `name/tool/prompt/script`).

## 📝 مخرجات المشغّل (مسودة)

عندما يحتوي الخط على `STEP write`، سينشئ backend ملف مسودة وهمي تحت:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

backend يصدّر أيضًا:
- حدث WS `output_created` مع `path` و `project_rel_path`
- سطر سجل `log` `[output] created: ...`

PWA تحتوي لوحة Outputs بسيطة تعرض الملفات عبر `GET /api/outputs/index` وتُحدَّث تلقائيًا عند `output_created`.

## 📦 مهام المشغّل (دفعات)

عندما يحتوي الخط على `STEP meta_tasks_generate`، سينشئ backend دفعة مهام مبدئية تحت:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

backend يصدّر أيضًا:
- حدث WS `tasks_batch_created` مع `batch_dir`, `tasks_jsonl`, `task_count`
- سطر سجل `log` `[tasks] created batch: ...`

PWA تحتوي لوحة Task Batches بسيطة تعرض الدفعات عبر `GET /api/tasks/batches/index` وتُحدَّث تلقائيًا عند `tasks_batch_created`.
يمكن أيضًا عرض تفاصيل الدفعة (`GET /api/tasks/batches/<batch_id>`) وتفعيلها لتصبح قائمة المهام الحالية لـ `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 إعدادات الوكيل / بوابة Codex

لوحة الإعدادات في PWA تحفظ إعدادات الوكيل عبر `/api/settings` في `autonovelwriter/runtime/state/settings.json`.

لأسباب الأمان، لا يشغّل backend واجهة `codex` CLI إلا إذا تحقق الشرطان:
- `settings.agent.enabled=true` و`settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` موجود في البيئة

لا ترفع الأسرار. استخدم `autonovelwriter/backend/.env.example` كقالب vars محلي.

## 🌐 I18N واجهة PWA (لغة الواجهة)

PWA يوفّر نظام i18n مدمجًا خفيفًا.

- فرض لغة الواجهة: أضف `?lang=<code>` إلى رابط PWA (مثل `?lang=ja`).
- التخزين لكل المتصفح عبر localStorage: `anw_lang`.
- لغات الواجهة المدعومة: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- ملفات README المحلية للمستودع موجودة في `i18n/` ومربوطة بالسطر الواحد للغة في أعلى هذا الملف.

| ملفات README المحلية (`i18n/`) | الحالة |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | موجودة |

## 🖋️ إعدادات الرواية (منفصلة عن لغة الواجهة)

إعدادات الكتابة تكون محفوظة في إعدادات backend تحت `settings.novel.*` في:
- `autonovelwriter/runtime/state/settings.json`

وهي منفصلة عمدًا عن لغة واجهة PWA (`?lang=` / `anw_lang`).

تجاوزات المشروع محفوظة تحت:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

الحقول العامة الحالية (قابلة للتحرير من مودال إعدادات PWA):
- `settings.novel.language` (رموز شبيهة BCP-47 مثل `en`, `ja`, `zh-Hans`, وغيرها)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

حقول تجاوز المشروع الحالية (فارغ/غير مضبوط = يرث من global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 أمثلة

### تشغيل محلي أدنى

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# ثم افتح http://127.0.0.1:8787/
```

### تشغيل عبر tmux بدون auto-attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### تشغيل ملفات اختبار backend مباشرة

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### تشغيل ملف اختبار PWA مباشرة

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### مثال مساعد الأتمتة

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

`scripts/auto-autonovelwriter-development.sh` يشغّل حلقة Codex-driven قابلة للاستئناف فوق المهام داخل `references/autonovelwriter_dev/`، ويعمل commit/push بعد كل مرحلة (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

عناصر تحكم مفيدة:
- الإيقاف بعد المهمة الحالية: `touch references/autonovelwriter_dev/STOP`
- إعادة تعيين تتبع الحالة (مع الحفاظ على الطابور): `scripts/auto-autonovelwriter-development.sh --reset-state`
- بدء جلسة Codex جديدة: `scripts/auto-autonovelwriter-development.sh --new-session`
- الممارسة الآمنة: العمل على فرع/نسخة عمل نظيفة ومراقبة `references/autonovelwriter_dev/state.tsv` قبل إعادة التشغيل

### افتراضات تشغيلية

- هذا README يفترض تطويرًا محليًا أوليًا على Linux/macOS مع `bash` وPython 3.11+.
- حالة runtime داخل `autonovelwriter/runtime/` قابلة للتعديل ومن المفترض أن تكون غير متتبعة.
- سلوك خط الأنابيب الموصوف هنا يعكس التنفيذ الحالي داخل `autonovelwriter/backend/server.py` و `autonovelwriter/pwa/app.js`.

## 🧪 ملاحظات الاختبار

لا يوجد orchestrator من نوع `Makefile`/`tox`/`npm test` أعلى مستوى في هذا المستودع حالياً.

نقاط الدخول العملية الحالية:

| المجال | نقطة الدخول |
|---|---|
| Backend parser/AST | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| Backend foreach-action syntax | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| Backend runner semantics | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| Backend action library update | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| سلوك حذف PWA AST | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (تشغيل ملفات الاختبار منفردة)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

إذا أضفت أو غيّرت semantics للمشغّل أو نحو syntax خط الأنابيب أو سلوك مكتبة الإجراءات، حدّث الاختبارات وملاحظات README/API في نفس التغيير.

## 📚 محتويات المستودع

- `docs/autonovelwriter_spec.md`: مواصفات المنتج للتحكم الشبيه بـ Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: أتمتة تطوير AutoNovelWriter نفسه (task loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: فلسفة ومتطلبات ثنائية اللغة (EN/ZH) لوكيل تطوير طويل الأمد وقابل للاستئناف.
- `docs/ORDERING_RATIONALE.md`: مثال لسببية ترتيب الخطوات المعتمدة على لقطات الشاشة.
- `scripts-legacy/`: سكربتات أقدم للأرشيف، محفوظة للرجوع إليها وليست مستخدمة بواسطة AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: مثال مساعد أتمتة Codex CLI.

ملاحظات إضافية للمطور:
- اختبارات backend موجودة في `autonovelwriter/backend/tests/`.
- يوجد اختبار سلوك صغير للـ PWA في `autonovelwriter/pwa/tests/`.
- `i18n/` يحتوي ملفات README مترجمة، بينما قواميس الترجمة في الواجهة مدمجة داخل `autonovelwriter/pwa/app.js`.

## 🧯 استكشاف الأخطاء وإصلاحها

| العَرَض | ما يجب التحقق منه |
|---|---|
| `tmux not found in PATH` | ثبّت tmux أو شغّل backend وخوادم static يدويًا. |
| `conda not found in PATH` عند استخدام سكربتات `--env` | ثبّت Miniconda/Anaconda أو تجاوز conda واستخدم تثبيت `pip` يدويًا. |
| PWA لا يتصل بالـ backend | تحقق من عنوان و منفذ backend ونقطة WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` يرجع حالة مقيّدة/معطلة | تأكد من كل من `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, و `AUTONOVELWRITER_ENABLE_CODEX=1`. |
| المشغّل يتوقف بعد تعديل السكربت | هذا سلوك متوقع؛ يتم إبطال المؤشر عند اختلاف hash الخط ويستلزم إعادة تشغيل. |
| PWA على `:5173` يعمل لكن استدعاءات API تفشل | تأكد من تشغيل backend على `:8787` (أو حدّث إعدادات app/backend الهدف).

## 🗺️ خريطة الطريق

- إكمال وتثبيت عناصر auto-dev المتبقية في الطابور (راجع كتلة التقدم المولدة أعلاه).
- توسيع وتزامن نسخ README متعددة اللغات في `i18n/` باستمرار.
- توسيع تغطية الاختبارات الآلية عبر حالات الحافة وتفاعلات PWA.
- الاستمرار في تحسين مكتبة الإجراءات وسير عمليات تكرار المهمة/الإجراء.

## 🤝 المساهمة

المساهمات مرحب بها.

إرشادات عملية لهذا المستودع:
- ابدأ من `docs/autonovelwriter_spec.md` و`docs/auto-development-guide.md`.
- أبقِ تغييرات وقت التشغيل داخل `autonovelwriter/runtime/` (المحتوى غير متتبع) وليس على الملفات المُدارة.
- اعتمد PRات تدريجية مع أوامر تشغيل واختبار قابلة لإعادة التشغيل.
- إذا غيّرت semantics خط الأنابيب أو عقود الـ API، حدّث README والاختبارات ذات الصلة معًا.

ملاحظة: لم يُعثر على ملف `CONTRIBUTING.md` مخصص في جذر المستودع في هذه المرحلة.

---

## 📄 الترخيص

حالة ملف/الرخصة غير مُذكورة صراحة في جذر المستودع في هذا السياق.

ملاحظة افتراضية:
- إذا أردت توضيح توزيع المشروع كمشروع مفتوح المصدر، أضف ملف `LICENSE` في المستوى الأعلى وحدث هذا القسم بما يتناسب.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
