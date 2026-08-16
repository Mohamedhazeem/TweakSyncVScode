# `infrastructure/messaging/handlers`

Inbound adapters that translate a WebSocket message arriving from the Chrome
extension into an application use case or a VS Code operation. They live under
`infrastructure` (not `domain`) because they are coupled to VS Code file I/O and
the WebSocket client — keeping them out of the pure domain layer preserves the
layering and avoids a `domain ↔ application` cycle.

| File | Responsibility |
|------|---------------|
| `elementStyles.ts` | Handles `ElementStyles` messages: applies reported CSS changes to every selected CSS file via the application-layer `StyleService` (which resolves the right `StyleLanguageHandler` through the registry). |
| `elementDetails.ts` | Handles `ElementDetails` messages: locates the temporary-id marker in each tracked HTML/React file and rewrites the element with the updated tag, text, and attributes using a `vscode.WorkspaceEdit`. |

**Wiring:** message routing is registered in `application/services/sync-service.ts`,
which forwards inbound WebSocket traffic to `handleWebSocketMessage` in
`src/scripts/server.ts`; that dispatcher delegates to these handlers.
