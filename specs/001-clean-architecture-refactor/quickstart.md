# Quickstart: Clean Architecture Refactor

**Date**: 2026-08-16  
**Feature**: Clean Architecture Refactor  
**Status**: Draft

## Prerequisites

- Node.js 18+ and npm installed
- Git repository cloned and on branch `001-clean-architecture-refactor`
- VS Code installed with the `@vscode/test-electron` test runner configured

## Setup

```bash
# Install dependencies
npm install

# Build the extension backend
npm run compile

# Build the webview frontend
npm run build:webview
```

## Validation Scenarios

### Scenario 1: Extension Activates Without Errors

**Steps**:
1. Open the project in VS Code.
2. Press `F5` to launch a new Extension Development Host.
3. In the new window, open the Command Palette and run `TweakSync: Open TweakSync Hub`.
4. Verify the webview panel opens without errors.

**Expected Outcome**: The extension activates, the webview opens, and no console errors appear in the Extension Development Host.

---

### Scenario 2: WebSocket Server Starts and Accepts Connections

**Steps**:
1. In the Extension Development Host, run `TweakSync: Start Server`.
2. Verify the status bar shows the server as running.
3. Connect a Chrome client to `ws://127.0.0.1:16016`.
4. Verify the extension receives the connection and logs `"Connection established from VS Code extension"`.

**Expected Outcome**: Server starts on port 16016, accepts Chrome client connections, and state is correctly reflected in the webview.

---

### Scenario 3: CSS Style Updates Flow End-to-End

**Steps**:
1. Select a CSS file using the webview.
2. Click `Watch All` to inject temporary IDs and start watching.
3. In Chrome DevTools, modify a style on an element tracked by TweakSync.
4. Verify the style update is received via WebSocket, applied to the CSS file, and the file is saved.

**Expected Outcome**: CSS file is updated with the new styles, and the webview reflects the updated file list.

---

### Scenario 4: Modular Unit Tests Pass

**Steps**:
1. Run unit tests for the domain layer:
   ```bash
   npm test -- --testPathPattern="domain"
   ```
2. Run unit tests for the application layer:
   ```bash
   npm test -- --testPathPattern="application"
   ```
3. Run integration tests:
   ```bash
   npm test
   ```

**Expected Outcome**: All tests pass independently. Changing one module's tests does not require running tests for unrelated modules.

---

### Scenario 5: New Styling Language Handler Registration

**Steps**:
1. Create a new file `src/domain/style/sass/handler.ts` implementing `StyleLanguageHandler`.
2. Register it in `src/domain/style/registry.ts`.
3. Run the extension and verify `.scss` files are recognized and processed.

**Expected Outcome**: The new handler is loaded without modifying any existing core module. CSS functionality remains unchanged.

---

## Troubleshooting

- **Extension fails to activate**: Check the Extension Development Host console for missing dependencies or TypeScript compilation errors.
- **WebSocket connection refused**: Verify no other process is using port 16016; check that `ws` is installed.
- **Styles not applying**: Ensure the CSS file is selected and watched; check that the Chrome client is connected.
- **Unit tests fail with VS Code API errors**: Ensure mocks are properly injected; verify that domain tests do not import VS Code modules.

## References

- [Data Model](../data-model.md)
- [WebSocket Contracts](../contracts/websocket-messages.md)
- [Webview Contracts](../contracts/webview-messages.md)
- [Style Language Handler Contract](../contracts/style-language-handler.md)
