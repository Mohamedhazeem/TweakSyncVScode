#!/usr/bin/env node
/**
 * Dependency graph validation: detects circular dependencies between modules.
 *
 * Walks every TypeScript/TSX source file under `src`, resolves internal imports
 * (relative paths and the `@domain/*`, `@application/*`, `@infrastructure/*`,
 * `@webview/*`, `@/*` path aliases), builds a module dependency graph, and fails
 * with a non-zero exit code when a cycle is found.
 *
 * External packages (e.g. `vscode`, `ws`, `react`) are treated as leaves.
 *
 * Usage: `node scripts/validate-deps.mjs`
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');

// Only the new clean-architecture layers are validated. Legacy modules under
// src/scripts, src/disposable, src/utils, etc. are being removed (see tasks T054)
// and are intentionally excluded so the check reflects the target architecture.
const LAYERS = ['domain', 'application', 'infrastructure', 'webview', 'types'];

const ALIASES = {
  '@domain': join(SRC, 'domain'),
  '@application': join(SRC, 'application'),
  '@infrastructure': join(SRC, 'infrastructure'),
  '@webview': join(SRC, 'webview'),
  '@': SRC
};

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'out' || entry === 'dist') continue;
      walk(full, acc);
    } else if (EXTENSIONS.includes(extname(full)) && !full.endsWith('.d.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

function resolveModule(spec, fromFile) {
  let base;
  if (spec.startsWith('.')) {
    base = resolve(dirname(fromFile), spec);
  } else {
    const alias = Object.keys(ALIASES).find((a) => spec === a || spec.startsWith(a + '/'));
    if (!alias) return null; // external package
    base = join(ALIASES[alias], spec.slice(alias.length + 1));
  }

  if (statSync(base, { throwIfNoEntry: false })?.isFile()) return base;
  for (const ext of EXTENSIONS) {
    if (statSync(base + ext, { throwIfNoEntry: false })?.isFile()) return base + ext;
  }
  if (statSync(base, { throwIfNoEntry: false })?.isDirectory()) {
    for (const ext of EXTENSIONS) {
      const idx = join(base, `index${ext}`);
      if (statSync(idx, { throwIfNoEntry: false })?.isFile()) return idx;
    }
  }
  return null;
}

const importRe =
  /(?:import\s[^'"]*?from\s*|import\s*|export\s[^'"]*?from\s*|require\(\s*|import\(\s*)['"]([^'"]+)['"]/g;

function extractImports(file) {
  const code = readFileSync(file, 'utf8');
  const specs = new Set();
  let m;
  while ((m = importRe.exec(code)) !== null) specs.add(m[1]);
  return [...specs];
}

const files = LAYERS.flatMap((layer) => walk(join(SRC, layer)));
const graph = new Map();
for (const file of files) graph.set(file, []);

for (const file of files) {
  for (const spec of extractImports(file)) {
    const target = resolveModule(spec, file);
    if (target && graph.has(target)) {
      graph.get(file).push(target);
    }
  }
}

const WHITE = 0;
const GRAY = 1;
const BLACK = 2;
const color = new Map();
const stack = [];
const cycles = [];

function dfs(node) {
  color.set(node, GRAY);
  stack.push(node);
  for (const next of graph.get(node) || []) {
    const c = color.get(next) ?? WHITE;
    if (c === GRAY) {
      const start = stack.indexOf(next);
      cycles.push(stack.slice(start).concat(next));
    } else if (c === WHITE) {
      dfs(next);
    }
  }
  stack.pop();
  color.set(node, BLACK);
}

for (const file of files) {
  if ((color.get(file) ?? WHITE) === WHITE) dfs(file);
}

if (cycles.length > 0) {
  console.error('❌ Circular dependencies detected:');
  for (const cycle of cycles) {
    const rel = cycle.map((f) => f.replace(ROOT + '\\', '').replace(ROOT + '/', ''));
    console.error('  ' + rel.join(' -> '));
  }
  process.exit(1);
}

console.log(`✓ No circular dependencies found across ${files.length} modules.`);
process.exit(0);
