import * as vscode from "vscode";
import { WebSocketServerPort } from "../../infrastructure/websocket/types";
import { handleWebSocketMessage } from "../../scripts/server";
import { WebviewMessageBus } from "../../infrastructure/webview/message-bus";

/**
 * Application use case that wires inbound WebSocket traffic to the appropriate
 * handlers and propagates connection-state changes to the webview. Depends only
 * on the {@link WebSocketServerPort} and {@link WebviewMessageBus} abstractions,
 * keeping the sync orchestration isolated from `ws` and `vscode` concretes.
 */
export class SyncService {
  constructor(
    private readonly server: WebSocketServerPort,
    private readonly context: vscode.ExtensionContext,
    private readonly bus: WebviewMessageBus
  ) {}

  register(): void {
    this.server.onMessage(async (message) => {
      await handleWebSocketMessage(message, this.context);
    });

    this.server.onConnectionChange((connected) => {
      this.bus.postMessage({ command: "serverConnected", value: connected });
    });
  }
}
