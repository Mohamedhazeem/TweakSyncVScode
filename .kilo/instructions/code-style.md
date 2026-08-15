# Code Style

## Formatting

- Indentation: 4 spaces for TypeScript; 2 spaces for webview React/TSX.
- Semicolons: required, enforced by `@typescript-eslint/semi: warn`.
- Quotes: double quotes for TypeScript strings.
- Max line length: not explicitly configured; keep lines readable and break long statements.

## Naming

- camelCase for variables, functions, and filenames (except React component files).
- PascalCase for React components and TypeScript types/interfaces.
- UPPER_SNAKE_CASE for constants only.

## File Structure

- One class/function/export per file when practical.
- Group related utilities in a single file if they are tightly coupled.
- Keep extension entry point (`extension.ts`) free of business logic; delegate to `scripts/`, `utils/`, and `disposable/`.

## Comments

- Use comments to explain non-obvious logic, especially around temporary ID injection and WebSocket message contracts.
- Do not comment obvious code.

## Error Handling

- Use `try/catch` around I/O and WebSocket operations.
- Log errors to `console.warn` or `console.error`; do not silently swallow failures.
- Do not throw literal values; use `Error` instances.
