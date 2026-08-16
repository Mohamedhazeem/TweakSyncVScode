import type { WebSocketMessage } from "../../types/ElementTypes";
import type { OutgoingWebSocketMessage } from "../../domain/messaging/contracts";
import type { StyleLanguageHandler } from "../../domain/style/handler";

/**
 * Transport-level types for the WebSocket layer. The inbound message wire shape
 * is the shared `WebSocketMessage` union (see `types/ElementTypes.ts`), narrowed
 * at the handler boundary by `isElementDetails` / `isElementStyles`. Outbound
 * status messages are described by `OutgoingWebSocketMessage` from
 * `domain/messaging/contracts.ts`. Connection/dispatch types below are used by
 * the server and client implementations in `infrastructure/websocket/*`.
 */
export type { OutgoingWebSocketMessage };

export type MessageHandler = (
  message: WebSocketMessage
) => Promise<void> | void;

export type ConnectionStateListener = (connected: boolean) => void;

export interface WebSocketServerPort {
  start(): void;
  stop(): void;
  readonly isRunning: boolean;
  onMessage(handler: MessageHandler): void;
  onConnectionChange(listener: ConnectionStateListener): void;
  broadcast(message: OutgoingWebSocketMessage): void;
}

export interface StyleLanguageResolver {
  resolveForFile(fileUri: string): StyleLanguageHandler | undefined;
}
