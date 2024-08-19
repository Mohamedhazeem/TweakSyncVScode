import { FileIdMap } from "@/types/ElementTypes";
import * as vscode from "vscode";

export let watchCollectedFiles = (
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) => {
  // Retrieve collected CSS and HTML/React files
  const cssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);
  const htmlReactFiles: FileIdMap[] = context.workspaceState.get("selectedHtmlReactFiles", []);

  // Combine both file arrays for a comprehensive watcher setup
  const allCollectedFiles = [...cssFiles, ...htmlReactFiles];

  if (allCollectedFiles.length === 0) {
    console.log("No files to watch.");
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    console.error("No workspace folder is open.");
    return;
  }

  // Create a file system watcher for the workspace folder
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceFolder, "**/*")
  );

  // Handle file deletion
  watcher.onDidDelete((uri: vscode.Uri) => {
    const deletedUriString = uri.toString();

    // Update CSS files state if necessary
    let updatedCssFiles = cssFiles.filter((file) => file !== deletedUriString);
    if (updatedCssFiles.length !== cssFiles.length) {
      context.workspaceState.update("selectedCssFiles", updatedCssFiles);
      cssFiles.splice(0, cssFiles.length, ...updatedCssFiles); // Update local reference
      console.log(`CSS file deleted: ${deletedUriString}`);
      currentPanel?.webview.postMessage({ command: "updateFileList", files: updatedCssFiles });
    }

    // Update HTML/React files state if necessary
    let updatedHtmlReactFiles = htmlReactFiles.filter((file) => file.fileUri !== deletedUriString);
    if (updatedHtmlReactFiles.length !== htmlReactFiles.length) {
      context.workspaceState.update("selectedHtmlReactFiles", updatedHtmlReactFiles);
      htmlReactFiles.splice(0, htmlReactFiles.length, ...updatedHtmlReactFiles); // Update local reference
      console.log(`HTML/React file deleted: ${deletedUriString}`);
      currentPanel?.webview.postMessage({
        command: "updateFileList",
        files: updatedHtmlReactFiles,
      });
    }
  });

  // Store the watcher to clean up later
  context.subscriptions.push(watcher);
};
