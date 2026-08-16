import { ClientOutboundMessage, FileIdMap } from "../../types/ElementTypes";

/**
 * Message contracts for inter-layer communication. This module is the single
 * source of truth for the wire shapes TweakSync speaks. It intentionally does
 * NOT redefine the inbound Chrome client messages: those live as the
 * `WebSocketMessage` union in `types/ElementTypes.ts` (discriminated by
 * `action`) so there is exactly one definition per wire channel.
 *
 * Channels:
 * - Inbound  Chrome -> VS Code : `WebSocketMessage` in `types/ElementTypes.ts`
 *   (handlers narrow it with `isElementDetails` / `isElementStyles`).
 * - Outbound VS Code -> Chrome : `ClientOutboundMessage` (also in
 *   `types/ElementTypes.ts`), sent via `WebSocketServerPort.sendToClient`.
 * - Extension <-> Webview      : `ExtensionToWebviewMessage` /
 *   `WebviewToExtensionMessage` below, exchanged via `WebviewMessageBus`
 *   (Constitution: explicit, versioned interfaces for inter-module comms).
 */

// ---------------------------------------------------------------------------
// Webview messages (Extension host <-> Webview panel)
// ---------------------------------------------------------------------------

export interface ExtensionToWebviewMessage {
  command: "serverStarted" | "serverConnected" | "updateFileList" | "error";
  value?: unknown;
  files?: {
    css?: string[];
    htmlReact?: FileIdMap[];
  };
}

export interface WebviewToExtensionMessage {
  command:
    | "selectFiles"
    | "watchAll"
    | "watchSingleFile"
    | "removeFile"
    | "removeAllFiles"
    | "startServer";
  value?: unknown;
}

export type { ClientOutboundMessage };
