# TweakSync

TweakSync is a powerful VS Code extension designed for front-end developers and web designers, enabling **real-time updates** of webpage elements and styles directly from Chrome to VS Code. With TweakSync, you can seamlessly integrate your browser with your code editor, allowing you to make styling changes in real-time without switching between tools, streamlining your web development workflow and improving efficiency.

# Tech Stack
- **MERN**
- Websocket
- Typescript
- Tailwind

## Architecture

TweakSync follows a layered **clean architecture** with strict separation of concerns. The entry point (`src/extension.ts`) is a thin composition root that delegates wiring to `src/infrastructure/container.ts`. Module resolution uses path aliases defined in `tsconfig.base.json` (`@domain/*`, `@application/*`, `@infrastructure/*`, `@webview/*`, `@/*`).

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Domain** | `src/domain/` | Pure business logic with no VS Code or `ws` imports. Style-language extension point (`StyleLanguageHandler`), the handler `registry`, CSS parser/updater, temporary-ID logic, and message contracts. |
| **Application** | `src/application/` | Use cases and orchestration: `SyncService` (routes inbound WebSocket traffic), `StyleService` (applies style changes via the registry), and the command handlers (`start-server`, `watch-files`, `remove-files`). |
| **Infrastructure** | `src/infrastructure/` | Concrete adapters: VS Code wrappers (`workspace-state`, `window`, `commands`, `workspace-fs`), WebSocket `server`/`client`, the webview `message-bus`, and `messaging/handlers` (inbound `elementStyles` / `elementDetails` adapters). |
| **Webview** | `src/webview/` | React UI (TweakSync Hub) decoupled from the extension host via typed messages. |

**Extension point (User Story 1):** new styling languages are supported by implementing `StyleLanguageHandler` and registering it on the `StyleLanguageRegistry` — no core module changes required.

**Cross-cutting guards:** `scripts/validate-deps.mjs` enforces zero circular dependencies, and `scripts/check-complexity.mjs` enforces a 300-line file cap and a per-function complexity budget.

> **Migration note:** a small number of legacy modules under `src/scripts/` (`statusBar`, `websocket`, `webView`, `server`) and `src/disposable/webViewDisposable.ts` are still wired into the composition root. The new architecture currently delegates to them; fully re-implementing these behind the new abstractions is the remaining cleanup step.

## Features

- **Seamless Chrome-to-VS Code Syncing:** Instantly sync changes made in Chrome directly to your VS Code environment, ensuring a smooth and integrated workflow.
- **Live Preview:** SModify CSS or HTML directly in Chrome, and see the changes reflected in real-time with immediate updates in VS Code when you click the 'Apply' button.
- **Efficient Performance:** Fast load times and optimized resource usage ensure that TweakSync runs smoothly, even on large projects.

## Upcoming Features

We are constantly working to enhance TweakSync and bring you new capabilities. Here are some of the exciting features we’re working on:

- **Extended CSS Styles and Selectors:**
  Enhanced support for a wider range of CSS styles and the ability to create and manage complex CSS selectors.
- **CSS Function Support:**
  Improved support for CSS functions, enabling more advanced styling options and greater flexibility in your designs.
- **Atrules Support:**
  Full support for CSS Atrules (like @media, @supports, and @keyframes etc...) to offer a more comprehensive styling experience.
- **Upcoming Library Support:**
  Currently, TweakSync supports HTML and React. We are actively working on expanding support to additional libraries and frameworks in future updates to ensure a broader range of development environments can benefit from TweakSync’s functionality.
- **And Many More...**

### Stay tuned for updates as we continue to add these features and more!

## Usage

### Opening TweakSync:

- #### Status Bar:
  - Locate the **TweakSync Icon** in the status bar. Click on it to open the TweakSync Hub.
- #### Command Palette:
  - Press **Ctrl+Shift+P** to open the Command Palette.
  - Type **TweakSync: Open TweakSync Hub** and select it to open the TweakSync Hub.

### Working with HTML Files:

- #### Select HTML Files:
  - Click on the **Select HTML Files** button to choose an HTML file.
- #### Watch All:
  - Click the **Watch All** button to start monitoring all elements in the selected HTML files.
- #### Watch Specific File:
  - If you change a particular file and want to monitor it again, use the **Watch** button to re-watch that specific file.

### Working with CSS Files:

- #### Select CSS File:
  - Click on the **Select CSS File** button to choose a CSS file. Note that only one CSS file can be selected at a time.
- #### No Need to Watch:
  - You do not need to use the **Watch** functionality for CSS files. Simply selecting the CSS file is sufficient.

### Starting and Managing TweakSync:

- #### Start TweakSync:
  - Click the **Start** button to begin the TweakSync process.
- #### Remove All Files:
  - If you want to remove all tracked files, click the **Remove All** button.
- ### Remove Single File:
  - To remove a specific file from tracking, click the **Remove** button for that file.

### Contact Support

#### Still have a question or need our help? Is there a feature you'd like to see? Let us know!

#### You can reach us at: [support@tweaksync.dev](support@tweaksync.dev)

## 🔒 License

**Private / Proprietary Software**

© 2025 TweakSync. All rights reserved.

This software is proprietary and confidential.  
Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited without explicit written permission from the owner.
