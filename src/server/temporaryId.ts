import * as vscode from "vscode";

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

  let modifiedText = text;

  if (mode === TempororyIdMode.inject) {
    // Inject temporary IDs
    modifiedText = injectTemporaryIds(modifiedText);
  } else if (mode === TempororyIdMode.remove) {
    // Remove temporary IDs
    modifiedText = removeTemporaryIds(modifiedText);
  }

  // Replace the document content with the modified code
  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );
  edit.replace(document.uri, fullRange, modifiedText);
  vscode.workspace.applyEdit(edit);
}
function generateRandomId(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 9; // Change the length as needed
  let randomId = "";
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomId;
}
function injectTemporaryIds(code: string): string {
  // let idCounter = 1;
  const injectedCode = code.replace(
    /(<[a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9:-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?>|>)/g,
    (match, p1, p2, p3) => {
      if (!p2.includes("data-temporaryid")) {
        // Append the temporary ID to the opening tag, after all existing attributes (if any)
        return `${p1}${p2}${
          p2.trim() ? " " : ""
        } data-temporaryid="tempid-${generateRandomId()}"${p3}`;
      }
      return match; // If the tag already contains a temporary ID, return the original match
    }
  );
  return injectedCode;
}

// function injectTemporaryIds(code: string): string {
//   let idCounter = 1;
//   const injectedCode = code.replace(
//     /(<[a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9:-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?>)/g,
//     (match, p1, p2, p3) => {
//       if (!p2.includes("data-temporaryid")) {
//         // Append the temporary ID to the opening tag, after all existing attributes (if any)
//         return `${p1}${p2}${
//           p2.trim() ? " " : " "
//         }data-temporaryid="tempid-${idCounter++}"${p3}`;
//       }
//       return match; // If the tag already contains a temporary ID, return the original match
//     }
//   );
//   return injectedCode;
// }

// function injectTemporaryIds(code: string): string {
//   let idCounter = 1;
//   const injectedCode = code.replace(
//     /(<[a-zA-Z0-9]+)([^>]*)(\/?>)/g,
//     (match, p1, p2, p3) => {
//       if (!p2.includes("data-temporaryid")) {
//         return `${p1}${p2} data-temporaryid="tempid-${idCounter++}"${p3}`;
//       }
//       return match;
//     }
//   );
//   return injectedCode;
// }

function removeTemporaryIds(code: string): string {
  const removedCode = code.replace(/\s*data-temporaryid="[^"]*"/g, "");
  return removedCode;
}

// export async function TemporaryIds(
//   document: vscode.TextDocument,
//   mode: TempororyIdMode
// ) {
//   const editor = await vscode.window.showTextDocument(document);
//   const text = document.getText();
//   const root = parse(text);

//   let idCounter = 0;

//   function traverseAndInject(node: HTMLElement) {
//     if (node.nodeType === 1) {
//       if (node.hasAttribute("data-temporaryid")) {
//         return;
//       }
//       node.setAttribute("data-temporaryid", `tempid-${idCounter++}`);
//     }
//     node.childNodes.forEach((child) => {
//       if (child instanceof HTMLElement) {
//         traverseAndInject(child);
//       }
//     });
//   }
//   function traverseAndRemove(node: HTMLElement) {
//     if (node.nodeType === 1 && node.hasAttribute("data-temporaryid")) {
//       node.removeAttribute("data-temporaryid");
//     }
//     node.childNodes.forEach((child) => {
//       if (child instanceof HTMLElement) {
//         traverseAndRemove(child);
//       }
//     });
//   }
//   if (mode === TempororyIdMode.inject) {
//     traverseAndInject(root);
//   } else if (mode === TempororyIdMode.remove) {
//     traverseAndRemove(root);
//   }

//   const modifiedText = root.toString();

//   const edit = new vscode.WorkspaceEdit();
//   const fullRange = new vscode.Range(
//     document.positionAt(0),
//     document.positionAt(text.length)
//   );
//   edit.replace(document.uri, fullRange, modifiedText);
//   vscode.workspace.applyEdit(edit);
// }
