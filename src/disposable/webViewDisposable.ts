import * as vscode from "vscode";
import * as path from "path";
import { getWebviewContent } from "../scripts/webView";
import { startServer, stopServer } from "../scripts/websocket";
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
          currentPanel = undefined;
        },
        null,
        context.subscriptions
      );
      OnReceiveMessage(currentPanel, context);
    }
  });
}
function OnReceiveMessage(currentPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
  currentPanel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.command) {
        case "startTweakSync":
          if (message.value) {
            vscode.window.showInformationMessage(message.value);
            startServer(currentPanel);
          } else {
            vscode.window.showInformationMessage(message.value);
            stopServer(currentPanel);
          }
          return;
      }
    },
    undefined,
    context.subscriptions
  );
}
