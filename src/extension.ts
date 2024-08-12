import * as vscode from "vscode";
import { startServer, stopServer } from "./scripts/websocket";
import {
  injectTemporaryId,
  injectTemporaryIdToFiles,
  removeFile,
  removeTemporaryId,
} from "./disposable/temporaryIdDisposable";
import { webViewPanelOpen } from "./disposable/webViewDisposable";

export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  let initiateServer = vscode.commands.registerCommand("tweakSync.startserver", () => {
    startServer(currentPanel);
  });
  // const findcss = vscode.commands.registerCommand("vscode.findcss", () => {
  //   findAndReplaceCssSelectors()
  //     .then(() => {
  //       console.log("CSS selectors updated successfully.");
  //     })
  //     .catch((err) => {
  //       console.warn("Failed to find and replace CSS selectors", err);
  //     });
  // });

  const sidePanel = webViewPanelOpen(currentPanel, context);
  const injectTemporaryIdToFilesCommand = injectTemporaryIdToFiles(context);
  const injectTemporaryIdCommand = injectTemporaryId(currentPanel, context);
  const removeTemporaryIdCommand = removeTemporaryId(currentPanel, context);
  const removeFileCommand = removeFile(currentPanel, context);

  context.subscriptions.push(initiateServer);
  context.subscriptions.push(injectTemporaryIdCommand);
  context.subscriptions.push(injectTemporaryIdToFilesCommand);
  context.subscriptions.push(removeTemporaryIdCommand);
  context.subscriptions.push(removeFileCommand);
  context.subscriptions.push(sidePanel);
}

export function deactivate() {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  stopServer(currentPanel);
}
