[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)


<p align="center">
  <img src="https://raw.githubusercontent.com/lachlanchen/lachlanchen/main/figs/banner.png" alt="LazyingArt banner" />
</p>

# AutoNovelWriter

Tùy chọn ngôn ngữ: **Tiếng Việt (bản dịch này)**. Không gian làm việc i18n nằm tại `i18n/`; các biến thể README bản địa hóa nên được tạo lần lượt theo từng bước tiếp theo.

![Python](https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Tornado%206.4%2B-0ea5e9)
![Frontend](https://img.shields.io/badge/frontend-PWA-10b981)
![Runtime](https://img.shields.io/badge/runtime-local%20state-orange)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)

PWA kiểu Scratch + backend Tornado để điều khiển một pipeline tự động viết tiểu thuyết (và phát triển ứng dụng).

Repo này cũng nhúng `AutoAppDev/` dưới dạng submodule (các script auto-dev có thể tái sử dụng).

## Tổng quan

AutoNovelWriter cung cấp lớp điều phối cục bộ cho:
- Chỉnh sửa script pipeline chuẩn (`pipeline.script`) bằng cả văn bản nguồn và giao diện block.
- Chạy backend có thể tiếp tục (resumable) với con trỏ và kết quả action được lưu bền vững.
- Quản lý project, tài liệu, output, batch task và mẫu action.
- Truyền cập nhật thời gian thực qua WebSocket (`/ws`) đến PWA.

Runtime mutable chuẩn là `autonovelwriter/runtime/` (bị gitignore).

| Khu vực | Chức năng |
|---|---|
| Soạn thảo pipeline | Chỉnh sửa script chuẩn + UI block lồng nhau từ một nguồn dữ liệu duy nhất |
| Thực thi | Runner có thể tiếp tục với con trỏ và kết quả action được lưu |
| Vận hành project | Tài liệu, output, cài đặt theo project và kích hoạt task-batch |
| UX thời gian thực | Sự kiện `/ws` cho cập nhật status/log/output/task/action |

## Tính năng

- Trình biên tập pipeline kiểu Scratch dựa trên script chuẩn + parser/AST.
- API điều khiển runner (`start/pause/resume/stop`) với trạng thái resumable.
- Container điều khiển luồng: `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF/ELSE`.
- Thư viện Action với mẫu mặc định + bản ghi đè người dùng theo cơ chế copy-on-edit.
- Ghi đè cài đặt viết tiểu thuyết theo project với ngữ nghĩa kế thừa.
- Luồng tạo/index/chi tiết/kích hoạt task batch cho `FOREACH_TASK`.
- Endpoint lập chỉ mục output và xem trước PDF tiểu thuyết mới nhất.
- Từ điển i18n tích hợp sẵn trong PWA (`en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar`, `fr`, `es`, `ru`, `de`).
- Script hỗ trợ tmux và driver auto-dev Codex có thể tiếp tục.

## 🗂️ Cấu trúc dự án

```text
AutoNovelWriter/
├── README.md
├── .github/
│   └── FUNDING.yml
├── .gitmodules                     # Khai báo submodule AutoAppDev
├── autonovelwriter/
│   ├── backend/
│   │   ├── server.py              # entrypoint backend chính + API/WS handlers + logic runner
│   │   ├── requirements.txt       # tornado>=6.4
│   │   ├── .env.example
│   │   └── tests/                 # unit test backend
│   ├── pwa/
│   │   ├── index.html
│   │   ├── app.js                 # logic UI + từ điển i18n nhúng sẵn
│   │   ├── app.css
│   │   ├── manifest.webmanifest
│   │   ├── service_worker.js
│   │   ├── icons/
│   │   └── tests/
│   └── runtime/                   # trạng thái/IO mutable (gitignored)
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
├── i18n/                          # đã tồn tại (hiện chưa có file)
└── AutoAppDev/                    # dự án đồng hành được liên kết
```

## ✅ Điều kiện tiên quyết

| Phụ thuộc | Bắt buộc | Ghi chú |
|---|---|---|
| Python `3.11+` | Có | Mốc khuyến nghị |
| `pip` | Có | Cài phụ thuộc backend |
| `tmux` | Không | Cần cho script khởi chạy nhiều pane |
| `conda` | Không | Script hỗ trợ tùy chọn |
| `node` | Không | Tùy chọn để chạy trực tiếp file test PWA |

## ⚙️ Cài đặt

### Tùy chọn A: Helper Conda (khuyến nghị cho repo này)

```bash
scripts/setup_conda_env.sh --name autonovelwriter
```

Sau đó chạy bằng tmux:

```bash
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
```

### Tùy chọn B: Thiết lập + chạy một lệnh

```bash
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

### Tùy chọn C: Cài thủ công bằng pip

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r autonovelwriter/backend/requirements.txt
```

## 🚀 Sử dụng

## Chạy Dev (Backend + PWA)

Backend (Tornado):
```bash
python3 autonovelwriter/backend/server.py --port 8787
```

Backend cũng mặc định phục vụ static assets của PWA từ `autonovelwriter/pwa/`, nên bạn có thể mở:
- `http://127.0.0.1:8787/` (PWA)
- WebSocket: `ws://127.0.0.1:8787/ws`

Tùy chọn: PWA (static dev server riêng):
```bash
python3 -m http.server 5173 --directory autonovelwriter/pwa
```

Mở PWA tại `http://127.0.0.1:5173` và trỏ về backend (mặc định `ws://127.0.0.1:8787/ws`).

tmux (khởi chạy cả hai pane + theo dõi log):
```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

Helper môi trường Conda:
```bash
scripts/setup_conda_env.sh --name autonovelwriter
scripts/run_autonovelwriter_tmux.sh --env autonovelwriter
# one-shot:
scripts/setup_and_run_autonovelwriter.sh --env autonovelwriter --kill
```

Script driver của repo (`scripts/auto-autonovelwriter-development.sh`) cũng có thể khởi tạo một phiên tmux trong quá trình auto-dev.

### Quy trình điển hình

1. Khởi động backend (hoặc helper tmux).
2. Mở PWA.
3. Chỉnh sửa pipeline qua Blocks và/hoặc ô textarea script.
4. Validate/lưu pipeline.
5. Khởi động runner và theo dõi log/status/events.
6. Rà soát output đã tạo/task batch.

## 🧠 Đường dẫn runtime

Toàn bộ trạng thái mutable và IO nằm dưới `autonovelwriter/runtime/` (bị git ignore):

| Đường dẫn | Mục đích |
|---|---|
| `autonovelwriter/runtime/io/inbox/` | user -> system (thả file `.txt`/`.md`) |
| `autonovelwriter/runtime/io/outbox/` | system -> user (backend ghi tin nhắn chat) |
| `autonovelwriter/runtime/state/` | trạng thái JSON lưu bền (settings, pipeline, runner, chat) |
| `autonovelwriter/runtime/state/chat.sqlite3` | bản sao chat sqlite (ngoài `chat.jsonl`) |
| `autonovelwriter/runtime/state/active_project.json` | con trỏ “active project” được lưu |
| `autonovelwriter/runtime/tasks/` | file hàng đợi task |
| `autonovelwriter/runtime/tasks/batches/<batch_id>/` | task batch đã tạo (ví dụ từ `meta_tasks_generate`) |
| `autonovelwriter/runtime/logs/` | log |
| `autonovelwriter/runtime/projects/<project_id>/materials/` | tài liệu project (input) |
| `autonovelwriter/runtime/projects/<project_id>/outputs/` | output project (bản nháp/xuất bản) |
| `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json` | ghi đè cài đặt viết tiểu thuyết theo project (ví dụ ngôn ngữ tiểu thuyết) |
| `autonovelwriter/runtime/actions/defaults/` | mẫu Action Library mặc định được seed (xem như bất biến) |
| `autonovelwriter/runtime/actions/user/` | mẫu Action Library của người dùng (tạo qua copy-on-edit) |
| `/home/lachlan/Documents/VoidAbyss/references/xiyouzhiyuan/input/` | input chat mirror để nạp vào pipeline writer |

## 🧩 Pipeline Script (Hiện vật chuẩn)

Pipeline được biểu diễn dưới dạng script đã định dạng trên đĩa:
- `autonovelwriter/runtime/state/pipeline.script`

Backend phục vụ qua `GET/POST /api/pipeline` với:
- `script` (chuẩn, dạng shell-ish với dòng `STEP <type>` / `DISABLED <type>`)
- `pipeline` JSON (suy ra, danh sách phẳng để render block đơn giản)
- `pipeline_ast` (suy ra, cấu trúc lồng dùng cho UI vòng lặp + thụt lề)

Runner thực thi các bước suy ra từ cùng parser/AST v2 nên những gì PWA hiển thị sẽ khớp với những gì được chạy.
Luồng điều khiển runner hỗ trợ container v2:
- `ROUND <n>` lặp lại các node con `n` lần.
- `FOREACH_TASK` chạy các node con một lần cho mỗi task trong danh sách task đang active (`autonovelwriter/runtime/tasks/tasks.json`).
- `FOREACH_ACTION` chạy các node con một lần cho mỗi phần tử trong danh sách `payload.actions` của task hiện tại (dự kiến lồng dưới `FOREACH_TASK`).

Khả năng tiếp tục (resumability):
- Runner lưu con trỏ thực thi có thể tiếp tục vào `autonovelwriter/runtime/state/runner_state.json`.
- Con trỏ chỉ tăng sau khi block hoàn tất thành công (nên khởi động lại không bỏ qua phần việc chưa xong).
- Nếu script pipeline chuẩn thay đổi (hash mismatch), runner dừng và yêu cầu khởi động lại (con trỏ bị vô hiệu).
- Runner lưu bản ghi `ActionResult` theo từng bước vào `autonovelwriter/runtime/state/action_results.jsonl` và dùng `exec_id` xác định theo từng bước để tránh ghi trùng kết quả đã commit khi khởi động lại.
  - Khi chạy bên trong `FOREACH_ACTION`, ActionResult bao gồm `action_index`, `action_id_ref`, và `action_key`, và vars gồm `prev` cùng các scope tường minh `task.prev` và `action.prev`.

Pipeline script v2 hỗ trợ lồng:
- `LOOP <n>` tạo block vòng lặp
- `ROUND <n>` tạo block container “rounds”
- `FOREACH_TASK` tạo block container theo từng task
- `FOREACH_ACTION` tạo block container theo từng action (runner lặp qua `task.payload.actions`)
- `IF <expr>` tạo block container điều kiện (parse/render; runner hiện chỉ thực thi then-branch)
- `ELSE` tạo nhánh thay thế tùy chọn dưới block `IF`
- node con được thụt vào 2 dấu cách mỗi cấp

Validation (không persist):
- `POST /api/pipeline/validate` trả về bản preview chuẩn cùng `pipeline_ast`, warnings, và errors.

PWA hiển thị script trong textarea (nguồn chân lý) và render block lồng từ `pipeline_ast`.
Nếu endpoint validate của backend không truy cập được, PWA dùng parser cục bộ dự phòng hỗ trợ cùng các động từ v2 (`LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, `IF`, `ELSE`, `STEP`, `DISABLED`).

Ghi chú UI Blocks:
- Số lần lặp `LOOP` và `ROUND` có thể chỉnh sửa inline trong danh sách block; chỉnh sửa hợp lệ sẽ cập nhật ngay textarea script chuẩn.
- Thanh công cụ Blocks có thể chèn container `LOOP`, `ROUND`, `FOREACH_TASK`, `FOREACH_ACTION`, và `IF` mà không cần sửa tay script (bọc block đang chọn, hoặc thêm vào cuối một container hợp lệ không rỗng).
- Block có thể xóa khỏi canvas (nút Delete theo block; phím `Delete` khi block được chọn). Xóa container sẽ đưa các node con lên cùng cấp, và editor giữ container không rỗng để tránh script không hợp lệ.
- Block `IF` được giữ hợp lệ về cấu trúc trong editor: `ELSE` không thể tồn tại bên ngoài `IF`, và then-branch luôn không rỗng.
- Block `STEP` có điều khiển Action Library: bộ chọn action, `Customize` (sao chép action mặc định sang action người dùng và chuyển sang dùng bản đó), và `Edit` (modal Action Editor cho `name/tool/prompt/script`).

## 🔧 Cấu hình

### Biến môi trường

Dùng `autonovelwriter/backend/.env.example` làm mẫu. Các biến chính được backend/runtime dùng:

- `AUTONOVELWRITER_RUNTIME_ROOT` (mặc định `autonovelwriter/runtime`)
- `AUTONOVELWRITER_PWA_ROOT` (mặc định `autonovelwriter/pwa`)
- `AUTONOVELWRITER_HOST` (mặc định `127.0.0.1`)
- `AUTONOVELWRITER_PORT` (mặc định `8787`)
- `AUTONOVELWRITER_WORKSPACE_ROOT` (mặc định: thư mục cha của repo root)
- `AUTONOVELWRITER_WRITER_SCRIPT` (mặc định `${WORKSPACE_ROOT}/scripts/auto-xiyouzhiyuan-writer.sh`)
- `AUTONOVELWRITER_XIYOU_INPUT_DIR` (mặc định `${WORKSPACE_ROOT}/references/xiyouzhiyuan/input`)
- `AUTONOVELWRITER_NOVELS_ROOT` (mặc định `${WORKSPACE_ROOT}/auto-novels`)
- `AUTONOVELWRITER_ENABLE_CODEX` (cổng cho phép thực thi agent, mặc định tắt)
- `AUTONOVELWRITER_CODEX_CLI_PATH` (tùy chọn ghi đè đường dẫn binary codex)

## 🌐 API Backend chính

### HTTP APIs

- Health: `GET /api/health`
- Settings: `GET/POST /api/settings`
- Projects: `GET /api/projects`, `POST /api/projects/active`
- Project settings (project đang active): `GET/POST /api/projects/settings` (ghi đè theo project với ngữ nghĩa kế thừa: `novel_language`, `novel_tone`, `novel_target_length_words`)
- Materials index (project đang active): `GET /api/materials/index`
- Outputs index (project đang active): `GET /api/outputs/index`
- Task batches index: `GET /api/tasks/batches/index` (tùy chọn: `?project=<project_id>`)
- Task batch details: `GET /api/tasks/batches/<batch_id>`
- Task batch activate: `POST /api/tasks/batches/<batch_id>/activate` (ghi `runtime/tasks/tasks.json` và `active_tasks.json` của project)
- Action Library: `GET /api/actions`, `GET /api/actions/<action_id>`, `POST /api/actions/<action_id>/copy`, `PUT /api/actions/<action_id>` (cập nhật copy-on-edit cho defaults)
- Pipeline (script chuẩn + JSON suy ra): `GET/POST /api/pipeline`
- Pipeline validate (chỉ preview): `POST /api/pipeline/validate`
- Preview/load reference writer pipeline:
  - `GET /api/pipeline/reference_writer` (đọc và parse `../scripts/auto-xiyouzhiyuan-writer.sh` làm tham chiếu)
  - `POST /api/pipeline/reference_writer/load` (nạp kết quả parse vào runtime pipeline; không bao giờ sửa script nguồn)
- Chat: `GET /api/chat/history`, `POST /api/chat/send`
- Latest novel PDF:
  - `GET /api/novel/latest` (metadata)
  - `GET /api/novel/latest/pdf` (luồng PDF inline cho viewer)
- Runner control: `POST /api/run/start|pause|resume|stop`, `GET /api/run/status`
- Agent test (có cổng): `POST /api/agent/test` (chỉ chạy `codex --version` khi được bật + qua cổng env)

### WebSocket

- Endpoint: `/ws`
- Sự kiện broadcast: `hello`, `chat`, `outbox_written`, `output_created`, `tasks_batch_created`, `tasks_batch_activated`, `action_created`, `action_updated`, `action_result_committed`, `run_status`, `task_status`, `log`, `pipeline_updated`, `project_active_changed`, `project_settings_updated`

## 📝 Output Runner (Bản nháp Stub)

Khi pipeline chứa block `STEP write`, backend runner sẽ tạo một file draft stub dưới:
- `autonovelwriter/runtime/projects/<project_id>/outputs/`

Backend cũng phát:
- sự kiện WS `output_created` với `path` và `project_rel_path`
- một dòng `log` `[output] created: ...`

PWA có panel Outputs tối giản, liệt kê file qua `GET /api/outputs/index` và làm mới khi có `output_created`.

## 📦 Task Runner (Batch Stub)

Khi pipeline chứa block `STEP meta_tasks_generate`, backend runner sẽ tạo một task batch stub dưới:
- `autonovelwriter/runtime/tasks/batches/<batch_id>/`

Backend phát:
- sự kiện WS `tasks_batch_created` với `batch_dir`, `tasks_jsonl`, và `task_count`
- một dòng `log` `[tasks] created batch: ...`

PWA có panel Task Batches tối giản, liệt kê batch qua `GET /api/tasks/batches/index` và làm mới khi có `tasks_batch_created`.
Nó cũng có thể hiển thị chi tiết batch (`GET /api/tasks/batches/<batch_id>`) và kích hoạt một batch để trở thành danh sách task hiện tại cho `FOREACH_TASK` (`POST /api/tasks/batches/<batch_id>/activate`).

## 🤖 Cài đặt Agent / Cổng Codex

Panel Settings của PWA lưu cài đặt agent qua `/api/settings` vào `autonovelwriter/runtime/state/settings.json`.

Vì an toàn, backend sẽ không spawn CLI `codex` trừ khi cả hai điều kiện đều đúng:
- `settings.agent.enabled=true` và `settings.agent.sdk="codex"`
- `AUTONOVELWRITER_ENABLE_CODEX=1` được đặt trong môi trường

Không bao giờ commit secrets. Dùng `autonovelwriter/backend/.env.example` làm mẫu cho biến môi trường cục bộ.

## 🌍 PWA I18N (Ngôn ngữ UI)

PWA có hệ thống i18n tích hợp nhẹ.

- Ép ngôn ngữ UI: thêm `?lang=<code>` vào URL PWA (ví dụ `?lang=ja`).
- Lưu theo từng trình duyệt trong localStorage: `anw_lang`.
- Ngôn ngữ UI hỗ trợ: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `vi`, `ar` (RTL), `fr`, `es`, `ru`, `de`.

## 📚 Cài đặt tiểu thuyết (Tách biệt với ngôn ngữ UI)

Tùy chọn viết tiểu thuyết được lưu trong cài đặt backend dưới `settings.novel.*` tại:
- `autonovelwriter/runtime/state/settings.json`

Các thiết lập này được tách **riêng** khỏi ngôn ngữ UI của PWA (`?lang=` / `anw_lang`).

Ghi đè theo project được lưu tại:
- `autonovelwriter/runtime/projects/<project_id>/state/project_settings.json`

Các trường hiện tại (có thể chỉnh trong modal Settings của PWA):
- `settings.novel.language` (mã gần chuẩn BCP-47 như `en`, `ja`, `zh-Hans`, v.v.)
- `settings.novel.tone`
- `settings.novel.target_length_words`
- `settings.novel.pov`
- `settings.novel.tense`
- `settings.novel.chapter_count_target`

Các trường ghi đè cấp project hiện tại (để trống/chưa đặt = kế thừa global):
- `project_settings.novel_language`
- `project_settings.novel_tone`
- `project_settings.novel_target_length_words`

## 💡 Ví dụ

### Chạy local tối thiểu

```bash
python3 autonovelwriter/backend/server.py --host 127.0.0.1 --port 8787
# sau đó mở http://127.0.0.1:8787/
```

### Chạy tmux không tự động attach

```bash
scripts/run_autonovelwriter_tmux.sh --no-attach
tmux attach -t autonovelwriter_app
```

### Chạy trực tiếp các file test backend

```bash
python3 autonovelwriter/backend/tests/pipeline_if_else_roundtrip_test.py
python3 autonovelwriter/backend/tests/runner_foreach_action_semantics_unit_test.py
```

### Chạy trực tiếp file test logic PWA

```bash
node autonovelwriter/pwa/tests/pipeline_ast_delete.test.js
```

### Ví dụ helper tự động hóa bằng script

```bash
bash examples/ralph-wiggum-example.sh
```

## 🛠️ Ghi chú phát triển

### Quy trình Driver (Auto-Dev)
<!-- AUTO_DEV_PROGRESS_START -->
### Auto-Dev Progress (Generated)
- updated_utc: 2026-02-16T02:48:02Z
- current: T032_project_settings_extend_novel_overrides / update_readme — Project settings: extend novel overrides (inherit)
- queue: total=32 done=31 pending=1
- last_done: T031_runner_foreach_action_semantics_and_var_scopes — Runner: FOREACH_ACTION semantics + var scopes @ 2026-02-16T10:35:36+0800
- latest_batch: references/autonovelwriter_dev/tasks/batches/batch_20260216_091332_b3
- autoappdev_head: 8bc23a5
<!-- AUTO_DEV_PROGRESS_END -->

`scripts/auto-autonovelwriter-development.sh` chạy vòng lặp Codex có thể tiếp tục trên các task trong `references/autonovelwriter_dev/` và **sẽ commit/push sau mỗi stage** (plan/implement/debug/fix/i18n/summary/update_readme).

Điều khiển hữu ích:
- Dừng sau task hiện tại: `touch references/autonovelwriter_dev/STOP`
- Reset theo dõi trạng thái (giữ nguyên queue): `scripts/auto-autonovelwriter-development.sh --reset-state`
- Bắt đầu phiên Codex mới: `scripts/auto-autonovelwriter-development.sh --new-session`
- Thực hành an toàn: chạy trên branch/worktree sạch và theo dõi `references/autonovelwriter_dev/state.tsv` trước khi chạy lại.

## 📚 Nội dung

- `docs/autonovelwriter_spec.md`: Đặc tả sản phẩm cho bộ điều khiển kiểu Scratch (chat + folder pipe + start/pause/stop + settings).
- `scripts/auto-autonovelwriter-development.sh`: Tự động phát triển chính ứng dụng AutoNovelWriter (vòng task: plan -> implement -> debug -> fix -> i18n -> summary -> update_readme -> commit+push).
- `docs/auto-development-guide.md`: Triết lý và yêu cầu song ngữ (EN/ZH) cho một tác nhân auto-development chạy lâu dài, có thể tiếp tục.
- `docs/ORDERING_RATIONALE.md`: Ví dụ lập luận cho thứ tự các bước dựa trên screenshot.
- `scripts-legacy/`: script tự động hóa cũ được giữ để tham khảo nhưng không dùng bởi AutoNovelWriter.
- `examples/ralph-wiggum-example.sh`: Ví dụ helper tự động hóa Codex CLI.

### Ghi chú thêm cho developer

- Test backend nằm trong `autonovelwriter/backend/tests/`.
- Một test hành vi PWA nhỏ nằm trong `autonovelwriter/pwa/tests/`.
- Thư mục `i18n/` ở root đã tồn tại nhưng hiện đang trống; bản dịch UI hiện đang được nhúng trong `autonovelwriter/pwa/app.js`.

## 🧯 Khắc phục sự cố

- `tmux not found in PATH`:
  - Cài tmux hoặc chạy thủ công backend/static server.
- `conda not found in PATH` khi dùng script `--env`:
  - Cài Miniconda/Anaconda, hoặc bỏ qua conda và dùng cài đặt `pip` thủ công.
- PWA không thể kết nối backend:
  - Kiểm tra địa chỉ/cổng backend và endpoint WebSocket `ws://<host>:<port>/ws`.
- `POST /api/agent/test` trả về gated/disabled:
  - Đảm bảo cả `settings.agent.enabled=true`, `settings.agent.sdk="codex"`, và môi trường `AUTONOVELWRITER_ENABLE_CODEX=1`.
- Pipeline runner dừng sau khi chỉnh sửa script:
  - Đây là hành vi mong đợi; con trỏ bị vô hiệu khi hash của pipeline script không khớp và cần khởi động lại.

## 🧭 Lộ trình

- Hoàn tất và ổn định các hạng mục còn lại trong hàng đợi auto-dev (xem khối tiến độ được tạo phía trên).
- Mở rộng tài nguyên i18n cấp repo bên ngoài dưới `i18n/` (đã có thư mục nhưng đang trống).
- Mở rộng phạm vi test tự động cho các trường hợp biên của runner và tương tác PWA.
- Tiếp tục cải thiện Action Library và quy trình lặp task/action.

## 🤝 Đóng góp

Rất hoan nghênh đóng góp.

Hướng dẫn thực dụng cho repo này:
- Bắt đầu từ `docs/autonovelwriter_spec.md` và `docs/auto-development-guide.md`.
- Giữ thay đổi runtime trong `autonovelwriter/runtime/` (gitignored), không lưu vào file được theo dõi.
- Ưu tiên PR tăng dần với lệnh chạy/test có thể tái tạo.
- Nếu thay đổi ngữ nghĩa pipeline hoặc hợp đồng API, hãy cập nhật README và test liên quan cùng lúc.

Lưu ý: chưa tìm thấy `CONTRIBUTING.md` chuyên biệt ở root repo tại thời điểm bản nháp này.

## ❤️ Tài trợ & Quyên góp

- GitHub Sponsors: https://github.com/sponsors/lachlanchen
- Donate: https://chat.lazying.art/donate
- PayPal: https://paypal.me/RongzhouChen
- Stripe: https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400

## 📄 Giấy phép

Trạng thái/tệp giấy phép chưa được khai báo rõ ràng tại root repo trong ngữ cảnh bản nháp này.

Ghi chú giả định:
- Nếu bạn muốn làm rõ khả năng phân phối lại mã nguồn mở, hãy thêm tệp `LICENSE` ở top-level và cập nhật lại phần này.
