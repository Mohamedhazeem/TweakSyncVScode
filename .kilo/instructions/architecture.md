# Architecture

## Overview

TweakSync is a VS Code extension that bridges Chrome DevTools with the editor. The extension host runs a WebSocket server on `127.0.0.1:16016`, the webview exposes a React 19 UI for managing tracked files, and a companion Chrome client drives live style updates.

The codebase is currently undergoing a clean-architecture refactor. The new structure enforces strict separation between domain logic, application orchestration, and VS Code / WebSocket infrastructure.

## Source Layout

| Directory | Responsibility |
|-----------|----------------|
| `src/domain/` | Pure business logic. No VS Code or `ws` imports. Contains style language abstractions (`StyleLanguageHandler`), the handler registry, CSS parser/updater, temporary-ID logic, and message contracts. |
| `src/application/` | Use cases and orchestration. `SyncService` routes inbound WebSocket traffic; `StyleService` applies style changes via the registry. Command handlers live here (`start-server`, `watch-files`, `inject-ids`, `remove-files`). |
| `src/infrastructure/` | Concrete adapters. VS Code wrappers (`workspace-state`, `window`, `commands`, `workspace-fs`), WebSocket `server`/`client`, webview `message-bus`, and inbound message handlers. |
| `src/webview/` | React 19 UI (TweakSync Hub) decoupled from the extension host via typed messages. Uses shadcn/ui and Tailwind CSS v4. |
| `src/types/` | Shared TypeScript interfaces (`ElementTypes`). |
| `src/utils/` | Cross-cutting helpers (file watching, formatting, element resolution). |
| `src/disposable/` | Legacy disposables being migrated into `infrastructure/vscode/disposables/`. |
| `src/scripts/` | Legacy modules being migrated into the new layers. |
| `src/test/` | VS Code integration tests via `vscode-test`. |

Entry point: `src/extension.ts` is a thin composition root that delegates wiring to `src/infrastructure/container.ts`.

## Key Interfaces

- `StyleLanguageHandler` — `src/domain/style/handler.ts`
- `StyleLanguageRegistry` — `src/domain/style/registry.ts`
- `WebSocketServerPort` — `src/infrastructure/websocket/types.ts`
- `WebviewMessageBus` — `src/infrastructure/webview/message-bus.ts`
- Message contracts — `src/domain/messaging/contracts.ts`

## Communication

- Extension → webview: `panel.webview.postMessage({ command, value })` or `{ command, files }`
- Webview → extension: `vscode.postMessage({ command, value })`
- Extension listens via `panel.webview.onDidReceiveMessage`; webview listens via `window.addEventListener("message", ...)`

## Key Patterns

- Commands return disposables; push all to `context.subscriptions` in `activate()`.
- Current webview panel is accessed via `getCurrentPanel()` / `setCurrentPanel()` in `src/utils/webviewPanel.ts`.
- Temporary IDs (`data-tweaksync-id`) are injected into HTML/React files to link DOM elements back to source files.
- `vscode.WorkspaceEdit` is used for bulk text replacements; `vscode.TextEditor.edit` is used for CSS updates.

## Migration Status

- `src/disposable/webViewDisposable.ts` — legacy, being migrated to `infrastructure/vscode/disposables/webview.ts`
- `src/scripts/{statusBar,websocket,webView,server}.ts` — legacy, being migrated into `infrastructure/` and `application/`
- Current composition root in `container.ts` still wires some legacy modules; new modules coexist and are incrementally replacing old behavior.
