import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
export function getWebviewContent(panel: vscode.WebviewPanel, extensionPath: string) {
  const scriptUri = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(extensionPath, "out", "webview", "bundle.js"))
  );

  const styleUri = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(extensionPath, "out", "webview", "styles", "index.css"))
  );
  return `
         <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TweakSync Hub</title>
            <link href="${styleUri}" rel="stylesheet">
        </head>
        <body>
            <div id="root"></div>
            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
}
