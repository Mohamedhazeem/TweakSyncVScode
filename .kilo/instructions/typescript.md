# TypeScript & Code Style

## Compiler Configuration

- `tsconfig.json`: `strict: true`, `target: ES6`, `module: NodeNext`, `jsx: react`
- Path alias: `@/*` maps to `src/*` (used in select files for `src/types/ElementTypes`)

## Conventions

- Use the `@/` path alias for imports from `src/` where configured.
- Prefer explicit types for public APIs and complex internals; use type inference for local variables when the type is obvious.
- Prefer `interface` for object shapes; use `type` for unions, intersections, and aliases.
- `const enum` is used for `TemporaryIdMode` in `src/domain/watcher/temporary-id.ts`.
- `any` is used for external message shapes and legacy typings.
- Default exports are used in webview components.

## Formatting

- Indentation: 4 spaces for TypeScript; 2 spaces for webview React/TSX.
- Semicolons: required, enforced by `@typescript-eslint/semi: warn`.
- camelCase for variables, functions, and filenames; PascalCase for React components and types/interfaces.

## Error Handling

- Use `try/catch` around I/O and WebSocket operations.
- Log errors to `console.warn` or `console.error`; do not silently swallow failures.
- Do not throw literal values; use `Error` instances.
