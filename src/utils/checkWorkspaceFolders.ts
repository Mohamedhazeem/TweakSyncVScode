import * as vscode from "vscode";

export function checkWorkspaceFolders() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.log("No workspace folders found.");
    return null;
  }
}
