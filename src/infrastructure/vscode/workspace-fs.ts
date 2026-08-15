import * as vscode from "vscode";
import { WorkspaceFsPort } from "./interfaces";

/**
 * Concrete {@link WorkspaceFsPort} backed by `vscode.workspace`. Isolates all
 * file-system access (read/write/stat/watchers) behind a port so application
 * logic can be tested with an in-memory stub.
 */
export class VscodeWorkspaceFs implements WorkspaceFsPort {
  get workspaceFolders(): readonly vscode.WorkspaceFolder[] | undefined {
    return vscode.workspace.workspaceFolders;
  }

  stat(uri: vscode.Uri): Thenable<vscode.FileStat> {
    return vscode.workspace.fs.stat(uri);
  }

  readFile(uri: vscode.Uri): Thenable<Uint8Array> {
    return vscode.workspace.fs.readFile(uri);
  }

  writeFile(uri: vscode.Uri, content: Uint8Array): Thenable<void> {
    return vscode.workspace.fs.writeFile(uri, content);
  }

  createFileSystemWatcher(pattern: vscode.RelativePattern): vscode.FileSystemWatcher {
    return vscode.workspace.createFileSystemWatcher(pattern);
  }
}
