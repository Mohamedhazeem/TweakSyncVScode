# TweakSync

Kilo agent instructions for the TweakSync project.

VS Code extension that syncs webpage element styles between Chrome DevTools and VS Code in real time via a WebSocket server.

## Commands

- `npm run compile` - Build extension backend via webpack
- `npm run watch` - Watch mode build for extension backend
- `npm run build:webview` - Build webview frontend bundle
- `npm run package` - Production build with hidden source maps
- `npm run lint` - ESLint on `src/` (TypeScript files)
- `npm run test` - Run VS Code integration tests via `vscode-test`

## Detailed Instructions

- [Architecture](.kilo/instructions/architecture.md)
- [TypeScript & Code Style](.kilo/instructions/typescript.md)
- [Styling](.kilo/instructions/styling.md)
- [Testing](.kilo/instructions/testing.md)
- [Git Workflow](.kilo/instructions/git-workflow.md)
