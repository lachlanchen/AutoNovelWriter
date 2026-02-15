(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

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

  function renderPipeline() {
    blocksEl.innerHTML = '';

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

  function indentSelected() {
    if (!selected) return;
    const path = parsePathKey(selected);
    if (path.length < 1) return;
    const info = getContainerAndIndex(pipelineAst, path);
    if (!info) return;
    const { container, index, parentPath } = info;
    if (index <= 0) return;
    const prev = container[index - 1];
    if (!prev || typeof prev !== 'object' || prev.kind !== 'loop' || !Array.isArray(prev.children)) {
      addMsg('err', 'pipeline', 'indent requires previous sibling to be a LOOP');
      return;
    }
    const node = container.splice(index, 1)[0];
    prev.children.push(node);
    setSelected(pathKey(parentPath.concat([index - 1, prev.children.length - 1])));
    setPipeStatus('dirty');
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
    const outerParentPath = loopInfo.parentPath;
    const outerInfo = outerParentPath.length ? getContainerAndIndex(pipelineAst, outerParentPath) : null;
    const outerKids = outerParentPath.length
      ? (outerInfo && outerInfo.node && Array.isArray(outerInfo.node.children) ? outerInfo.node.children : null)
      : pipelineAst.children;
    if (!Array.isArray(outerKids)) return;
    const loopIndex = loopInfo.index;
    const node = container.splice(index, 1)[0];
    outerKids.splice(loopIndex + 1, 0, node);
    setSelected(pathKey(outerParentPath.concat([loopIndex + 1])));
    setPipeStatus('dirty');
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
          if (Array.isArray(obj.warnings) && obj.warnings.length) {
            addMsg('err', 'pipeline warnings', JSON.stringify(obj.warnings.slice(0, 5)));
          }
          if (Array.isArray(obj.errors) && obj.errors.length) {
            addMsg('err', 'pipeline errors', JSON.stringify(obj.errors.slice(0, 5)));
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
      return;
    } catch (_) {}

    pipelineAst = defaultPipelineAst();
    pipelineScript.value = renderScriptFromAst(pipelineAst);
    setSelected('');
    updateDerivedFromAst({ writeScript: false });
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
    pipelineAst = defaultPipelineAst();
    setSelected('');
    setPipeStatus('dirty');
    updateDerivedFromAst({ writeScript: true });
    renderPipeline();
  }

  let scriptValidateTimer = null;

  async function validatePipelineScript(script, opts) {
    const url = backendApiUrl('/api/pipeline/validate');
    if (!url) return;
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
      if (!opts || !opts.quiet) addMsg('err', 'pipeline validate', String(e));
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
          addMsg('err', 'pipeline warnings', JSON.stringify(obj.warnings.slice(0, 5)));
        }
        // Refresh nested UI from the canonical script (best-effort).
        validatePipelineScript(obj.script, { quiet: true });
        setPipeStatus('loaded');
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

  connect();
  loadPipeline();
  loadChatHistory();
  loadRunStatus();
  loadSettings();
})();
