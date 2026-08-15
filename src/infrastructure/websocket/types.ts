import type {
  IncomingWebSocketMessage,
  OutgoingWebSocketMessage,
} from "../../domain/messaging/contracts";
import type { StyleLanguageHandler } from "../../domain/style/handler";

/**
 * Transport-level types for the WebSocket layer. The message shapes themselves
 * are owned by `domain/messaging/contracts.ts`; this module re-exports them and
 * adds the connection/dispatch types used by the server and client
 * implementations in `infrastructure/websocket/*`.
 */
export type { IncomingWebSocketMessage, OutgoingWebSocketMessage };

export type MessageHandler = (
  message: IncomingWebSocketMessage
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
