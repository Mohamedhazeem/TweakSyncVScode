import * as vscode from "vscode";
import { webViewPanelOpen } from "../../../disposable/webViewDisposable";
import { WebSocketServerPort } from "../../websocket/types";
import { WebviewMessageBus } from "../../webview/message-bus";

export interface WebviewDisposableDeps {
  setPanel: (panel: vscode.WebviewPanel | undefined) => void;
  context: vscode.ExtensionContext;
  server: WebSocketServerPort;
  bus: WebviewMessageBus;
}

/**
 * Disposable that registers the webview panel command and wires the webview's
 * inbound message handling. Delegates to `webViewPanelOpen`, supplying the
 * WebSocket and webview-message ports so the disposable stays free of legacy
 * `scripts/*` reach-throughs (User Story 2 isolation).
 */
export function createWebviewDisposable(deps: WebviewDisposableDeps): vscode.Disposable {
  return webViewPanelOpen(deps.setPanel, deps.context, deps.server, deps.bus);
}
