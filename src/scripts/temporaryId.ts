import * as vscode from "vscode";
import { injectTemporaryIds, removeTemporaryIds } from "../domain/watcher/temporary-id";

export const enum TempororyIdMode {
  inject,
  remove,
}

export async function TemporaryIds(document: vscode.TextDocument, mode: TempororyIdMode) {
  const editor = await vscode.window.showTextDocument(document);
  const text = document.getText();

  let modifiedText = text;

  if (mode === TempororyIdMode.inject) {
    modifiedText = injectTemporaryIds(modifiedText);
  } else if (mode === TempororyIdMode.remove) {
    modifiedText = removeTemporaryIds(modifiedText);
  }

  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
  edit.replace(document.uri, fullRange, modifiedText);
  vscode.workspace.applyEdit(edit);
}

export { injectTemporaryIds, removeTemporaryIds };
