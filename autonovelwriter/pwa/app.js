(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const REQUIRED_LANGS = [
    'en',
    'zh-Hans',
    'zh-Hant',
    'ja',
    'ko',
    'vi',
    'ar',
    'fr',
    'es',
    'ru',
    'de'
  ];

  const I18N = {
    en: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': 'Runner status',
      'run.idle': 'idle',
      'run.start': 'Start',
      'run.pause': 'Pause',
      'run.resume': 'Resume',
      'run.stop': 'Stop',
      'ui.settings': 'Settings',
      'ui.close': 'Close',
      'ui.save': 'Save',
      'ui.reset': 'Reset',
      'ui.pipeline': 'Pipeline',
      'pipeline.status_title': 'Pipeline persistence status',
      'pipeline.loading': 'loading',
      'pipeline.blocks': 'Blocks',
      'projects.title': 'Project',
      'projects.select': 'Select',
      'projects.selector_aria': 'Project selector',
      'materials.empty': '(no materials yet)',
      'outputs.title': 'Outputs',
      'outputs.empty': '(no outputs yet)',
      'outputs.created': 'Output created:',
      'tasks_batches.title': 'Task Batches',
      'tasks_batches.empty': '(no batches yet)',
      'tasks_batches.created': 'Batch created:',
      'tasks_batches.details': 'Details',
      'tasks_batches.details_title': 'View batch details',
      'tasks_batches.activate': 'Activate',
      'tasks_batches.activate_title': 'Activate this batch for FOREACH_TASK',
      'tasks_batches.active': 'Active',
      'tasks_batches.activated': 'Activated batch:',
      'pipeline.indent': 'Indent',
      'pipeline.outdent': 'Outdent',
      'pipeline.indent_title': 'Indent selected block (Tab)',
      'pipeline.outdent_title': 'Outdent selected block (Shift+Tab)',
      'pipeline.add_loop': 'Add LOOP',
      'pipeline.add_round': 'Add ROUND',
      'pipeline.add_foreach_task': 'Add FOREACH_TASK',
      'pipeline.add_foreach_action': 'Add FOREACH_ACTION',
      'pipeline.add_if': 'Add IF',
      'pipeline.add_loop_title': 'Add LOOP (wrap selected, or append)',
      'pipeline.add_round_title': 'Add ROUND (wrap selected, or append)',
      'pipeline.add_foreach_task_title': 'Add FOREACH_TASK (wrap selected, or append)',
      'pipeline.add_foreach_action_title': 'Add FOREACH_ACTION (wrap selected, or append)',
      'pipeline.add_if_title': 'Add IF (wrap selected, or append)',
      'pipeline.delete': 'Delete',
      'pipeline.delete_title': 'Delete selected block (Del)',
      'pipeline.script_canonical': 'Pipeline script (canonical)',
      'pipeline.json_derived': 'Pipeline JSON (derived)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': 'enabled',
      'pipeline.state_disabled': 'disabled',
      'pipeline.repeat_aria': 'Repeat count',
      'pipeline.repeat_title': 'Repeat count (1-10000)',
      'pipeline.repeat_err': 'Repeat must be 1-10000',
      'ui.chat': 'Chat',
      'ws.status_title': 'WebSocket status',
      'ws.disconnected': 'disconnected',
      'ui.backend': 'Backend:',
      'ws.set_url_title': 'Click to set WS URL',
      'ws.set_url_prompt': 'Set WebSocket URL (stored in this browser).',
      'chat.placeholder': 'Type a message (echoed over WS for now)…',
      'chat.send': 'Send',
      'ui.offline_shell': 'Offline shell enabled via Service Worker.',
      'settings.agent_sdk': 'Agent SDK',
      'settings.model': 'Model',
      'settings.vision_model': 'Vision model',
      'settings.codex_cli_path': 'Codex CLI path',
      'settings.enable_agent_runner': 'Enable agent runner (backend still requires env gate for Codex)',
      'settings.test_codex': 'Test Codex',
      'settings.test_codex_title': 'Runs a gated `codex --version` on backend',
      'settings.codex_gate_hint': 'Codex subprocess is disabled by default. To enable: set',
      'settings.codex_gate_hint_2': 'in your environment and set Agent SDK to',
      'settings.codex_gate_hint_3': 'with “Enable agent runner”.',
      'actions.action': 'Action',
      'actions.action_title': 'Action template',
      'actions.user_suffix': 'user',
      'actions.customize': 'Customize',
      'actions.customize_title': 'Copy default action to a user action and switch',
      'novel.section': 'Novel',
      'novel.language': 'Novel language',
      'novel.tone': 'Tone',
      'novel.tone_ph': 'neutral',
      'novel.target_words': 'Target length (words)',
      'novel.target_words_ph': '80000',
      'novel.pov': 'POV',
      'novel.pov_ph': 'third_limited',
      'novel.tense': 'Tense',
      'novel.tense_ph': 'past',
      'novel.chapters': 'Target chapters',
      'novel.chapters_ph': '12',
      'project.section': 'Project',
      'project.settings_title': 'Project settings',
      'project.active': 'Active project',
      'project.novel_language': 'Novel language (project)',
      'project.novel_language_title': 'Novel language override for this project (separate from UI language)',
      'project.novel_language_inherit': 'Use global default',
      'errors.backend_api_url': 'Cannot derive backend API URL'
    },
    'zh-Hans': {
      'app.title': 'AutoNovelWriter',
      'run.status_title': '运行状态',
      'run.idle': '空闲',
      'run.start': '开始',
      'run.pause': '暂停',
      'run.resume': '继续',
      'run.stop': '停止',
      'ui.settings': '设置',
      'ui.close': '关闭',
      'ui.save': '保存',
      'ui.reset': '重置',
      'ui.pipeline': '流水线',
      'pipeline.status_title': '流水线持久化状态',
      'pipeline.loading': '加载中',
      'pipeline.blocks': '积木块',
      'projects.title': '项目',
      'projects.select': '选择',
      'projects.selector_aria': '项目选择器',
      'materials.empty': '（暂无材料）',
      'outputs.title': '输出',
      'outputs.empty': '（暂无输出）',
      'outputs.created': '已生成输出：',
      'tasks_batches.title': '任务批次',
      'tasks_batches.empty': '（暂无批次）',
      'tasks_batches.created': '已生成批次：',
      'tasks_batches.details': '详情',
      'tasks_batches.details_title': '查看批次详情',
      'tasks_batches.activate': '启用',
      'tasks_batches.activate_title': '将此批次设为 FOREACH_TASK 的当前任务列表',
      'tasks_batches.active': '当前',
      'tasks_batches.activated': '已启用批次：',
      'pipeline.indent': '缩进',
      'pipeline.outdent': '取消缩进',
      'pipeline.indent_title': '缩进选中块 (Tab)',
      'pipeline.outdent_title': '取消缩进 (Shift+Tab)',
      'pipeline.add_loop': '添加 LOOP',
      'pipeline.add_round': '添加 ROUND',
      'pipeline.add_foreach_task': '添加 FOREACH_TASK',
      'pipeline.add_foreach_action': '添加 FOREACH_ACTION',
      'pipeline.add_if': '添加 IF',
      'pipeline.add_loop_title': '添加 LOOP（包裹选中块或追加）',
      'pipeline.add_round_title': '添加 ROUND（包裹选中块或追加）',
      'pipeline.add_foreach_task_title': '添加 FOREACH_TASK（包裹选中块或追加）',
      'pipeline.add_foreach_action_title': '添加 FOREACH_ACTION（包裹选中块或追加）',
      'pipeline.add_if_title': '添加 IF（包裹选中块或追加）',
      'pipeline.delete': '删除',
      'pipeline.delete_title': '删除选中块（Del）',
      'pipeline.script_canonical': '流水线脚本（规范）',
      'pipeline.json_derived': '流水线 JSON（派生）',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': '启用',
      'pipeline.state_disabled': '禁用',
      'pipeline.repeat_aria': '重复次数',
      'pipeline.repeat_title': '重复次数（1-10000）',
      'pipeline.repeat_err': '重复次数必须为 1-10000',
      'ui.chat': '聊天',
      'ws.status_title': 'WebSocket 状态',
      'ws.disconnected': '未连接',
      'ui.backend': '后端：',
      'ws.set_url_title': '点击设置 WS 地址',
      'ws.set_url_prompt': '设置 WebSocket 地址（保存在此浏览器）。',
      'chat.placeholder': '输入消息（暂时通过 WS 回显）…',
      'chat.send': '发送',
      'ui.offline_shell': '已启用离线壳（Service Worker）。',
      'settings.agent_sdk': 'Agent SDK',
      'settings.model': '模型',
      'settings.vision_model': '视觉模型',
      'settings.codex_cli_path': 'Codex CLI 路径',
      'settings.enable_agent_runner': '启用代理运行器（后端仍需 Codex 环境开关）',
      'settings.test_codex': '测试 Codex',
      'settings.test_codex_title': '在后端运行受控的 `codex --version`',
      'settings.codex_gate_hint': 'Codex 子进程默认禁用。启用：设置',
      'settings.codex_gate_hint_2': '并将 Agent SDK 设为',
      'settings.codex_gate_hint_3': '且勾选“启用代理运行器”。',
      'actions.action': '动作',
      'actions.action_title': '动作模板',
      'actions.user_suffix': '用户',
      'actions.customize': '自定义',
      'actions.customize_title': '复制默认动作为用户动作并切换',
      'novel.section': '小说',
      'novel.language': '小说语言',
      'novel.tone': '风格',
      'novel.tone_ph': '中性',
      'novel.target_words': '目标字数',
      'novel.target_words_ph': '80000',
      'novel.pov': '视角',
      'novel.pov_ph': '第三人称有限',
      'novel.tense': '时态',
      'novel.tense_ph': '过去时',
      'novel.chapters': '目标章节数',
      'novel.chapters_ph': '12',
      'project.section': '项目',
      'project.settings_title': '项目设置',
      'project.active': '当前项目',
      'project.novel_language': '小说语言（项目）',
      'project.novel_language_title': '此项目的小说语言覆盖（与界面语言分离）',
      'project.novel_language_inherit': '使用全局默认',
      'errors.backend_api_url': '无法推导后端 API 地址'
    },
    'zh-Hant': {
      'app.title': 'AutoNovelWriter',
      'run.status_title': '執行狀態',
      'run.idle': '閒置',
      'run.start': '開始',
      'run.pause': '暫停',
      'run.resume': '繼續',
      'run.stop': '停止',
      'ui.settings': '設定',
      'ui.close': '關閉',
      'ui.save': '儲存',
      'ui.reset': '重設',
      'ui.pipeline': '流程',
      'pipeline.status_title': '流程保存狀態',
      'pipeline.loading': '載入中',
      'pipeline.blocks': '積木',
      'projects.title': '專案',
      'projects.select': '選擇',
      'projects.selector_aria': '專案選擇器',
      'materials.empty': '（尚無素材）',
      'outputs.title': '輸出',
      'outputs.empty': '（尚無輸出）',
      'outputs.created': '已產生輸出：',
      'tasks_batches.title': '任務批次',
      'tasks_batches.empty': '（尚無批次）',
      'tasks_batches.created': '已產生批次：',
      'tasks_batches.details': '詳細',
      'tasks_batches.details_title': '檢視批次詳細資訊',
      'tasks_batches.activate': '啟用',
      'tasks_batches.activate_title': '將此批次設為 FOREACH_TASK 的目前任務清單',
      'tasks_batches.active': '目前',
      'tasks_batches.activated': '已啟用批次：',
      'pipeline.indent': '縮排',
      'pipeline.outdent': '取消縮排',
      'pipeline.indent_title': '縮排所選區塊 (Tab)',
      'pipeline.outdent_title': '取消縮排 (Shift+Tab)',
      'pipeline.add_loop': '新增 LOOP',
      'pipeline.add_round': '新增 ROUND',
      'pipeline.add_foreach_task': '新增 FOREACH_TASK',
      'pipeline.add_foreach_action': '新增 FOREACH_ACTION',
      'pipeline.add_if': '新增 IF',
      'pipeline.add_loop_title': '新增 LOOP（包住所選區塊或加到末尾）',
      'pipeline.add_round_title': '新增 ROUND（包住所選區塊或加到末尾）',
      'pipeline.add_foreach_task_title': '新增 FOREACH_TASK（包住所選區塊或加到末尾）',
      'pipeline.add_foreach_action_title': '新增 FOREACH_ACTION（包住所選區塊或加到末尾）',
      'pipeline.add_if_title': '新增 IF（包住所選區塊或加到末尾）',
      'pipeline.delete': '刪除',
      'pipeline.delete_title': '刪除所選區塊（Del）',
      'pipeline.script_canonical': '流程腳本（規範）',
      'pipeline.json_derived': '流程 JSON（衍生）',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': '啟用',
      'pipeline.state_disabled': '停用',
      'pipeline.repeat_aria': '重複次數',
      'pipeline.repeat_title': '重複次數（1-10000）',
      'pipeline.repeat_err': '重複次數必須為 1-10000',
      'ui.chat': '聊天',
      'ws.status_title': 'WebSocket 狀態',
      'ws.disconnected': '未連線',
      'ui.backend': '後端：',
      'ws.set_url_title': '點擊設定 WS 位址',
      'ws.set_url_prompt': '設定 WebSocket 位址（儲存在此瀏覽器）。',
      'chat.placeholder': '輸入訊息（目前透過 WS 回顯）…',
      'chat.send': '送出',
      'ui.offline_shell': '已啟用離線殼（Service Worker）。',
      'settings.agent_sdk': 'Agent SDK',
      'settings.model': '模型',
      'settings.vision_model': '視覺模型',
      'settings.codex_cli_path': 'Codex CLI 路徑',
      'settings.enable_agent_runner': '啟用代理執行器（後端仍需 Codex 環境開關）',
      'settings.test_codex': '測試 Codex',
      'settings.test_codex_title': '在後端執行受控的 `codex --version`',
      'settings.codex_gate_hint': 'Codex 子程序預設停用。啟用：設定',
      'settings.codex_gate_hint_2': '並將 Agent SDK 設為',
      'settings.codex_gate_hint_3': '並勾選「啟用代理執行器」。',
      'actions.action': '動作',
      'actions.action_title': '動作範本',
      'actions.user_suffix': '使用者',
      'actions.customize': '自訂',
      'actions.customize_title': '將預設動作複製為使用者動作並切換',
      'novel.section': '小說',
      'novel.language': '小說語言',
      'novel.tone': '風格',
      'novel.tone_ph': '中性',
      'novel.target_words': '目標字數',
      'novel.target_words_ph': '80000',
      'novel.pov': '視角',
      'novel.pov_ph': '第三人稱有限',
      'novel.tense': '時態',
      'novel.tense_ph': '過去式',
      'novel.chapters': '目標章節數',
      'novel.chapters_ph': '12',
      'project.section': '專案',
      'project.settings_title': '專案設定',
      'project.active': '目前專案',
      'project.novel_language': '小說語言（專案）',
      'project.novel_language_title': '此專案的小說語言覆寫（與介面語言分離）',
      'project.novel_language_inherit': '使用全域預設',
      'errors.backend_api_url': '無法推導後端 API 位址'
    },
    ja: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': '実行状態',
      'run.idle': '待機',
      'run.start': '開始',
      'run.pause': '一時停止',
      'run.resume': '再開',
      'run.stop': '停止',
      'ui.settings': '設定',
      'ui.close': '閉じる',
      'ui.save': '保存',
      'ui.reset': 'リセット',
      'ui.pipeline': 'パイプライン',
      'pipeline.status_title': 'パイプライン保存状態',
      'pipeline.loading': '読み込み中',
      'pipeline.blocks': 'ブロック',
      'projects.title': 'プロジェクト',
      'projects.select': '選択',
      'projects.selector_aria': 'プロジェクト選択',
      'materials.empty': '（素材なし）',
      'outputs.title': '出力',
      'outputs.empty': '（出力なし）',
      'outputs.created': '出力を作成:',
      'tasks_batches.title': 'タスクバッチ',
      'tasks_batches.empty': '（バッチなし）',
      'tasks_batches.created': 'バッチ作成:',
      'tasks_batches.details': '詳細',
      'tasks_batches.details_title': 'バッチ詳細を表示',
      'tasks_batches.activate': '有効化',
      'tasks_batches.activate_title': 'このバッチを FOREACH_TASK のタスクにする',
      'tasks_batches.active': '有効',
      'tasks_batches.activated': '有効化したバッチ:',
      'pipeline.indent': 'インデント',
      'pipeline.outdent': 'アウトデント',
      'pipeline.indent_title': '選択ブロックをインデント (Tab)',
      'pipeline.outdent_title': 'アウトデント (Shift+Tab)',
      'pipeline.add_loop': 'LOOP を追加',
      'pipeline.add_round': 'ROUND を追加',
      'pipeline.add_foreach_task': 'FOREACH_TASK を追加',
      'pipeline.add_foreach_action': 'FOREACH_ACTION を追加',
      'pipeline.add_if': 'IF を追加',
      'pipeline.add_loop_title': 'LOOP を追加（選択を包む/末尾に追加）',
      'pipeline.add_round_title': 'ROUND を追加（選択を包む/末尾に追加）',
      'pipeline.add_foreach_task_title': 'FOREACH_TASK を追加（選択を包む/末尾に追加）',
      'pipeline.add_foreach_action_title': 'FOREACH_ACTION を追加（選択を包む/末尾に追加）',
      'pipeline.add_if_title': 'IF を追加（選択を包む/末尾に追加）',
      'pipeline.delete': '削除',
      'pipeline.delete_title': '選択ブロックを削除（Del）',
      'pipeline.script_canonical': 'パイプラインスクリプト（正）',
      'pipeline.json_derived': 'パイプライン JSON（派生）',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': '有効',
      'pipeline.state_disabled': '無効',
      'pipeline.repeat_aria': '繰り返し回数',
      'pipeline.repeat_title': '繰り返し回数（1-10000）',
      'pipeline.repeat_err': '繰り返し回数は 1-10000 です',
      'ui.chat': 'チャット',
      'ws.status_title': 'WebSocket 状態',
      'ws.disconnected': '未接続',
      'ui.backend': 'バックエンド:',
      'ws.set_url_title': 'クリックして WS URL を設定',
      'ws.set_url_prompt': 'WebSocket URL を設定（このブラウザに保存）。',
      'chat.placeholder': 'メッセージを入力（現状 WS でエコー）…',
      'chat.send': '送信',
      'ui.offline_shell': 'Service Worker によりオフラインシェル有効。',
      'settings.agent_sdk': 'Agent SDK',
      'settings.model': 'モデル',
      'settings.vision_model': 'ビジョンモデル',
      'settings.codex_cli_path': 'Codex CLI パス',
      'settings.enable_agent_runner': 'エージェント実行を有効化（Codex は環境ゲートが必要）',
      'settings.test_codex': 'Codex をテスト',
      'settings.test_codex_title': 'バックエンドで `codex --version`（ゲート有）を実行',
      'settings.codex_gate_hint': 'Codex サブプロセスは既定で無効。有効化：',
      'settings.codex_gate_hint_2': 'を環境に設定し、Agent SDK を',
      'settings.codex_gate_hint_3': 'にして「エージェント実行を有効化」。',
      'actions.action': 'アクション',
      'actions.action_title': 'アクションテンプレート',
      'actions.user_suffix': 'ユーザー',
      'actions.customize': 'カスタマイズ',
      'actions.customize_title': '既定アクションをユーザー用にコピーして切り替え',
      'novel.section': '小説',
      'novel.language': '小説の言語',
      'novel.tone': 'トーン',
      'novel.tone_ph': 'ニュートラル',
      'novel.target_words': '目標語数',
      'novel.target_words_ph': '80000',
      'novel.pov': '視点',
      'novel.pov_ph': '三人称（限定）',
      'novel.tense': '時制',
      'novel.tense_ph': '過去',
      'novel.chapters': '目標章数',
      'novel.chapters_ph': '12',
      'project.section': 'プロジェクト',
      'project.settings_title': 'プロジェクト設定',
      'project.active': '現在のプロジェクト',
      'project.novel_language': '小説の言語（プロジェクト）',
      'project.novel_language_title': 'このプロジェクトの小説言語の上書き（UI言語とは別）',
      'project.novel_language_inherit': 'グローバル既定を使用',
      'errors.backend_api_url': 'バックエンド API URL を取得できません'
    },
    ko: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': '실행 상태',
      'run.idle': '대기',
      'run.start': '시작',
      'run.pause': '일시정지',
      'run.resume': '재개',
      'run.stop': '중지',
      'ui.settings': '설정',
      'ui.close': '닫기',
      'ui.save': '저장',
      'ui.reset': '초기화',
      'ui.pipeline': '파이프라인',
      'pipeline.status_title': '파이프라인 저장 상태',
      'pipeline.loading': '로딩 중',
      'pipeline.blocks': '블록',
      'projects.title': '프로젝트',
      'projects.select': '선택',
      'projects.selector_aria': '프로젝트 선택',
      'materials.empty': '(자료 없음)',
      'outputs.title': '출력',
      'outputs.empty': '(출력 없음)',
      'outputs.created': '출력 생성:',
      'tasks_batches.title': '작업 배치',
      'tasks_batches.empty': '(배치 없음)',
      'tasks_batches.created': '배치 생성:',
      'tasks_batches.details': '상세',
      'tasks_batches.details_title': '배치 상세 보기',
      'tasks_batches.activate': '활성화',
      'tasks_batches.activate_title': '이 배치를 FOREACH_TASK의 작업 목록으로 설정',
      'tasks_batches.active': '활성',
      'tasks_batches.activated': '활성화된 배치:',
      'pipeline.indent': '들여쓰기',
      'pipeline.outdent': '내어쓰기',
      'pipeline.indent_title': '선택 블록 들여쓰기 (Tab)',
      'pipeline.outdent_title': '내어쓰기 (Shift+Tab)',
      'pipeline.add_loop': 'LOOP 추가',
      'pipeline.add_round': 'ROUND 추가',
      'pipeline.add_foreach_task': 'FOREACH_TASK 추가',
      'pipeline.add_foreach_action': 'FOREACH_ACTION 추가',
      'pipeline.add_if': 'IF 추가',
      'pipeline.add_loop_title': 'LOOP 추가(선택 감싸기/끝에 추가)',
      'pipeline.add_round_title': 'ROUND 추가(선택 감싸기/끝에 추가)',
      'pipeline.add_foreach_task_title': 'FOREACH_TASK 추가(선택 감싸기/끝에 추가)',
      'pipeline.add_foreach_action_title': 'FOREACH_ACTION 추가(선택 감싸기/끝에 추가)',
      'pipeline.add_if_title': 'IF 추가(선택 감싸기/끝에 추가)',
      'pipeline.delete': '삭제',
      'pipeline.delete_title': '선택 블록 삭제(Del)',
      'pipeline.script_canonical': '파이프라인 스크립트(원본)',
      'pipeline.json_derived': '파이프라인 JSON(파생)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': '사용',
      'pipeline.state_disabled': '사용 안 함',
      'pipeline.repeat_aria': '반복 횟수',
      'pipeline.repeat_title': '반복 횟수 (1-10000)',
      'pipeline.repeat_err': '반복 횟수는 1-10000이어야 합니다',
      'ui.chat': '채팅',
      'ws.status_title': 'WebSocket 상태',
      'ws.disconnected': '연결 끊김',
      'ui.backend': '백엔드:',
      'ws.set_url_title': '클릭하여 WS URL 설정',
      'ws.set_url_prompt': 'WebSocket URL 설정(이 브라우저에 저장).',
      'chat.placeholder': '메시지 입력(현재 WS로 에코)…',
      'chat.send': '전송',
      'ui.offline_shell': 'Service Worker로 오프라인 셸 활성화.',
      'settings.agent_sdk': 'Agent SDK',
      'settings.model': '모델',
      'settings.vision_model': '비전 모델',
      'settings.codex_cli_path': 'Codex CLI 경로',
      'settings.enable_agent_runner': '에이전트 실행 활성화(백엔드는 Codex 환경 게이트 필요)',
      'settings.test_codex': 'Codex 테스트',
      'settings.test_codex_title': '백엔드에서 게이트된 `codex --version` 실행',
      'settings.codex_gate_hint': 'Codex 서브프로세스는 기본 비활성. 활성화:',
      'settings.codex_gate_hint_2': '을 설정하고 Agent SDK를',
      'settings.codex_gate_hint_3': '로 설정 후 “에이전트 실행 활성화”.',
      'actions.action': '액션',
      'actions.action_title': '액션 템플릿',
      'actions.user_suffix': '사용자',
      'actions.customize': '사용자화',
      'actions.customize_title': '기본 액션을 사용자 액션으로 복사 후 전환',
      'novel.section': '소설',
      'novel.language': '소설 언어',
      'novel.tone': '톤',
      'novel.tone_ph': '중립',
      'novel.target_words': '목표 분량(단어)',
      'novel.target_words_ph': '80000',
      'novel.pov': '시점',
      'novel.pov_ph': '3인칭 제한',
      'novel.tense': '시제',
      'novel.tense_ph': '과거',
      'novel.chapters': '목표 장 수',
      'novel.chapters_ph': '12',
      'project.section': '프로젝트',
      'project.settings_title': '프로젝트 설정',
      'project.active': '현재 프로젝트',
      'project.novel_language': '소설 언어(프로젝트)',
      'project.novel_language_title': '이 프로젝트의 소설 언어 오버라이드(UI 언어와 분리)',
      'project.novel_language_inherit': '전역 기본값 사용',
      'errors.backend_api_url': '백엔드 API URL을 가져올 수 없습니다'
    },
    vi: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': 'Trang thai chay',
      'run.idle': 'nhan roi',
      'run.start': 'Bat dau',
      'run.pause': 'Tam dung',
      'run.resume': 'Tiep tuc',
      'run.stop': 'Dung',
      'ui.settings': 'Cai dat',
      'ui.close': 'Dong',
      'ui.save': 'Luu',
      'ui.reset': 'Dat lai',
      'ui.pipeline': 'Pipeline',
      'pipeline.status_title': 'Trang thai luu pipeline',
      'pipeline.loading': 'dang tai',
      'pipeline.blocks': 'Khoi',
      'projects.title': 'Du an',
      'projects.select': 'Chon',
      'projects.selector_aria': 'Bo chon du an',
      'materials.empty': '(chua co tai lieu)',
      'outputs.title': 'Dau ra',
      'outputs.empty': '(chua co dau ra)',
      'outputs.created': 'Da tao dau ra:',
      'tasks_batches.title': 'Lo batch',
      'tasks_batches.empty': '(chua co batch)',
      'tasks_batches.created': 'Da tao batch:',
      'tasks_batches.details': 'Chi tiet',
      'tasks_batches.details_title': 'Xem chi tiet batch',
      'tasks_batches.activate': 'Kich hoat',
      'tasks_batches.activate_title': 'Dat batch nay lam danh sach tac vu cho FOREACH_TASK',
      'tasks_batches.active': 'Dang dung',
      'tasks_batches.activated': 'Da kich hoat batch:',
      'pipeline.indent': 'Thut vao',
      'pipeline.outdent': 'Thut ra',
      'pipeline.indent_title': 'Thut vao khoi da chon (Tab)',
      'pipeline.outdent_title': 'Thut ra (Shift+Tab)',
      'pipeline.add_loop': 'Them LOOP',
      'pipeline.add_round': 'Them ROUND',
      'pipeline.add_foreach_task': 'Them FOREACH_TASK',
      'pipeline.add_foreach_action': 'Them FOREACH_ACTION',
      'pipeline.add_if': 'Them IF',
      'pipeline.add_loop_title': 'Them LOOP (bao boc chon / them cuoi)',
      'pipeline.add_round_title': 'Them ROUND (bao boc chon / them cuoi)',
      'pipeline.add_foreach_task_title': 'Them FOREACH_TASK (bao boc chon / them cuoi)',
      'pipeline.add_foreach_action_title': 'Them FOREACH_ACTION (bao boc chon / them cuoi)',
      'pipeline.add_if_title': 'Them IF (bao boc chon / them cuoi)',
      'pipeline.delete': 'Xoa',
      'pipeline.delete_title': 'Xoa khoi da chon (Del)',
      'pipeline.script_canonical': 'Script pipeline (chuan)',
      'pipeline.json_derived': 'Pipeline JSON (suy ra)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': 'bat',
      'pipeline.state_disabled': 'tat',
      'pipeline.repeat_aria': 'So lan lap',
      'pipeline.repeat_title': 'So lan lap (1-10000)',
      'pipeline.repeat_err': 'So lan lap phai tu 1-10000',
      'ui.chat': 'Chat',
      'ws.status_title': 'Trang thai WebSocket',
      'ws.disconnected': 'mat ket noi',
      'ui.backend': 'Backend:',
      'ws.set_url_title': 'Bam de dat WS URL',
      'ws.set_url_prompt': 'Dat WebSocket URL (luu trong trinh duyet nay).',
      'chat.placeholder': 'Nhap tin nhan (tam thoi echo qua WS)…',
      'chat.send': 'Gui',
      'ui.offline_shell': 'Offline shell duoc bat qua Service Worker.',
      'settings.agent_sdk': 'Agent SDK',
      'settings.model': 'Model',
      'settings.vision_model': 'Vision model',
      'settings.codex_cli_path': 'Duong dan Codex CLI',
      'settings.enable_agent_runner': 'Bat agent runner (backend van can gate Codex)',
      'settings.test_codex': 'Test Codex',
      'settings.test_codex_title': 'Chay `codex --version` co gate tren backend',
      'settings.codex_gate_hint': 'Codex subprocess mac dinh tat. De bat:',
      'settings.codex_gate_hint_2': 'trong moi truong va dat Agent SDK =',
      'settings.codex_gate_hint_3': 'va chon “Bat agent runner”.',
      'actions.action': 'Hanh dong',
      'actions.action_title': 'Mau hanh dong',
      'actions.user_suffix': 'nguoi dung',
      'actions.customize': 'Tuy chinh',
      'actions.customize_title': 'Sao chep mau mac dinh sang mau nguoi dung va chuyen doi',
      'novel.section': 'Tieu thuyet',
      'novel.language': 'Ngon ngu tieu thuyet',
      'novel.tone': 'Giong dieu',
      'novel.tone_ph': 'trung tinh',
      'novel.target_words': 'Do dai muc tieu (tu)',
      'novel.target_words_ph': '80000',
      'novel.pov': 'Goc nhin',
      'novel.pov_ph': 'ngoi thu ba gioi han',
      'novel.tense': 'Thi',
      'novel.tense_ph': 'qua khu',
      'novel.chapters': 'So chuong muc tieu',
      'novel.chapters_ph': '12',
      'project.section': 'Du an',
      'project.settings_title': 'Cai dat du an',
      'project.active': 'Du an dang chon',
      'project.novel_language': 'Ngon ngu tieu thuyet (du an)',
      'project.novel_language_title': 'Ghi de ngon ngu tieu thuyet cho du an nay (tach voi ngon ngu UI)',
      'project.novel_language_inherit': 'Dung mac dinh toan cuc',
      'errors.backend_api_url': 'Khong lay duoc URL API backend'
    },
    ar: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': 'حالة التشغيل',
      'run.idle': 'خامل',
      'run.start': 'ابدأ',
      'run.pause': 'إيقاف مؤقت',
      'run.resume': 'استئناف',
      'run.stop': 'إيقاف',
      'ui.settings': 'الإعدادات',
      'ui.close': 'إغلاق',
      'ui.save': 'حفظ',
      'ui.reset': 'إعادة ضبط',
      'ui.pipeline': 'خط الأنابيب',
      'pipeline.status_title': 'حالة حفظ خط الأنابيب',
      'pipeline.loading': 'جارٍ التحميل',
      'pipeline.blocks': 'الكتل',
      'projects.title': 'المشروع',
      'projects.select': 'اختيار',
      'projects.selector_aria': 'محدد المشروع',
      'materials.empty': '(لا توجد مواد بعد)',
      'outputs.title': 'المخرجات',
      'outputs.empty': '(لا توجد مخرجات بعد)',
      'outputs.created': 'تم إنشاء مخرج:',
      'tasks_batches.title': 'دفعات المهام',
      'tasks_batches.empty': '(لا توجد دفعات بعد)',
      'tasks_batches.created': 'تم إنشاء دفعة:',
      'tasks_batches.details': 'تفاصيل',
      'tasks_batches.details_title': 'عرض تفاصيل الدفعة',
      'tasks_batches.activate': 'تفعيل',
      'tasks_batches.activate_title': 'تفعيل هذه الدفعة لـ FOREACH_TASK',
      'tasks_batches.active': 'مفعّل',
      'tasks_batches.activated': 'تم تفعيل الدفعة:',
      'pipeline.indent': 'إزاحة للداخل',
      'pipeline.outdent': 'إزاحة للخارج',
      'pipeline.indent_title': 'إزاحة الكتلة المحددة (Tab)',
      'pipeline.outdent_title': 'إزاحة للخارج (Shift+Tab)',
      'pipeline.add_loop': 'إضافة LOOP',
      'pipeline.add_round': 'إضافة ROUND',
      'pipeline.add_foreach_task': 'إضافة FOREACH_TASK',
      'pipeline.add_foreach_action': 'إضافة FOREACH_ACTION',
      'pipeline.add_if': 'إضافة IF',
      'pipeline.add_loop_title': 'إضافة LOOP (تغليف المحدد أو الإلحاق)',
      'pipeline.add_round_title': 'إضافة ROUND (تغليف المحدد أو الإلحاق)',
      'pipeline.add_foreach_task_title': 'إضافة FOREACH_TASK (تغليف المحدد أو الإلحاق)',
      'pipeline.add_foreach_action_title': 'إضافة FOREACH_ACTION (تغليف المحدد أو الإلحاق)',
      'pipeline.add_if_title': 'إضافة IF (تغليف المحدد أو الإلحاق)',
      'pipeline.delete': 'حذف',
      'pipeline.delete_title': 'حذف الكتلة المحددة (Del)',
      'pipeline.script_canonical': 'نص خط الأنابيب (مرجعي)',
      'pipeline.json_derived': 'JSON لخط الأنابيب (مشتق)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': 'مفعل',
      'pipeline.state_disabled': 'معطل',
      'pipeline.repeat_aria': 'عدد التكرار',
      'pipeline.repeat_title': 'عدد التكرار (1-10000)',
      'pipeline.repeat_err': 'يجب أن يكون التكرار بين 1 و10000',
      'ui.chat': 'الدردشة',
      'ws.status_title': 'حالة WebSocket',
      'ws.disconnected': 'غير متصل',
      'ui.backend': 'الخادم:',
      'ws.set_url_title': 'انقر لتعيين عنوان WS',
      'ws.set_url_prompt': 'عيّن عنوان WebSocket (يُحفظ في هذا المتصفح).',
      'chat.placeholder': 'اكتب رسالة (تُعرض عبر WS حالياً)…',
      'chat.send': 'إرسال',
      'ui.offline_shell': 'تم تفعيل واجهة العمل دون اتصال عبر Service Worker.',
      'settings.agent_sdk': 'حزمة الوكيل',
      'settings.model': 'النموذج',
      'settings.vision_model': 'نموذج الرؤية',
      'settings.codex_cli_path': 'مسار Codex CLI',
      'settings.enable_agent_runner': 'تمكين تشغيل الوكيل (يتطلب الخادم بوابة Codex)',
      'settings.test_codex': 'اختبار Codex',
      'settings.test_codex_title': 'تشغيل `codex --version` (مقيّد) على الخادم',
      'settings.codex_gate_hint': 'تشغيل Codex معطّل افتراضياً. للتمكين: عيّن',
      'settings.codex_gate_hint_2': 'في البيئة واختر Agent SDK =',
      'settings.codex_gate_hint_3': 'مع “تمكين تشغيل الوكيل”.',
      'actions.action': 'إجراء',
      'actions.action_title': 'قالب الإجراء',
      'actions.user_suffix': 'مستخدم',
      'actions.customize': 'تخصيص',
      'actions.customize_title': 'نسخ الإجراء الافتراضي إلى إجراء مستخدم والتبديل',
      'novel.section': 'الرواية',
      'novel.language': 'لغة الرواية',
      'novel.tone': 'النبرة',
      'novel.tone_ph': 'محايد',
      'novel.target_words': 'الطول المستهدف (كلمات)',
      'novel.target_words_ph': '80000',
      'novel.pov': 'وجهة النظر',
      'novel.pov_ph': 'شخص ثالث محدود',
      'novel.tense': 'الزمن',
      'novel.tense_ph': 'ماضٍ',
      'novel.chapters': 'الفصول المستهدفة',
      'novel.chapters_ph': '12',
      'project.section': 'المشروع',
      'project.settings_title': 'إعدادات المشروع',
      'project.active': 'المشروع النشط',
      'project.novel_language': 'لغة الرواية (للمشروع)',
      'project.novel_language_title': 'تجاوز لغة الرواية لهذا المشروع (منفصل عن لغة الواجهة)',
      'project.novel_language_inherit': 'استخدم الإعداد العام',
      'errors.backend_api_url': 'تعذر تحديد عنوان API للخادم'
    },
    fr: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': 'Statut du runner',
      'run.idle': 'inactif',
      'run.start': 'Démarrer',
      'run.pause': 'Pause',
      'run.resume': 'Reprendre',
      'run.stop': 'Arrêter',
      'ui.settings': 'Paramètres',
      'ui.close': 'Fermer',
      'ui.save': 'Enregistrer',
      'ui.reset': 'Réinitialiser',
      'ui.pipeline': 'Pipeline',
      'pipeline.status_title': 'Statut de persistance du pipeline',
      'pipeline.loading': 'chargement',
      'pipeline.blocks': 'Blocs',
      'projects.title': 'Projet',
      'projects.select': 'Choisir',
      'projects.selector_aria': 'Sélecteur de projet',
      'materials.empty': '(aucun document)',
      'outputs.title': 'Sorties',
      'outputs.empty': '(aucune sortie)',
      'outputs.created': 'Sortie créée :',
      'tasks_batches.title': 'Lots de tâches',
      'tasks_batches.empty': '(aucun lot)',
      'tasks_batches.created': 'Lot créé :',
      'tasks_batches.details': 'Détails',
      'tasks_batches.details_title': 'Voir les détails du lot',
      'tasks_batches.activate': 'Activer',
      'tasks_batches.activate_title': 'Activer ce lot pour FOREACH_TASK',
      'tasks_batches.active': 'Actif',
      'tasks_batches.activated': 'Lot activé :',
      'pipeline.indent': 'Indenter',
      'pipeline.outdent': 'Désindenter',
      'pipeline.indent_title': 'Indenter le bloc sélectionné (Tab)',
      'pipeline.outdent_title': 'Désindenter (Shift+Tab)',
      'pipeline.add_loop': 'Ajouter LOOP',
      'pipeline.add_round': 'Ajouter ROUND',
      'pipeline.add_foreach_task': 'Ajouter FOREACH_TASK',
      'pipeline.add_foreach_action': 'Ajouter FOREACH_ACTION',
      'pipeline.add_if': 'Ajouter IF',
      'pipeline.add_loop_title': 'Ajouter LOOP (englober la sélection ou ajouter)',
      'pipeline.add_round_title': 'Ajouter ROUND (englober la sélection ou ajouter)',
      'pipeline.add_foreach_task_title': 'Ajouter FOREACH_TASK (englober la sélection ou ajouter)',
      'pipeline.add_foreach_action_title': 'Ajouter FOREACH_ACTION (englober la sélection ou ajouter)',
      'pipeline.add_if_title': 'Ajouter IF (englober la sélection ou ajouter)',
      'pipeline.delete': 'Supprimer',
      'pipeline.delete_title': 'Supprimer le bloc sélectionné (Suppr)',
      'pipeline.script_canonical': 'Script du pipeline (canonique)',
      'pipeline.json_derived': 'JSON du pipeline (dérivé)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': 'actif',
      'pipeline.state_disabled': 'inactif',
      'pipeline.repeat_aria': 'Nombre de répétitions',
      'pipeline.repeat_title': 'Nombre de répétitions (1-10000)',
      'pipeline.repeat_err': 'Doit être 1-10000',
      'ui.chat': 'Chat',
      'ws.status_title': 'Statut WebSocket',
      'ws.disconnected': 'déconnecté',
      'ui.backend': 'Backend :',
      'ws.set_url_title': 'Cliquer pour définir l’URL WS',
      'ws.set_url_prompt': 'Définir l’URL WebSocket (enregistrée dans ce navigateur).',
      'chat.placeholder': 'Écrire un message (écho via WS pour l’instant)…',
      'chat.send': 'Envoyer',
      'ui.offline_shell': 'Shell hors ligne activé via Service Worker.',
      'settings.agent_sdk': 'SDK agent',
      'settings.model': 'Modèle',
      'settings.vision_model': 'Modèle vision',
      'settings.codex_cli_path': 'Chemin Codex CLI',
      'settings.enable_agent_runner': 'Activer le runner agent (gate Codex côté backend requis)',
      'settings.test_codex': 'Tester Codex',
      'settings.test_codex_title': 'Exécute `codex --version` (protégé) sur le backend',
      'settings.codex_gate_hint': 'Le sous-processus Codex est désactivé par défaut. Pour activer : définir',
      'settings.codex_gate_hint_2': 'dans l’environnement et choisir Agent SDK =',
      'settings.codex_gate_hint_3': 'avec « Activer le runner agent ».',
      'actions.action': 'Action',
      'actions.action_title': 'Modèle d’action',
      'actions.user_suffix': 'utilisateur',
      'actions.customize': 'Personnaliser',
      'actions.customize_title': 'Copier l’action par défaut en action utilisateur et basculer',
      'novel.section': 'Roman',
      'novel.language': 'Langue du roman',
      'novel.tone': 'Ton',
      'novel.tone_ph': 'neutre',
      'novel.target_words': 'Longueur cible (mots)',
      'novel.target_words_ph': '80000',
      'novel.pov': 'Point de vue',
      'novel.pov_ph': 'troisième limité',
      'novel.tense': 'Temps',
      'novel.tense_ph': 'passé',
      'novel.chapters': 'Chapitres cibles',
      'novel.chapters_ph': '12',
      'project.section': 'Projet',
      'project.settings_title': 'Paramètres du projet',
      'project.active': 'Projet actif',
      'project.novel_language': 'Langue du roman (projet)',
      'project.novel_language_title': 'Surcharge de langue du roman pour ce projet (séparée de la langue UI)',
      'project.novel_language_inherit': 'Utiliser le défaut global',
      'errors.backend_api_url': "Impossible de déterminer l'URL de l'API backend"
    },
    es: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': 'Estado del runner',
      'run.idle': 'inactivo',
      'run.start': 'Iniciar',
      'run.pause': 'Pausar',
      'run.resume': 'Reanudar',
      'run.stop': 'Detener',
      'ui.settings': 'Ajustes',
      'ui.close': 'Cerrar',
      'ui.save': 'Guardar',
      'ui.reset': 'Restablecer',
      'ui.pipeline': 'Pipeline',
      'pipeline.status_title': 'Estado de persistencia del pipeline',
      'pipeline.loading': 'cargando',
      'pipeline.blocks': 'Bloques',
      'projects.title': 'Proyecto',
      'projects.select': 'Elegir',
      'projects.selector_aria': 'Selector de proyecto',
      'materials.empty': '(sin materiales)',
      'outputs.title': 'Salidas',
      'outputs.empty': '(sin salidas)',
      'outputs.created': 'Salida creada:',
      'tasks_batches.title': 'Lotes de tareas',
      'tasks_batches.empty': '(sin lotes)',
      'tasks_batches.created': 'Lote creado:',
      'tasks_batches.details': 'Detalles',
      'tasks_batches.details_title': 'Ver detalles del lote',
      'tasks_batches.activate': 'Activar',
      'tasks_batches.activate_title': 'Activar este lote para FOREACH_TASK',
      'tasks_batches.active': 'Activo',
      'tasks_batches.activated': 'Lote activado:',
      'pipeline.indent': 'Indentar',
      'pipeline.outdent': 'Desindentar',
      'pipeline.indent_title': 'Indentar bloque seleccionado (Tab)',
      'pipeline.outdent_title': 'Desindentar (Shift+Tab)',
      'pipeline.add_loop': 'Agregar LOOP',
      'pipeline.add_round': 'Agregar ROUND',
      'pipeline.add_foreach_task': 'Agregar FOREACH_TASK',
      'pipeline.add_foreach_action': 'Agregar FOREACH_ACTION',
      'pipeline.add_if': 'Agregar IF',
      'pipeline.add_loop_title': 'Agregar LOOP (envolver selección o añadir)',
      'pipeline.add_round_title': 'Agregar ROUND (envolver selección o añadir)',
      'pipeline.add_foreach_task_title': 'Agregar FOREACH_TASK (envolver selección o añadir)',
      'pipeline.add_foreach_action_title': 'Agregar FOREACH_ACTION (envolver selección o añadir)',
      'pipeline.add_if_title': 'Agregar IF (envolver selección o añadir)',
      'pipeline.delete': 'Eliminar',
      'pipeline.delete_title': 'Eliminar el bloque seleccionado (Supr)',
      'pipeline.script_canonical': 'Script del pipeline (canónico)',
      'pipeline.json_derived': 'JSON del pipeline (derivado)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': 'activo',
      'pipeline.state_disabled': 'inactivo',
      'pipeline.repeat_aria': 'Repeticiones',
      'pipeline.repeat_title': 'Repeticiones (1-10000)',
      'pipeline.repeat_err': 'Debe ser 1-10000',
      'ui.chat': 'Chat',
      'ws.status_title': 'Estado de WebSocket',
      'ws.disconnected': 'desconectado',
      'ui.backend': 'Backend:',
      'ws.set_url_title': 'Clic para configurar URL WS',
      'ws.set_url_prompt': 'Configurar URL WebSocket (guardada en este navegador).',
      'chat.placeholder': 'Escribe un mensaje (eco por WS por ahora)…',
      'chat.send': 'Enviar',
      'ui.offline_shell': 'Shell sin conexión habilitado vía Service Worker.',
      'settings.agent_sdk': 'SDK del agente',
      'settings.model': 'Modelo',
      'settings.vision_model': 'Modelo de visión',
      'settings.codex_cli_path': 'Ruta de Codex CLI',
      'settings.enable_agent_runner': 'Habilitar runner del agente (backend requiere gate de Codex)',
      'settings.test_codex': 'Probar Codex',
      'settings.test_codex_title': 'Ejecuta `codex --version` (con gate) en backend',
      'settings.codex_gate_hint': 'El subproceso de Codex está deshabilitado por defecto. Para habilitar: establece',
      'settings.codex_gate_hint_2': 'en el entorno y elige Agent SDK =',
      'settings.codex_gate_hint_3': 'con “Habilitar runner del agente”.',
      'actions.action': 'Acción',
      'actions.action_title': 'Plantilla de acción',
      'actions.user_suffix': 'usuario',
      'actions.customize': 'Personalizar',
      'actions.customize_title': 'Copiar la acción por defecto a una acción de usuario y cambiar',
      'novel.section': 'Novela',
      'novel.language': 'Idioma de la novela',
      'novel.tone': 'Tono',
      'novel.tone_ph': 'neutral',
      'novel.target_words': 'Longitud objetivo (palabras)',
      'novel.target_words_ph': '80000',
      'novel.pov': 'POV',
      'novel.pov_ph': 'tercera persona limitada',
      'novel.tense': 'Tiempo verbal',
      'novel.tense_ph': 'pasado',
      'novel.chapters': 'Capítulos objetivo',
      'novel.chapters_ph': '12',
      'project.section': 'Proyecto',
      'project.settings_title': 'Ajustes del proyecto',
      'project.active': 'Proyecto activo',
      'project.novel_language': 'Idioma de la novela (proyecto)',
      'project.novel_language_title': 'Sobrescribir idioma de la novela para este proyecto (separado del idioma UI)',
      'project.novel_language_inherit': 'Usar el valor global',
      'errors.backend_api_url': 'No se puede determinar la URL de la API del backend'
    },
    ru: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': 'Статус раннера',
      'run.idle': 'ожидание',
      'run.start': 'Старт',
      'run.pause': 'Пауза',
      'run.resume': 'Продолжить',
      'run.stop': 'Стоп',
      'ui.settings': 'Настройки',
      'ui.close': 'Закрыть',
      'ui.save': 'Сохранить',
      'ui.reset': 'Сбросить',
      'ui.pipeline': 'Пайплайн',
      'pipeline.status_title': 'Статус сохранения пайплайна',
      'pipeline.loading': 'загрузка',
      'pipeline.blocks': 'Блоки',
      'projects.title': 'Проект',
      'projects.select': 'Выбрать',
      'projects.selector_aria': 'Выбор проекта',
      'materials.empty': '(нет материалов)',
      'outputs.title': 'Выходные файлы',
      'outputs.empty': '(нет выходных файлов)',
      'outputs.created': 'Создан выход:',
      'tasks_batches.title': 'Пакеты задач',
      'tasks_batches.empty': '(нет пакетов)',
      'tasks_batches.created': 'Пакет создан:',
      'tasks_batches.details': 'Детали',
      'tasks_batches.details_title': 'Показать детали пакета',
      'tasks_batches.activate': 'Активировать',
      'tasks_batches.activate_title': 'Активировать этот пакет для FOREACH_TASK',
      'tasks_batches.active': 'Активен',
      'tasks_batches.activated': 'Активирован пакет:',
      'pipeline.indent': 'Вложить',
      'pipeline.outdent': 'Развернуть',
      'pipeline.indent_title': 'Вложить выбранный блок (Tab)',
      'pipeline.outdent_title': 'Развернуть (Shift+Tab)',
      'pipeline.add_loop': 'Добавить LOOP',
      'pipeline.add_round': 'Добавить ROUND',
      'pipeline.add_foreach_task': 'Добавить FOREACH_TASK',
      'pipeline.add_foreach_action': 'Добавить FOREACH_ACTION',
      'pipeline.add_if': 'Добавить IF',
      'pipeline.add_loop_title': 'Добавить LOOP (обернуть выбранное или добавить)',
      'pipeline.add_round_title': 'Добавить ROUND (обернуть выбранное или добавить)',
      'pipeline.add_foreach_task_title': 'Добавить FOREACH_TASK (обернуть выбранное или добавить)',
      'pipeline.add_foreach_action_title': 'Добавить FOREACH_ACTION (обернуть выбранное или добавить)',
      'pipeline.add_if_title': 'Добавить IF (обернуть выбранное или добавить)',
      'pipeline.delete': 'Удалить',
      'pipeline.delete_title': 'Удалить выбранный блок (Del)',
      'pipeline.script_canonical': 'Скрипт пайплайна (канон.)',
      'pipeline.json_derived': 'JSON пайплайна (производный)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': 'включено',
      'pipeline.state_disabled': 'выключено',
      'pipeline.repeat_aria': 'Количество повторов',
      'pipeline.repeat_title': 'Количество повторов (1-10000)',
      'pipeline.repeat_err': 'Должно быть 1-10000',
      'ui.chat': 'Чат',
      'ws.status_title': 'Статус WebSocket',
      'ws.disconnected': 'нет связи',
      'ui.backend': 'Бэкенд:',
      'ws.set_url_title': 'Нажмите, чтобы задать WS URL',
      'ws.set_url_prompt': 'Задать WebSocket URL (сохраняется в этом браузере).',
      'chat.placeholder': 'Введите сообщение (пока эхо через WS)…',
      'chat.send': 'Отправить',
      'ui.offline_shell': 'Офлайн-оболочка включена через Service Worker.',
      'settings.agent_sdk': 'SDK агента',
      'settings.model': 'Модель',
      'settings.vision_model': 'Vision-модель',
      'settings.codex_cli_path': 'Путь Codex CLI',
      'settings.enable_agent_runner': 'Включить запуск агента (на бэкенде нужен gate Codex)',
      'settings.test_codex': 'Тест Codex',
      'settings.test_codex_title': 'Запускает gated `codex --version` на бэкенде',
      'settings.codex_gate_hint': 'Подпроцесс Codex по умолчанию отключён. Чтобы включить: задайте',
      'settings.codex_gate_hint_2': 'в окружении и выберите Agent SDK =',
      'settings.codex_gate_hint_3': 'с «Включить запуск агента».',
      'actions.action': 'Действие',
      'actions.action_title': 'Шаблон действия',
      'actions.user_suffix': 'пользователь',
      'actions.customize': 'Настроить',
      'actions.customize_title': 'Скопировать действие по умолчанию в пользовательское и переключить',
      'novel.section': 'Роман',
      'novel.language': 'Язык романа',
      'novel.tone': 'Тон',
      'novel.tone_ph': 'нейтральный',
      'novel.target_words': 'Целевая длина (слов)',
      'novel.target_words_ph': '80000',
      'novel.pov': 'Точка зрения',
      'novel.pov_ph': 'третье лицо (огр.)',
      'novel.tense': 'Время',
      'novel.tense_ph': 'прошедшее',
      'novel.chapters': 'Цель по главам',
      'novel.chapters_ph': '12',
      'project.section': 'Проект',
      'project.settings_title': 'Настройки проекта',
      'project.active': 'Активный проект',
      'project.novel_language': 'Язык романа (проект)',
      'project.novel_language_title': 'Переопределение языка романа для этого проекта (отдельно от языка UI)',
      'project.novel_language_inherit': 'Использовать глобальный',
      'errors.backend_api_url': 'Не удалось определить URL API бэкенда'
    },
    de: {
      'app.title': 'AutoNovelWriter',
      'run.status_title': 'Runner-Status',
      'run.idle': 'bereit',
      'run.start': 'Start',
      'run.pause': 'Pause',
      'run.resume': 'Weiter',
      'run.stop': 'Stopp',
      'ui.settings': 'Einstellungen',
      'ui.close': 'Schließen',
      'ui.save': 'Speichern',
      'ui.reset': 'Zurücksetzen',
      'ui.pipeline': 'Pipeline',
      'pipeline.status_title': 'Pipeline-Speicherstatus',
      'pipeline.loading': 'lädt',
      'pipeline.blocks': 'Blöcke',
      'projects.title': 'Projekt',
      'projects.select': 'Auswählen',
      'projects.selector_aria': 'Projektauswahl',
      'materials.empty': '(keine Materialien)',
      'outputs.title': 'Ausgaben',
      'outputs.empty': '(keine Ausgaben)',
      'outputs.created': 'Ausgabe erstellt:',
      'tasks_batches.title': 'Aufgaben-Batches',
      'tasks_batches.empty': '(keine Batches)',
      'tasks_batches.created': 'Batch erstellt:',
      'tasks_batches.details': 'Details',
      'tasks_batches.details_title': 'Batch-Details anzeigen',
      'tasks_batches.activate': 'Aktivieren',
      'tasks_batches.activate_title': 'Diesen Batch für FOREACH_TASK aktivieren',
      'tasks_batches.active': 'Aktiv',
      'tasks_batches.activated': 'Batch aktiviert:',
      'pipeline.indent': 'Einrücken',
      'pipeline.outdent': 'Ausrücken',
      'pipeline.indent_title': 'Ausgewählten Block einrücken (Tab)',
      'pipeline.outdent_title': 'Ausrücken (Shift+Tab)',
      'pipeline.add_loop': 'LOOP hinzufügen',
      'pipeline.add_round': 'ROUND hinzufügen',
      'pipeline.add_foreach_task': 'FOREACH_TASK hinzufügen',
      'pipeline.add_foreach_action': 'FOREACH_ACTION hinzufügen',
      'pipeline.add_if': 'IF hinzufügen',
      'pipeline.add_loop_title': 'LOOP hinzufügen (Auswahl umschließen oder anhängen)',
      'pipeline.add_round_title': 'ROUND hinzufügen (Auswahl umschließen oder anhängen)',
      'pipeline.add_foreach_task_title': 'FOREACH_TASK hinzufügen (Auswahl umschließen oder anhängen)',
      'pipeline.add_foreach_action_title': 'FOREACH_ACTION hinzufügen (Auswahl umschließen oder anhängen)',
      'pipeline.add_if_title': 'IF hinzufügen (Auswahl umschließen oder anhängen)',
      'pipeline.delete': 'Löschen',
      'pipeline.delete_title': 'Ausgewählten Block löschen (Entf)',
      'pipeline.script_canonical': 'Pipeline-Skript (kanonisch)',
      'pipeline.json_derived': 'Pipeline-JSON (abgeleitet)',
      'pipeline.verb_loop': 'LOOP',
      'pipeline.verb_round': 'ROUND',
      'pipeline.verb_foreach_task': 'FOREACH_TASK',
      'pipeline.verb_foreach_action': 'FOREACH_ACTION',
      'pipeline.verb_if': 'IF',
      'pipeline.verb_else': 'ELSE',
      'pipeline.badge_foreach': 'foreach',
      'pipeline.state_enabled': 'aktiv',
      'pipeline.state_disabled': 'inaktiv',
      'pipeline.repeat_aria': 'Wiederholungen',
      'pipeline.repeat_title': 'Wiederholungen (1-10000)',
      'pipeline.repeat_err': 'Muss 1-10000 sein',
      'ui.chat': 'Chat',
      'ws.status_title': 'WebSocket-Status',
      'ws.disconnected': 'getrennt',
      'ui.backend': 'Backend:',
      'ws.set_url_title': 'Klicken, um WS-URL zu setzen',
      'ws.set_url_prompt': 'WebSocket-URL setzen (in diesem Browser gespeichert).',
      'chat.placeholder': 'Nachricht eingeben (derzeit Echo per WS)…',
      'chat.send': 'Senden',
      'ui.offline_shell': 'Offline-Shell via Service Worker aktiviert.',
      'settings.agent_sdk': 'Agent SDK',
      'settings.model': 'Modell',
      'settings.vision_model': 'Vision-Modell',
      'settings.codex_cli_path': 'Codex-CLI-Pfad',
      'settings.enable_agent_runner': 'Agent-Runner aktivieren (Backend benötigt Codex-Gate)',
      'settings.test_codex': 'Codex testen',
      'settings.test_codex_title': 'Führt gated `codex --version` im Backend aus',
      'settings.codex_gate_hint': 'Codex-Subprozess ist standardmäßig deaktiviert. Zum Aktivieren: setze',
      'settings.codex_gate_hint_2': 'in der Umgebung und wähle Agent SDK =',
      'settings.codex_gate_hint_3': 'mit „Agent-Runner aktivieren“.',
      'actions.action': 'Aktion',
      'actions.action_title': 'Aktionsvorlage',
      'actions.user_suffix': 'Benutzer',
      'actions.customize': 'Anpassen',
      'actions.customize_title': 'Standardaktion als Benutzeraktion kopieren und umschalten',
      'novel.section': 'Roman',
      'novel.language': 'Romansprache',
      'novel.tone': 'Ton',
      'novel.tone_ph': 'neutral',
      'novel.target_words': 'Zielumfang (Wörter)',
      'novel.target_words_ph': '80000',
      'novel.pov': 'Perspektive',
      'novel.pov_ph': 'dritte Person, begrenzt',
      'novel.tense': 'Zeitform',
      'novel.tense_ph': 'Vergangenheit',
      'novel.chapters': 'Zielkapitel',
      'novel.chapters_ph': '12',
      'project.section': 'Projekt',
      'project.settings_title': 'Projekteinstellungen',
      'project.active': 'Aktives Projekt',
      'project.novel_language': 'Romansprache (Projekt)',
      'project.novel_language_title': 'Romansprache für dieses Projekt überschreiben (getrennt von UI-Sprache)',
      'project.novel_language_inherit': 'Globalen Standard verwenden',
      'errors.backend_api_url': 'Backend-API-URL kann nicht abgeleitet werden'
    }
  };

  function detectLang() {
    const url = new URL(window.location.href);
    const q = (url.searchParams.get('lang') || '').trim();
    if (q && REQUIRED_LANGS.includes(q)) return q;
    try {
      const saved = String(window.localStorage.getItem('anw_lang') || '').trim();
      if (saved && REQUIRED_LANGS.includes(saved)) return saved;
    } catch (_) {}
    const nav = String((navigator.languages && navigator.languages[0]) || navigator.language || 'en');
    const n = nav.toLowerCase();
    if (n.startsWith('zh')) {
      if (n.includes('hans') || n.includes('cn') || n.includes('sg')) return 'zh-Hans';
      return 'zh-Hant';
    }
    if (n.startsWith('ja')) return 'ja';
    if (n.startsWith('ko')) return 'ko';
    if (n.startsWith('vi')) return 'vi';
    if (n.startsWith('ar')) return 'ar';
    if (n.startsWith('fr')) return 'fr';
    if (n.startsWith('es')) return 'es';
    if (n.startsWith('ru')) return 'ru';
    if (n.startsWith('de')) return 'de';
    return 'en';
  }

  let UI_LANG = detectLang();

  function t(key) {
    const k = String(key || '');
    const dict = I18N[UI_LANG] || I18N.en;
    if (dict && Object.prototype.hasOwnProperty.call(dict, k)) return dict[k];
    if (I18N.en && Object.prototype.hasOwnProperty.call(I18N.en, k)) return I18N.en[k];
    return k;
  }

  function applyI18n() {
    try { window.localStorage.setItem('anw_lang', UI_LANG); } catch (_) {}
    const html = document.documentElement;
    if (html) {
      html.lang = UI_LANG;
      html.dir = UI_LANG === 'ar' ? 'rtl' : 'ltr';
    }
    const els = document.querySelectorAll('[data-i18n]');
    for (const el of els) {
      const key = el.getAttribute('data-i18n');
      if (!key) continue;
      el.textContent = t(key);
    }
    const titleEls = document.querySelectorAll('[data-i18n-title]');
    for (const el of titleEls) {
      const key = el.getAttribute('data-i18n-title');
      if (!key) continue;
      el.title = t(key);
    }
    const phEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (const el of phEls) {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) continue;
      el.placeholder = t(key);
    }
    const ariaEls = document.querySelectorAll('[data-i18n-aria-label]');
    for (const el of ariaEls) {
      const key = el.getAttribute('data-i18n-aria-label');
      if (!key) continue;
      el.setAttribute('aria-label', t(key));
    }
    // Keep document title in sync if it has the attribute.
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) document.title = t(titleEl.getAttribute('data-i18n'));
  }

  const chatLog = $('chatLog');
  const chatForm = $('chatForm');
  const chatInput = $('chatInput');
  const conn = $('conn');
  const backendHint = $('backendHint');

  const blocksEl = $('blocks');
  const pipeIndent = $('pipeIndent');
  const pipeOutdent = $('pipeOutdent');
  const pipeAddLoop = $('pipeAddLoop');
  const pipeAddRound = $('pipeAddRound');
  const pipeAddForeachTask = $('pipeAddForeachTask');
  const pipeAddForeachAction = $('pipeAddForeachAction');
  const pipeAddIf = $('pipeAddIf');
  const pipeSave = $('pipeSave');
  const pipeReset = $('pipeReset');
  const pipeStatus = $('pipeStatus');
  const pipelineJson = $('pipelineJson');
  const pipelineScript = $('pipelineScript');

  const activeProject = $('activeProject');
  const projectSelect = $('projectSelect');
  const materialsList = $('materialsList');
  const outputsList = $('outputsList');
  const batchesList = $('batchesList');

  const runPill = $('runPill');
  const runStart = $('runStart');
  const runPause = $('runPause');
  const runResume = $('runResume');
  const runStop = $('runStop');
  const openSettings = $('openSettings');
  const settingsModal = $('settingsModal');
  const closeSettings = $('closeSettings');
  const settingsForm = $('settingsForm');
  const agentSdk = $('agentSdk');
  const agentModel = $('agentModel');
  const agentVisionModel = $('agentVisionModel');
  const codexCliPath = $('codexCliPath');
  const agentEnabled = $('agentEnabled');
  const testCodex = $('testCodex');
  const novelLanguage = $('novelLanguage');
  const novelTone = $('novelTone');
  const novelTargetWords = $('novelTargetWords');
  const novelPov = $('novelPov');
  const novelTense = $('novelTense');
  const novelChapters = $('novelChapters');
  const projectActiveSettings = $('projectActiveSettings');
  const projectNovelLanguage = $('projectNovelLanguage');

  const LS_WS_URL = 'anw_ws_url';
  const LS_PIPELINE = 'anw_pipeline';
  const LS_PIPELINE_SCRIPT = 'anw_pipeline_script';
  const LS_PIPELINE_AST = 'anw_pipeline_ast';
  let chatHistoryLoadedKey = null;
  const seenChatIds = new Set();

  applyI18n();

  function ts() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function addMsg(kind, title, body) {
    const li = document.createElement('li');
    li.className = `msg ${kind}`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `[${ts()}] ${title}`;

    const b = document.createElement('div');
    b.className = 'body';
    b.textContent = body;

    li.appendChild(meta);
    li.appendChild(b);
    chatLog.appendChild(li);
    // Keep UI usable during long runs.
    while (chatLog.childElementCount > 300) chatLog.removeChild(chatLog.firstElementChild);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function addChatMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (typeof msg.id === 'string' && msg.id) {
      if (seenChatIds.has(msg.id)) return;
      seenChatIds.add(msg.id);
    }
    const role = typeof msg.role === 'string' ? msg.role : 'event';
    const source = typeof msg.source === 'string' ? msg.source : 'unknown';
    const text = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg);
    const title = `${role}/${source}`;
    addMsg(source === 'inbox' ? 'hello' : 'hello', title, text);
  }

  function fmtBytes(n) {
    const b = Number(n || 0);
    if (!Number.isFinite(b) || b <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = b;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i += 1;
    }
    return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function setConn(state) {
    // Keep exact WS state string for debugging; translate only the default idle/disconnected text.
    conn.textContent = state;
    conn.classList.remove('ok', 'warn');
    if (state === 'connected') conn.classList.add('ok');
    else if (state === 'connecting') conn.classList.add('warn');
  }

  function setPipeStatus(state) {
    pipeStatus.textContent = state;
    pipeStatus.classList.remove('ok', 'warn');
    if (state === 'saved' || state === 'loaded') pipeStatus.classList.add('ok');
    else if (state === 'dirty' || state === 'saving' || state === 'local') pipeStatus.classList.add('warn');
  }

  function setRunStatus(state, taskId, block) {
    const s = state || 'idle';
    runPill.textContent = s === 'idle' ? t('run.idle') : s;
    runPill.classList.remove('ok', 'warn');
    if (state === 'running') runPill.classList.add('warn');
    if (state === 'paused') runPill.classList.add('warn');
    if (state === 'idle') runPill.classList.add('ok');
    const extra = [taskId ? `task=${taskId}` : null, block ? `block=${block}` : null].filter(Boolean).join(' ');
    runPill.title = extra || t('run.status_title');
  }

  function renderMaterialsIndex(obj) {
    if (!materialsList) return;
    const active = obj && typeof obj.active_project === 'string' ? obj.active_project : '';
    const proj = obj && typeof obj.project === 'string' ? obj.project : active;
    if (activeProject) activeProject.textContent = proj || active || 'default';

    materialsList.innerHTML = '';
    const files = obj && Array.isArray(obj.files) ? obj.files : [];
    const shown = files.filter((f) => f && f.kind === 'file');
    if (!shown.length) {
      const li = document.createElement('li');
      li.className = 'mat';
      const p = document.createElement('div');
      p.className = 'path';
      p.textContent = t('materials.empty');
      const m = document.createElement('div');
      m.className = 'meta';
      m.textContent = '';
      li.appendChild(p);
      li.appendChild(m);
      materialsList.appendChild(li);
      return;
    }

    for (const f of shown.slice(0, 2000)) {
      const li = document.createElement('li');
      li.className = 'mat';
      const p = document.createElement('div');
      p.className = 'path';
      p.textContent = String(f.path || '');
      const m = document.createElement('div');
      m.className = 'meta';
      m.textContent = fmtBytes(f.size_bytes || 0);
      li.appendChild(p);
      li.appendChild(m);
      materialsList.appendChild(li);
    }
  }

  function renderOutputsIndex(obj) {
    if (!outputsList) return;
    outputsList.innerHTML = '';
    const files = obj && Array.isArray(obj.files) ? obj.files : [];
    const shown = files.filter((f) => f && f.kind === 'file');
    if (!shown.length) {
      const li = document.createElement('li');
      li.className = 'mat';
      const p = document.createElement('div');
      p.className = 'path';
      p.textContent = t('outputs.empty');
      const m = document.createElement('div');
      m.className = 'meta';
      m.textContent = '';
      li.appendChild(p);
      li.appendChild(m);
      outputsList.appendChild(li);
      return;
    }

    for (const f of shown.slice(0, 2000)) {
      const li = document.createElement('li');
      li.className = 'mat';
      const p = document.createElement('div');
      p.className = 'path';
      p.textContent = String(f.path || '');
      const m = document.createElement('div');
      m.className = 'meta';
      m.textContent = fmtBytes(f.size_bytes || 0);
      li.appendChild(p);
      li.appendChild(m);
      outputsList.appendChild(li);
    }
  }

  async function loadProjects() {
    const url = backendApiUrl('/api/projects');
    if (!url) return null;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok) return null;
      return obj;
    } catch (_) {
      return null;
    }
  }

  async function setActiveProject(pid) {
    const url = backendApiUrl('/api/projects/active');
    if (!url) return false;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: String(pid || '') })
      });
      const obj = await res.json();
      return !!(obj && obj.ok);
    } catch (_) {
      return false;
    }
  }

  async function loadMaterialsIndex(opts) {
    const url = backendApiUrl('/api/materials/index');
    if (!url) return null;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok) return null;
      renderMaterialsIndex(obj);
      if (projectSelect && !opts?.skipSelectSync) {
        const pid = String(obj.project || obj.active_project || '');
        if (pid) projectSelect.value = pid;
      }
      return obj;
    } catch (_) {
      return null;
    }
  }

  async function loadOutputsIndex(opts) {
    const url = backendApiUrl('/api/outputs/index');
    if (!url) return null;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok) return null;
      renderOutputsIndex(obj);
      if (projectSelect && !opts?.skipSelectSync) {
        const pid = String(obj.project || obj.active_project || '');
        if (pid) projectSelect.value = pid;
      }
      return obj;
    } catch (_) {
      return null;
    }
  }

  function renderTaskBatchesIndex(obj) {
    if (!batchesList) return;
    batchesList.innerHTML = '';
    const batches = obj && Array.isArray(obj.batches) ? obj.batches : [];
    const activeBatchId = obj && typeof obj.active_batch_id === 'string' ? String(obj.active_batch_id || '').trim() : '';
    if (!batches.length) {
      const li = document.createElement('li');
      li.className = 'mat';
      const p = document.createElement('div');
      p.className = 'path';
      p.textContent = t('tasks_batches.empty');
      const m = document.createElement('div');
      m.className = 'meta';
      m.textContent = '';
      li.appendChild(p);
      li.appendChild(m);
      batchesList.appendChild(li);
      return;
    }

    for (const b of batches.slice(0, 500)) {
      if (!b || typeof b !== 'object') continue;
      const li = document.createElement('li');
      li.className = 'mat';

      const p = document.createElement('div');
      p.className = 'path';
      const bid = String(b.batch_id || '').trim() || '(batch)';
      p.textContent = bid;

      const m = document.createElement('div');
      m.className = 'meta';
      const created = String(b.created_utc || '').trim();
      const n = b.task_count === null || b.task_count === undefined ? '' : String(b.task_count);
      const tj = String(b.tasks_jsonl || '').trim();
      const parts = [];
      if (created) parts.push(created);
      if (n) parts.push(`tasks=${n}`);
      if (tj) parts.push(tj);
      m.textContent = parts.join('  ');

      const actions = document.createElement('div');
      actions.className = 'actions';

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t('tasks_batches.active');
      badge.style.display = activeBatchId && bid === activeBatchId ? 'inline-block' : 'none';
      actions.appendChild(badge);

      const bdet = document.createElement('button');
      bdet.type = 'button';
      bdet.className = 'mini';
      bdet.textContent = t('tasks_batches.details');
      bdet.title = t('tasks_batches.details_title');
      bdet.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = backendApiUrl(`/api/tasks/batches/${encodeURIComponent(bid)}`);
        if (!url) return;
        try {
          const res = await fetch(url, { method: 'GET' });
          const obj2 = await res.json();
          if (!obj2 || !obj2.ok) {
            addMsg('err', t('tasks_batches.title'), JSON.stringify(obj2 || { ok: false }));
            return;
          }
          const head = obj2.preview && Array.isArray(obj2.preview.head) ? obj2.preview.head : [];
          const tail = obj2.preview && Array.isArray(obj2.preview.tail) ? obj2.preview.tail : [];
          const lines = [];
          lines.push(`batch_id=${bid}`);
          if (typeof obj2.task_count === 'number') lines.push(`task_count=${obj2.task_count}`);
          if (head.length) lines.push(`head=${head.length}`);
          if (tail.length) lines.push(`tail=${tail.length}`);
          const sample = head.slice(0, 5).map((x) => (x && typeof x === 'object' ? (x.title || x.id || JSON.stringify(x)) : String(x)));
          if (sample.length) lines.push(`sample: ${sample.join(' | ')}`);
          addMsg('hello', t('tasks_batches.title'), lines.join('  '));
        } catch (e2) {
          addMsg('err', t('tasks_batches.title'), String(e2));
        }
      });
      actions.appendChild(bdet);

      const bact = document.createElement('button');
      bact.type = 'button';
      bact.className = 'mini';
      bact.textContent = t('tasks_batches.activate');
      bact.title = t('tasks_batches.activate_title');
      bact.disabled = !!activeBatchId && bid === activeBatchId;
      bact.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = backendApiUrl(`/api/tasks/batches/${encodeURIComponent(bid)}/activate`);
        if (!url) return;
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
          const obj2 = await res.json();
          if (!obj2 || !obj2.ok) {
            addMsg('err', t('tasks_batches.title'), JSON.stringify(obj2 || { ok: false }));
            return;
          }
          addMsg('hello', t('tasks_batches.title'), `${t('tasks_batches.activated')} ${bid}`);
          const pid = projectSelect ? String(projectSelect.value || '').trim() : '';
          loadTaskBatchesIndex({ project_id: pid });
        } catch (e2) {
          addMsg('err', t('tasks_batches.title'), String(e2));
        }
      });
      actions.appendChild(bact);

      li.appendChild(p);
      li.appendChild(m);
      li.appendChild(actions);
      batchesList.appendChild(li);
    }
  }

  async function loadTaskBatchesIndex(opts) {
    let suffix = '';
    try {
      const pid = String(opts?.project_id || '').trim();
      if (pid) suffix = `?project=${encodeURIComponent(pid)}`;
    } catch (_) {}
    const url = backendApiUrl('/api/tasks/batches/index' + suffix);
    if (!url) return null;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok) return null;
      renderTaskBatchesIndex(obj);
      return obj;
    } catch (_) {
      return null;
    }
  }

  let outputsRefreshTimer = null;
  function scheduleOutputsRefresh(delayMs) {
    if (!outputsList) return;
    if (outputsRefreshTimer) clearTimeout(outputsRefreshTimer);
    outputsRefreshTimer = setTimeout(() => {
      outputsRefreshTimer = null;
      loadOutputsIndex();
    }, Math.max(0, Number(delayMs || 0)));
  }

  let batchesRefreshTimer = null;
  function scheduleBatchesRefresh(delayMs) {
    if (!batchesList) return;
    if (batchesRefreshTimer) clearTimeout(batchesRefreshTimer);
    batchesRefreshTimer = setTimeout(() => {
      batchesRefreshTimer = null;
      const pid = projectSelect ? String(projectSelect.value || '').trim() : '';
      loadTaskBatchesIndex({ project_id: pid });
    }, Math.max(0, Number(delayMs || 0)));
  }

  function parseBackendWsUrl() {
    const url = new URL(window.location.href);

    // Allow override: ?ws=ws://host:port/ws
    const wsOverride = url.searchParams.get('ws');
    if (wsOverride) return wsOverride;

    // Allow persisted override set from UI (click backend hint).
    const saved = window.localStorage.getItem(LS_WS_URL);
    if (saved) return saved;

    // Allow override: ?backend=http://host:port (converted to ws)
    const backendOverride = url.searchParams.get('backend');
    if (backendOverride) {
      try {
        const b = new URL(backendOverride);
        const proto = b.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${b.host}/ws`;
      } catch (_) {
        // ignore
      }
    }

    // Default: backend is usually on 8787 (per driver).
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || '127.0.0.1';
    return `${proto}//${host}:8787/ws`;
  }

  function backendApiUrl(pathname) {
    const wsUrl = parseBackendWsUrl();
    let u = null;
    try {
      u = new URL(wsUrl);
    } catch (_) {
      return null;
    }
    const proto = u.protocol === 'wss:' ? 'https:' : 'http:';
    return `${proto}//${u.host}${pathname}`;
  }

  let settingsCache = null;
  let projectSettingsCache = null;

  function openModal() {
    settingsModal.classList.add('open');
    settingsModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    settingsModal.classList.remove('open');
    settingsModal.setAttribute('aria-hidden', 'true');
  }

  function fillSettingsForm(settings) {
    const a = (settings && settings.agent) || {};
    agentSdk.value = a.sdk || 'codex';
    agentModel.value = a.model || '';
    agentVisionModel.value = a.vision_model || '';
    codexCliPath.value = a.codex_cli_path || '';
    agentEnabled.checked = !!a.enabled;

    const n = (settings && settings.novel) || {};
    if (novelLanguage) novelLanguage.value = String(n.language || 'en');
    if (novelTone) novelTone.value = String(n.tone || 'neutral');
    if (novelTargetWords) novelTargetWords.value = String(Number.isFinite(n.target_length_words) ? n.target_length_words : (n.target_length_words || 80000));
    if (novelPov) novelPov.value = String(n.pov || 'third_limited');
    if (novelTense) novelTense.value = String(n.tense || 'past');
    if (novelChapters) novelChapters.value = String(Number.isFinite(n.chapter_count_target) ? n.chapter_count_target : (n.chapter_count_target || 12));
  }

  function fillProjectSettingsForm(obj) {
    if (!obj || !obj.ok) return;
    projectSettingsCache = obj;
    const pid = typeof obj.project_id === 'string' ? obj.project_id : '';
    if (activeProject) activeProject.textContent = pid || 'default';
    if (projectActiveSettings) projectActiveSettings.value = pid || 'default';
    const ps = obj.project_settings && typeof obj.project_settings === 'object' ? obj.project_settings : {};
    const eff = obj.effective && typeof obj.effective === 'object' ? obj.effective : {};
    const override = typeof ps.novel_language === 'string' ? ps.novel_language.trim() : '';
    // Empty value means "inherit global default" (no project override).
    const val = override ? override : '';
    if (projectNovelLanguage) projectNovelLanguage.value = val;
  }

  async function loadProjectSettings() {
    const url = backendApiUrl('/api/projects/settings');
    if (!url) return null;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok) return null;
      fillProjectSettingsForm(obj);
      return obj;
    } catch (_) {
      return null;
    }
  }

  async function saveProjectSettingsFromForm() {
    const url = backendApiUrl('/api/projects/settings');
    if (!url) {
      addMsg('err', t('project.settings_title'), t('errors.backend_api_url'));
      return;
    }
    const novel_language = projectNovelLanguage ? String(projectNovelLanguage.value || '').trim() : '';
    const project_settings = { novel_language };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_settings })
      });
      const obj = await res.json();
      if (obj && obj.ok) {
        addMsg('hello', t('project.settings_title'), t('ui.save'));
        loadProjectSettings();
        return;
      }
      addMsg('err', t('project.settings_title'), JSON.stringify(obj));
    } catch (e) {
      addMsg('err', t('project.settings_title'), String(e));
    }
  }

  async function loadSettings() {
    const url = backendApiUrl('/api/settings');
    if (!url) return;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok || !obj.settings) return;
      settingsCache = obj.settings;
      fillSettingsForm(settingsCache);
    } catch (_) {}
  }

  async function saveSettingsFromForm() {
    const url = backendApiUrl('/api/settings');
    if (!url) {
      addMsg('err', 'settings', 'cannot derive backend api url');
      return;
    }
    const agent = {
      enabled: !!agentEnabled.checked,
      sdk: String(agentSdk.value || 'codex'),
      model: String(agentModel.value || ''),
      vision_model: String(agentVisionModel.value || ''),
      codex_cli_path: String(codexCliPath.value || '')
    };

    const novel = {
      language: String(novelLanguage && novelLanguage.value ? novelLanguage.value : 'en'),
      tone: String(novelTone && novelTone.value ? novelTone.value : 'neutral').trim(),
      target_length_words: (() => {
        const v = novelTargetWords ? parseInt(String(novelTargetWords.value || '').trim(), 10) : NaN;
        return Number.isFinite(v) && v >= 0 ? v : 80000;
      })(),
      pov: String(novelPov && novelPov.value ? novelPov.value : 'third_limited').trim(),
      tense: String(novelTense && novelTense.value ? novelTense.value : 'past').trim(),
      chapter_count_target: (() => {
        const v = novelChapters ? parseInt(String(novelChapters.value || '').trim(), 10) : NaN;
        return Number.isFinite(v) && v >= 0 ? v : 12;
      })()
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, novel })
      });
      const obj = await res.json();
      if (obj && obj.ok && obj.settings) {
        settingsCache = obj.settings;
        addMsg('hello', t('ui.settings'), t('ui.save'));
        return;
      }
      addMsg('err', 'settings', JSON.stringify(obj));
    } catch (e) {
      addMsg('err', 'settings', String(e));
    }
  }

  async function testCodexStub() {
    const url = backendApiUrl('/api/agent/test');
    if (!url) {
      addMsg('err', 'codex', 'cannot derive backend api url');
      return;
    }
    try {
      const res = await fetch(url, { method: 'POST' });
      const obj = await res.json();
      if (obj && obj.ok && obj.result) {
        const out = (obj.result.stdout || obj.result.stderr || '').trim();
        addMsg('hello', 'codex', out || 'ok');
      } else {
        addMsg('err', 'codex', JSON.stringify(obj));
      }
    } catch (e) {
      addMsg('err', 'codex', String(e));
    }
  }

  async function loadChatHistory() {
    const url = backendApiUrl('/api/chat/history?limit=200');
    if (!url) return;
    if (chatHistoryLoadedKey === url) return;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok || !Array.isArray(obj.messages)) return;
      chatHistoryLoadedKey = url;
      for (const m of obj.messages) addChatMessage(m);
    } catch (_) {
      // ignore (backend may not be up yet)
    }
  }

  function defaultPipeline() {
    const types = [
      'meta_tasks_generate',
      'plan',
      'write',
      'critique_story',
      'fix_story',
      'critique_tone',
      'fix_tone',
      'critique_dialogue',
      'fix_dialogue',
      'critique_character',
      'fix_character',
      'summary',
      'log',
      'update_readme',
      'commit_push'
    ];
    return { blocks: types.map((t) => ({ id: t, type: t, enabled: true })) };
  }

  const ALLOWED_TYPES = new Set(defaultPipeline().blocks.map((b) => b.type));

  function normalizePipeline(p) {
    if (!p || typeof p !== 'object') return defaultPipeline();
    if (!Array.isArray(p.blocks)) return defaultPipeline();
    const blocks = [];
    for (const b of p.blocks) {
      if (!b || typeof b !== 'object') continue;
      const type = typeof b.type === 'string' && b.type ? b.type : '';
      if (!type) continue;
      const id = typeof b.id === 'string' && b.id ? b.id : type;
      blocks.push({ id, type, enabled: b.enabled !== false });
    }
    return { blocks };
  }

  function pipelineAstFromPipeline(p) {
    const pp = normalizePipeline(p);
    return {
      kind: 'root',
      version: 2,
      children: (pp.blocks || []).map((b) => ({ kind: 'step', type: b.type, enabled: b.enabled !== false }))
    };
  }

  function defaultPipelineAst() {
    const p = defaultPipeline();
    return {
      kind: 'root',
      version: 2,
      children: (p.blocks || []).map((b) => ({ kind: 'step', type: b.type, enabled: b.enabled !== false }))
    };
  }

	  function normalizePipelineAst(ast) {
    const cleanStep = (n) => {
      if (!n || typeof n !== 'object') return null;
      const type = typeof n.type === 'string' ? n.type : '';
      if (!type) return null;
      return { kind: 'step', type, enabled: n.enabled !== false };
    };
    const cleanLoop = (n) => {
      if (!n || typeof n !== 'object') return null;
      const r = Number.isFinite(n.repeat) ? n.repeat : parseInt(String(n.repeat || '1'), 10);
      const repeat = Number.isFinite(r) && r > 0 ? r : 1;
      const kids = Array.isArray(n.children) ? n.children : [];
      const children = [];
      for (const c of kids) {
        const cc = cleanNode(c);
        if (cc) children.push(cc);
      }
      return { kind: 'loop', repeat, children };
    };
    const cleanRound = (n) => {
      if (!n || typeof n !== 'object') return null;
      const r = Number.isFinite(n.repeat) ? n.repeat : parseInt(String(n.repeat || '1'), 10);
      const repeat = Number.isFinite(r) && r > 0 ? r : 1;
      const kids = Array.isArray(n.children) ? n.children : [];
      const children = [];
      for (const c of kids) {
        const cc = cleanNode(c);
        if (cc) children.push(cc);
      }
      return { kind: 'round', repeat, children };
    };
    const cleanForeachTask = (n) => {
      if (!n || typeof n !== 'object') return null;
      const kids = Array.isArray(n.children) ? n.children : [];
      const children = [];
      for (const c of kids) {
        const cc = cleanNode(c);
        if (cc) children.push(cc);
      }
      return { kind: 'foreach_task', children };
    };
	    const cleanForeachAction = (n) => {
	      if (!n || typeof n !== 'object') return null;
	      const kids = Array.isArray(n.children) ? n.children : [];
	      const children = [];
	      for (const c of kids) {
	        const cc = cleanNode(c);
	        if (cc) children.push(cc);
	      }
	      return { kind: 'foreach_action', children };
	    };
	    const cleanIf = (n) => {
	      if (!n || typeof n !== 'object') return null;
	      const expr = typeof n.expr === 'string' ? n.expr : '';
	      const kids = Array.isArray(n.children) ? n.children : [];
	      const children = [];
	      for (const c of kids) {
	        const cc = cleanNode(c);
	        if (cc) children.push(cc);
	      }
	      return { kind: 'if', expr, children };
	    };
	    const cleanElse = (n) => {
	      if (!n || typeof n !== 'object') return null;
	      const kids = Array.isArray(n.children) ? n.children : [];
	      const children = [];
	      for (const c of kids) {
	        const cc = cleanNode(c);
	        if (cc) children.push(cc);
	      }
	      return { kind: 'else', children };
	    };
	    const cleanNode = (n) => {
	      if (!n || typeof n !== 'object') return null;
	      if (n.kind === 'step') return cleanStep(n);
	      if (n.kind === 'loop') return cleanLoop(n);
	      if (n.kind === 'round') return cleanRound(n);
	      if (n.kind === 'foreach_task') return cleanForeachTask(n);
	      if (n.kind === 'foreach_action') return cleanForeachAction(n);
	      if (n.kind === 'if') return cleanIf(n);
	      if (n.kind === 'else') return cleanElse(n);
	      return null;
	    };

    const kids = ast && typeof ast === 'object' && Array.isArray(ast.children) ? ast.children : null;
    if (!kids) return defaultPipelineAst();
    const children = [];
    for (const c of kids) {
      const cc = cleanNode(c);
      if (cc) children.push(cc);
    }
    if (!children.length) return defaultPipelineAst();
    return { kind: 'root', version: 2, children };
  }

	  function flattenAstSteps(ast) {
	    const out = [];
	    const walk = (n) => {
	      if (!n || typeof n !== 'object') return;
	      if (n.kind === 'step') {
	        out.push({ id: n.type, type: n.type, enabled: n.enabled !== false });
	        return;
	      }
	      if ((n.kind === 'loop' || n.kind === 'round' || n.kind === 'foreach_task' || n.kind === 'foreach_action' || n.kind === 'if' || n.kind === 'else') && Array.isArray(n.children)) {
	        for (const c of n.children) walk(c);
	      }
	    };
    if (ast && typeof ast === 'object' && Array.isArray(ast.children)) {
      for (const c of ast.children) walk(c);
    }
    return out;
  }

	  function astHasLoop(n) {
	    if (!n || typeof n !== 'object') return false;
	    if (n.kind === 'loop' || n.kind === 'round' || n.kind === 'foreach_task' || n.kind === 'foreach_action' || n.kind === 'if' || n.kind === 'else') return true;
	    const kids = Array.isArray(n.children) ? n.children : [];
	    for (const c of kids) {
	      if (astHasLoop(c)) return true;
	    }
	    return false;
	  }

	  function renderScriptFromAst(ast) {
	    const header = astHasLoop(ast) ? '# AutoNovelWriter pipeline script v2' : '# AutoNovelWriter pipeline script v1';
	    const lines = [header];
	    const emit = (n, level) => {
	      if (!n || typeof n !== 'object') return;
	      const indent = '  '.repeat(level);
	      if (n.kind === 'step') {
	        const verb = n.enabled === false ? 'DISABLED' : 'STEP';
	        lines.push(`${indent}${verb} ${n.type}`);
	        return;
	      }
      if (n.kind === 'loop') {
        const repeat = Number.isFinite(n.repeat) ? n.repeat : parseInt(String(n.repeat || '1'), 10);
        lines.push(`${indent}LOOP ${repeat > 0 ? repeat : 1}`);
        const kids = Array.isArray(n.children) ? n.children : [];
        for (const c of kids) emit(c, level + 1);
        return;
      }
      if (n.kind === 'round') {
        const repeat = Number.isFinite(n.repeat) ? n.repeat : parseInt(String(n.repeat || '1'), 10);
        lines.push(`${indent}ROUND ${repeat > 0 ? repeat : 1}`);
        const kids = Array.isArray(n.children) ? n.children : [];
        for (const c of kids) emit(c, level + 1);
        return;
      }
      if (n.kind === 'foreach_task') {
        lines.push(`${indent}FOREACH_TASK`);
        const kids = Array.isArray(n.children) ? n.children : [];
        for (const c of kids) emit(c, level + 1);
        return;
      }
	      if (n.kind === 'foreach_action') {
	        lines.push(`${indent}FOREACH_ACTION`);
	        const kids = Array.isArray(n.children) ? n.children : [];
	        for (const c of kids) emit(c, level + 1);
	        return;
	      }
	      if (n.kind === 'if') {
	        const expr = typeof n.expr === 'string' ? n.expr.trim() : '';
	        if (!expr) return;
	        lines.push(`${indent}IF ${expr}`);
	        const kids = Array.isArray(n.children) ? n.children : [];
	        let elseNode = null;
	        const thenKids = [];
	        for (const c of kids) {
	          if (c && typeof c === 'object' && c.kind === 'else') {
	            elseNode = c;
	            break;
	          }
	          thenKids.push(c);
	        }
	        for (const c of thenKids) emit(c, level + 1);
	        if (elseNode && typeof elseNode === 'object') {
	          lines.push(`${indent}ELSE`);
	          const ek = Array.isArray(elseNode.children) ? elseNode.children : [];
	          for (const c of ek) emit(c, level + 1);
	        }
	        return;
	      }
	      if (n.kind === 'else') {
	        // Usually rendered as part of IF; keep for robustness.
	        lines.push(`${indent}ELSE`);
	        const kids = Array.isArray(n.children) ? n.children : [];
	        for (const c of kids) emit(c, level + 1);
	      }
	    };
	    const kids = ast && typeof ast === 'object' && Array.isArray(ast.children) ? ast.children : [];
	    for (const c of kids) emit(c, 0);
	    return lines.join('\n') + '\n';
	  }

	  function parseScriptToAst(script) {
    const warnings = [];
    const errors = [];
    const knownActions = new Set();
    try {
      for (const a of actionsIndex) {
        if (a && typeof a.id === 'string' && a.id.trim()) knownActions.add(String(a.id).trim());
      }
    } catch (_) {}

    const root = { kind: 'root', version: 2, children: [] };
    const stack = [{ level: 0, children: root.children, containerLine: null, containerKind: null }];

    function curLevel() {
      return stack[stack.length - 1].level;
    }

	    function closeTo(level) {
	      while (stack.length && level < stack[stack.length - 1].level) {
	        const top = stack[stack.length - 1];
	        if (top.containerLine !== null && (!top.children || !top.children.length)) {
	          const kind = top.containerKind;
	          if (kind === 'loop') errors.push({ line: top.containerLine, code: 'loop_empty', text: 'LOOP' });
	          else if (kind === 'round') errors.push({ line: top.containerLine, code: 'round_empty', text: 'ROUND' });
	          else if (kind === 'foreach_task') errors.push({ line: top.containerLine, code: 'foreach_task_empty', text: 'FOREACH_TASK' });
	          else if (kind === 'foreach_action') errors.push({ line: top.containerLine, code: 'foreach_action_empty', text: 'FOREACH_ACTION' });
	          else if (kind === 'if') errors.push({ line: top.containerLine, code: 'if_empty', text: 'IF' });
	          else if (kind === 'else') errors.push({ line: top.containerLine, code: 'else_empty', text: 'ELSE' });
	        }
	        if (top.containerLine !== null && top.containerKind === 'if' && Array.isArray(top.children) && top.children.length) {
	          // IF must have a non-ELSE child in its then-branch.
	          let hasThen = false;
	          for (const c of top.children) {
	            if (c && typeof c === 'object' && c.kind !== 'else') {
	              hasThen = true;
	              break;
	            }
	          }
	          if (!hasThen) errors.push({ line: top.containerLine, code: 'if_empty', text: 'IF' });
	        }
	        stack.pop();
	      }
	    }

    function leadingSpaces(raw) {
      let n = 0;
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === '\t') return { n, hasTab: true };
        if (ch === ' ') {
          n += 1;
          continue;
        }
        break;
      }
      return { n, hasTab: false };
    }

    const lines = String(script || '').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const ln = i + 1;
      const raw = lines[i];
      if (!raw || !raw.trim()) continue;
      const trimmed = raw.trimStart();
      if (trimmed.startsWith('#')) continue;

      const { n: sp, hasTab } = leadingSpaces(raw);
      if (hasTab) {
        errors.push({ line: ln, code: 'tab_indent_not_allowed', text: raw });
        continue;
      }
      if (sp % 2 !== 0) {
        errors.push({ line: ln, code: 'bad_indent_not_multiple_of_2', text: raw });
        continue;
      }
      const lvl = sp / 2;

      closeTo(lvl);
      if (lvl > curLevel()) {
        errors.push({ line: ln, code: 'indent_jump', text: raw });
        continue;
      }

      const parts = raw.trim().split(/\s+/);
      const verb = (parts[0] || '').toUpperCase();
      if (verb === 'LOOP') {
        if (parts.length < 2) {
          errors.push({ line: ln, code: 'loop_missing_repeat', text: raw });
          continue;
        }
        if (parts.length > 2) warnings.push({ line: ln, code: 'too_many_tokens', text: raw });
        const repeat = parseInt(parts[1], 10);
        if (!Number.isFinite(repeat)) {
          errors.push({ line: ln, code: 'loop_repeat_not_int', text: raw });
          continue;
        }
        if (repeat <= 0 || repeat > 10000) {
          errors.push({ line: ln, code: 'loop_repeat_out_of_range', text: raw });
          continue;
        }
        const loop = { kind: 'loop', repeat, children: [] };
        stack[stack.length - 1].children.push(loop);
        stack.push({ level: lvl + 1, children: loop.children, containerLine: ln, containerKind: 'loop' });
        continue;
      }

      if (verb === 'ROUND') {
        if (parts.length < 2) {
          errors.push({ line: ln, code: 'round_missing_repeat', text: raw });
          continue;
        }
        if (parts.length > 2) warnings.push({ line: ln, code: 'too_many_tokens', text: raw });
        const repeat = parseInt(parts[1], 10);
        if (!Number.isFinite(repeat)) {
          errors.push({ line: ln, code: 'round_repeat_not_int', text: raw });
          continue;
        }
        if (repeat <= 0 || repeat > 10000) {
          errors.push({ line: ln, code: 'round_repeat_out_of_range', text: raw });
          continue;
        }
        const round = { kind: 'round', repeat, children: [] };
        stack[stack.length - 1].children.push(round);
        stack.push({ level: lvl + 1, children: round.children, containerLine: ln, containerKind: 'round' });
        continue;
      }

      if (verb === 'FOREACH_TASK') {
        if (parts.length > 1) warnings.push({ line: ln, code: 'too_many_tokens', text: raw });
        const ft = { kind: 'foreach_task', children: [] };
        stack[stack.length - 1].children.push(ft);
        stack.push({ level: lvl + 1, children: ft.children, containerLine: ln, containerKind: 'foreach_task' });
        continue;
      }

	      if (verb === 'FOREACH_ACTION') {
	        if (parts.length > 1) warnings.push({ line: ln, code: 'too_many_tokens', text: raw });
	        // Intended nesting is under FOREACH_TASK, but keep parsing permissive.
	        const parentKind = stack.length ? stack[stack.length - 1].containerKind : null;
	        if (parentKind !== 'foreach_task') warnings.push({ line: ln, code: 'foreach_action_outside_foreach_task', text: raw });
	        const fa = { kind: 'foreach_action', children: [] };
	        stack[stack.length - 1].children.push(fa);
	        stack.push({ level: lvl + 1, children: fa.children, containerLine: ln, containerKind: 'foreach_action' });
	        continue;
	      }

	      if (verb === 'IF') {
	        const expr = String(raw.trim().slice(2) || '').trim();
	        if (!expr) {
	          errors.push({ line: ln, code: 'if_missing_expr', text: raw });
	          continue;
	        }
	        const ifn = { kind: 'if', expr, children: [] };
	        stack[stack.length - 1].children.push(ifn);
	        stack.push({ level: lvl + 1, children: ifn.children, containerLine: ln, containerKind: 'if' });
	        continue;
	      }

	      if (verb === 'ELSE') {
	        if (parts.length > 1) warnings.push({ line: ln, code: 'too_many_tokens', text: raw });
	        // Support both:
	        // - ELSE aligned with IF header (same level as IF line): attaches to prior IF sibling.
	        // - ELSE indented inside IF body (same level as IF children): attaches to currently open IF frame.
	        const top = stack[stack.length - 1];
	        if (top && top.containerKind === 'if' && Array.isArray(top.children)) {
	          const ifKids = top.children;
	          if (ifKids.some((c) => c && typeof c === 'object' && c.kind === 'else')) {
	            errors.push({ line: ln, code: 'else_duplicate', text: raw });
	            continue;
	          }
	          const en = { kind: 'else', children: [] };
	          ifKids.push(en);
	          stack.push({ level: lvl + 1, children: en.children, containerLine: ln, containerKind: 'else' });
	          continue;
	        }

	        const parentKids = top ? top.children : null;
	        const prev = Array.isArray(parentKids) && parentKids.length ? parentKids[parentKids.length - 1] : null;
	        if (!prev || typeof prev !== 'object' || prev.kind !== 'if' || !Array.isArray(prev.children)) {
	          errors.push({ line: ln, code: 'else_without_if', text: raw });
	          continue;
	        }
	        if (prev.children.some((c) => c && typeof c === 'object' && c.kind === 'else')) {
	          errors.push({ line: ln, code: 'else_duplicate', text: raw });
	          continue;
	        }
	        const en = { kind: 'else', children: [] };
	        prev.children.push(en);
	        stack.push({ level: lvl + 1, children: en.children, containerLine: ln, containerKind: 'else' });
	        continue;
	      }

	      if (verb === 'STEP' || verb === 'DISABLED') {
	        if (parts.length < 2) {
	          warnings.push({ line: ln, code: 'too_few_tokens', text: raw });
	          continue;
	        }
        const type = parts[1];
        if (!/^[A-Za-z0-9_-]+$/.test(String(type || ''))) {
          warnings.push({ line: ln, code: 'invalid_step_token', text: raw });
          continue;
        }
        if (!ALLOWED_TYPES.has(type) && !knownActions.has(type)) warnings.push({ line: ln, code: 'unknown_action_id', text: raw });
        stack[stack.length - 1].children.push({ kind: 'step', type, enabled: verb === 'STEP' });
        continue;
      }

      warnings.push({ line: ln, code: 'unknown_verb', text: raw });
    }

    closeTo(0);
    if (!root.children.length) {
      // Keep UI usable even if script is empty/garbled.
      return { ok: true, pipeline_ast: defaultPipelineAst(), warnings, errors };
    }
    return { ok: errors.length === 0, pipeline_ast: root, warnings, errors };
  }

  function pathKey(path) {
    if (!Array.isArray(path) || !path.length) return '';
    return path.map((n) => String(n)).join('.');
  }

  function parsePathKey(key) {
    if (!key) return [];
    const parts = String(key).split('.');
    const out = [];
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (!Number.isFinite(n) || n < 0) return [];
      out.push(n);
    }
    return out;
  }

	  function getContainerAndIndex(ast, path) {
	    if (!ast || typeof ast !== 'object') return null;
	    if (!Array.isArray(path) || !path.length) return null;
	    let parent = ast;
	    let container = Array.isArray(ast.children) ? ast.children : null;
	    if (!container) return null;
	    for (let d = 0; d < path.length - 1; d++) {
	      const idx = path[d];
	      const node = container[idx];
	      if (!node || typeof node !== 'object' || (node.kind !== 'loop' && node.kind !== 'round' && node.kind !== 'foreach_task' && node.kind !== 'foreach_action' && node.kind !== 'if' && node.kind !== 'else') || !Array.isArray(node.children)) return null;
	      parent = node;
	      container = node.children;
	    }
	    const index = path[path.length - 1];
	    if (index < 0 || index >= container.length) return null;
	    return { parent, container, index, node: container[index], parentPath: path.slice(0, -1) };
	  }

  function clearDropTargets() {
    const els = blocksEl.querySelectorAll('.drop-target');
    for (const el of els) el.classList.remove('drop-target');
  }

  let pipelineAst = defaultPipelineAst();
  let pipeline = normalizePipeline({ blocks: flattenAstSteps(pipelineAst) });
  let selected = '';
  let dragFrom = '';
  let dragParent = '';
  let actionsIndex = [];
  let actionsById = {};

  function setActionsIndex(list) {
    actionsIndex = Array.isArray(list) ? list.filter((a) => a && typeof a.id === 'string' && a.id.trim()) : [];
    actionsById = {};
    for (const a of actionsIndex) actionsById[String(a.id)] = a;
  }

  async function loadActionsIndex() {
    const url = backendApiUrl('/api/actions');
    if (!url) return null;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok || !Array.isArray(obj.actions)) return null;
      setActionsIndex(obj.actions);
      return obj;
    } catch (_) {
      return null;
    }
  }

  function setSelected(key) {
    selected = String(key || '');
  }

  function updateDerivedFromAst(opts) {
    const writeScript = opts && opts.writeScript;
    pipeline = normalizePipeline({ blocks: flattenAstSteps(pipelineAst) });
    pipelineJson.textContent = JSON.stringify({ pipeline, pipeline_ast: pipelineAst }, null, 2);

    if (writeScript) {
      pipelineScript.value = renderScriptFromAst(pipelineAst);
    }

    try {
      window.localStorage.setItem(LS_PIPELINE, JSON.stringify(pipeline));
      window.localStorage.setItem(LS_PIPELINE_AST, JSON.stringify(pipelineAst));
      window.localStorage.setItem(LS_PIPELINE_SCRIPT, String(pipelineScript.value || ''));
    } catch (_) {}
  }

  function updateIndentButtons() {
    const on = !!selected;
    try { pipeIndent.disabled = !on; } catch (_) {}
    try { pipeOutdent.disabled = !on; } catch (_) {}
  }

	  function renderPipeline() {
	    blocksEl.innerHTML = '';
	    updateIndentButtons();

	    function isContainerKind(kind) {
	      return kind === 'loop' || kind === 'round' || kind === 'foreach_task' || kind === 'foreach_action' || kind === 'if' || kind === 'else';
	    }

    function attachContainerDrop(ol, parentPath) {
      const parentKey = pathKey(parentPath);
      ol.addEventListener('dragover', (e) => {
        if (!dragFrom) return;
        if (dragParent !== parentKey) return;
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
      });
      ol.addEventListener('drop', (e) => {
        if (!dragFrom) return;
        if (dragParent !== parentKey) return;
        e.preventDefault();
        clearDropTargets();
        const fromPath = parsePathKey(dragFrom);
        if (!fromPath.length) return;
        const fromIndex = fromPath[fromPath.length - 1];
        let container = null;
        if (parentPath.length) {
          const info = getContainerAndIndex(pipelineAst, parentPath);
          container = info && info.node && Array.isArray(info.node.children) ? info.node.children : null;
        } else {
          container = pipelineAst.children;
        }
        const toIndex = Array.isArray(container) ? container.length : 0;
        moveWithinParent(parentPath, fromIndex, toIndex);
      });
    }

    const renderList = (ol, kids, parentPath) => {
      ol.dataset.parentPath = pathKey(parentPath);
      for (let i = 0; i < kids.length; i++) {
        const n = kids[i];
        const p = parentPath.concat([i]);
        const key = pathKey(p);
        const parentKey = pathKey(parentPath);

        const li = document.createElement('li');
        li.className = 'block' + (key === selected ? ' selected' : '') + (isContainerKind(n.kind) ? ' loop' : '') + (n.enabled === false ? ' disabled' : '');
        li.draggable = true;
        li.dataset.path = key;
        li.dataset.parent = parentKey;

        const handle = document.createElement('div');
        handle.className = 'handle';
        handle.textContent = '::';
        handle.title = 'Drag to reorder (same level only)';

        const mid = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'btitle';
	        title.textContent =
	          n.kind === 'loop' ? t('pipeline.verb_loop')
	            : n.kind === 'round' ? t('pipeline.verb_round')
	              : n.kind === 'foreach_task' ? t('pipeline.verb_foreach_task')
	                : n.kind === 'foreach_action' ? t('pipeline.verb_foreach_action')
	                : n.kind === 'if' ? (t('pipeline.verb_if') + (n.expr ? ` ${String(n.expr)}` : ''))
	                  : n.kind === 'else' ? t('pipeline.verb_else')
	                : n.type;
        const meta = document.createElement('div');
        meta.className = 'btype';
        if (n.kind === 'loop' || n.kind === 'round') {
          const row = document.createElement('div');
          row.className = 'repeat-row';

          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = 'x';
          row.appendChild(badge);

          const inp = document.createElement('input');
          inp.type = 'number';
          inp.className = 'repeat-input';
          inp.min = '1';
          inp.max = '10000';
          inp.step = '1';
          inp.inputMode = 'numeric';
          inp.title = t('pipeline.repeat_title');
          inp.setAttribute('aria-label', t('pipeline.repeat_aria'));
          inp.value = String(Number.isFinite(n.repeat) ? n.repeat : parseInt(String(n.repeat || '1'), 10) || 1);

          const err = document.createElement('div');
          err.className = 'repeat-err';
          err.textContent = t('pipeline.repeat_err');
          err.hidden = true;

          const parseVal = () => {
            const s = String(inp.value || '').trim();
            if (!s) return null;
            if (!/^[0-9]+$/.test(s)) return null;
            const v = parseInt(s, 10);
            if (!Number.isFinite(v)) return null;
            return v;
          };

          const setValid = (ok) => {
            if (ok) {
              inp.classList.remove('invalid');
              err.hidden = true;
              try { inp.setCustomValidity(''); } catch (_) {}
            } else {
              inp.classList.add('invalid');
              err.hidden = false;
              try { inp.setCustomValidity(t('pipeline.repeat_err')); } catch (_) {}
            }
          };

          const commitIfValid = () => {
            const v = parseVal();
            if (v === null || v < 1 || v > 10000) {
              setValid(false);
              return;
            }
            setValid(true);
            if (n.repeat !== v) {
              n.repeat = v;
              setPipeStatus('dirty');
              updateDerivedFromAst({ writeScript: true });
            }
          };

          inp.addEventListener('focus', () => {
            setSelected(key);
            updateIndentButtons();
          });
          inp.addEventListener('mousedown', (e) => e.stopPropagation());
          inp.addEventListener('click', (e) => e.stopPropagation());
          inp.addEventListener('input', () => commitIfValid());
          inp.addEventListener('change', () => commitIfValid());
          inp.addEventListener('blur', () => {
            // If the field is left invalid, snap back to the last valid repeat.
            const v = parseVal();
            if (v === null || v < 1 || v > 10000) {
              inp.value = String(n.repeat || 1);
              setValid(true);
            }
          });
          inp.addEventListener('keydown', (e) => {
            if (!e) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              commitIfValid();
              try { inp.blur(); } catch (_) {}
            } else if (e.key === 'Escape') {
              e.preventDefault();
              inp.value = String(n.repeat || 1);
              setValid(true);
              try { inp.blur(); } catch (_) {}
            }
          });

          row.appendChild(inp);
          meta.appendChild(row);
          meta.appendChild(err);
	        } else if (n.kind === 'foreach_task' || n.kind === 'foreach_action') {
	          const badge = document.createElement('span');
	          badge.className = 'badge';
	          badge.textContent = t('pipeline.badge_foreach');
	          meta.appendChild(badge);
	        } else if (n.kind === 'if' || n.kind === 'else') {
	          meta.textContent = '';
	        } else {
	          meta.textContent = n.enabled === false ? t('pipeline.state_disabled') : t('pipeline.state_enabled');
	        }
        mid.appendChild(title);
        mid.appendChild(meta);

        const side = document.createElement('div');
        side.className = 'bside';

        const actions = document.createElement('div');
        actions.className = 'bactions';

        const bin = document.createElement('button');
        bin.type = 'button';
        bin.className = 'mini';
        bin.textContent = t('pipeline.indent');
        bin.title = t('pipeline.indent_title');
        bin.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelected(key);
          indentSelected();
        });

        const bout = document.createElement('button');
        bout.type = 'button';
        bout.className = 'mini';
        bout.textContent = t('pipeline.outdent');
        bout.title = t('pipeline.outdent_title');
        bout.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelected(key);
          outdentSelected();
        });

        actions.appendChild(bin);
        actions.appendChild(bout);

        const bdel = document.createElement('button');
        bdel.type = 'button';
        bdel.className = 'mini danger';
        bdel.textContent = t('pipeline.delete');
        bdel.title = t('pipeline.delete_title');
        bdel.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelected(key);
          deleteSelected();
        });
        actions.appendChild(bdel);
        side.appendChild(actions);

        if (n.kind === 'step') {
          const toggle = document.createElement('label');
          toggle.className = 'btoggle';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = n.enabled !== false;
          const lbl = document.createElement('span');
          lbl.textContent = cb.checked ? t('pipeline.state_enabled') : t('pipeline.state_disabled');
          cb.addEventListener('change', (e) => {
            e.stopPropagation();
            n.enabled = !!cb.checked;
            setPipeStatus('dirty');
            updateDerivedFromAst({ writeScript: true });
            renderPipeline();
          });
          toggle.appendChild(cb);
          toggle.appendChild(lbl);
          side.appendChild(toggle);

          // Minimal wiring: allow choosing an action_id for this STEP.
          // (This sets `n.type`, which is what the canonical script uses today.)
          const sel = document.createElement('select');
          sel.className = 'input input-compact';
          sel.title = t('actions.action_title');
          sel.setAttribute('aria-label', t('actions.action'));
          sel.addEventListener('mousedown', (e) => e.stopPropagation());
          sel.addEventListener('click', (e) => e.stopPropagation());

          const curId = String(n.type || '').trim();
          const opts = [];
          // Ensure the current id is always present.
          if (curId) opts.push({ id: curId, name: curId, origin: 'current' });
          for (const a of actionsIndex) {
            const id = String(a.id || '').trim();
            if (!id) continue;
            if (id === curId) continue;
            opts.push({ id, name: String(a.name || id), origin: String(a.origin || '') });
          }

          // De-dupe while preserving order.
          const seen = new Set();
          for (const o of opts) {
            if (seen.has(o.id)) continue;
            seen.add(o.id);
            const op = document.createElement('option');
            op.value = o.id;
            op.textContent = o.origin === 'user' ? `${o.name} (${t('actions.user_suffix')})` : o.name;
            sel.appendChild(op);
          }
          sel.value = curId;
          sel.addEventListener('change', (e) => {
            e.stopPropagation();
            const next = String(sel.value || '').trim();
            if (!next || next === n.type) return;
            n.type = next;
            setPipeStatus('dirty');
            updateDerivedFromAst({ writeScript: true });
            renderPipeline();
          });
          side.appendChild(sel);

          // Copy-on-edit wiring: allow creating a user action from a default action and
          // switching this STEP to reference it.
          const bcustom = document.createElement('button');
          bcustom.type = 'button';
          bcustom.className = 'mini';
          bcustom.textContent = t('actions.customize');
          bcustom.title = t('actions.customize_title');
          bcustom.addEventListener('click', async (e) => {
            e.stopPropagation();
            const aid = String(n.type || '').trim();
            if (!aid) return;
            const meta = actionsById[aid];
            if (!meta || meta.origin !== 'default') return;
            const url = backendApiUrl(`/api/actions/${encodeURIComponent(aid)}/copy`);
            if (!url) return;
            try {
              const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ overrides: {} })
              });
              const obj = await res.json();
              if (!obj || !obj.ok || typeof obj.new_action_id !== 'string') {
                addMsg('err', 'actions', JSON.stringify(obj || { ok: false }));
                return;
              }
              await loadActionsIndex();
              n.type = String(obj.new_action_id);
              setPipeStatus('dirty');
              updateDerivedFromAst({ writeScript: true });
              renderPipeline();
            } catch (e2) {
              addMsg('err', 'actions', String(e2));
            }
          });
          bcustom.disabled = !curId || !(actionsById[curId] && actionsById[curId].origin === 'default');
          side.appendChild(bcustom);
        }

        li.appendChild(handle);
        li.appendChild(mid);
        li.appendChild(side);

        li.addEventListener('click', () => {
          setSelected(key);
          renderPipeline();
        });

        li.addEventListener('dragstart', (e) => {
          dragFrom = key;
          dragParent = parentKey;
          li.classList.add('dragging');
          try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', key);
          } catch (_) {}
        });

        li.addEventListener('dragend', () => {
          dragFrom = '';
          dragParent = '';
          li.classList.remove('dragging');
          clearDropTargets();
        });

        li.addEventListener('dragover', (e) => {
          if (!dragFrom) return;
          if (dragParent !== parentKey) return;
          e.preventDefault();
          try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
          clearDropTargets();
          li.classList.add('drop-target');
        });

        li.addEventListener('drop', (e) => {
          if (!dragFrom) return;
          if (dragParent !== parentKey) return;
          e.preventDefault();
          clearDropTargets();
          const fromPath = parsePathKey(dragFrom);
          const toPath = p;
          if (!fromPath.length || !toPath.length) return;
          const fromIndex = fromPath[fromPath.length - 1];
          const toIndex = toPath[toPath.length - 1];
          const parentPathArr = parentPath;
          moveWithinParent(parentPathArr, fromIndex, toIndex);
        });

        ol.appendChild(li);

        if (isContainerKind(n.kind) && Array.isArray(n.children)) {
          const childOl = document.createElement('ol');
          childOl.className = 'blocks nested';
          attachContainerDrop(childOl, p);
          renderList(childOl, n.children, p);
          li.appendChild(childOl);
        }
      }
    };

    // Root container.
    attachContainerDrop(blocksEl, []);
    const kids = Array.isArray(pipelineAst.children) ? pipelineAst.children : [];
    renderList(blocksEl, kids, []);
  }

  function moveWithinParent(parentPath, fromIndex, toIndex) {
    let kids = null;
    if (parentPath && parentPath.length) {
      const info = getContainerAndIndex(pipelineAst, parentPath);
      kids = info && info.node && Array.isArray(info.node.children) ? info.node.children : null;
    } else {
      kids = pipelineAst.children;
    }
    if (!Array.isArray(kids)) return;
    if (fromIndex < 0 || fromIndex >= kids.length) return;
    if (toIndex < 0) toIndex = 0;
    if (toIndex > kids.length) toIndex = kids.length;
    if (fromIndex === toIndex) return;
    const item = kids.splice(fromIndex, 1)[0];
    if (toIndex > fromIndex) toIndex -= 1;
    kids.splice(toIndex, 0, item);
    setSelected(pathKey(parentPath.concat([toIndex])));
    setPipeStatus('dirty');
    updateDerivedFromAst({ writeScript: true });
    renderPipeline();
  }

	  function removeEmptyContainers(ast) {
	    const prune = (n) => {
	      if (!n || typeof n !== 'object') return;
	      if (!Array.isArray(n.children)) return;
	      const next = [];
	      for (const c of n.children) {
	        if (!c || typeof c !== 'object') continue;
	        prune(c);
	        if ((c.kind === 'loop' || c.kind === 'round' || c.kind === 'foreach_task' || c.kind === 'foreach_action' || c.kind === 'else') && (!Array.isArray(c.children) || c.children.length === 0)) continue;
	        if (c.kind === 'if') {
	          const kids = Array.isArray(c.children) ? c.children : [];
	          const hasThen = kids.some((x) => x && typeof x === 'object' && x.kind !== 'else');
	          if (!hasThen) continue;
	        }
	        next.push(c);
	      }
	      n.children = next;
	    };
	    prune(ast);
	  }

	  function isContainerNode(n) {
	    return !!(n && typeof n === 'object' && (n.kind === 'loop' || n.kind === 'round' || n.kind === 'foreach_task' || n.kind === 'foreach_action' || n.kind === 'if' || n.kind === 'else') && Array.isArray(n.children));
	  }

  function ensureNonEmptyChildren(children) {
    if (!Array.isArray(children)) return false;
    if (children.length) return false;
    children.push({ kind: 'step', type: defaultStepType(), enabled: true });
    return true;
  }

  function fixIfNode(ifNode) {
    if (!ifNode || typeof ifNode !== 'object' || ifNode.kind !== 'if' || !Array.isArray(ifNode.children)) return;
    const kids = ifNode.children;

    // Ensure at most one ELSE child (merge duplicates) and keep ELSE as the last child.
    let elseNode = null;
    let elseIdx = -1;
    for (let i = 0; i < kids.length; i++) {
      const c = kids[i];
      if (!c || typeof c !== 'object' || c.kind !== 'else') continue;
      if (!elseNode) {
        elseNode = c;
        elseIdx = i;
      } else {
        const ek = Array.isArray(c.children) ? c.children : [];
        if (!Array.isArray(elseNode.children)) elseNode.children = [];
        elseNode.children.push(...ek);
        kids.splice(i, 1);
        i -= 1;
      }
    }

    if (elseNode && elseIdx >= 0 && elseIdx !== kids.length - 1) {
      kids.splice(elseIdx, 1);
      kids.push(elseNode);
    }

    // IF must have at least one non-ELSE child (then-branch) to remain valid.
    let hasThen = false;
    for (const c of kids) {
      if (c && typeof c === 'object' && c.kind !== 'else') {
        hasThen = true;
        break;
      }
    }
    if (!hasThen) {
      const step = { kind: 'step', type: defaultStepType(), enabled: true };
      if (elseNode && kids.length) kids.splice(kids.length - 1, 0, step);
      else kids.push(step);
    }

    // ELSE must not be empty when present; keep a placeholder STEP rather than producing else_empty.
    if (elseNode && typeof elseNode === 'object') {
      if (!Array.isArray(elseNode.children)) elseNode.children = [];
      ensureNonEmptyChildren(elseNode.children);
    }
  }

  function deleteSelected() {
    if (!selected) return;
    const path = parsePathKey(selected);
    if (path.length < 1) return;
    const info = getContainerAndIndex(pipelineAst, path);
    if (!info) return;

    const { container, index, parentPath, node } = info;
    if (!Array.isArray(container)) return;
    if (!node || typeof node !== 'object') return;

    const parentNode = info.parent;
    const touchedIfParent = !!(parentNode && typeof parentNode === 'object' && parentNode.kind === 'if');

    if (node.kind === 'step') {
      container.splice(index, 1);
    } else if (node.kind === 'if') {
      // Deleting IF should splice its then+else bodies upward, but must not leave a raw ELSE node
      // at the parent level (ELSE without IF is invalid in the script format).
      const kids = Array.isArray(node.children) ? node.children : [];
      const spliced = [];
      for (const c of kids) {
        if (c && typeof c === 'object' && c.kind === 'else') {
          const ek = Array.isArray(c.children) ? c.children : [];
          for (const e of ek) spliced.push(e);
        } else {
          spliced.push(c);
        }
      }
      if (spliced.length) container.splice(index, 1, ...spliced);
      else container.splice(index, 1);
    } else if (isContainerNode(node)) {
      const kids = Array.isArray(node.children) ? node.children : [];
      if (kids.length) container.splice(index, 1, ...kids);
      else container.splice(index, 1);
    } else {
      // Unknown node kind; ignore.
      return;
    }

    // Never allow a container (including root) to become empty; backend validate rejects empty containers.
    const insertedDefault = ensureNonEmptyChildren(container);
    if (touchedIfParent) fixIfNode(parentNode);

    let nextIndex = index;
    if (!container.length) nextIndex = 0;
    else if (nextIndex >= container.length) nextIndex = container.length - 1;
    else if (nextIndex < 0) nextIndex = 0;
    if (insertedDefault) nextIndex = 0;

    setSelected(pathKey(parentPath.concat([nextIndex])));
    setPipeStatus('dirty');
    updateDerivedFromAst({ writeScript: true });
    renderPipeline();
    updateIndentButtons();
  }

  function indentSelected() {
    if (!selected) return;
    const path = parsePathKey(selected);
    if (path.length < 1) return;
    const info = getContainerAndIndex(pipelineAst, path);
    if (!info) return;
    const { container, index, parentPath } = info;
    if (index <= 0) return;
    const prev = container[index - 1];
	    const node = container.splice(index, 1)[0];
	    if (prev && typeof prev === 'object' && (prev.kind === 'loop' || prev.kind === 'round' || prev.kind === 'foreach_task' || prev.kind === 'foreach_action' || prev.kind === 'if' || prev.kind === 'else') && Array.isArray(prev.children)) {
	      prev.children.push(node);
	      setSelected(pathKey(parentPath.concat([index - 1, prev.children.length - 1])));
	    } else {
      // Minimal, semantics-preserving behavior: wrap in LOOP 1 so indentation is meaningful.
      const loop = { kind: 'loop', repeat: 1, children: [node] };
      container.splice(index, 0, loop);
      setSelected(pathKey(parentPath.concat([index, 0])));
    }
    setPipeStatus('dirty');
    removeEmptyContainers(pipelineAst);
    updateDerivedFromAst({ writeScript: true });
    renderPipeline();
  }

  function outdentSelected() {
    if (!selected) return;
    const path = parsePathKey(selected);
    if (path.length < 2) return;
	    const info = getContainerAndIndex(pipelineAst, path);
	    if (!info) return;
	    const { container, index, parentPath } = info;
	    // parentPath points to the parent container node.
	    const containerPath = parentPath;
	    const cInfo = getContainerAndIndex(pipelineAst, containerPath);
	    if (!cInfo || !cInfo.node || (cInfo.node.kind !== 'loop' && cInfo.node.kind !== 'round' && cInfo.node.kind !== 'foreach_task' && cInfo.node.kind !== 'foreach_action' && cInfo.node.kind !== 'if' && cInfo.node.kind !== 'else')) return;
    const containerNode = cInfo.node;
    const outerParentPath = cInfo.parentPath;
    const outerInfo = outerParentPath.length ? getContainerAndIndex(pipelineAst, outerParentPath) : null;
    const outerKids = outerParentPath.length
      ? (outerInfo && outerInfo.node && Array.isArray(outerInfo.node.children) ? outerInfo.node.children : null)
      : pipelineAst.children;
    if (!Array.isArray(outerKids)) return;
    const containerIndex = cInfo.index;
    const node = container.splice(index, 1)[0];
    outerKids.splice(containerIndex + 1, 0, node);
    if (Array.isArray(containerNode.children) && containerNode.children.length === 0) {
      // Avoid generating invalid scripts (backend rejects empty containers).
      outerKids.splice(containerIndex, 1);
      setSelected(pathKey(outerParentPath.concat([containerIndex])));
    } else {
      setSelected(pathKey(outerParentPath.concat([containerIndex + 1])));
    }
    setPipeStatus('dirty');
    removeEmptyContainers(pipelineAst);
    updateDerivedFromAst({ writeScript: true });
    renderPipeline();
  }

  async function loadPipeline() {
    setPipeStatus('loading');

    const url = backendApiUrl('/api/pipeline');
    if (url) {
      try {
        const res = await fetch(url, { method: 'GET' });
        const obj = await res.json();
        if (obj && obj.ok && typeof obj.script === 'string') {
          pipelineScript.value = obj.script;
          if (obj.pipeline_ast && typeof obj.pipeline_ast === 'object') pipelineAst = normalizePipelineAst(obj.pipeline_ast);
          else if (obj.pipeline) pipelineAst = pipelineAstFromPipeline(obj.pipeline);
          setSelected('');
          updateDerivedFromAst({ writeScript: false });
          await loadActionsIndex();
          renderPipeline();
          updateIndentButtons();
          if (Array.isArray(obj.warnings) && obj.warnings.length) {
            addMsg('err', 'pipeline', JSON.stringify(obj.warnings.slice(0, 5)));
          }
          if (Array.isArray(obj.errors) && obj.errors.length) {
            addMsg('err', 'pipeline', JSON.stringify(obj.errors.slice(0, 5)));
          }
          setPipeStatus('loaded');
          return;
        }
      } catch (_) {
        // fall through
      }
    }

    try {
      const cachedAst = JSON.parse(window.localStorage.getItem(LS_PIPELINE_AST) || 'null');
      const cachedScript = window.localStorage.getItem(LS_PIPELINE_SCRIPT) || '';
      if (cachedAst && typeof cachedAst === 'object') pipelineAst = normalizePipelineAst(cachedAst);
      else {
        const cached = JSON.parse(window.localStorage.getItem(LS_PIPELINE) || 'null');
        pipelineAst = pipelineAstFromPipeline(cached);
      }
      if (cachedScript) pipelineScript.value = cachedScript;
      else pipelineScript.value = renderScriptFromAst(pipelineAst);
      setSelected('');
      updateDerivedFromAst({ writeScript: false });
      setPipeStatus('local');
      await loadActionsIndex();
      renderPipeline();
      updateIndentButtons();
      return;
    } catch (_) {}

    pipelineAst = defaultPipelineAst();
    pipelineScript.value = renderScriptFromAst(pipelineAst);
    setSelected('');
    updateDerivedFromAst({ writeScript: false });
    setPipeStatus('loaded');
    await loadActionsIndex();
    renderPipeline();
    updateIndentButtons();
  }

  async function savePipeline() {
    setPipeStatus('saving');
    window.localStorage.setItem(LS_PIPELINE, JSON.stringify(pipeline));

    const url = backendApiUrl('/api/pipeline');
    if (!url) {
      setPipeStatus('dirty');
      addMsg('err', 'pipeline', 'cannot derive backend api url');
      return;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: pipeline.blocks, script: pipelineScript.value })
      });
      const obj = await res.json();
      if (obj && obj.ok) {
        if (typeof obj.script === 'string') pipelineScript.value = obj.script;
        if (obj.pipeline_ast && typeof obj.pipeline_ast === 'object') pipelineAst = normalizePipelineAst(obj.pipeline_ast);
        else if (obj.pipeline) pipelineAst = pipelineAstFromPipeline(obj.pipeline);
        setSelected('');
        updateDerivedFromAst({ writeScript: false });
        renderPipeline();
        if (Array.isArray(obj.warnings) && obj.warnings.length) {
          addMsg('err', 'pipeline', JSON.stringify(obj.warnings.slice(0, 5)));
        }
        setPipeStatus('saved');
        return;
      }
      setPipeStatus('local');
      addMsg('err', 'pipeline', `save failed: ${JSON.stringify(obj)}`);
    } catch (e) {
      setPipeStatus('local');
      addMsg('err', 'pipeline', `save error: ${String(e)}`);
    }
  }

  function resetPipeline() {
    pipelineAst = defaultPipelineAst();
    setSelected('');
    setPipeStatus('dirty');
    updateDerivedFromAst({ writeScript: true });
    renderPipeline();
    updateIndentButtons();
  }

  let scriptValidateTimer = null;

  async function validatePipelineScript(script, opts) {
    const url = backendApiUrl('/api/pipeline/validate');
    if (!url) {
      const r = parseScriptToAst(script);
      if (r.ok && r.pipeline_ast) {
        pipelineAst = normalizePipelineAst(r.pipeline_ast);
        setSelected('');
        updateDerivedFromAst({ writeScript: false });
        renderPipeline();
      } else if (!opts || !opts.quiet) {
        if (Array.isArray(r.errors) && r.errors.length) addMsg('err', 'pipeline errors', JSON.stringify(r.errors.slice(0, 5)));
      }
      return;
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: String(script || '') })
      });
      const obj = await res.json();
      if (obj && obj.ok && obj.pipeline_ast) {
        pipelineAst = normalizePipelineAst(obj.pipeline_ast);
        setSelected('');
        updateDerivedFromAst({ writeScript: false });
        renderPipeline();
        if (!opts || !opts.quiet) {
          if (Array.isArray(obj.warnings) && obj.warnings.length) {
            addMsg('err', 'pipeline warnings', JSON.stringify(obj.warnings.slice(0, 5)));
          }
        }
        return;
      }
      if (!opts || !opts.quiet) {
        if (obj && Array.isArray(obj.errors) && obj.errors.length) {
          addMsg('err', 'pipeline errors', JSON.stringify(obj.errors.slice(0, 5)));
        } else {
          addMsg('err', 'pipeline validate', JSON.stringify(obj));
        }
      }
    } catch (e) {
      const r = parseScriptToAst(script);
      if (r.ok && r.pipeline_ast) {
        pipelineAst = normalizePipelineAst(r.pipeline_ast);
        setSelected('');
        updateDerivedFromAst({ writeScript: false });
        renderPipeline();
        if (!opts || !opts.quiet) {
          if (Array.isArray(r.warnings) && r.warnings.length) addMsg('err', 'pipeline warnings', JSON.stringify(r.warnings.slice(0, 5)));
        }
      } else if (!opts || !opts.quiet) {
        addMsg('err', 'pipeline validate', String(e));
        if (Array.isArray(r.errors) && r.errors.length) addMsg('err', 'pipeline errors', JSON.stringify(r.errors.slice(0, 5)));
      }
    }
  }

  async function callRun(path) {
    const url = backendApiUrl(path);
    if (!url) {
      addMsg('err', 'run', 'cannot derive backend api url');
      return;
    }
    try {
      const res = await fetch(url, { method: 'POST' });
      const obj = await res.json();
      if (obj && obj.ok && obj.status) {
        setRunStatus(obj.status.status, obj.status.task_id, obj.status.block);
      }
    } catch (e) {
      addMsg('err', 'run', String(e));
    }
  }

  async function loadRunStatus() {
    const url = backendApiUrl('/api/run/status');
    if (!url) return;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (obj && obj.ok && obj.status) {
        setRunStatus(obj.status.status, obj.status.task_id, obj.status.block);
      }
    } catch (_) {}
  }

  let ws = null;
  let reconnectTimer = null;
  let reconnectMs = 400;

  function connect() {
    const wsUrl = parseBackendWsUrl();
    backendHint.textContent = wsUrl;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    setConn('connecting');

    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      addMsg('err', 'ws error', String(e));
      setConn('disconnected');
      scheduleReconnect();
      return;
    }

    ws.addEventListener('open', () => {
      reconnectMs = 400;
      setConn('connected');
      addMsg('hello', 'ws', 'connected');
    });

    ws.addEventListener('message', (evt) => {
      let obj = null;
      try {
        obj = JSON.parse(evt.data);
      } catch (_) {
        addMsg('hello', 'event', String(evt.data));
        return;
      }

      if (obj && obj.type === 'hello') {
        addMsg('hello', 'hello', `client_id=${obj.client_id}`);
      } else if (obj && obj.type === 'chat' && obj.message) {
        addChatMessage(obj.message);
      } else if (obj && obj.type === 'outbox_written' && obj.outbox && obj.outbox.filename) {
        addMsg('hello', 'outbox', `wrote ${obj.outbox.filename}`);
      } else if (obj && obj.type === 'pipeline_updated' && typeof obj.script === 'string') {
        pipelineScript.value = obj.script;
        if (Array.isArray(obj.warnings) && obj.warnings.length) {
          addMsg('err', 'pipeline', JSON.stringify(obj.warnings.slice(0, 5)));
        }
        // Refresh nested UI from the canonical script (best-effort).
        validatePipelineScript(obj.script, { quiet: true });
        setPipeStatus('loaded');
      } else if (obj && obj.type === 'project_active_changed' && obj.project_id) {
        if (activeProject) activeProject.textContent = String(obj.project_id);
        if (projectActiveSettings) projectActiveSettings.value = String(obj.project_id);
        loadMaterialsIndex();
        loadOutputsIndex();
        loadTaskBatchesIndex({ project_id: String(obj.project_id || '').trim() });
        loadProjectSettings();
      } else if (obj && obj.type === 'project_settings_updated' && obj.project_id) {
        // Best-effort refresh (covers updates from other clients).
        loadProjectSettings();
      } else if (obj && obj.type === 'output_created') {
        const rel = String(obj.project_rel_path || obj.path || '').trim();
        if (rel) addMsg('hello', t('outputs.title'), `${t('outputs.created')} ${rel}`);
        scheduleOutputsRefresh(350);
      } else if (obj && obj.type === 'tasks_batch_created') {
        const bid = String(obj.batch_id || '').trim();
        if (bid) addMsg('hello', t('tasks_batches.title'), `${t('tasks_batches.created')} ${bid}`);
        else addMsg('hello', t('tasks_batches.title'), t('tasks_batches.created'));
        scheduleBatchesRefresh(500);
      } else if (obj && obj.type === 'tasks_batch_activated') {
        const bid = String(obj.batch_id || '').trim();
        if (bid) addMsg('hello', t('tasks_batches.title'), `${t('tasks_batches.activated')} ${bid}`);
        else addMsg('hello', t('tasks_batches.title'), t('tasks_batches.activated'));
        scheduleBatchesRefresh(500);
      } else if (obj && obj.type === 'action_created') {
        // Refresh Action Library index so new user actions are selectable without reload.
        loadActionsIndex().then(() => renderPipeline());
      } else if (obj && obj.type === 'run_status') {
        setRunStatus(obj.status, obj.task_id, obj.block);
      } else if (obj && obj.type === 'task_status') {
        addMsg('hello', 'task', `${obj.task_id}: ${obj.status}`);
      } else if (obj && obj.type === 'log' && obj.line) {
        addMsg('hello', 'log', String(obj.line));
      } else if (obj && obj.type) {
        addMsg('hello', obj.type, JSON.stringify(obj));
      } else {
        addMsg('hello', 'event', JSON.stringify(obj));
      }
    });

    ws.addEventListener('close', () => {
      setConn('disconnected');
      scheduleReconnect();
    });

    ws.addEventListener('error', () => {
      setConn('disconnected');
      scheduleReconnect();
    });
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    const wait = Math.min(5000, reconnectMs);
    reconnectMs = Math.min(5000, Math.floor(reconnectMs * 1.7));
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, wait);
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (chatInput.value || '').trim();
    if (!text) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      // Avoid double-render (optimistic + server broadcast). The server will
      // broadcast a canonical chat message back over WS.
      ws.send(JSON.stringify({ type: 'chat', text }));
    } else {
      addMsg('hello', 'you', text);
      // Fallback to REST if WS isn't available.
      const url = backendApiUrl('/api/chat/send');
      if (!url) {
        addMsg('err', 'chat', 'cannot derive backend api url');
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        }).catch((e2) => addMsg('err', 'chat', String(e2)));
      }
    }

    chatInput.value = '';
  });

  // Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('service_worker.js')
        .catch((e) => addMsg('err', 'sw', String(e)));
    });
  }

  backendHint.addEventListener('click', () => {
    const current = parseBackendWsUrl();
    const next = window.prompt(t('ws.set_url_prompt'), current);
    if (!next) return;
    window.localStorage.setItem(LS_WS_URL, next.trim());
    addMsg('hello', 'ws', `saved ws url: ${next.trim()}`);
    if (ws) try { ws.close(); } catch (_) {}
    connect();
    loadPipeline();
    chatHistoryLoadedKey = null;
    // Keep seenChatIds so history reload doesn't duplicate existing messages.
    loadChatHistory();
    loadRunStatus();
    loadSettings();
  });

  pipeSave.addEventListener('click', () => savePipeline());
  pipeReset.addEventListener('click', () => {
    resetPipeline();
    savePipeline();
  });
  pipeIndent.addEventListener('click', () => indentSelected());
  pipeOutdent.addEventListener('click', () => outdentSelected());

  function defaultStepType() {
    if (ALLOWED_TYPES.has('write')) return 'write';
    if (ALLOWED_TYPES.has('plan')) return 'plan';
    const arr = Array.from(ALLOWED_TYPES);
    return arr.length ? arr[0] : 'write';
  }

  function insertContainer(kind) {
    const k = String(kind || '');
    if (k !== 'loop' && k !== 'round' && k !== 'foreach_task' && k !== 'foreach_action' && k !== 'if') return;

    const wrapSelected = () => {
      if (!selected) return false;
      const path = parsePathKey(selected);
      if (!path.length) return false;
      const info = getContainerAndIndex(pipelineAst, path);
      if (!info) return false;
      const node = info.container[info.index];
      if (!node || typeof node !== 'object') return false;
      const containerNode =
        k === 'foreach_task'
          ? { kind: 'foreach_task', children: [node] }
          : k === 'foreach_action'
            ? { kind: 'foreach_action', children: [node] }
            : k === 'if'
              ? {
                  kind: 'if',
                  expr: 'true',
                  children: [
                    node,
                    { kind: 'else', children: [{ kind: 'step', type: defaultStepType(), enabled: true }] }
                  ]
                }
              : { kind: k, repeat: 1, children: [node] };
      if (containerNode.kind === 'if') fixIfNode(containerNode);
      info.container.splice(info.index, 1, containerNode);
      setSelected(pathKey(info.parentPath.concat([info.index])));
      return true;
    };

    const appendRoot = () => {
      const step = { kind: 'step', type: defaultStepType(), enabled: true };
      const containerNode =
        k === 'foreach_task'
          ? { kind: 'foreach_task', children: [step] }
          : k === 'foreach_action'
            ? { kind: 'foreach_action', children: [step] }
            : k === 'if'
              ? {
                  kind: 'if',
                  expr: 'true',
                  children: [
                    step,
                    { kind: 'else', children: [{ kind: 'step', type: defaultStepType(), enabled: true }] }
                  ]
                }
              : { kind: k, repeat: 1, children: [step] };
      if (containerNode.kind === 'if') fixIfNode(containerNode);
      if (!Array.isArray(pipelineAst.children)) pipelineAst.children = [];
      pipelineAst.children.push(containerNode);
      setSelected(pathKey([pipelineAst.children.length - 1]));
      return true;
    };

    if (!wrapSelected()) appendRoot();

    setPipeStatus('dirty');
    removeEmptyContainers(pipelineAst);
    updateDerivedFromAst({ writeScript: true });
    renderPipeline();
    updateIndentButtons();
  }

  if (pipeAddLoop) pipeAddLoop.addEventListener('click', () => insertContainer('loop'));
  if (pipeAddRound) pipeAddRound.addEventListener('click', () => insertContainer('round'));
  if (pipeAddForeachTask) pipeAddForeachTask.addEventListener('click', () => insertContainer('foreach_task'));
  if (pipeAddForeachAction) pipeAddForeachAction.addEventListener('click', () => insertContainer('foreach_action'));
  if (pipeAddIf) pipeAddIf.addEventListener('click', () => insertContainer('if'));

  pipelineScript.addEventListener('input', () => {
    setPipeStatus('dirty');
    try { window.localStorage.setItem(LS_PIPELINE_SCRIPT, String(pipelineScript.value || '')); } catch (_) {}
    if (scriptValidateTimer) clearTimeout(scriptValidateTimer);
    scriptValidateTimer = setTimeout(() => {
      scriptValidateTimer = null;
      validatePipelineScript(pipelineScript.value);
    }, 500);
  });

  document.addEventListener('keydown', (e) => {
    const ae = document.activeElement;
    const tag = ae && ae.tagName ? String(ae.tagName).toUpperCase() : '';
    // Respect typing in inputs/textarea.
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!e) return;

    if (e.key === 'Tab') {
      if (!selected) return;
      e.preventDefault();
      if (e.shiftKey) outdentSelected();
      else indentSelected();
      return;
    }

    if (e.key === 'Delete') {
      if (!selected) return;
      e.preventDefault();
      deleteSelected();
    }
  });

  runStart.addEventListener('click', () => callRun('/api/run/start'));
  runPause.addEventListener('click', () => callRun('/api/run/pause'));
  runResume.addEventListener('click', () => callRun('/api/run/resume'));
  runStop.addEventListener('click', () => callRun('/api/run/stop'));

  openSettings.addEventListener('click', () => {
    openModal();
    loadSettings();
    loadProjectSettings();
  });
  closeSettings.addEventListener('click', () => closeModal());
  settingsModal.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close) closeModal();
  });
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    Promise.all([saveSettingsFromForm(), saveProjectSettingsFromForm()]).then(() => closeModal());
  });
  testCodex.addEventListener('click', () => testCodexStub());

  if (projectSelect) {
    projectSelect.addEventListener('change', () => {
      const pid = String(projectSelect.value || '').trim();
      if (!pid) return;
      setActiveProject(pid).then(() => {
        loadProjects().then((pj) => {
          if (pj && Array.isArray(pj.projects) && projectSelect) {
            // keep options stable
            const cur = String(pid);
            projectSelect.value = cur;
          }
        });
        loadMaterialsIndex({ skipSelectSync: true });
        loadOutputsIndex({ skipSelectSync: true });
        loadTaskBatchesIndex({ project_id: pid });
        loadProjectSettings();
      });
    });
  }

  connect();
  loadPipeline();
  loadChatHistory();
  loadRunStatus();
  loadSettings();
  function applyProjectsToUi(pj) {
    if (!projectSelect) return;
    if (!pj || !pj.ok) return;
    projectSelect.innerHTML = '';
    const projs = Array.isArray(pj.projects) ? pj.projects : [];
    const active = typeof pj.active_project === 'string' ? pj.active_project : '';
    for (const pr of projs) {
      if (!pr || typeof pr.id !== 'string') continue;
      const opt = document.createElement('option');
      opt.value = pr.id;
      opt.textContent = pr.id;
      projectSelect.appendChild(opt);
    }
    if (active) projectSelect.value = active;
    if (activeProject) activeProject.textContent = active || 'default';
  }

  loadProjects().then((pj) => {
    applyProjectsToUi(pj);
    loadMaterialsIndex();
    loadOutputsIndex();
    const pid = projectSelect ? String(projectSelect.value || '').trim() : '';
    loadTaskBatchesIndex({ project_id: pid });
  });

  // Poll materials index so dropping files shows up without reload.
  let materialsPollN = 0;
  let materialsPollMs = 2000;
  function tickMaterialsPoll() {
    const url = backendApiUrl('/api/materials/index');
    if (!url) {
      // Backend URL is unknown; keep a slower retry cadence.
      materialsPollMs = Math.min(15000, Math.floor(materialsPollMs * 1.7));
      setTimeout(tickMaterialsPoll, materialsPollMs);
      return;
    }
    materialsPollN += 1;
    loadMaterialsIndex().then((obj) => {
      if (obj) materialsPollMs = 2000;
      else materialsPollMs = Math.min(15000, Math.floor(materialsPollMs * 1.7));
      if (projectSelect && projectSelect.childElementCount === 0 && materialsPollN % 3 === 0) {
        loadProjects().then((pj) => applyProjectsToUi(pj));
      }
      setTimeout(tickMaterialsPoll, materialsPollMs);
    });
  }
  setTimeout(tickMaterialsPoll, materialsPollMs);

  // Poll outputs index at a slower cadence so the panel stays fresh even if WS is down.
  let outputsPollN = 0;
  let outputsPollMs = 5000;
  function tickOutputsPoll() {
    const url = backendApiUrl('/api/outputs/index');
    if (!url) {
      outputsPollMs = Math.min(20000, Math.floor(outputsPollMs * 1.7));
      setTimeout(tickOutputsPoll, outputsPollMs);
      return;
    }
    outputsPollN += 1;
    loadOutputsIndex().then((obj) => {
      if (obj) outputsPollMs = 5000;
      else outputsPollMs = Math.min(20000, Math.floor(outputsPollMs * 1.7));
      setTimeout(tickOutputsPoll, outputsPollMs);
    });
  }
  setTimeout(tickOutputsPoll, outputsPollMs);
})();
