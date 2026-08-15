import * as vscode from "vscode";
import { WorkspaceStatePort } from "../interfaces";
import { WebviewMessageBus } from "../../webview/message-bus";
import { FileIdMap } from "../../../types/ElementTypes";

export interface FileWatcherDeps {
  workspaceState: WorkspaceStatePort;
  bus: WebviewMessageBus;
  context: vscode.ExtensionContext;
}

/**
 * Sets up a file-system watcher for the currently collected files and keeps the
 * workspace state + webview in sync when a file is deleted. Returns a
 * `vscode.Disposable` so the composition root manages its lifecycle as one unit.
 */
export function createFileWatcherDisposable(deps: FileWatcherDeps): vscode.Disposable {
  const cssFiles: string[] = deps.workspaceState.get("selectedCssFiles", []);
  const htmlReactFiles: FileIdMap[] = deps.workspaceState.get("selectedHtmlReactFiles", []);

  const allCollectedFiles = [...cssFiles, ...htmlReactFiles.map((file) => file.fileUri)];

  if (allCollectedFiles.length === 0) {
    console.log("No files to watch.");
    return new vscode.Disposable(() => {});
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    console.error("No workspace folder is open.");
    return new vscode.Disposable(() => {});
  }

  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceFolder, "**/*")
  );

  watcher.onDidDelete((uri: vscode.Uri) => {
    const deletedUriString = uri.toString();

    let updatedCssFiles = cssFiles.filter((file) => file !== deletedUriString);
    if (updatedCssFiles.length !== cssFiles.length) {
      deps.workspaceState.update("selectedCssFiles", updatedCssFiles);
      cssFiles.splice(0, cssFiles.length, ...updatedCssFiles);
      console.log(`CSS file deleted: ${deletedUriString}`);
      deps.bus.postMessage({ command: "updateFileList", files: { css: updatedCssFiles } });
    }

    let updatedHtmlReactFiles = htmlReactFiles.filter((file) => file.fileUri !== deletedUriString);
    if (updatedHtmlReactFiles.length !== htmlReactFiles.length) {
      deps.workspaceState.update("selectedHtmlReactFiles", updatedHtmlReactFiles);
      htmlReactFiles.splice(0, htmlReactFiles.length, ...updatedHtmlReactFiles);
      console.log(`HTML/React file deleted: ${deletedUriString}`);
      deps.bus.postMessage({ command: "updateFileList", files: { htmlReact: updatedHtmlReactFiles } });
    }
  });

  return new vscode.Disposable(() => watcher.dispose());
}
