import WebSocket from "ws";
import * as vscode from "vscode";
import {
  WebSocketServerPort,
  MessageHandler,
  ConnectionStateListener,
  ExtensionToWebviewMessage,
  ClientOutboundMessage,
} from "./types";
import { LOCAL_HOST, PORT } from "../../utils/constant";
import { WebSocketClient } from "./client";

/**
 * Concrete {@link WebSocketServerPort} built on the `ws` library. Mirrors the
 * previous monolithic server behavior (start/stop, connection tracking, client
 * broadcast) while exposing explicit hooks (`onMessage`, `onConnectionChange`)
 * and a {@link WebSocketMessageBus}-style post method so the rest of the
 * system depends on the port rather than on `ws` internals directly.
 */
class WebSocketServerImpl implements WebSocketServerPort {
  private ws?: WebSocket.Server;
  private clients: WebSocketClient[] = [];
  private messageHandlers: MessageHandler[] = [];
  private connectionListeners: ConnectionStateListener[] = [];
  private panel?: vscode.WebviewPanel;
  private context?: vscode.ExtensionContext;

  isRunning = false;
  isConnected = false;

  setPanel(panel: vscode.WebviewPanel | undefined): void {
    this.panel = panel;
  }

  setContext(context: vscode.ExtensionContext): void {
    this.context = context;
  }

  start(): void {
    if (this.isRunning) {
      this.panel?.webview.postMessage({
        command: "serverStarted",
        value: this.isRunning,
      });
      return;
    }

    try {
      this.ws = new WebSocket.Server({ port: PORT, host: LOCAL_HOST });
      this.isRunning = true;

      this.panel?.webview.postMessage({
        command: "serverStarted",
        value: this.isRunning,
      });

      this.ws.on("connection", (socket: WebSocket) => {
        const client = new WebSocketClient(socket);
        this.clients.push(client);
        this.isConnected = true;
        this.connectionListeners.forEach((listener) => listener(true));

        socket.on("message", async (message) => {
          try {
            const parsed = JSON.parse(message.toString());
            for (const handler of this.messageHandlers) {
              await handler(parsed);
            }
          } catch (error) {
            console.error("Error handling message:", error);
          }
        });

        socket.on("close", () => {
          const index = this.clients.findIndex((c) => c.socket === socket);
          if (index !== -1) {
            this.clients.splice(index, 1);
          }
          this.connectionListeners.forEach((listener) => listener(false));
        });

        socket.on("error", (error) => {
          console.error("WebSocket client error:", error);
          this.connectionListeners.forEach((listener) => listener(false));
        });
      });

      this.ws.on("error", (error) => {
        console.log("server error:", error);
        this.stop();
      });

      this.ws.on("close", () => {
        this.isRunning = false;
        this.isConnected = false;
        this.ws = undefined;
      });
    } catch (error) {
      console.error("Error starting server:", error);
    }
  }

  stop(): void {
    if (!this.isRunning || !this.ws) {
      console.log("Server is not running.");
      return;
    }

    this.clients.forEach((client) => client.close());

    this.ws.close(() => {
      console.log("server stopped");
      this.ws = undefined;
      this.isRunning = false;
      this.isConnected = false;
      this.panel?.webview.postMessage({
        command: "serverStarted",
        value: this.isRunning,
      });
      this.panel?.webview.postMessage({
        command: "serverConnected",
        value: this.isConnected,
      });
    });
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  onConnectionChange(listener: ConnectionStateListener): void {
    this.connectionListeners.push(listener);
  }

  broadcast(message: ExtensionToWebviewMessage): void {
    this.panel?.webview.postMessage(message);
  }

  sendToClient(message: ClientOutboundMessage): void {
    this.clients[0]?.send(message);
  }
}

/** Process-wide singleton server instance. */
export const server = new WebSocketServerImpl();
export { WebSocketServerImpl as WebSocketServer };
