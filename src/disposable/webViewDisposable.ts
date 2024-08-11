import * as vscode from "vscode";
import * as path from "path";
import { getWebviewContent } from "../scripts/webView";
export function webViewPanelOpen(
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) {
  return vscode.commands.registerCommand("vscode.showPanel", () => {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.One);
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        "myWebviewPanel",
        "My Side Panel",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "webview"))],
        }
      );

      currentPanel.webview.html = getWebviewContent(currentPanel, context.extensionPath);
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined; // Clean up the reference
        },
        null,
        context.subscriptions
      );
      // Handle messages from the webview
      currentPanel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "webviewToExtension":
              vscode.window.showInformationMessage(message.value);
              return;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  });
}
