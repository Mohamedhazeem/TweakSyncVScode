import * as vscode from "vscode";
import { startServer, stopServer } from "./scripts/websocket";
import {
  injectTemporaryId,
  watchFiles,
  watchSingleFile,
  removeSingleFile,
  removeTemporaryId,
  removeFiles,
} from "./disposable/temporaryIdDisposable";
import { webViewPanelOpen } from "./disposable/webViewDisposable";
import { watchCollectedFiles } from "./utils/watchCollectedFiles";
import { getCurrentPanel, setCurrentPanel } from "./utils/webviewPanel";
import { registerStatusBarCommands } from "./scripts/statusBar";

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
  // const treeDataProvider = new TweakSyncTreeDataProvider();
  // vscode.window.createTreeView("tweakSync_Sidebar", {
  //   treeDataProvider,
  // });

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

  const sidePanel = webViewPanelOpen(setPanel, context);
  const watchFilesCommand = watchFiles(context);
  const watchSingleFileCommand = watchSingleFile(context);
  const injectTemporaryIdCommand = injectTemporaryId(context);
  const removeTemporaryIdCommand = removeTemporaryId(context);
  const removeSingleFileCommand = removeSingleFile(context);
  const removeFilesCommand = removeFiles(context);

  context.subscriptions.push(sidePanel);
  context.subscriptions.push(initiateServer);
  context.subscriptions.push(injectTemporaryIdCommand);
  context.subscriptions.push(watchFilesCommand);
  context.subscriptions.push(watchSingleFileCommand);
  context.subscriptions.push(removeTemporaryIdCommand);
  context.subscriptions.push(removeSingleFileCommand);
  context.subscriptions.push(removeFilesCommand);
  // activityPanelIntercative(context);
  registerStatusBarCommands(context);
}

export function deactivate() {
  console.log("Deactivating extension with panel:", getCurrentPanel() ? "exists" : "undefined");
  stopServer(getCurrentPanel());
}
