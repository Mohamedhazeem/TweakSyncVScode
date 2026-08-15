import * as vscode from "vscode";
import { CompositionRoot } from "./infrastructure/container";

let root: CompositionRoot | undefined;

export function activate(context: vscode.ExtensionContext): void {
  root = new CompositionRoot(context);
  root.activate();
  context.subscriptions.push(new vscode.Disposable(() => {
    root = undefined;
  }));
}

export function deactivate(): void {
  root = undefined;
}
