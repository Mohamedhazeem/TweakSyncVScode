import * as vscode from "vscode";

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
function generateRandomId(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 9;
  let randomId = "";
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomId;
}
export function injectTemporaryIds(code: string): string {
  const injectedCode = code.replace(
    /(<[a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9:-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?>|>)/g,
    (match, p1, p2, p3) => {
      if (!p2.includes("data-temporaryid")) {
        return `${p1}${p2}${
          p2.trim() ? " " : ""
        } data-temporaryid="tempid-${generateRandomId()}"${p3}`;
      }
      return match;
    }
  );
  return injectedCode;
}

export function removeTemporaryIds(code: string): string {
  const removedCode = code.replace(/\s*data-temporaryid="[^"]*"/g, "");
  return removedCode;
}
