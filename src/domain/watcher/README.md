# `domain/watcher`

Pure source-transformation logic for tracked HTML/React files.

| File | Responsibility |
|------|---------------|
| `temporary-id.ts` | `injectTemporaryIds(code)` / `removeTemporaryIds(code)` — insert and strip the `data-tweaksync-id` markers used to correlate Chrome elements with source files. Depends only on `@babel/*`, never on VS Code, so it is unit-testable in isolation. |

**Naming note:** this file was previously named `file-watcher.ts`. It holds
*temporary-id* logic, not file-watching; the actual file-system watcher lives in
`infrastructure/vscode/disposables/file-watcher.ts`. The rename keeps module
names aligned with their responsibility.
