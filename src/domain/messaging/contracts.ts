import { ExternalStyles, FileIdMap } from "../../types/ElementTypes";

/**
 * Message contracts for inter-layer communication. These interfaces replace the
 * previously implicit, loosely-typed message objects with explicit,
 * compile-time-verified contracts (Constitution: explicit versioned interfaces
 * for inter-module communication).
 */

// ---------------------------------------------------------------------------
// WebSocket messages (Chrome client <-> Extension host)
// ---------------------------------------------------------------------------

export interface ElementDetailsMessage {
  type: "ElementDetails";
  element: {
    tagName: string;
    attributes: Record<string, string>;
    textContent?: string;
    computedStyles?: Record<string, string>;
  };
  sourceFile: string;
  sourceLine: number;
}

export interface ElementStylesMessage {
  type: "ElementStyles";
  styles: ExternalStyles;
  sourceFile: string;
}

export type IncomingWebSocketMessage = ElementDetailsMessage | ElementStylesMessage;

export interface ServerStatusMessage {
  type: "ServerStatus";
  isRunning: boolean;
  isConnected: boolean;
}

export type OutgoingWebSocketMessage = ServerStatusMessage;

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
