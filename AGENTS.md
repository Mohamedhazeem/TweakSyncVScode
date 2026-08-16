# TweakSync

VS Code extension that syncs webpage element styles between Chrome DevTools and VS Code in real time via a WebSocket server.

## Critical Rules

- **Dependency direction**: `domain` → `application` → `infrastructure` → entry point. Never import upward.
- **No VS Code or `ws` imports in `src/domain/`**: domain must remain framework-free.
- **Composition root only**: `src/infrastructure/container.ts` is the ONLY file that instantiates concrete classes. Do not add `new` expressions elsewhere.
- **Extension point**: new styling languages are added by implementing `StyleLanguageHandler` and registering it on `StyleLanguageRegistry`. No core module changes required.
- **Message contracts**: all WebSocket and webview messages are typed with discriminated unions in `src/domain/messaging/contracts.ts`.

## Commands

- `npm run compile` - Build extension backend via webpack
- `npm run watch` - Watch mode build for extension backend
- `npm run build:webview` - Build webview frontend bundle
- `npm run package` - Production build with hidden source maps
- `npm run lint` - ESLint on `src/`
- `npm run typecheck` - TypeScript strict-mode check
- `npm run test` - Run VS Code integration tests via `vscode-test`
- `npm run test:unit` - Run Jest unit tests
- `npm run build:layers` - Build domain, application, and infrastructure layers independently
- `npm run lint:complexity` - Enforce 300-line file cap
- `npm run check:circular` - Validate zero circular dependencies

## Detailed Instructions

- [Architecture](.kilo/instructions/architecture.md)
- [TypeScript & Code Style](.kilo/instructions/typescript.md)
- [Styling](.kilo/instructions/styling.md)
- [Testing](.kilo/instructions/testing.md)
- [Git Workflow](.kilo/instructions/git-workflow.md)
