import WebSocket from "ws";

/**
 * Thin wrapper around a single connected WebSocket client. Isolates the
 * transport concern so the server can broadcast/send without leaking `ws`
 * internals into the rest of the system.
 */
export class WebSocketClient {
  constructor(public readonly socket: WebSocket) {}

  get isOpen(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }

  send(message: unknown): void {
    if (this.isOpen) {
      this.socket.send(JSON.stringify(message));
    }
  }

  close(): void {
    this.socket.close();
  }
}
