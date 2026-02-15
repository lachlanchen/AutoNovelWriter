(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const chatLog = $('chatLog');
  const chatForm = $('chatForm');
  const chatInput = $('chatInput');
  const conn = $('conn');
  const backendHint = $('backendHint');

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

  function setConn(state) {
    conn.textContent = state;
    conn.classList.remove('ok', 'warn');
    if (state === 'connected') conn.classList.add('ok');
    else if (state === 'connecting') conn.classList.add('warn');
  }

  function parseBackendWsUrl() {
    const url = new URL(window.location.href);

    // Allow override: ?ws=ws://host:port/ws
    const wsOverride = url.searchParams.get('ws');
    if (wsOverride) return wsOverride;

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
      addMsg('err', 'ws', 'not connected');
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

  connect();
})();
