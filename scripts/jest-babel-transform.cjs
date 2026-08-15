/**
 * Minimal Jest transform for TypeScript/TSX using the project's @babel/core (v8).
 *
 * The standard `babel-jest` package is incompatible with @babel/core 8 (it calls
 * `loadPartialConfig` synchronously, which Babel 8 rejects), so we drive Babel
 * directly via `transformSync`. No type-checking is performed here (tsc handles
 * that); this only strips types so Jest can execute the module.
 */
const babel = require('@babel/core');

module.exports = {
  process(src, filename) {
    if (!/\.(ts|tsx|js|jsx)$/.test(filename)) {
      return src;
    }
    const result = babel.transformSync(src, {
      filename,
      babelrc: false,
      configFile: false,
      sourceMaps: 'inline',
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    });
    return { code: result.code, map: result.map };
  }
};
