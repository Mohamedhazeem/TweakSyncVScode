import * as vscode from "vscode";
import { server } from "../infrastructure/websocket/server";

/**
 * Backwards-compatibility shim. The real implementation now lives in
 * `infrastructure/websocket/server.ts`; this module re-exposes the previous
 * public names so existing importers (`elementDetails`, `elementStyles`,
 * `statusBar`, `webViewDisposable`) keep working unchanged.
 */

export const startServer = (
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
): void => {
  server.setPanel(currentPanel);
  server.setContext(context);
  server.start();
};

export const stopServer = (currentPanel: vscode.WebviewPanel | undefined): void => {
  server.setPanel(currentPanel);
  server.stop();
};

export const sendMessageToClient = (message: unknown): void => {
  server.sendToClient(message);
};

export { server };
