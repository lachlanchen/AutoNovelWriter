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

  const LS_WS_URL = 'anw_ws_url';
  const LS_PIPELINE = 'anw_pipeline';

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
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function addChatMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
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

  async function loadChatHistory() {
    const url = backendApiUrl('/api/chat/history?limit=200');
    if (!url) return;
    try {
      const res = await fetch(url, { method: 'GET' });
      const obj = await res.json();
      if (!obj || !obj.ok || !Array.isArray(obj.messages)) return;
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
        body: JSON.stringify(pipeline)
      });
      const obj = await res.json();
      if (obj && obj.ok) {
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
    renderPipeline();
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

    addMsg('hello', 'you', text);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', text }));
    } else {
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
    loadChatHistory();
  });

  pipeSave.addEventListener('click', () => savePipeline());
  pipeReset.addEventListener('click', () => {
    resetPipeline();
    savePipeline();
  });

  connect();
  loadPipeline();
  loadChatHistory();
})();
