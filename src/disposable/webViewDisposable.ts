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
import { FileIdMap } from "../types/ElementTypes";
import { getIdsForFile } from "../utils/extractIdsFromCode";
import { getCurrentPanel } from "../utils/webviewPanel";

export function webViewPanelOpen(
  setPanel: (panel: vscode.WebviewPanel | undefined) => void,
  context: vscode.ExtensionContext
) {
  return vscode.commands.registerCommand("tweakSync.showPanel", () => {
    console.log("Command 'tweakSync.showPanel' invoked");
    const currentPanel = getCurrentPanel();
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
          setPanel(undefined);
        },
        null,
        context.subscriptions
      );
      setPanel(panel);
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
            startServer(currentPanel, context);
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
            // Assuming cssFile and htmlFile functions return URIs
            const cssUris = cssFile(uris, allowedCssExtensions);
            const htmlReactUris = htmlFile(uris, allowedHtmlExtensions);

            // Convert URIs to strings
            const cssFileUris = cssUris.map((uri) => uri.toString());
            const htmlReactFileUris = htmlReactUris.map((uri) => uri.toString());

            // Retrieve previously stored files
            let previousCssFiles = context.workspaceState.get<string[]>("selectedCssFiles", []);
            let previousHtmlReactFiles = context.workspaceState.get<FileIdMap[]>(
              "selectedHtmlReactFiles",
              []
            );

            // Update CSS files
            previousCssFiles = Array.from(new Set([...previousCssFiles, ...cssFileUris]));

            // Create a map to update HTML/React files
            const fileIdMapDict = new Map<string, FileIdMap>(
              previousHtmlReactFiles.map((file) => [file.fileUri, file])
            );
            const htmlReactFileUrisWithIds = await Promise.all(
              htmlReactUris.map(async (uri) => ({
                fileUri: uri.toString(),
                ids: await getIdsForFile(uri),
              }))
            );

            htmlReactFileUrisWithIds.forEach(({ fileUri, ids }) => {
              if (fileIdMapDict.has(fileUri)) {
                const existingFile = fileIdMapDict.get(fileUri)!;
                existingFile.ids = Array.from(new Set([...existingFile.ids, ...ids]));
              } else {
                fileIdMapDict.set(fileUri, { fileUri, ids });
              }
            });

            // Convert dictionary back to array
            previousHtmlReactFiles = Array.from(fileIdMapDict.values());

            // Update the workspace state
            context.workspaceState.update("selectedCssFiles", previousCssFiles);
            context.workspaceState.update("selectedHtmlReactFiles", previousHtmlReactFiles);

            // Send updated files to the webview
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
        // case "editFile":
        //   const uri = await vscode.window.showOpenDialog({
        //     canSelectMany: false,
        //     openLabel: "Select File",
        //     canSelectFiles: true,
        //     canSelectFolders: false,
        //     title: "Edit File for TweakSync",
        //   });

        //   if (uri && uri.length > 0) {
        //     // Filter URIs based on file extension
        //     const cssUris = uri.filter((uri) => {
        //       const ext = path.extname(uri.fsPath);
        //       return allowedCssExtensions.includes(ext);
        //     });

        //     const htmlReactUris = uri.filter((uri) => {
        //       const ext = path.extname(uri.fsPath);
        //       return allowedHtmlExtensions.includes(ext);
        //     });

        //     if (cssUris.length > 0 || htmlReactUris.length > 0) {
        //       const newFileUri = cssUris[0]?.toString() || htmlReactUris[0]?.toString();

        //       // Retrieve existing files from workspace state
        //       let previousCssFiles = context.workspaceState.get<string[]>("selectedCssFiles", []);
        //       // let previousHtmlReactFiles = context.workspaceState.get<string[]>(
        //       //   "selectedHtmlReactFiles",
        //       //   []
        //       // );
        //       let previousHtmlReactFiles = context.workspaceState.get<FileIdMap[]>(
        //         "selectedHtmlReactFiles",
        //         []
        //       );

        //       // Replace the old file with the new one
        //       const updatedCssFiles = previousCssFiles.map((file) =>
        //         file === message.oldFile ? newFileUri : file
        //       );

        //       // const updatedHtmlReactFiles = previousHtmlReactFiles.map((file) =>
        //       //   file === message.oldFile ? newFileUri : file
        //       // );
        //       const updatedHtmlReactFiles = previousHtmlReactFiles.map((file) => {
        //         if (file.fileUri === message.oldFile) {
        //           return { ...file, fileUri: newFileUri };
        //         }
        //         return file;
        //       });

        //       // Update workspace state with the edited files list
        //       context.workspaceState.update("selectedCssFiles", updatedCssFiles);
        //       context.workspaceState.update("selectedHtmlReactFiles", updatedHtmlReactFiles);

        //       // Combine updated lists for Webview
        //       const updatedFiles = {
        //         css: updatedCssFiles,
        //         htmlReact: updatedHtmlReactFiles,
        //       };

        //       // Post the updated file list to the Webview
        //       if (currentPanel?.webview) {
        //         currentPanel.webview.postMessage({
        //           command: "updateFileList",
        //           files: updatedFiles,
        //         });
        //       }
        //     }
        //   }
        //   break;
        case "removeFiles":
          vscode.commands.executeCommand("tweakSync.removeFiles", message.file, message.index);
          break;
        case "removeSingleFile":
          vscode.commands.executeCommand("tweakSync.removeSingleFile", message.file, message.index);
          break;
        case "watchFiles":
          vscode.commands.executeCommand("tweakSync.watchFiles");
          break;
        case "watchSingleFile":
          const fileUri = message.file;
          vscode.commands.executeCommand("tweakSync.watchSingleFile", fileUri);
          break;
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
