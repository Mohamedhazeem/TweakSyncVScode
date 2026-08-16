import type { WebSocketMessage, ClientOutboundMessage } from "../../types/ElementTypes";
import type { ExtensionToWebviewMessage } from "../../domain/messaging/contracts";
import type { StyleLanguageHandler } from "../../domain/style/handler";

/**
 * Transport-level types for the WebSocket layer. The inbound message wire shape
 * is the shared `WebSocketMessage` union (see `types/ElementTypes.ts`), narrowed
 * at the handler boundary by `isElementDetails` / `isElementStyles`. Outbound
 * client messages use `ClientOutboundMessage` (also in `types/ElementTypes.ts`);
 * webview-bound status messages use `ExtensionToWebviewMessage` from
 * `domain/messaging/contracts.ts`. Connection/dispatch types below are used by
 * the server and client implementations in `infrastructure/websocket/*`.
 */
export type { ClientOutboundMessage, ExtensionToWebviewMessage };

export type MessageHandler = (
  message: WebSocketMessage
) => Promise<void> | void;

export type ConnectionStateListener = (connected: boolean) => void;

export interface WebSocketServerPort {
  start(): void;
  stop(): void;
  readonly isRunning: boolean;
  readonly isConnected: boolean;
  onMessage(handler: MessageHandler): void;
  onConnectionChange(listener: ConnectionStateListener): void;
  /** Send a status/notification message to the webview panel. */
  broadcast(message: ExtensionToWebviewMessage): void;
  /** Send an outbound message to the connected Chrome client. */
  sendToClient(message: ClientOutboundMessage): void;
}

export interface StyleLanguageResolver {
  resolveForFile(fileUri: string): StyleLanguageHandler | undefined;
}
