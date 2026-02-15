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
      'materials.empty': '(no materials yet)',
      'pipeline.indent': 'Indent',
      'pipeline.outdent': 'Outdent',
      'pipeline.indent_title': 'Indent selected block (Tab)',
      'pipeline.outdent_title': 'Outdent selected block (Shift+Tab)',
      'pipeline.script_canonical': 'Pipeline script (canonical)',
      'pipeline.json_derived': 'Pipeline JSON (derived)',
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
      'settings.codex_gate_hint_3': 'with “Enable agent runner”.'
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
      'materials.empty': '（暂无材料）',
      'pipeline.indent': '缩进',
      'pipeline.outdent': '取消缩进',
      'pipeline.indent_title': '缩进选中块 (Tab)',
      'pipeline.outdent_title': '取消缩进 (Shift+Tab)',
      'pipeline.script_canonical': '流水线脚本（规范）',
      'pipeline.json_derived': '流水线 JSON（派生）',
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
      'settings.codex_gate_hint_3': '且勾选“启用代理运行器”。'
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
      'materials.empty': '（尚無素材）',
      'pipeline.indent': '縮排',
      'pipeline.outdent': '取消縮排',
      'pipeline.indent_title': '縮排所選區塊 (Tab)',
      'pipeline.outdent_title': '取消縮排 (Shift+Tab)',
      'pipeline.script_canonical': '流程腳本（規範）',
      'pipeline.json_derived': '流程 JSON（衍生）',
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
      'settings.codex_gate_hint_3': '並勾選「啟用代理執行器」。'
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
      'materials.empty': '（素材なし）',
      'pipeline.indent': 'インデント',
      'pipeline.outdent': 'アウトデント',
      'pipeline.indent_title': '選択ブロックをインデント (Tab)',
      'pipeline.outdent_title': 'アウトデント (Shift+Tab)',
      'pipeline.script_canonical': 'パイプラインスクリプト（正）',
      'pipeline.json_derived': 'パイプライン JSON（派生）',
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
      'settings.codex_gate_hint_3': 'にして「エージェント実行を有効化」。'
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
      'materials.empty': '(자료 없음)',
      'pipeline.indent': '들여쓰기',
      'pipeline.outdent': '내어쓰기',
      'pipeline.indent_title': '선택 블록 들여쓰기 (Tab)',
      'pipeline.outdent_title': '내어쓰기 (Shift+Tab)',
      'pipeline.script_canonical': '파이프라인 스크립트(원본)',
      'pipeline.json_derived': '파이프라인 JSON(파생)',
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
      'settings.codex_gate_hint_3': '로 설정 후 “에이전트 실행 활성화”.'
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
      'materials.empty': '(chua co tai lieu)',
      'pipeline.indent': 'Thut vao',
      'pipeline.outdent': 'Thut ra',
      'pipeline.indent_title': 'Thut vao khoi da chon (Tab)',
      'pipeline.outdent_title': 'Thut ra (Shift+Tab)',
      'pipeline.script_canonical': 'Script pipeline (chuan)',
      'pipeline.json_derived': 'Pipeline JSON (suy ra)',
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
      'settings.codex_gate_hint_3': 'va chon “Bat agent runner”.'
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
      'materials.empty': '(لا توجد مواد بعد)',
      'pipeline.indent': 'إزاحة للداخل',
      'pipeline.outdent': 'إزاحة للخارج',
      'pipeline.indent_title': 'إزاحة الكتلة المحددة (Tab)',
      'pipeline.outdent_title': 'إزاحة للخارج (Shift+Tab)',
      'pipeline.script_canonical': 'نص خط الأنابيب (مرجعي)',
      'pipeline.json_derived': 'JSON لخط الأنابيب (مشتق)',
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
      'settings.codex_gate_hint_3': 'مع “تمكين تشغيل الوكيل”.'
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
      'materials.empty': '(aucun document)',
      'pipeline.indent': 'Indenter',
      'pipeline.outdent': 'Désindenter',
      'pipeline.indent_title': 'Indenter le bloc sélectionné (Tab)',
      'pipeline.outdent_title': 'Désindenter (Shift+Tab)',
      'pipeline.script_canonical': 'Script du pipeline (canonique)',
      'pipeline.json_derived': 'JSON du pipeline (dérivé)',
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
      'settings.codex_gate_hint_3': 'avec « Activer le runner agent ».'
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
      'materials.empty': '(sin materiales)',
      'pipeline.indent': 'Indentar',
      'pipeline.outdent': 'Desindentar',
      'pipeline.indent_title': 'Indentar bloque seleccionado (Tab)',
      'pipeline.outdent_title': 'Desindentar (Shift+Tab)',
      'pipeline.script_canonical': 'Script del pipeline (canónico)',
      'pipeline.json_derived': 'JSON del pipeline (derivado)',
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
      'settings.codex_gate_hint_3': 'con “Habilitar runner del agente”.'
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
      'materials.empty': '(нет материалов)',
      'pipeline.indent': 'Вложить',
      'pipeline.outdent': 'Развернуть',
      'pipeline.indent_title': 'Вложить выбранный блок (Tab)',
      'pipeline.outdent_title': 'Развернуть (Shift+Tab)',
      'pipeline.script_canonical': 'Скрипт пайплайна (канон.)',
      'pipeline.json_derived': 'JSON пайплайна (производный)',
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
      'settings.codex_gate_hint_3': 'с «Включить запуск агента».'
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
      'materials.empty': '(keine Materialien)',
      'pipeline.indent': 'Einrücken',
      'pipeline.outdent': 'Ausrücken',
      'pipeline.indent_title': 'Ausgewählten Block einrücken (Tab)',
      'pipeline.outdent_title': 'Ausrücken (Shift+Tab)',
      'pipeline.script_canonical': 'Pipeline-Skript (kanonisch)',
      'pipeline.json_derived': 'Pipeline-JSON (abgeleitet)',
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
      'settings.codex_gate_hint_3': 'mit „Agent-Runner aktivieren“.'
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
  const pipeSave = $('pipeSave');
  const pipeReset = $('pipeReset');
  const pipeStatus = $('pipeStatus');
  const pipelineJson = $('pipelineJson');
  const pipelineScript = $('pipelineScript');

  const activeProject = $('activeProject');
  const projectSelect = $('projectSelect');
  const materialsList = $('materialsList');

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

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent })
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
    const cleanNode = (n) => {
      if (!n || typeof n !== 'object') return null;
      if (n.kind === 'step') return cleanStep(n);
      if (n.kind === 'loop') return cleanLoop(n);
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
      if (n.kind === 'loop' && Array.isArray(n.children)) {
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
    if (n.kind === 'loop') return true;
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
      }
    };
    const kids = ast && typeof ast === 'object' && Array.isArray(ast.children) ? ast.children : [];
    for (const c of kids) emit(c, 0);
    return lines.join('\n') + '\n';
  }

  function parseScriptToAst(script) {
    const warnings = [];
    const errors = [];

    const root = { kind: 'root', version: 2, children: [] };
    const stack = [{ level: 0, children: root.children, loopLine: null }];

    function curLevel() {
      return stack[stack.length - 1].level;
    }

    function closeTo(level) {
      while (stack.length && level < stack[stack.length - 1].level) {
        const top = stack[stack.length - 1];
        if (top.loopLine !== null && (!top.children || !top.children.length)) {
          errors.push({ line: top.loopLine, code: 'loop_empty', text: 'LOOP' });
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
        stack.push({ level: lvl + 1, children: loop.children, loopLine: ln });
        continue;
      }

      if (verb === 'STEP' || verb === 'DISABLED') {
        if (parts.length < 2) {
          warnings.push({ line: ln, code: 'too_few_tokens', text: raw });
          continue;
        }
        const type = parts[1];
        if (!ALLOWED_TYPES.has(type)) {
          warnings.push({ line: ln, code: 'unknown_type', text: raw });
          continue;
        }
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
      if (!node || typeof node !== 'object' || node.kind !== 'loop' || !Array.isArray(node.children)) return null;
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
        li.className = 'block' + (key === selected ? ' selected' : '') + (n.kind === 'loop' ? ' loop' : '') + (n.enabled === false ? ' disabled' : '');
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
        title.textContent = n.kind === 'loop' ? 'LOOP' : n.type;
        const meta = document.createElement('div');
        meta.className = 'btype';
        if (n.kind === 'loop') {
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = `x${n.repeat || 1}`;
          meta.appendChild(badge);
        } else {
          meta.textContent = n.enabled === false ? 'disabled' : 'enabled';
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
        bin.textContent = 'Indent';
        bin.title = 'Indent (Tab)';
        bin.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelected(key);
          indentSelected();
        });

        const bout = document.createElement('button');
        bout.type = 'button';
        bout.className = 'mini';
        bout.textContent = 'Outdent';
        bout.title = 'Outdent (Shift+Tab)';
        bout.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelected(key);
          outdentSelected();
        });

        actions.appendChild(bin);
        actions.appendChild(bout);
        side.appendChild(actions);

        if (n.kind === 'step') {
          const toggle = document.createElement('label');
          toggle.className = 'btoggle';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = n.enabled !== false;
          cb.addEventListener('change', (e) => {
            e.stopPropagation();
            n.enabled = !!cb.checked;
            setPipeStatus('dirty');
            updateDerivedFromAst({ writeScript: true });
            renderPipeline();
          });
          const t = document.createElement('span');
          t.textContent = 'enabled';
          toggle.appendChild(cb);
          toggle.appendChild(t);
          side.appendChild(toggle);
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

        if (n.kind === 'loop' && Array.isArray(n.children)) {
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

  function removeEmptyLoops(ast) {
    const prune = (n) => {
      if (!n || typeof n !== 'object') return;
      if (!Array.isArray(n.children)) return;
      const next = [];
      for (const c of n.children) {
        if (!c || typeof c !== 'object') continue;
        prune(c);
        if (c.kind === 'loop' && (!Array.isArray(c.children) || c.children.length === 0)) {
          continue;
        }
        next.push(c);
      }
      n.children = next;
    };
    prune(ast);
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
    if (prev && typeof prev === 'object' && prev.kind === 'loop' && Array.isArray(prev.children)) {
      prev.children.push(node);
      setSelected(pathKey(parentPath.concat([index - 1, prev.children.length - 1])));
    } else {
      // Minimal, semantics-preserving behavior: wrap in LOOP 1 so indentation is meaningful.
      const loop = { kind: 'loop', repeat: 1, children: [node] };
      container.splice(index, 0, loop);
      setSelected(pathKey(parentPath.concat([index, 0])));
    }
    setPipeStatus('dirty');
    removeEmptyLoops(pipelineAst);
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
    // parentPath points to the parent loop node.
    const loopPath = parentPath;
    const loopInfo = getContainerAndIndex(pipelineAst, loopPath);
    if (!loopInfo || !loopInfo.node || loopInfo.node.kind !== 'loop') return;
    const loopNode = loopInfo.node;
    const outerParentPath = loopInfo.parentPath;
    const outerInfo = outerParentPath.length ? getContainerAndIndex(pipelineAst, outerParentPath) : null;
    const outerKids = outerParentPath.length
      ? (outerInfo && outerInfo.node && Array.isArray(outerInfo.node.children) ? outerInfo.node.children : null)
      : pipelineAst.children;
    if (!Array.isArray(outerKids)) return;
    const loopIndex = loopInfo.index;
    const node = container.splice(index, 1)[0];
    outerKids.splice(loopIndex + 1, 0, node);
    if (Array.isArray(loopNode.children) && loopNode.children.length === 0) {
      // Avoid generating invalid scripts (backend rejects empty loops).
      outerKids.splice(loopIndex, 1);
      setSelected(pathKey(outerParentPath.concat([loopIndex])));
    } else {
      setSelected(pathKey(outerParentPath.concat([loopIndex + 1])));
    }
    setPipeStatus('dirty');
    removeEmptyLoops(pipelineAst);
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
      renderPipeline();
      updateIndentButtons();
      return;
    } catch (_) {}

    pipelineAst = defaultPipelineAst();
    pipelineScript.value = renderScriptFromAst(pipelineAst);
    setSelected('');
    updateDerivedFromAst({ writeScript: false });
    setPipeStatus('loaded');
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
        loadMaterialsIndex();
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
    if (!e || e.key !== 'Tab') return;
    const ae = document.activeElement;
    const tag = ae && ae.tagName ? String(ae.tagName).toUpperCase() : '';
    // Respect typing in inputs/textarea.
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!selected) return;
    e.preventDefault();
    if (e.shiftKey) outdentSelected();
    else indentSelected();
  });

  runStart.addEventListener('click', () => callRun('/api/run/start'));
  runPause.addEventListener('click', () => callRun('/api/run/pause'));
  runResume.addEventListener('click', () => callRun('/api/run/resume'));
  runStop.addEventListener('click', () => callRun('/api/run/stop'));

  openSettings.addEventListener('click', () => {
    openModal();
    loadSettings();
  });
  closeSettings.addEventListener('click', () => closeModal());
  settingsModal.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close) closeModal();
  });
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettingsFromForm().then(() => closeModal());
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
  });

  // Poll materials index so dropping files shows up without reload.
  let materialsPollN = 0;
  setInterval(() => {
    materialsPollN += 1;
    loadMaterialsIndex();
    if (projectSelect && projectSelect.childElementCount === 0 && materialsPollN % 3 === 0) {
      loadProjects().then((pj) => applyProjectsToUi(pj));
    }
  }, 2000);
})();
