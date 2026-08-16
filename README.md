# TweakSync

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red)](LICENSE.md)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)

TweakSync is a production-grade VS Code extension that bridges **Chrome DevTools** and **VS Code**, enabling front-end developers to push live style changes from the browser directly into source files in real time.

---

## The Problem

Modern front-end development forces developers to work in two disconnected environments:

- **Chrome DevTools** for visual experimentation, live CSS editing, and rapid prototyping.
- **VS Code** for authoring, maintaining, and shipping production code.

When a designer or developer tweaks a style in DevTools, they must manually copy-paste changes back into their source files. This workflow is error-prone, slow, and breaks the creative flow — especially on large projects with complex selectors, SCSS nesting, or component-based architectures.

Existing tools either lack bidirectional sync, fail to handle modern CSS/SCSS structures, or require heavy external dependencies. There is no seamless, real-time bridge that respects clean architecture, testability, and extensibility.

---

## The Solution

TweakSync solves this by running a **WebSocket server inside the VS Code extension host** on `127.0.0.1:16016`. A lightweight Chrome companion client detects style mutations and streams them to the extension, which then:

1. **Resolves** the correct source file using injected temporary IDs (`data-tweaksync-id`).
2. **Parses** the existing stylesheet via a pluggable language handler.
3. **Applies** the style changes structurally, preserving formatting and comments.
4. **Writes** the updated content back to disk through the VS Code FileSystem API.

Developers can also watch HTML/React files for element tracking, manage tracked files through a React 19 webview hub, and trigger style updates with a single click.

---

## How It Works

```text
┌──────────────┐     WebSocket (127.0.0.1:16016)       ┌───────────────────┐
│  Chrome Dev  │ ────────────────────────────────────► │  VS Code Extension│
│  Tools Client│                                       │  Host (Node.js)   │
└──────────────┘                                       └────────┬──────────┘
                                                                │
                                                                │ WebviewPanel
                                                                ▼
                                                       ┌───────────────────┐
                                                       │  TweakSync Hub    │
                                                       │  (React 19 +      │
                                                       │   shadcn/ui)      │
                                                       └───────────────────┘
```

**Data Flow:**

1. User opens TweakSync Hub via Command Palette or status bar icon.
2. User selects HTML/React and CSS files to track.
3. Temporary IDs are injected into HTML/React files to map DOM elements back to source lines.
4. Chrome companion client captures `ElementDetails` (for ID tracking) and `ElementStyles` (for CSS changes).
5. Messages arrive at the WebSocket server and are routed by `SyncService` to typed inbound handlers.
6. `StyleService` resolves the appropriate `StyleLanguageHandler` for each CSS file, applies changes, and persists the updated content.
7. Webview receives connection and status updates via a typed message bus.

---

## Architecture

TweakSync is built on a **layered clean architecture** with strict dependency rules and explicit module boundaries.

```text
src/
├── extension.ts              # Thin composition root (entry point)
├── domain/                   # Pure business logic — zero VS Code / ws imports
│   ├── style/
│   │   ├── handler.ts        # StyleLanguageHandler interface (extension point)
│   │   ├── css/              # CSS parser, updater, and handler implementation
│   │   └── registry.ts       # StyleLanguageRegistry (Strategy pattern)
│   ├── messaging/
│   │   └── contracts.ts      # WebSocket & webview message contracts
│   └── watcher/
│       └── temporary-id.ts   # Temporary ID generation logic
├── application/              # Use cases & orchestration
│   ├── services/
│   │   ├── sync-service.ts   # Routes inbound WebSocket traffic
│   │   └── style-service.ts  # Applies style changes via registry
│   └── commands/
│       ├── start-server.ts
│       ├── watch-files.ts
│       ├── inject-ids.ts
│       └── remove-files.ts
├── infrastructure/           # Concrete adapters
│   ├── vscode/               # VS Code API wrappers
│   ├── websocket/            # WebSocket server & client
│   ├── webview/              # Message bus & content script
│   └── messaging/
│       └── handlers/         # Inbound message adapters
├── webview/                  # React 19 UI (decoupled via typed messages)
│   ├── App.tsx
│   ├── HomePage.tsx
│   ├── NavBar.tsx
│   ├── SupportPage.tsx
│   ├── TutorialPage.tsx
│   ├── components/
│   └── styles/
└── utils/                    # Cross-cutting helpers
```

### Key Design Decisions

| Principle                 | Implementation                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dependency Inversion**  | Domain and application layers depend on abstractions (`WebSocketServerPort`, `StyleFileReader`). Concrete implementations live in `infrastructure/`. |
| **Open/Closed**           | New styling languages (Sass, Less, Tailwind) are added by implementing `StyleLanguageHandler` and registering it — no core module changes required.  |
| **Single Responsibility** | Each module has one reason to change: CSS parsing, WebSocket transport, VS Code file watching, React UI state.                                       |
| **Testability**           | Constructor injection enables isolated unit tests without VS Code or a running WebSocket server.                                                     |
| **Incremental Migration** | The Strangler Fig pattern is used: new modules coexist with legacy `src/scripts/` and `src/disposable/` modules, which are gradually routed out.     |

---

## Tech Stack

| Layer                 | Technology                                                              |
| --------------------- | ----------------------------------------------------------------------- |
| **Extension Runtime** | VS Code Extension API (`vscode` ^1.89.0)                                |
| **Language**          | TypeScript 5.x with `strict: true`                                      |
| **Transport**         | `ws` (WebSocket server & client)                                        |
| **UI Framework**      | React 19 with JSX                                                       |
| **Component Library** | shadcn/ui + Radix UI primitives                                         |
| **Styling (Webview)** | Tailwind CSS v4, PostCSS                                                |
| **CSS Parsing**       | PostCSS (`postcss-safe-parser`)                                         |
| **Build Tool**        | Webpack 5 (multi-config for domain, application, infrastructure layers) |
| **Testing**           | VS Code integration tests (`vscode-test`) + Jest unit tests             |
| **Quality Gates**     | ESLint, complexity checker, circular dependency validator               |

---

## Features

### Core Capabilities

- **Real-time Chrome-to-VS Code Sync** — Instantly push style changes from Chrome DevTools into your workspace files without leaving the browser.
- **Pluggable Style Language Support** — CSS is supported out of the box. The `StyleLanguageHandler` interface makes it trivial to add Sass, Less, SCSS, or Tailwind without touching core logic.
- **Temporary ID Injection** — HTML and React files are instrumented with `data-tweaksync-id` attributes to precisely map DOM elements back to their source locations.
- **File Tracking & Watching** — Track HTML/React and CSS files through an intuitive React hub. Changes on disk are detected and temporary IDs are re-injected automatically.
- **WebSocket-based Communication** — Lightweight, low-latency, local-only protocol on `127.0.0.1:16016` with typed message contracts.
- **Structured CSS Updates** — Styles are parsed, modified, and re-serialized structurally, preserving comments and minimizing diff noise.

### Developer Experience

- **Incremental Builds** — Build and test only the layer you changed (`npm run build:domain`, `build:application`, `build:infrastructure`).
- **Strict Type Safety** — Discriminated unions for all inter-process messages; compile-time contract verification.
- **Zero Circular Dependencies** — Enforced at build time by `scripts/validate-deps.mjs`.
- **Complexity Budgets** — 300-line file cap and per-function complexity checks via `scripts/check-complexity.mjs`.

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- VS Code 1.89+
- (Optional) `vsce` for packaging

### Install

```bash
git clone https://github.com/Mohamedhazeem/TweakSyncVScode.git
cd TweakSyncVScode
npm install
```

### Build

```bash
# Compile all layers
npm run compile

# Watch mode for backend
npm run watch

# Build webview frontend
npm run build:webview

# Production build
npm run package
```

### Quality

```bash
npm run lint              # ESLint
npm run typecheck         # TypeScript strict mode
npm run lint:complexity   # Enforce 300-line file cap
npm run check:circular    # Validate zero circular deps
```

### Test

```bash
npm run test              # VS Code integration tests
npm run test:unit         # Jest unit tests
npm run test:domain       # Domain layer tests only
npm run build:layers      # Independent layer compilation
```

### Run in VS Code

1. Press `F5` in VS Code to launch the Extension Development Host.
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
3. Run **TweakSync: Start TweakSync** to launch the WebSocket server.
4. Run **TweakSync: Open TweakSync Hub** to manage tracked files.
5. Use the Chrome companion client (or DevTools integration) to send style updates.

---

## Roadmap

### In Progress

- Full clean-architecture migration (strangler fig pattern)
- Unit test coverage for domain and application layers

### Upcoming

- **Extended CSS Selectors & Styles** — Support for complex selectors and advanced CSS properties.
- **CSS Functions** — Full support for `calc()`, `var()`, `clamp()`, and custom properties.
- **CSS At-Rules** — `@media`, `@supports`, `@keyframes`, and nested at-rules.
- **Multi-Language Support** — Sass, Less, SCSS, and Tailwind via the `StyleLanguageHandler` extension point.
- **Framework Expansion** — Beyond HTML and React: Vue, Svelte, Astro, and Angular.
- **Bidirectional Sync** — Push changes from VS Code back to Chrome DevTools.
- **Diff Preview** — Visual diff before applying changes to source files.

---

## Project Structure Reference

| Concept               | File / Directory                         |
| --------------------- | ---------------------------------------- |
| Composition Root      | `src/infrastructure/container.ts`        |
| Domain entry          | `src/domain/`                            |
| Application services  | `src/application/services/`              |
| WebSocket server      | `src/infrastructure/websocket/server.ts` |
| Webview UI            | `src/webview/`                           |
| Message contracts     | `src/domain/messaging/contracts.ts`      |
| Style registry        | `src/domain/style/registry.ts`           |
| CSS handler           | `src/domain/style/css/handler.ts`        |
| Specs                 | `specs/001-clean-architecture-refactor/` |
| Detailed instructions | `.kilo/instructions/`                    |

---

## License

**Proprietary / Confidential** — See [LICENSE.md](LICENSE.md) for full terms.

Copyright © 2025 TweakSync. All rights reserved. This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited without explicit written permission from the owner.

---

## Contact

**Support:** [support@tweaksync.dev](mailto:support@tweaksync.dev)

**Repository:** [https://github.com/Mohamedhazeem/TweakSyncVScode](https://github.com/Mohamedhazeem/TweakSyncVScode)

---

> TweakSync is designed for developers who care about architecture, testability, and a frictionless workflow between design and code.
