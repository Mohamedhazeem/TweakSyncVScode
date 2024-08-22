import { TWEAKSYNC_ID } from "../utils/constant";
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
// export function injectTemporaryIds(code: string): string {
//   const injectedCode = code.replace(
//     /(<[a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9:-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?>|>)/g,
//     (match, p1, p2, p3) => {
//       if (!p2.includes(TWEAKSYNC_ID)) {
//         return `${p1}${p2}${
//           p2.trim() ? " " : ""
//         } TWEAKSYNC_ID="tempid-${generateRandomId()}"${p3}`;
//       }
//       return match;
//     }
//   );
//   return injectedCode;
// }
export function injectTemporaryIds(code: string): string {
  // Split the code into lines for easier processing
  console.time("TemporaryIdStart");
  const lines = code.split("\n");

  // Regex patterns
  const hooksPattern = /^\s*const\s+\[\s*\w+(?:,\s*\w+)*\s*\]\s*=\s*use\w+\s*(?:<.*>)?\s*\(.*\);/; // Matches React hooks, including those with generics
  const genericJsxFragmentPattern = /^\s*<>\s*$|^\s*<\/>\s*$/; // Matches generic JSX fragments

  // Process each line
  const processedLines = lines.map((line) => {
    // Skip lines that contain React hooks or generic JSX fragments
    if (hooksPattern.test(line) || genericJsxFragmentPattern.test(line)) {
      return line; // Return the line unchanged
    }

    // Inject IDs into HTML elements
    return line.replace(
      /(<[a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9:-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?>|>)/g,
      (match, p1, p2, p3) => {
        if (!p2.includes(TWEAKSYNC_ID)) {
          // Ensure there's always a space before adding the data-tweaksync-id attribute
          return `${p1}${p2.trim() ? ` ${p2}` : ""} ${TWEAKSYNC_ID}="${generateRandomId()}"${p3}`;
        }
        return match;
      }
    );
  });
  console.timeEnd("TemporaryIdStart");
  // Join the processed lines back into a single string
  return processedLines.join("\n");
}

export function removeTemporaryIds(code: string): string {
  const regex = new RegExp(`\\s*${TWEAKSYNC_ID}="[^"]*"`, "g");
  const removedCode = code.replace(regex, "");
  return removedCode;
}
