[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)



[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

<div align="center">
  <h1>AutoNovelWriter</h1>
  <p><strong>واجهة PWA بنمط Scratch مع Backend مبني على Tornado للتحكم في خط أنابيب مؤتمت لكتابة الروايات (وتطوير التطبيقات).</strong></p>
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

هذا المستودع يحتوي أيضًا على `AutoAppDev/` كوحدة فرعية (submodule) (سكربتات تطوير آلي قابلة لإعادة الاستخدام).

> [!TIP]
> `README.md` هو المرجع الرسمي. الإصدارات المعرّبة موجودة في `i18n/` ومربوطة بسطر واحد لاختيار اللغة في الأعلى.

## 🧭 لقطة المشروع السريعة

| حقائق سريعة | التفاصيل |
|---|---|
| المكدس الأساسي | Python + Tornado للـ backend، وواجهة PWA في المتصفح |
| تجربة المستخدم الأساسية | محرر سكربت + محرر كتل مدعوم بمصدر خط أنابيب مرجعي واحد |
| نمط التنفيذ | مشغل قابل للاستئناف مع مؤشر ونتائج إجراءات محفوظة |
| الوقت الفعلي | نقطة WebSocket على `/ws` |
| جذر زمن التشغيل القابل للتغيير | `autonovelwriter/runtime/` (مستثنى في git) |
## نظرة سريعة على التنقل

| 🎯 ماذا تستخدم الآن | 🔧 الأمر / الرابط |
|---|---|
| افتح PWA المحلي | `http://127.0.0.1:8787/` |
| اربط التحديثات المباشرة | `ws://127.0.0.1:8787/ws` |
| شغّل backend بسرعة | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| شغّل الإعداد+التشغيل كسكربت واحد | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |

## 🔌 قيم الإطلاق الافتراضية

| الإعداد | القيمة |
|---|---|
| رابط PWA | `http://127.0.0.1:8787/` |
| رابط WebSocket | `ws://127.0.0.1:8787/ws` |
| منفذ/مضيف backend | `127.0.0.1:8787` |

## جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [الميزات](#-الميزات)
- [مخطط معماري سريع](#-مخطط-معماري-سريع)
- [هيكل المشروع](#️-هيكل-المشروع)
- [المسارات السريعة للتنقل](#-المسارات-السريعة-للتنقل)
- [المتطلبات المسبقة](#-المتطلبات-المسبقة)
- [التثبيت](#-التثبيت)
- [الاستخدام](#-الاستخدام)
- [الإعداد](#️-الإعداد)
- [واجهة برمجة التطبيقات الخلفية الأساسية](#-واجهة-برمجة-التطبيقات-الخلفية-الأساسية)
- [مسارات زمن التشغيل](#-مسارات-زمن-التشغيل)
- [سكربت خط الأنابيب (النسخة المرجعية)](#-سكربت-خط-الأنابيب-النسخة-المرجعية)
- [مخرجات المشغّل (مسودة)](#-مخرجات-المشغّل-مسودة)
- [مهام المشغّل (دفعات)](#-مهام-المشغّل-دفعات)
- [إعدادات الوكيل / بوابة Codex](#-إعدادات-الوكيل--بوابة-codex)
- [I18N الواجهة في PWA](#-i18n-الواجهة-في-pwa)
- [إعدادات الرواية (منفصلة عن لغة الواجهة)](#️-إعدادات-الرواية-منفصلة-عن-لغة-الواجهة)
- [أمثلة](#-أمثلة)
- [ملاحظات التطوير](#️-ملاحظات-التطوير)
- [ملاحظات الاختبار](#-ملاحظات-الاختبار)
- [محتويات المستودع](#-محتويات-المستودع)
- [استكشاف الأخطاء وإصلاحها](#-استكشاف-الأخطاء-وإصلاحها)
- [خريطة الطريق](#️-خريطة-الطريق)
- [المساهمة](#-المساهمة)
- [الدعم](#-support)
- [الترخيص](#-الترخيص)

## 📌 نظرة عامة

يوفر AutoNovelWriter طبقة تنسيق محلية لإدارة:
- تحرير سكربت خط الأنابيب المرجعي (`pipeline.script`) عبر النص المصدري وواجهة الكتل.
- تشغيل backend قابل للاستئناف مع مؤشر تنفيذ ونتائج إجراءات محفوظة.
- إدارة المشاريع، والمصادر، والمخرجات، ودفعات المهام، وقوالب الإجراءات.
- بث التحديثات الحية عبر WebSocket (`/ws`) إلى PWA.

الـ runtime القابل للتعديل بشكل مباشر هو `autonovelwriter/runtime/` (المحتويات فيه متجاهلة من Git).

| المجال | الوظيفة |
|---|---|
| تأليف خط الأنابيب | تحرير السكربت المرجعي + واجهة الكتل المتداخلة من مصدر حقيقة واحد |
| التنفيذ | مشغل قابل للاستئناف مع مؤشر ونتائج إجراءات محفوظة |
| عمليات المشروع | مواد ومخرجات وإعدادات على مستوى المشروع، وتفعيل دفعات المهام |
| تجربة الوقت الفعلي | أحداث `/ws` للحالة/السجل/المخرجات/المهام/الإجراءات |

## ✨ الميزات

- محرر pipeline بنمط Scratch مدعوم بسكربت مرجعي + parser/AST.
- واجهات تحكم المشغّل (`start/pause/resume/stop`) مع حالة قابلة للاستئناف.
- حاويات التحكم بالتدفق: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- مكتبة إجراءات بقوالب افتراضية + تجاوزات المستخدم بنمط copy-on-edit.
- تجاوزات إعدادات كتابة الرواية على مستوى المشروع مع دلالة الوراثة.
- تدفق إنشاء/فهرسة/تفاصيل/تفعيل دفعات المهام لـ `FOREACH_TASK`.
- فهرسة المخرجات ونقاط نهاية معاينة أحدث PDF للرواية.
- قواميس i18n مدمجة للواجهة (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- سكربتات tmux المساعدة + محرك Codex Auto-Dev قابل للاستئناف.

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
| `pip` | نعم | لتثبيت تبعيات الـ backend |
| `tmux` | لا | مطلوب إذا كنت تستخدم سكربت الإطلاق متعدد الألواح |
| `conda` | لا | للسكربتات المساعدة الاختيارية |
| `node` | لا | اختياري لتشغيل ملف اختبار PWA مباشرة |

## 🚀 التثبيت

| المسار | الأفضل متى | الأمر |
|---|---|---|
| الخيار A | أنت تستخدم conda وتريد إعداد المستودع الجاهز | `scripts/setup_conda_env.sh --name autonovelwriter` |
| الخيار B | تريد الإعداد+التشغيل في أمر واحد | `scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill` |
| الخيار C | تفضل التحكم اليدوي عبر pip | `python3 -m pip install -r autonovelwriter/backend/requirements.txt` |

### الخيار A: مساعد Conda (موصى به لهذا المستودع)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

ثم شغّل عبر tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### الخيار B: إعداد وتشغيل دفعة واحدة

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### الخيار C: تثبيت pip يدوي

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

### اختياري: تهيئة الـ Submodule

```bash
git submodule update --init --recursive
```

## 🧪 الاستخدام

| التدفق | الأمر / الرابط |
|---|---|
| تشغيل backend | `python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787` |
| فتح التطبيق | `http://127.0.0.1:8787/` |
| نقطة WebSocket | `ws://127.0.0.1:8787/ws` |
| PWA ثابتة اختياري | `python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa` |
| مشغل tmux | `scripts/run_autonovelwriter_tmux.sh --no-attach` |

### بدء سريع (بدون tmux)

```bash
python3 -m pip install -r autonovelwriter/backend/requirements.txt
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# open http://127.0.0.1:8787/
```

### تشغيل للتطوير (Backend + PWA)

Backend (Tornado):

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
```

يقوم backend أيضًا بخدمة أصول PWA الثابتة افتراضيًا من `autonovelwriter/pwa/`، لذلك يمكنك فتح:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

اختياري: PWA (خادم تطوير ثابت منفصل):

```bash
python3 -m http.server 5173 --bind 127.0.0.1 --directory autonovelwriter/pwa
```

افتح PWA على `http://127.0.0.1:5173` ووجّهها إلى backend (الافتراضي `ws://127.0.0.1:8787/ws`).

tmux (تشغيل الواجهة وواجهة الخادم + تتبع السجل):

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Conda env helper:

```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

برنامج التوجيه الخاص بالمستودع (`scripts/auto-autonovelwriter-development.sh`) يمكنه أيضًا تشغيل جلسة tmux أثناء auto-dev.

### سير العمل النموذجي

1. شغّل backend (أو مساعد tmux).
2. افتح PWA.
3. حرّر خط الأنابيب عبر Blocks أو textarea السكربت.
4. تحقق من صحة السكربت واحفظه.
5. شغّل المشغل وراقب السجل/الحالة/الأحداث.
6. راجع المخرجات ودفعات المهام المولّدة.

## ⚙️ التكوين

### متغيرات البيئة

استخدم `autonovelwriter/backend/.env.example` كنموذج. المتغيرات الرئيسية المستخدمة في backend/runtime:

- `AUTONOVELWRITER_RUNTIME_ROOT` (افتراضي `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (افتراضي `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (افتراضي `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (افتراضي CLI: `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (المستوى الأعلى لأصل المستودع)
- `AUTONOVELWRITER_WRITER_SCRIPT` (افتراضي `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (افتراضي `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (افتراضي `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (بوابة تنفيذ agent، افتراضياً معطلة)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (بديل المسار التنفيذي لـ codex اختياري)

### خيارات واجهة سطر أوامر السكربتات

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

## 🔌 واجهات برمجة التطبيقات الخلفية الأساسية

| مجموعة API | نقاط النهاية الأساسية |
|---|---|
| الصحة والإعدادات | `/api/health`, `/api/settings` |
| المشاريع وإعدادات المشاريع | `/api/projects`, `/api/projects/active`, `/api/projects/settings` |
| خط الأنابيب | `/api/pipeline`, `/api/pipeline/validate`, `/api/pipeline/reference_writer*` |
| المهام | `/api/tasks/batches/index`, `/api/tasks/batches/<batch_id>`, `/api/tasks/batches/<batch_id>/activate` |
| الإجراءات | `/api/actions`, `/api/actions/<action_id>`, `/api/actions/<action_id>/copy` |
| المشغل | `/api/run/start|pause|resume|stop`, `/api/run/status` |
| المخرجات ومعاينة الرواية | `/api/outputs/index`, `/api/novel/latest`, `/api/novel/latest/pdf` |
| الوقت الفعلي | `/ws` |

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (active project): `GET/POST /api/projects/settings` (تجاوزات مستوى المشروع مع دلالة الوراثة: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (active project): `GET /api/materials/index`
- Outputs index (active project): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (اختياري: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (تكتب `runtime/tasks/tasks.json` و`project` `active_tasks.json`)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (تحديث copy-on-edit للتعديلات الافتراضية)
- Pipeline (canonical script + derived JSON): `GET/POST /api/pipeline`
- Pipeline validate (preview only): `POST /api/pipeline/validate`
- Reference writer pipeline preview/load:
  - `GET /api/pipeline/reference_writer` (يقرأ ويفسر `../scripts/auto-xiyouzhiyuan-writer.sh` كمرجع)
  - `POST /api/pipeline/reference_writer/load` (يحمل النتيجة المفككة إلى runtime pipeline؛ دون تعديل السكربت المصدري)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (البيانات الوصفية)
  - `GET /api/novel/latest/pdf` (تدفق PDF ضمني للعارض)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (gated): `POST /api/agent/test` (يشغّل `codex --version` فقط عند تفعيل البوابة والمتغيرات)

### WebSocket

- Endpoint: `/ws`
- Broadcast events: `hello`, `chat`, `outbox_written`, `input_mirror_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`, `echo`

## 📁 مسارات زمن التشغيل

جميع الحالات المتغيرة وعمليات الإدخال/الإخراج تقع تحت `autonovelwriter/runtime/`:

| المسار | الغرض |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (إسقاط ملفات `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend يكتب رسائل chat) |
| `autonovelwriter/runtime/state/` | حالة JSON دائمة (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | SQLite chat mirror (إضافةً إلى chat.jsonl) |
| `autonovelwriter/runtime/state/active_project.json` | مؤشر المشروع النشط المدوّن |
| `autonovelwriter/runtime/tasks/` | ملفات قائمة انتظار المهام |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | دفعات المهام المولدة (مثلًا من `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | السجلات |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | مواد المشروع (المدخلات) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | مخرجات المشروع (المسودات/التصديرات) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | تجاوزات إعدادات رواية المشروع (مثل لغة الرواية) |
| `autonovelwriter/runtime/actions/defaults/` | قوالب Action Library الافتراضية (تعامل معها كمحتوى غير قابل للتعديل)
| `autonovelwriter/runtime/actions/user/` | قوالب Action Library الخاصة بالمستخدم (تُنشأ عبر copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | مخرجات إدخال chat المنعكسة لاستهلاك خط الأنابيب |

## 🧩 سكربت خط الأنابيب (النسخة المرجعية)

خط الأنابيب ممثّل كسكربت منسق على القرص:
- `autonovelwriter/runtime/state/pipeline.script`

الخلفية تعرضه عبر `GET/POST /api/pipeline` كـ:
- `script` (مرجعي، أسطر شبيهة بالسطر الأوامر `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (قائمة مسطحة مشتقة لعرض الكتل البسيط)
- `pipeline_ast` (هيكلية متداخلة مشتقة لواجهة الحاويات في العرض)

المشغل ينفذ الخطوات المشتقة من نفس parser/AST v2 حتى تتطابق ما يعرضه PWA مع ما يتم تنفيذه فعليًا.

تدفق التحكم في المشغل يدعم حاويات v2:
- `ROUND <n>` يكرر عناصره الفرعية `n` مرات.
- `FOREACH_TASK` ينفذ عناصره الفرعية مرة لكل مهمة في قائمة المهام النشطة (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` ينفذ عناصره الفرعية مرة لكل عنصر في قائمة `payload.actions` للمهمة الحالية (من المفترض أن تكون متداخلة ضمن `FOREACH_TASK`).

قابلية الاستئناف:
- المشغل يحفظ مؤشر تنفيذ قابل للاستئناف في `autonovelwriter/runtime/state/runner_state.json`.
- المؤشر لا يتقدم إلا بعد إكمال كتلة بنجاح (لذلك لا تفقد المهام غير المكتملة عند إعادة التشغيل).
- إذا تغيّر سكربت خط الأنابيب المرجعي (تفاوت hash)، سيتوقف المشغل ويتطلب إعادة تشغيل (إبطال المؤشر).
- المشغل يحفظ سجلات `ActionResult` لكل خطوة في `autonovelwriter/runtime/state/action_results.jsonl` ويستخدم `exec_id` ثابت لكل خطوة لمنع تكرار النتائج الملتزمة عند الاستئناف.
- أثناء التشغيل داخل `FOREACH_ACTION`، تتضمن ActionResults: `action_index`, `action_id_ref`, و`action_key`، وتحتوي المتغيرات على `prev` مع نطاقات `task.prev` مقابل `action.prev`.

دعم تعشيش خط الأنابيب v2:
- `LOOP <n>` ينشئ حاوية حلقة متداخلة.
- `ROUND <n>` ينشئ حاوية جولات.
- `FOREACH_TASK` ينشئ حاوية لكل مهمة.
- `FOREACH_ACTION` ينشئ حاوية لكل إجراء داخل المهمة (تُكرر `task.payload.actions`).
- `IF <expr>` ينشئ حاوية شرطية (parse/render؛ المشغل ينفذ فرع then فقط حاليًا).
- `ELSE` ينشئ فرعًا بديلًا اختياريًا تحت `IF`.
- الأطفال يتموضعون بمسافة 2 مسافات لكل مستوى.

التحقق (بدون حفظ):
- `POST /api/pipeline/validate` يرجّع معاينة مرجعية + `pipeline_ast` وتنبيهات وأخطاء.

واجهة PWA تعرض السكربت داخل textarea (مصدر الحقيقة) وتعرض الكتل المتداخلة من `pipeline_ast`.
إذا كانت نقطة تحقق الخلفية غير متاحة، فإن PWA تستخدم parser محليًا بدعم نفس الأوامر v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

ملاحظات Blocks UI:
- يمكن تعديل عداد `LOOP` و`ROUND` مباشرة من قائمة الكتل؛ التعديلات المعتبرة تحدّث textarea السكربت مباشرة.
- شريط أدوات الكتل يمكنه إدراج `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, و`IF` دون تحرير يدوي للسكربت (يغلف الكتلة المحددة، أو يضيف حاوية صالحة غير فارغة).
- يمكن حذف الكتل من لوحة التحرير (زر حذف لكل كتلة أو زر `Delete` عند تحديد كتلة). حذف الحاوية يدمج أطفالها، والمحرك يحافظ على أن الحاويات ليست فارغة لتجنّب سكربتات غير صالحة.
- حاويات `IF` تبقى بنائية صالحة في المحرر: لا يمكن أن تظهر `ELSE` خارج `IF`، و remains then-branch غير فارغة.
- كتل `STEP` تعرض عناصر مكتبة الإجراءات: selector الإجراء، `Customize` (نسخ إجراء افتراضي إلى المستخدم وتبديل السياق)، و`Edit` (نافذة محرر الإجراء لحقول `name/tool/prompt/script`).

## 📝 مخرجات المشغل (مسودة)

عندما يحتوي خط الأنابيب على كتلة `STEP write`، سينشئ المشغل ملف مسودة مبدئي تحت:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

كما يرسل backend:
- حدث WS `output_created` مع `path` و`project_rel_path`
- سطر log `[output] created: ...`

واجهة PWA تضم لوحة Outputs بسيطة تعرض الملفات عبر `GET /api/outputs/index` وتنعش تلقائيًا عند `output_created`.

## 📦 مهام المشغل (دفعة)

عند وجود كتلة `STEP meta_tasks_generate` في خط الأنابيب، سينشئ مشغل backend دفعة مهام تجريبية تحت:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

ويرسل backend:
- حدث WS `tasks_batch_created` مع `batch_dir`, `tasks_jsonl`, و`task_count`
- سطر log `[tasks] created batch: ...`

واجهة PWA تضم لوحة Task Batches بسيطة تعرض الدفعات عبر `GET /api/tasks/batches/index` وتنعش تلقائيًا عند `tasks_batch_created`.
يمكن أيضًا عرض تفاصيل دفعة (`GET /api/tasks/batches/<batch_id>`) وتفعيل دفعة لتصبح القائمة النشطة لمهام `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🔐 إعدادات الوكيل / بوابة Codex

لوحة إعدادات PWA تحفظ إعدادات الوكيل عبر `/api/settings` داخل `autonovelwriter/runtime/state/settings.json`.

ولأسباب الأمان، لن ينشئ backend عملية `codex CLI` إلا إذا تحققت الشروط التالية:
- `settings.agent.enabled=true` و `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` مضبوط في البيئة

لا تُشارك أسرارًا. استخدم `autonovelwriter/backend/.env.example` كنموذج لملفات env المحلية.

## 🌐 I18N الواجهة في PWA

الـ PWA يتضمن نظام i18n خفيفًا مدمجًا.

- فرض لغة الواجهة: أضف `?lang=<code>` للرابط (مثلاً `?lang=ja`).
- محفوظة per-browser في localStorage: `anw_lang`.
- لغات الواجهة المدعومة: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.
- READMEs على مستوى المستودع موجودة في `i18n/` ومربوطة بسطر language-options الوحيد أعلى هذا الملف.

| ملفات README المحلية (`i18n/`) | الحالة |
|---|---|
| `README.ar.md`, `README.de.md`, `README.es.md`, `README.fr.md`, `README.ja.md`, `README.ko.md`, `README.ru.md`, `README.vi.md`, `README.zh-Hans.md`, `README.zh-Hant.md` | موجودة |

## 🖋️ إعدادات الرواية (منفصلة عن لغة الواجهة)

إعدادات كتابة الرواية محفوظة داخل إعدادات backend في `settings.novel.*` ضمن:
- `autonovelwriter/runtime/state/settings.json`

وهذه منفصلة عمداً عن لغة الواجهة في PWA (`?lang=` / `anw_lang`).

تخزَّن تجاوزات المشاريع ضمن:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

الحقول العامة الحالية (قابلة للتحرير من نافذة Settings في PWA):
- `settings.novel.language` (أكواد شبيهة BCP-47 مثل `en`, `ja`, `zh-Hans`, إلخ)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

حقول تجاوز المستوى المشروعي الحالية (فارغ/غير مضبوط = يرث من العمومي):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 🧰 أمثلة

### تشغيل محلي أدنى

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# ثم افتح http://127.0.0.1:8787/
```

### tmux بدون auto-attach

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

### مثال مساعد الأتمتة المبرمجة

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

برنامج `scripts/auto-autonovelwriter-development.sh` يشغّل حلقة Codex-driven قابلة للاستئناف على المهام في `references/autonovelwriter_dev/` وسيقوم بالـ commit/push بعد كل مرحلة (`plan -> implement -> debug -> fix -> i18n -> summary -> update_readme`).

عناصر التحكم المفيدة:
- أوقف بعد المهمة الحالية: `touch references/autonovelwriter_dev/STOP`
- أعِد تتبع الحالة (مع الحفاظ على الطابور): `scripts/auto-autonovelwriter-development.sh --reset-state`
- ابدأ جلسة Codex جديدة: `scripts/auto-autonovelwriter-development.sh --new-session`
- ممارسة آمنة: استخدم فرعًا أو worktree نظيفًا وراقب `references/autonovelwriter_dev/state.tsv` قبل إعادة التشغيل

### افتراضات تشغيلية

- يفترض هذا README تنمية محلية على Linux/macOS باستخدام `bash` وPython 3.11+.
- حالة زمن التشغيل داخل `autonovelwriter/runtime/` قابلة للتغيير ومتوقعة أن تكون غير متتبعة في git.
- سلوك خط الأنابيب الموصوف هنا يعكس التنفيذ الحالي داخل `autonovelwriter/backend/server.py` و`autonovelwriter/pwa/app.js`.

## 🧪 ملاحظات الاختبار

لا يوجد orchestrator على مستوى الأعلى مثل `Makefile`/`tox`/`npm test` في هذا المستودع في وقت الكتابة هذا.

نقاط دخول الاختبار العملية:

| المجال | نقطة الدخول |
|---|---|
| Parser/AST في الخلفية | `python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py` |
| صياغة foreach-action في الخلفية | `python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py` |
| دلالات runner في الخلفية | `python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py` |
| تحديث مكتبة الإجراءات | `python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py` |
| سلوك PWA AST عند الحذف | `node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js` |

```bash
# backend (run individual test files)
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/pipeline_foreach_action_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
python3 autonovelwriter/backend/tests/actions_library_update_unit_test.py

# pwa logic test
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

إذا أضفت أو غيّرت دلالات المشغّل أو syntax خط الأنابيب أو سلوك مكتبة الإجراءات، حدّث الاختبارات وملاحظات README/API في نفس التغيير.

## 📚 محتويات المستودع

- `docs/autonovelwriter_spec.md`: المواصفات الفنية للتحكم بنمط Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: auto-develop لـ AutoNovelWriter نفسه (task loop: `plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push`).
- `docs/auto-development-guide.md`: فلسفة ومتطلبات ثنائية اللغة (EN/ZH) لوكيل التطوير طويل الأمد وقابل للاستئناف.
- `docs/ORDERING_RATIONALE.md`: مثال لأسباب ترتيب الخطوات المدفوعة بالصور.
- `scripts-legacy/`: سكربتات أقدم للرجوع إليها لكنها غير مستخدمة حاليا.
- `examples/ralph-wiggum-example.sh`: مثال مساعد أتمتة Codex CLI.

ملاحظات إضافية للمطور:
- اختبارات backend موجودة في `autonovelwriter/backend/tests/`.
- يوجد اختبار PWA صغير في `autonovelwriter/pwa/tests/`.
- مجلد `i18n/` يحتوي ملفات README المترجمة، بينما قواميس الواجهة موجودة مدمجة داخل `autonovelwriter/pwa/app.js`.

## 🧯 استكشاف الأخطاء وإصلاحها

| العَرَض | ما يجب فحصه |
|---|---|
| `tmux not found in PATH` | ثبّت tmux أو شغّل الخادمين backend/static يدويًا. |
| `conda not found in PATH` عند استخدام سكربتات `--env` | ثبّت Miniconda/Anaconda، أو تجاوز conda واستخدم التثبيت اليدوي عبر pip. |
| PWA لا تتصل بالـ backend | تأكد من عنوان backend والمنفذ ونقطة WebSocket `ws://<host>:<port>/ws`. |
| `POST /api/agent/test` ترجع gated/disabled | تأكد من `settings.agent.enabled=true` و`settings.agent.sdk="codex"` و`AUTONOVELWRITER_ENABLE_CODEX=1`. |
| المشغّل يتوقف بعد تعديل السكربت | هذا سلوك متوقع؛ يتم إبطال المؤشر عند اختلاف hash سكربت خط الأنابيب ويتطلب إعادة تشغيل. |
| PWA ثابت على `:5173` يعمل لكن استدعاءات API تفشل | تأكد من أن backend يعمل على `:8787` (أو عدّل إعدادات backend/frontend حسب الحالة). |

## 🗺️ خارطة الطريق

- إكمال وتجهيز العناصر المتبقية في طابور auto-dev (راجع bloc التقدم المولد بالأعلى).
- توسيع وتزامن نسخ README متعددة اللغات في `i18n/` باستمرار.
- توسيع تغطية الاختبارات الآلية عبر حالات طرفية إضافية ومرات تفاعل PWA.
- الاستمرار في تحسين Action Library وتدفقات تكرار المهمة/الإجراء.

## 🤝 المساهمة

المساهمات مرحب بها.

إرشادات عملية لهذا المستودع:
- ابدأ من `docs/autonovelwriter_spec.md` و`docs/auto-development-guide.md`.
- أبقِ تغييرات زمن التشغيل ضمن `autonovelwriter/runtime/` (المحتوى غير متتبع في git)، وليس في الملفات المتتبعة.
- فضلًا اعتمد PR تدريجية بمعايير تشغيلية واضحة وأوامر إعادة التشغيل قابلة للإعادة.
- إذا غيّرت semantics pipeline أو عقود API، حدّث README والاختبارات المرتبطة معًا.

ملاحظة: لا يوجد ملف `CONTRIBUTING.md` مخصص في جذر المستودع في وقت هذا المسودة.

---

## 📄 الترخيص

حالة ملف/الرخصة غير معلنة صراحة في جذر المستودع في سياق هذه المسودة.

ملاحظة افتراضية:
- إذا كنت ترغب في نشر المشروع كمصدر مفتوح بوضوح، أضف ملف `LICENSE` في أعلى المستوى وحدث هذا القسم وفقًا لذلك.


## ❤️ Support

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://camo.githubusercontent.com/24a4914f0b42c6f435f9e101621f1e52535b02c225764b2f6cc99416926004b7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f446f6e6174652d4c617a79696e674172742d3045413545393f7374796c653d666f722d7468652d6261646765266c6f676f3d6b6f2d6669266c6f676f436f6c6f723d7768697465)](https://chat.lazying.art/donate) | [![PayPal](https://camo.githubusercontent.com/d0f57e8b016517a4b06961b24d0ca87d62fdba16e18bbdb6aba28e978dc0ea21/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50617950616c2d526f6e677a686f754368656e2d3030343537433f7374796c653d666f722d7468652d6261646765266c6f676f3d70617970616c266c6f676f436f6c6f723d7768697465)](https://paypal.me/RongzhouChen) | [![Stripe](https://camo.githubusercontent.com/1152dfe04b6943afe3a8d2953676749603fb9f95e24088c92c97a01a897b4942/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5374726970652d446f6e6174652d3633354246463f7374796c653d666f722d7468652d6261646765266c6f676f3d737472697065266c6f676f436f6c6f723d7768697465)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |
