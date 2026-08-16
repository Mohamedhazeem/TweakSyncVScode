import * as vscode from "vscode";
import { WebSocketServerPort } from "../../infrastructure/websocket/types";
import { isElementDetails, isElementStyles } from "../../utils/elementHelper";
import { elementStyles } from "@/infrastructure/messaging/handlers/elementStyles";
import { elementDetails } from "@/infrastructure/messaging/handlers/elementDetails";
import { WebviewMessageBus } from "../../infrastructure/webview/message-bus";

/**
 * Application use case that wires inbound WebSocket traffic to the appropriate
 * handlers and propagates connection-state changes to the webview. Depends only
 * on the {@link WebSocketServerPort} and {@link WebviewMessageBus} abstractions,
 * keeping the sync orchestration isolated from `ws` and `vscode` concretes. The
 * message dispatch previously lived in the monolithic `scripts/server.ts`; it is
 * now inlined here so the application layer owns the routing decision while the
 * handlers stay the inbound adapters (User Story 2 isolation).
 */
export class SyncService {
  constructor(
    private readonly server: WebSocketServerPort,
    private readonly context: vscode.ExtensionContext,
    private readonly bus: WebviewMessageBus
  ) {}

  register(): void {
    this.server.onMessage(async (message) => {
      if (isElementDetails(message)) {
        await elementDetails(message, this.context, this.server);
      } else if (isElementStyles(message)) {
        await elementStyles(message, this.context, this.server);
      } else {
        console.log("Invalid WebSocket message action.");
      }
    });

    this.server.onConnectionChange((connected) => {
      this.bus.postMessage({ command: "serverConnected", value: connected });
    });
  }
}
