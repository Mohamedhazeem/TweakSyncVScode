import * as vscode from "vscode";
import * as path from "path";
import { getWebviewContent } from "../scripts/webView";
export function webViewPanelOpen(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand("vscode.showPanel", () => {
    const panel = vscode.window.createWebviewPanel(
      "myWebviewPanel",
      "My Side Panel",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "webview"))],
      }
    );

    panel.webview.html = getWebviewContent(panel, context.extensionPath);
  });
}
