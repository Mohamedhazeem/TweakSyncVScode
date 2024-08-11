import * as vscode from "vscode";
import { startServer, stopServer } from "./scripts/websocket";
import { injectTemporaryId, removeTemporaryId } from "./disposable/temporaryIdDisposable";

import { webViewPanelOpen } from "./disposable/webViewDisposable";

export function activate(context: vscode.ExtensionContext) {
  let initiateServer = vscode.commands.registerCommand("vscode.startserver", () => {
    startServer();
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
  const sidePanel = webViewPanelOpen(context);
  context.subscriptions.push(initiateServer);
  context.subscriptions.push(injectTemporaryId);
  context.subscriptions.push(removeTemporaryId);
  context.subscriptions.push(sidePanel);
}

export function deactivate() {
  stopServer();
}
