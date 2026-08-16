# `infrastructure/vscode/disposables`

VS Code–specific `vscode.Disposable` factories that own a piece of extension
lifecycle (command registration or a file-system watcher). Each export returns a
disposable the composition root (`infrastructure/container.ts`) pushes onto
`context.subscriptions`, so every concern can be tested and replaced
independently (User Story 2).

| File | Responsibility |
|------|---------------|
| `temporary-id.ts` | Registers the temporary-ID commands (`injectTemporaryIds`, `removeTemporaryIds`, `watchSingleFile`, `removeSingleFile`). Delegates the pure algorithm to `domain/watcher/temporary-id.ts` and all I/O to injected ports. |
| `file-watcher.ts` | `createFileWatcherDisposable` — watches the workspace for deletions of tracked files and keeps workspace state + webview in sync. |
| `webview.ts` | `createWebviewDisposable` — owns the webview panel command and routes inbound webview messages. |

**Why this module exists:** these are the focused replacements for the monolithic
`src/disposable/temporaryIdDisposable.ts` and `src/disposable/webViewDisposable.ts`,
and the file-watching responsibility formerly in `src/utils/watchCollectedFiles.ts`.
