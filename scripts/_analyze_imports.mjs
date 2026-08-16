const fs = require('fs');
const path = require('path');

const srcRoot = path.resolve('src');
const exts = ['.ts', '.tsx'];

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!p.includes('node_modules')) walk(p, out); }
    else if (exts.includes(path.extname(e.name))) out.push(p);
  }
}

const files = [];
walk(srcRoot, files);

function importsOf(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const re = /(?:import|export)[^;]*?from\s*['"]([^'"]+)['"]/g;
  const out = [];
  let m;
  while ((m = re.exec(txt))) out.push(m[1]);
  return out;
}

const relPath = (f) => path.relative(srcRoot, f).replace(/\\/g, '/');

const targets = [
  'src/scripts/updateCSSContent.ts',
  'src/scripts/temporaryId.ts',
  'src/scripts/elementDetails.ts',
  'src/scripts/elementStyles.ts',
  'src/scripts/server.ts',
  'src/scripts/statusBar.ts',
  'src/scripts/websocket.ts',
  'src/scripts/webView.ts',
  'src/scripts/activityPanel.ts',
  'src/scripts/test.ts',
  'src/scripts/updateRule.ts',
  'src/disposable/temporaryIdDisposable.ts',
  'src/disposable/webViewDisposable.ts',
];

const byRel = {};
for (const f of files) byRel[relPath(f)] = f;

for (const t of targets) {
  const tBase = t.replace(/\.tsx?$/, '');
  const refs = [];
  for (const f of files) {
    if (relPath(f) === t) continue;
    for (const imp of importsOf(f)) {
      const clean = imp.replace(/\.tsx?$/, '');
      if (clean === tBase || clean.endsWith('/' + tBase) || imp.endsWith(t)) {
        refs.push(relPath(f));
      }
    }
  }
  console.log(`${t} -> ${refs.length} refs`);
  refs.forEach(r => console.log('    ' + r));
}
