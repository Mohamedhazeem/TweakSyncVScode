import { TWEAKSYNC_ID } from "../utils/constant";
import * as vscode from "vscode";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { JSXAttribute, jsxIdentifier, stringLiteral } from "@babel/types";

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
const nonHtmlPatterns = [
  /^\s*const\s+\[\s*\w+(?:,\s*\w+)*\s*\]\s*=\s*use\w+\s*(?:<.*>)?\s*\(.*\);/, // React hooks
  /^\s*<>\s*$|^\s*<\/>\s*$/, //generic fragment
  /^\s*type\s+\w+\s*=\s*\{.*\}/, // TypeScript type declarations
  /^\s*interface\s+\w+\s*=\s*\{.*\}/, // TypeScript interface declarations
  /^(const\s+\w+\s*:\s*React\.FC<[^>]*>)|^(function\s+\w+\s*\(.*\)\s*{)/m, // React component declarations
  /^\s*enum\s+\w+\s*=\s*\{.*\}/, // TypeScript enum declarations
  /^\s*class\s+\w+\s+extends\s+\w+\s*{/, // TypeScript class declarations
  /^\s*(public|private|protected)?\s*\w+\s*:\s*\w+;|^\s*(public|private|protected)?\s*\w+\s*\(\s*\)\s*{/, // TypeScript class properties and methods
  /^\s*function\s+\w+\s*\(.*\)\s*{/, // TypeScript function declarations
  /^\s*\(\s*\w*\s*\)\s*=>\s*\{/, // Arrow functions
  /^\s*import\s+.*\s+from\s+['"].*['"]/, // TypeScript import statements
];

// Check if a line is HTML or not
function isHtmlLine(line: string): boolean {
  return !nonHtmlPatterns.some((pattern) => pattern.test(line));
}
// export function injectTemporaryIds(code: string): string {
//   const lines = code.split("\n");
//   // const elementPattern =
//   //   /(<[a-zA-Z0-9]+)((?:\s+[a-zA-Z0-9:-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?>|>)/g;
//   const elementPattern = /(<[a-zA-Z][a-zA-Z0-9-]*)(\s+[^>]*?)(\/?>|>)/g;

//   // Process each line
//   const processedLines = lines.map((line) => {
//     if (isHtmlLine(line)) {
//       return line.replace(elementPattern, (match, p1, p2, p3) => {
//         if (!p2.includes(TWEAKSYNC_ID)) {
//           const attributes = p2.trim();
//           return `${p1} ${attributes} ${TWEAKSYNC_ID}="${generateRandomId()}"${p3}`.replace(
//             /\s+/g,
//             " "
//           );
//         }
//         return match;
//       });
//     } else {
//       // Return non-HTML lines unchanged
//       return line;
//     }
//   });

//   console.timeEnd("TemporaryIdStart");
//   return processedLines.join("\n");
// }
export function injectTemporaryIds(code: string): string {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    JSXOpeningElement(path) {
      const attributes = path.get("attributes");

      // Check if the TWEAKSYNC_ID already exists
      const hasTweakSyncId = attributes.some((attrPath) => {
        const attr = attrPath.node; // Get the node from the path
        return attr.type === "JSXAttribute" && attr.name.name === TWEAKSYNC_ID;
      });

      if (!hasTweakSyncId) {
        // Generate a new ID and add it to the attributes
        const newId = generateRandomId();
        const newAttribute: JSXAttribute = {
          type: "JSXAttribute",
          name: jsxIdentifier(TWEAKSYNC_ID),
          value: stringLiteral(newId),
        };

        path.pushContainer("attributes", newAttribute);
      }
    },
  });

  const { code: transformedCode } = generate(ast);
  return transformedCode;
}

export function removeTemporaryIds(code: string): string {
  const regex = new RegExp(`\\s*${TWEAKSYNC_ID}="[^"]*"`, "g");
  const removedCode = code.replace(regex, "");
  return removedCode;
}
