import type * as vscode from "vscode";

/**
 * Ports (abstractions) over the VS Code API. The domain and application layers
 * depend on these interfaces instead of the concrete `vscode` module, which
 * keeps them testable and portable (Dependency Inversion principle). The real
 * implementations live in `infrastructure/vscode/*`.
 *
 * Type-only `vscode` imports are erased at compile time, so depending on these
 * interfaces introduces no runtime coupling to the editor.
 */
export interface WorkspaceStatePort {
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: unknown): Thenable<void>;
}

export interface WorkspaceFsPort {
  readonly workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined;
  stat(uri: vscode.Uri): Thenable<vscode.FileStat>;
  readFile(uri: vscode.Uri): Thenable<Uint8Array>;
  writeFile(uri: vscode.Uri, content: Uint8Array): Thenable<void>;
  createFileSystemWatcher(pattern: vscode.RelativePattern): vscode.FileSystemWatcher;
}

export interface WindowPort {
  readonly activeTextEditor: vscode.TextEditor | undefined;
  showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined>;
  showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined>;
  createWebviewPanel(
    viewType: string,
    title: string,
    showOptions: vscode.ViewColumn,
    options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ): vscode.WebviewPanel;
  onDidChangeActiveTextEditor(
    listener: (editor: vscode.TextEditor | undefined) => void
  ): vscode.Disposable;
  createStatusBarItem(
    alignment: vscode.StatusBarAlignment,
    priority?: number
  ): vscode.StatusBarItem;
  showTextDocument(
    document: vscode.TextDocument,
    column?: vscode.ViewColumn
  ): Thenable<vscode.TextEditor>;
}

export interface CommandsPort {
  registerCommand(
    command: string,
    callback: (...args: unknown[]) => unknown
  ): vscode.Disposable;
  executeCommand(command: string, ...args: unknown[]): Thenable<unknown>;
}
