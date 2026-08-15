# TweakSync

VS Code extension that syncs webpage element styles between Chrome DevTools and VS Code in real time via a WebSocket server.

## Commands

- `npm run compile` - Build extension backend via webpack
- `npm run watch` - Watch mode build for extension backend
- `npm run build:webview` - Build webview frontend bundle
- `npm run package` - Production build with hidden source maps
- `npm run lint` - ESLint on `src/` (TypeScript files)
- `npm run test` - Run VS Code integration tests via `vscode-test`

## Architecture

- **Extension host** (`src/extension.ts`): Registers commands, disposables, and status bar items. Delegates to `scripts/`, `utils/`, and `disposable/`.
- **WebSocket server** (`src/scripts/websocket.ts`, `src/scripts/server.ts`): Listens on `127.0.0.1:16016`, receives `ElementDetails` or `ElementStyles` messages from Chrome, and dispatches to handlers.
- **Disposables** (`src/disposable/`): Manage file injection, watching, and webview panel lifecycle via VS Code disposables stored in `context.subscriptions`.
- **Webview UI** (`src/webview/`): React 19 app rendered in a VS Code WebviewPanel. Uses shadcn/ui and Tailwind CSS v4.
- **Workspace state**: Tracked files are stored in `context.workspaceState` under `selectedCssFiles` and `selectedHtmlReactFiles`.

## Key Patterns

- Commands return disposables; push all to `context.subscriptions` in `activate()`.
- Current webview panel is accessed via `getCurrentPanel()` / `setCurrentPanel()` in `src/utils/webviewPanel.ts`.
- Temporary IDs (`data-tweaksync-id`) are injected into HTML/React files to link DOM elements back to source files.
- `vscode.WorkspaceEdit` is used for bulk text replacements; `vscode.TextEditor.edit` is used for CSS updates.
- Webview messages use `webview.postMessage({ command, value })`; extension side listens via `webview.onDidReceiveMessage`.

## TypeScript & Code Style

- `tsconfig.json`: `strict: true`, `target: ES6`, `module: NodeNext`, `jsx: react`, path alias `@/*` -> `src/*`.
- Use `@/` for imports from `src/`.
- ESLint: `@typescript-eslint/semi: warn` (semicolons required), `curly: warn`, `eqeqeq: warn`, `no-throw-literal: warn`.
- 4 spaces for TS, 2 spaces for webview React/TSX.
- camelCase for variables/functions/filenames; PascalCase for React components and types/interfaces.
- Avoid `any`; prefer `unknown` when shape is uncertain. Prefer `interface` over `type` for extendable object shapes.
- Do not use enums; use const objects or union string literals.
- Named exports only; no default exports.
- Error handling: `try/catch` around I/O and WebSocket operations; use `console.warn` / `console.error`; never throw literals.

## CSS / Styling

- CSS files are updated via PostCSS (`postcss-safe-parser`) in `src/scripts/updateRule.ts` and `src/scripts/updateCSSContent.ts`.
- Webview styles live in `src/webview/styles/index.css` and are built with `css-loader` / `style-loader` or `mini-css-extract-plugin`.
- Tailwind CSS v4 is configured via `tailwind.config.js` and PostCSS.

## Testing

- Integration tests use `vscode-test`.
- Run `npm run test` for the full suite.
- Tests compile to `out/` via `npm run compile-tests`.
- `npm run pretest` runs compile, watch, and lint before test.

## Git & Release

- Commit messages use imperative mood: "Add", "Fix", "Update".
- Do not commit `dist/`, `out/`, or generated artifacts.
- Extension version is in `package.json` `version`; follow semver.
