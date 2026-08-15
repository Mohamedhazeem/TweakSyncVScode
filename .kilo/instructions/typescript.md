# TypeScript

## Compiler Configuration

- `tsconfig.json` target: `ES6`
- Module system: `NodeNext`
- JSX: `react`
- `strict: true` is enabled
- Path alias: `@/*` maps to `src/*`

## Conventions

- Use the `@/` path alias for imports from `src/` to keep imports stable and concise.
- Prefer explicit types for public APIs and complex internals; use type inference for local variables when the type is obvious.
- Do not use `any`. Use `unknown` when the shape is truly uncertain.
- Prefer `interface` for object shapes that may be extended; use `type` for unions, intersections, and aliases.
- Avoid enums; use const objects or union string types instead.
- Use named exports for all modules; avoid default exports.

## Extension API Types

- Use `vscode` module types for all VS Code APIs.
- Guard Webview messages against unknown shapes; do not cast blindly.

## React/Webview Types

- Use React 19 types from `react` and `react-dom`.
- Event handlers on webview components should use the standard React event types from the bundled React version.
