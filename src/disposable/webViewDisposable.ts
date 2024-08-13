import * as vscode from "vscode";
import * as path from "path";
import { getWebviewContent } from "../scripts/webView";
import { isServerRunning, startServer, stopServer } from "../scripts/websocket";
import {
  allowedCssExtensions,
  allowedHtmlExtensions,
  cssFile,
  htmlFile,
} from "../utils/isSupportedFileType";
import { validateStoredFiles } from "../utils/checkSelectedFileAvailable";

export function webViewPanelOpen(
  currentPanel: vscode.WebviewPanel | undefined,
  setPanel: (panel: vscode.WebviewPanel | undefined) => void,
  context: vscode.ExtensionContext
) {
  return vscode.commands.registerCommand("tweakSync.showPanel", () => {
    console.log("Command 'tweakSync.showPanel' invoked");
    console.log(currentPanel);
    if (currentPanel) {
      console.log("Panel already exists, revealing it.");
      currentPanel.reveal(vscode.ViewColumn.One);
    } else {
      console.log("Creating new panel.");
      const panel = vscode.window.createWebviewPanel(
        "tweakSyncPanel",
        "TweakSync Hub",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "webview"))],
        }
      );
      panel.webview.html = getWebviewContent(panel, context.extensionPath);
      panel.onDidDispose(
        () => {
          console.log("Panel disposed.");
          setPanel(undefined); // Clear the global reference when the panel is closed
        },
        null,
        context.subscriptions
      );
      setPanel(panel); // Update the global reference
      OnReceiveMessage(panel, context);
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
        case "selectFiles":
          const uris = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: "Select Files",
            canSelectFiles: true,
            canSelectFolders: false,
            title: "Select Files for TweakSync",
          });

          if (uris) {
            const cssUris = cssFile(uris, allowedCssExtensions);
            const htmlReactUris = htmlFile(uris, allowedHtmlExtensions);
            const cssFileUris = cssUris.map((uri) => uri.toString());
            const htmlReactFileUris = htmlReactUris.map((uri) => uri.toString());
            let previousCssFiles = context.workspaceState.get<string[]>("selectedCssFiles", []);
            let previousHtmlReactFiles = context.workspaceState.get<string[]>(
              "selectedHtmlReactFiles",
              []
            );

            // Combine previous files with new selections, ensuring unique entries
            previousCssFiles = Array.from(new Set([...previousCssFiles, ...cssFileUris]));
            previousHtmlReactFiles = Array.from(
              new Set([...previousHtmlReactFiles, ...htmlReactFileUris])
            );

            // Update workspace state with combined files
            context.workspaceState.update("selectedCssFiles", previousCssFiles);
            context.workspaceState.update("selectedHtmlReactFiles", previousHtmlReactFiles);
            // const filteredUris = uris.filter((uri) => {
            //   const ext = path.extname(uri.fsPath);
            //   return allowedExtensions.includes(ext);
            // });
            // const fileUris = filteredUris.map((uri) => uri.toString());
            // let previousFiles = context.workspaceState.get<string[]>("selectedFiles", []);

            // // Combine previous files with new selections
            // previousFiles = Array.from(new Set([...previousFiles, ...fileUris]));

            // // Update workspace state with combined files
            // context.workspaceState.update("selectedFiles", previousFiles);
            const updatedFiles = {
              css: previousCssFiles,
              htmlReact: previousHtmlReactFiles,
            };
            currentPanel.webview.postMessage({
              command: "updateFileList",
              files: updatedFiles,
            });
          }
          break;
        case "editFile":
          const uri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: "Select File",
            canSelectFiles: true,
            canSelectFolders: false,
            title: "Edit File for TweakSync",
          });

          if (uri && uri.length > 0) {
            // Filter URIs based on file extension
            const cssUris = uri.filter((uri) => {
              const ext = path.extname(uri.fsPath);
              return allowedCssExtensions.includes(ext);
            });

            const htmlReactUris = uri.filter((uri) => {
              const ext = path.extname(uri.fsPath);
              return allowedHtmlExtensions.includes(ext);
            });

            if (cssUris.length > 0 || htmlReactUris.length > 0) {
              const newFileUri = cssUris[0]?.toString() || htmlReactUris[0]?.toString();

              // Retrieve existing files from workspace state
              let previousCssFiles = context.workspaceState.get<string[]>("selectedCssFiles", []);
              let previousHtmlReactFiles = context.workspaceState.get<string[]>(
                "selectedHtmlReactFiles",
                []
              );

              // Replace the old file with the new one
              const updatedCssFiles = previousCssFiles.map((file) =>
                file === message.oldFile ? newFileUri : file
              );

              const updatedHtmlReactFiles = previousHtmlReactFiles.map((file) =>
                file === message.oldFile ? newFileUri : file
              );

              // Update workspace state with the edited files list
              context.workspaceState.update("selectedCssFiles", updatedCssFiles);
              context.workspaceState.update("selectedHtmlReactFiles", updatedHtmlReactFiles);

              // Combine updated lists for Webview
              const updatedFiles = {
                css: updatedCssFiles,
                htmlReact: updatedHtmlReactFiles,
              };

              // Post the updated file list to the Webview
              if (currentPanel?.webview) {
                currentPanel.webview.postMessage({
                  command: "updateFileList",
                  files: updatedFiles,
                });
              }
            }
          }
          break;
        case "removeFile":
          vscode.commands.executeCommand("tweakSync.removeFile", message.file, message.index);
          break;
        case "watchFiles":
          vscode.commands.executeCommand("tweakSync.injectTemporaryIdsToFiles");
          break;
        case "getStoredFiles":
          const updatedFiles = await validateStoredFiles(context);
          currentPanel?.webview.postMessage({ command: "updateFileList", files: updatedFiles });
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}
