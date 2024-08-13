import * as vscode from "vscode";
import { startServer, stopServer } from "./scripts/websocket";
import {
  injectTemporaryId,
  injectTemporaryIdToFiles,
  removeFile,
  removeTemporaryId,
} from "./disposable/temporaryIdDisposable";
import { webViewPanelOpen } from "./disposable/webViewDisposable";
import { watchCollectedFiles } from "./utils/watchCollectedFiles";
import { getCurrentPanel, setCurrentPanel } from "./utils/webviewPanelPanel";

// let currentPanel: vscode.WebviewPanel | undefined = undefined;
export function activate(context: vscode.ExtensionContext) {
  const setPanel = (panel: vscode.WebviewPanel | undefined) => {
    console.log("Setting panel:", panel ? panel.title : "undefined");
    setCurrentPanel(panel);
    console.log(getCurrentPanel());
  };
  let initiateServer = vscode.commands.registerCommand("tweakSync.startserver", () => {
    startServer(getCurrentPanel());
  });
  // const findcss = vscode.commands.registerCommand("tweakSync.findcss", () => {
  //   findAndReplaceCssSelectors()
  //     .then(() => {
  //       console.log("CSS selectors updated successfully.");
  //     })
  //     .catch((err) => {
  //       console.warn("Failed to find and replace CSS selectors", err);
  //     });
  // });
  watchCollectedFiles(getCurrentPanel(), context);

  const sidePanel = webViewPanelOpen(getCurrentPanel(), setPanel, context);
  const injectTemporaryIdToFilesCommand = injectTemporaryIdToFiles(context);
  const injectTemporaryIdCommand = injectTemporaryId(context);
  const removeTemporaryIdCommand = removeTemporaryId(context);
  const removeFileCommand = removeFile(context);

  context.subscriptions.push(sidePanel);
  context.subscriptions.push(initiateServer);
  context.subscriptions.push(injectTemporaryIdCommand);
  context.subscriptions.push(injectTemporaryIdToFilesCommand);
  context.subscriptions.push(removeTemporaryIdCommand);
  context.subscriptions.push(removeFileCommand);
}

export function deactivate() {
  console.log("Deactivating extension with panel:", getCurrentPanel() ? "exists" : "undefined");
  stopServer(getCurrentPanel());
}
