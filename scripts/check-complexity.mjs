#!/usr/bin/env node
/**
 * Complexity & file-size gate for the clean-architecture layers.
 *
 * Parses every TypeScript/TSX file under the architecture layers with @babel/parser
 * (which supports the project's TypeScript version), computes cyclomatic complexity
 * per function, and fails with a non-zero exit code when a function exceeds the
 * complexity budget or a file exceeds the line budget.
 *
 * This is the CI/lint enforcement for:
 *   - FR-006 / SC-003: no source file exceeds 300 lines
 *   - Complexity limit on individual functions
 *
 * Scope: the new architecture layers (domain/application/infrastructure/webview/types).
 * Legacy modules under src/scripts, src/disposable, src/utils are being removed
 * (see tasks T051/T054) and are intentionally excluded.
 *
 * Usage: `node scripts/check-complexity.mjs`
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

const traverse = _traverse.default || _traverse;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');

const LAYERS = ['domain', 'application', 'infrastructure', 'webview', 'types'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const MAX_LINES = 300;
const MAX_COMPLEXITY = 10;

const FUNCTION_TYPES = [
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod'
];

const BRANCH_TYPES = new Set([
  'IfStatement',
  'ConditionalExpression',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchCase',
  'CatchClause',
  'LogicalExpression'
]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'out' || entry === 'dist') continue;
      walk(full, acc);
    } else if (EXTENSIONS.includes(extnameSafe(full)) && !full.endsWith('.d.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

function extnameSafe(p) {
  const i = p.lastIndexOf('.');
  return i === -1 ? '' : p.slice(i);
}

function nameOf(node) {
  if (node.id && node.id.name) return node.id.name;
  if (node.key && node.key.name) return node.key.name;
  return '<anonymous>';
}

function checkFile(file) {
  const code = readFileSync(file, 'utf8');
  const lineCount = code.split('\n').length;
  const violations = [];

  if (lineCount > MAX_LINES) {
    violations.push(`file has ${lineCount} lines (max ${MAX_LINES})`);
  }

  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true
    });
  } catch (err) {
    violations.push(`parse error: ${err.message}`);
    return { file, lineCount, violations };
  }

  const stack = [];
  traverse(ast, {
    enter(path) {
      const t = path.node.type;
      if (FUNCTION_TYPES.includes(t)) {
        stack.push({ name: nameOf(path.node), complexity: 1 });
      } else if (BRANCH_TYPES.has(t)) {
        const top = stack[stack.length - 1];
        if (top) {
          if (t === 'LogicalExpression') top.complexity += 1;
          else if (t === 'SwitchCase' && path.node.test) top.complexity += 1;
          else if (t !== 'SwitchCase') top.complexity += 1;
        }
      }
    },
    exit(path) {
      if (FUNCTION_TYPES.includes(path.node.type)) {
        const fn = stack.pop();
        if (fn && fn.complexity > MAX_COMPLEXITY) {
          const loc = path.node.loc?.start?.line ?? '?';
          violations.push(
            `function '${fn.name}' complexity ${fn.complexity} (max ${MAX_COMPLEXITY}) at line ${loc}`
          );
        }
      }
    }
  });

  return { file, lineCount, violations };
}

const files = LAYERS.flatMap((layer) => walk(join(SRC, layer)));
let failed = 0;

for (const { file, violations } of files.map(checkFile)) {
  if (violations.length === 0) continue;
  failed++;
  const rel = file.replace(ROOT + '\\', '').replace(ROOT + '/', '');
  console.error(`✗ ${rel}`);
  for (const v of violations) console.error(`    - ${v}`);
}

if (failed > 0) {
  console.error(`\n❌ ${failed} module(s) exceeded complexity/size limits.`);
  process.exit(1);
}

console.log(`✓ Complexity & size limits satisfied across ${files.length} modules.`);
process.exit(0);
