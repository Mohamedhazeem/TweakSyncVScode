import * as vscode from "vscode";
import { parse, HTMLElement } from "node-html-parser";
export const enum TempororyIdMode {
  inject,
  remove,
}

export async function TemporaryIds(
  document: vscode.TextDocument,
  mode: TempororyIdMode
) {
  const editor = await vscode.window.showTextDocument(document);
  const text = document.getText();
  const root = parse(text);

  let idCounter = 0;

  function traverseAndInject(node: HTMLElement) {
    if (node.nodeType === 1) {
      if (node.hasAttribute("data-temporaryid")) {
        return;
      }
      node.setAttribute("data-temporaryid", `tempid-${idCounter++}`);
    }
    node.childNodes.forEach((child) => {
      if (child instanceof HTMLElement) {
        traverseAndInject(child);
      }
    });
  }
  function traverseAndRemove(node: HTMLElement) {
    if (node.nodeType === 1 && node.hasAttribute("data-temporaryid")) {
      node.removeAttribute("data-temporaryid");
    }
    node.childNodes.forEach((child) => {
      if (child instanceof HTMLElement) {
        traverseAndRemove(child);
      }
    });
  }
  if (mode === TempororyIdMode.inject) {
    traverseAndInject(root);
  } else if (mode === TempororyIdMode.remove) {
    traverseAndRemove(root);
  }

  const modifiedText = root.toString();

  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );
  edit.replace(document.uri, fullRange, modifiedText);
  vscode.workspace.applyEdit(edit);
}

export async function removeTemporaryIds(document: vscode.TextDocument) {
  const editor = await vscode.window.showTextDocument(document);
  const text = document.getText();
  const root = parse(text);

  function traverseAndRemove(node: HTMLElement) {
    if (node.nodeType === 1 && node.hasAttribute("data-temporaryid")) {
      node.removeAttribute("data-temporaryid");
    }
    node.childNodes.forEach((child) => {
      if (child instanceof HTMLElement) {
        traverseAndRemove(child);
      }
    });
  }

  traverseAndRemove(root);

  const modifiedText = root.toString();

  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );
  edit.replace(document.uri, fullRange, modifiedText);
  await vscode.workspace.applyEdit(edit);
  await document.save();
}
