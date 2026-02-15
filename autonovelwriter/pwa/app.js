(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const chatLog = $('chatLog');
  const chatForm = $('chatForm');
  const chatInput = $('chatInput');
  const conn = $('conn');
  const backendHint = $('backendHint');

  const blocksEl = $('blocks');
  const pipeSave = $('pipeSave');
  const pipeReset = $('pipeReset');
  const pipeStatus = $('pipeStatus');
  const pipelineJson = $('pipelineJson');
  const pipelineScript = $('pipelineScript');

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
  let chatHistoryLoadedKey = null;
  const seenChatIds = new Set();

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

  function setConn(state) {
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
    runPill.textContent = state || 'idle';
    runPill.classList.remove('ok', 'warn');
    if (state === 'running') runPill.classList.add('warn');
    if (state === 'paused') runPill.classList.add('warn');
    if (state === 'idle') runPill.classList.add('ok');
    const extra = [taskId ? `task=${taskId}` : null, block ? `block=${block}` : null].filter(Boolean).join(' ');
    runPill.title = extra || 'Runner status';
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
        addMsg('hello', 'settings', 'saved');
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

  let pipeline = defaultPipeline();
  let dragFrom = null;

  function clearDropTargets() {
    const els = blocksEl.querySelectorAll('.drop-target');
    for (const el of els) el.classList.remove('drop-target');
  }

  function moveBlock(from, to) {
    if (from === to) return;
    if (from < 0 || from >= pipeline.blocks.length) return;
    if (to < 0) to = 0;
    if (to > pipeline.blocks.length) to = pipeline.blocks.length;

    const item = pipeline.blocks.splice(from, 1)[0];
    // If moving down, the removal shifts the target index by -1.
    if (to > from) to -= 1;
    pipeline.blocks.splice(to, 0, item);
  }

  function renderPipeline() {
    blocksEl.innerHTML = '';

    for (let i = 0; i < pipeline.blocks.length; i++) {
      const b = pipeline.blocks[i];
      const li = document.createElement('li');
      li.className = 'block' + (b.enabled ? '' : ' disabled');
      li.draggable = true;
      li.dataset.index = String(i);

      const handle = document.createElement('div');
      handle.className = 'handle';
      handle.textContent = '::';
      handle.title = 'Drag to reorder';

      const mid = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'btitle';
      title.textContent = b.type;
      const type = document.createElement('div');
      type.className = 'btype';
      type.textContent = b.enabled ? 'enabled' : 'disabled';
      mid.appendChild(title);
      mid.appendChild(type);

      const toggle = document.createElement('label');
      toggle.className = 'btoggle';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!b.enabled;
      cb.addEventListener('change', () => {
        b.enabled = cb.checked;
        setPipeStatus('dirty');
        renderPipeline();
      });
      const t = document.createElement('span');
      t.textContent = 'enabled';
      toggle.appendChild(cb);
      toggle.appendChild(t);

      li.appendChild(handle);
      li.appendChild(mid);
      li.appendChild(toggle);

      li.addEventListener('dragstart', (e) => {
        dragFrom = i;
        li.classList.add('dragging');
        try {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(i));
        } catch (_) {}
      });

      li.addEventListener('dragend', () => {
        dragFrom = null;
        li.classList.remove('dragging');
        clearDropTargets();
      });

      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
        clearDropTargets();
        li.classList.add('drop-target');
      });

      li.addEventListener('drop', (e) => {
        e.preventDefault();
        clearDropTargets();
        let from = dragFrom;
        if (from === null) {
          try { from = Number(e.dataTransfer.getData('text/plain')); } catch (_) {}
        }
        const to = i;
        if (typeof from !== 'number' || Number.isNaN(from)) return;
        moveBlock(from, to);
        setPipeStatus('dirty');
        renderPipeline();
      });

      blocksEl.appendChild(li);
    }

    pipelineJson.textContent = JSON.stringify(pipeline, null, 2);
  }

  blocksEl.addEventListener('dragover', (e) => {
    // Allow dropping into empty list / after last element.
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
  });

  blocksEl.addEventListener('drop', (e) => {
    // Drop on the list container appends to end.
    e.preventDefault();
    clearDropTargets();
    let from = dragFrom;
    if (from === null) {
      try { from = Number(e.dataTransfer.getData('text/plain')); } catch (_) {}
    }
    if (typeof from !== 'number' || Number.isNaN(from)) return;
    moveBlock(from, pipeline.blocks.length);
    setPipeStatus('dirty');
    renderPipeline();
  });

  async function loadPipeline() {
    setPipeStatus('loading');

    const url = backendApiUrl('/api/pipeline');
    if (url) {
      try {
        const res = await fetch(url, { method: 'GET' });
        const obj = await res.json();
        if (obj && obj.ok && obj.pipeline) {
          pipeline = normalizePipeline(obj.pipeline);
          if (typeof obj.script === 'string') pipelineScript.value = obj.script;
          if (Array.isArray(obj.warnings) && obj.warnings.length) {
            addMsg('err', 'pipeline warnings', JSON.stringify(obj.warnings.slice(0, 5)));
          }
          window.localStorage.setItem(LS_PIPELINE, JSON.stringify(pipeline));
          setPipeStatus('loaded');
          renderPipeline();
          return;
        }
      } catch (_) {
        // fall through
      }
    }

    try {
      const cached = JSON.parse(window.localStorage.getItem(LS_PIPELINE) || 'null');
      pipeline = normalizePipeline(cached);
      setPipeStatus('local');
      renderPipeline();
      return;
    } catch (_) {}

    pipeline = defaultPipeline();
    setPipeStatus('loaded');
    pipelineScript.value = '# AutoNovelWriter pipeline script v1\n' + pipeline.blocks.map((b) => `STEP ${b.type}`).join('\n') + '\n';
    renderPipeline();
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
        if (obj.pipeline) pipeline = normalizePipeline(obj.pipeline);
        if (typeof obj.script === 'string') pipelineScript.value = obj.script;
        renderPipeline();
        if (Array.isArray(obj.warnings) && obj.warnings.length) {
          addMsg('err', 'pipeline warnings', JSON.stringify(obj.warnings.slice(0, 5)));
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
    pipeline = defaultPipeline();
    setPipeStatus('dirty');
    pipelineScript.value = '# AutoNovelWriter pipeline script v1\n' + pipeline.blocks.map((b) => `STEP ${b.type}`).join('\n') + '\n';
    renderPipeline();
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
    const next = window.prompt('Set WebSocket URL (stored in this browser).', current);
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

  connect();
  loadPipeline();
  loadChatHistory();
  loadRunStatus();
  loadSettings();
})();
