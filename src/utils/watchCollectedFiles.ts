import * as vscode from "vscode";
export let watchCollectedFiles = (
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) => {
  const collectedFiles: string[] = context.workspaceState.get("selectedFiles", []);

  if (collectedFiles.length === 0) {
    console.log("No files to watch.");
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    console.error("No workspace folder is open.");
    return;
  }

  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceFolder, "**/*")
  );

  // Handle file deletion
  watcher.onDidDelete((uri: vscode.Uri) => {
    const deletedUriString = uri.toString();
    let updatedFiles: string[] = context.workspaceState.get("selectedFiles", []);

    if (updatedFiles.includes(deletedUriString)) {
      updatedFiles = updatedFiles.filter((file) => file !== deletedUriString);
      context.workspaceState.update("selectedFiles", updatedFiles);

      console.log(`File deleted: ${deletedUriString}`);
      currentPanel?.webview.postMessage({ command: "updateFileList", files: updatedFiles });
    }
  });

  // Store the watcher to clean up later
  context.subscriptions.push(watcher);
};
