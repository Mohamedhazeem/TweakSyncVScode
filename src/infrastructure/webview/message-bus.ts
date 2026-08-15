import * as vscode from "vscode";
import { ExtensionToWebviewMessage } from "../../domain/messaging/contracts";
import { getCurrentPanel, setCurrentPanel } from "../../utils/webviewPanel";

/**
 * Mediates all messages sent from the extension host to the webview panel.
 * Backed by the shared panel singleton so legacy code paths that call
 * `getCurrentPanel()` stay consistent with the new modules.
 */
export class WebviewMessageBus {
  setPanel(panel: vscode.WebviewPanel | undefined): void {
    setCurrentPanel(panel);
  }

  getPanel(): vscode.WebviewPanel | undefined {
    return getCurrentPanel();
  }

  postMessage(message: ExtensionToWebviewMessage): void {
    this.getPanel()?.webview.postMessage(message);
  }
}
