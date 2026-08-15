# Architecture

## Overview

TweakSync is a VS Code extension that bridges Chrome DevTools with the editor. The extension host runs a WebSocket server, the webview exposes a React UI for managing tracked files, and a companion Chrome client drives live style updates.

## Project Layout

- **Extension host** (`src/extension.ts`): Registers commands, disposables, and status bar items. Delegates to `scripts/`, `utils/`, and `disposable/`.
- **WebSocket server** (`src/scripts/websocket.ts`, `src/scripts/server.ts`): Listens on `127.0.0.1:16016`, receives `ElementDetails` or `ElementStyles` messages from Chrome, and dispatches to handlers.
- **Disposables** (`src/disposable/`): Manage file injection, watching, and webview panel lifecycle via VS Code disposables stored in `context.subscriptions`.
- **Webview UI** (`src/webview/`): React 19 app rendered in a VS Code WebviewPanel. Uses shadcn/ui and Tailwind CSS v4.
- **Workspace state**: Tracked files are stored in `context.workspaceState` under `selectedCssFiles` and `selectedHtmlReactFiles`.

## Communication

- Extension → webview: `panel.webview.postMessage({ command, value })` or `{ command, files }`
- Webview → extension: `vscode.postMessage({ command, value })`
- Extension listens via `panel.webview.onDidReceiveMessage`; webview listens via `window.addEventListener("message", ...)`

## Key Patterns

- Commands return disposables; push all to `context.subscriptions` in `activate()`.
- Current webview panel is accessed via `getCurrentPanel()` / `setCurrentPanel()` in `src/utils/webviewPanel.ts`.
- Temporary IDs (`data-tweaksync-id`) are injected into HTML/React files to link DOM elements back to source files.
- `vscode.WorkspaceEdit` is used for bulk text replacements; `vscode.TextEditor.edit` is used for CSS updates.
