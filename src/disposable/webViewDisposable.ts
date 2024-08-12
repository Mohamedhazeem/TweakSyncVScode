import * as vscode from "vscode";
import * as path from "path";
import { getWebviewContent } from "../scripts/webView";
import { isServerRunning, startServer, stopServer } from "../scripts/websocket";

export function webViewPanelOpen(
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) {
  return vscode.commands.registerCommand("tweakSync.showPanel", () => {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.One);
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        "tweakSyncPanel",
        "TweakSync Hub",
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
    async (message) => {
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
        case "requestServerStatus":
          currentPanel?.webview.postMessage({ command: "serverStarted", value: isServerRunning });
          break;
        case "collectFiles":
          const uris = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: "Select Files",
            canSelectFiles: true,
            canSelectFolders: false,
            title: "Collect Files",
          });

          if (uris) {
            const allowedExtensions = [".html", ".jsx", ".tsx", ".css"];
            const filteredUris = uris.filter((uri) => {
              const ext = path.extname(uri.fsPath);
              return allowedExtensions.includes(ext);
            });
            const fileUris = filteredUris.map((uri) => uri.toString());
            let previousFiles = context.workspaceState.get<string[]>("selectedFiles", []);

            // Combine previous files with new selections
            previousFiles = Array.from(new Set([...previousFiles, ...fileUris]));

            // Update workspace state with combined files
            context.workspaceState.update("selectedFiles", previousFiles);
            currentPanel.webview.postMessage({ command: "updateFileList", files: previousFiles });
          }
          break;
        case "editFile":
          const selectedFileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: "Select File",
            canSelectFiles: true,
            canSelectFolders: false,
            title: "Edit File",
          });

          if (selectedFileUri && selectedFileUri.length > 0) {
            const allowedExtensions = [".html", ".jsx", ".tsx", ".css"];
            const filteredUris = selectedFileUri.filter((uri) => {
              const ext = path.extname(uri.fsPath);
              return allowedExtensions.includes(ext);
            });

            if (filteredUris.length > 0) {
              const newFileUri = filteredUris[0].toString();
              let previousFiles = context.workspaceState.get<string[]>("selectedFiles", []);

              // Replace the old file with the new one
              const updatedFiles = previousFiles.map((file) =>
                file === message.oldFile ? newFileUri : file
              );

              // Update workspace state with the edited files list
              context.workspaceState.update("selectedFiles", updatedFiles);

              // Post the updated file list to the Webview
              currentPanel.webview.postMessage({ command: "updateFileList", files: updatedFiles });
            }
          }
          break;
        case "removeFile":
          const fileToRemove = message.file;
          let updatedFiles = context.workspaceState.get<string[]>("selectedFiles", []);

          updatedFiles = updatedFiles.filter((file) => file !== fileToRemove);

          context.workspaceState.update("selectedFiles", updatedFiles);
          currentPanel.webview.postMessage({ command: "updateFileList", files: updatedFiles });
          break;
        case "getStoredFiles":
          const storedFiles = context.workspaceState.get<string[]>("selectedFiles", []);
          currentPanel?.webview.postMessage({ command: "updateFileList", files: storedFiles });
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}
