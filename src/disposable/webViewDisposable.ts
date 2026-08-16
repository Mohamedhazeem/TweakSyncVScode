import * as vscode from "vscode";
import * as path from "path";
import { getWebviewContent } from "../infrastructure/webview/content";
import { WebSocketServerPort } from "../infrastructure/websocket/types";
import { WebviewMessageBus } from "../infrastructure/webview/message-bus";
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

/**
 * Registers the `tweakSync.showPanel` command, manages the webview panel
 * lifecycle, and routes inbound webview messages to extension commands. Depends
 * on the {@link WebSocketServerPort} (start/stop + running state) and the
 * {@link WebviewMessageBus} for outbound notifications, replacing the legacy
 * `scripts/webView.ts` + `scripts/websocket.ts` reach into the `ws` singleton.
 */
export function webViewPanelOpen(
  setPanel: (panel: vscode.WebviewPanel | undefined) => void,
  context: vscode.ExtensionContext,
  server: WebSocketServerPort,
  bus: WebviewMessageBus
) {
  return vscode.commands.registerCommand("tweakSync.showPanel", () => {
    console.log("Command 'tweakSync.showPanel' invoked");
    const existingPanel = getCurrentPanel();
    console.log(existingPanel);

    if (existingPanel) {
      console.log("Panel already exists, revealing it.");
      existingPanel.reveal(vscode.ViewColumn.One);
      return;
    }

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

    panel.iconPath = {
      dark: vscode.Uri.file(
        path.join(context.extensionPath, "out", "webview", "resources", "icon16.png")
      ),
      light: vscode.Uri.file(
        path.join(context.extensionPath, "out", "webview", "resources", "icon16.png")
      ),
    };
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
    OnReceiveMessage(panel, context, server, bus);
  });
}

function OnReceiveMessage(
  currentPanel: vscode.WebviewPanel,
  context: vscode.ExtensionContext,
  server: WebSocketServerPort,
  bus: WebviewMessageBus
) {
  currentPanel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "startTweakSync":
          if (message.value) {
            vscode.window.showInformationMessage(message.value);
            server.start();
          } else {
            vscode.window.showInformationMessage(message.value);
            server.stop();
          }
          return;
        case "requestServerStatus":
          bus.postMessage({ command: "serverStarted", value: server.isRunning });
          bus.postMessage({ command: "serverConnected", value: server.isConnected });
          break;
        case "selectFiles": {
          const uris = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: "Select Files",
            canSelectFiles: true,
            canSelectFolders: false,
            filters: { files: ["tsx", "jsx", "html"] },
            title: "Select HTML Files for TweakSync",
          });

          if (uris) {
            const htmlReactUris = htmlFile(uris, allowedHtmlExtensions);

            let previousCssFiles = context.workspaceState.get<string[]>("selectedCssFiles", []);
            let previousHtmlReactFiles = context.workspaceState.get<FileIdMap[]>(
              "selectedHtmlReactFiles",
              []
            );

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

            previousHtmlReactFiles = Array.from(fileIdMapDict.values());

            context.workspaceState.update("selectedCssFiles", previousCssFiles);
            context.workspaceState.update("selectedHtmlReactFiles", previousHtmlReactFiles);

            const updatedFiles = {
              css: previousCssFiles,
              htmlReact: previousHtmlReactFiles,
            };
            bus.postMessage({
              command: "updateFileList",
              files: updatedFiles,
            });
          }
          break;
        }
        case "selectCssFile": {
          const cssUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: "Select File",
            canSelectFiles: true,
            canSelectFolders: false,
            filters: { files: ["css"] },
            title: "Select CSS File for TweakSync",
          });

          if (cssUri) {
            const cssUris = cssFile(cssUri, allowedCssExtensions);

            const cssFileUris = cssUris.map((uri) => uri.toString());

            const lastCssFileUri =
              cssFileUris.length > 0 ? cssFileUris[cssFileUris.length - 1] : undefined;
            let previousHtmlReactFiles = context.workspaceState.get<FileIdMap[]>(
              "selectedHtmlReactFiles",
              []
            );

            context.workspaceState.update(
              "selectedCssFiles",
              lastCssFileUri ? [lastCssFileUri] : []
            );
            context.workspaceState.update("selectedHtmlReactFiles", previousHtmlReactFiles);

            const updatedFiles = {
              css: lastCssFileUri ? [lastCssFileUri] : [],
              htmlReact: previousHtmlReactFiles,
            };
            bus.postMessage({
              command: "updateFileList",
              files: updatedFiles,
            });
          }
          break;
        }
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
          vscode.commands.executeCommand("tweakSync.watchSingleFile", message.file);
          break;
        case "getStoredFiles": {
          const updatedFiles = await validateStoredFiles(context);
          bus.postMessage({ command: "updateFileList", files: updatedFiles });
          break;
        }
      }
    },
    undefined,
    context.subscriptions
  );
}
