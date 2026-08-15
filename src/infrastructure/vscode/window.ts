import * as vscode from "vscode";
import { WindowPort } from "./interfaces";

/**
 * Concrete {@link WindowPort} backed by `vscode.window`. Centralizes the
 * editor window interactions (messages, panels, status bar) behind a port so
 * application code can be tested without the real window.
 */
export class VscodeWindow implements WindowPort {
  get activeTextEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
  }

  showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    return vscode.window.showInformationMessage(message, ...items);
  }

  showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    return vscode.window.showErrorMessage(message, ...items);
  }

  createWebviewPanel(
    viewType: string,
    title: string,
    showOptions: vscode.ViewColumn,
    options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ): vscode.WebviewPanel {
    return vscode.window.createWebviewPanel(viewType, title, showOptions, options);
  }

  onDidChangeActiveTextEditor(
    listener: (editor: vscode.TextEditor | undefined) => void
  ): vscode.Disposable {
    return vscode.window.onDidChangeActiveTextEditor(listener);
  }

  createStatusBarItem(
    alignment: vscode.StatusBarAlignment,
    priority?: number
  ): vscode.StatusBarItem {
    return vscode.window.createStatusBarItem(alignment, priority);
  }

  showTextDocument(
    document: vscode.TextDocument,
    column?: vscode.ViewColumn
  ): Thenable<vscode.TextEditor> {
    return vscode.window.showTextDocument(document, column);
  }
}
