# Architecture

## Overview

TweakSync is a VS Code extension that bridges Chrome DevTools with the editor. The extension host runs a WebSocket server, the webview exposes a React UI for managing tracked files, and a companion Chrome client drives live style updates.

## Project Layout

```
src/
  extension.ts              Extension entry point; registers commands and disposables
  scripts/
    server.ts               WebSocket server lifecycle
    websocket.ts            Command handlers for server start/stop
    statusBar.ts            Status bar UI and commands
    activityPanel.ts        Side panel contributions
  disposable/
    temporaryIdDisposable.ts File watch/inject/remove disposables
    webViewDisposable.ts    Webview panel lifecycle
  utils/
    watchCollectedFiles.ts  File watching logic
    webviewPanel.ts         Current panel state
    createHtmlElement.ts    DOM element creation helpers
    elementDetails.ts       Element metadata extraction
    elementStyles.ts        Style parsing helpers
    updateRule.ts           CSS rule mutation
    updateCSSContent.ts     CSS content replacement
    constant.ts             Shared constants
  webview/
    index.tsx               Webview entry
    App.tsx                 Root webview component
    HomePage.tsx            Main hub UI
    TutorialPage.tsx        Onboarding flow
    SupportPage.tsx         Help/support UI
    NavBar.tsx              Webview navigation
    components/             Reusable webview components
    styles/
      index.css             Webview styles
  types/
    ElementTypes.ts         Shared TS types
  components/ui/            shadcn/ui components
  lib/
    utils.ts                Utility helpers
  test/
    extension.test.ts       Integration tests
dist/                       Compiled extension output
out/webview/                Compiled webview output
```

## Key Patterns

- Extension commands register disposable functions in `extension.ts` and push them to `context.subscriptions`.
- The current webview panel is stored via `webviewPanel.ts` getters/setters.
- File watching is split between `temporaryIdDisposable.ts` (inject/remove) and `watchCollectedFiles.ts` (watched set).
- Webview communication uses VS Code's `WebviewPanel.webview` messaging API.
- The WebSocket server is managed by `scripts/server.ts` and `scripts/websocket.ts`.

## Build

- Extension backend: `webpack` compiles `src/extension.ts` to `dist/extension.js`.
- Webview frontend: `webpack --config webpack.config.js` compiles React/TSX to `out/webview/`.
- Both use `ts-loader` and Babel presets for TypeScript and React.
