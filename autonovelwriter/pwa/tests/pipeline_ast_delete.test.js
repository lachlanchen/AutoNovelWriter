#!/usr/bin/env node
'use strict';

const assert = require('assert');

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
    if (!node || typeof node !== 'object' || (node.kind !== 'loop' && node.kind !== 'round' && node.kind !== 'foreach_task') || !Array.isArray(node.children)) return null;
    parent = node;
    container = node.children;
  }
  const index = path[path.length - 1];
  if (index < 0 || index >= container.length) return null;
  return { parent, container, index, node: container[index], parentPath: path.slice(0, -1) };
}

function isContainerNode(n) {
  return !!(n && typeof n === 'object' && (n.kind === 'loop' || n.kind === 'round' || n.kind === 'foreach_task') && Array.isArray(n.children));
}

function defaultStepType() {
  return 'write';
}

function ensureNonEmptyChildren(children) {
  if (!Array.isArray(children)) return false;
  if (children.length) return false;
  children.push({ kind: 'step', type: defaultStepType(), enabled: true });
  return true;
}

function deleteAtSelected(ast, selectedKey) {
  const path = parsePathKey(selectedKey);
  const info = getContainerAndIndex(ast, path);
  assert.ok(info, 'path should resolve');

  const { container, index, parentPath, node } = info;
  if (node.kind === 'step') {
    container.splice(index, 1);
  } else if (isContainerNode(node)) {
    const kids = node.children || [];
    if (kids.length) container.splice(index, 1, ...kids);
    else container.splice(index, 1);
  } else {
    throw new Error('unknown node kind');
  }

  const insertedDefault = ensureNonEmptyChildren(container);
  let nextIndex = index;
  if (!container.length) nextIndex = 0;
  else if (nextIndex >= container.length) nextIndex = container.length - 1;
  else if (nextIndex < 0) nextIndex = 0;
  if (insertedDefault) nextIndex = 0;
  return pathKey(parentPath.concat([nextIndex]));
}

// 1) Deleting a container splices children up.
{
  const ast = {
    kind: 'root',
    version: 2,
    children: [
      { kind: 'round', repeat: 2, children: [{ kind: 'step', type: 'plan', enabled: true }, { kind: 'step', type: 'write', enabled: true }] },
      { kind: 'step', type: 'summary', enabled: true }
    ]
  };
  const nextSel = deleteAtSelected(ast, '0');
  assert.deepStrictEqual(ast.children.map((n) => n.kind === 'step' ? n.type : n.kind), ['plan', 'write', 'summary']);
  assert.strictEqual(nextSel, '0', 'selection should point at the first spliced child');
}

// 2) Deleting the last step in a container inserts a default STEP instead of leaving it empty.
{
  const ast = {
    kind: 'root',
    version: 2,
    children: [
      { kind: 'foreach_task', children: [{ kind: 'step', type: 'plan', enabled: true }] }
    ]
  };
  const nextSel = deleteAtSelected(ast, '0.0');
  assert.strictEqual(ast.children[0].kind, 'foreach_task');
  assert.strictEqual(ast.children[0].children.length, 1);
  assert.strictEqual(ast.children[0].children[0].kind, 'step');
  assert.strictEqual(ast.children[0].children[0].type, 'write');
  assert.strictEqual(nextSel, '0.0');
}

// 3) Deleting the only root node keeps root non-empty.
{
  const ast = {
    kind: 'root',
    version: 2,
    children: [{ kind: 'step', type: 'plan', enabled: true }]
  };
  const nextSel = deleteAtSelected(ast, '0');
  assert.strictEqual(ast.children.length, 1);
  assert.strictEqual(ast.children[0].kind, 'step');
  assert.strictEqual(ast.children[0].type, 'write');
  assert.strictEqual(nextSel, '0');
}

console.log('ok - pipeline_ast_delete');

