import { WebSocket } from "ws";
import * as vscode from "vscode";
import { HTMLElement, parse } from "node-html-parser";

const ws = new WebSocket.Server({ port: 8000 });
interface ConnectedClient {
  socket: WebSocket;
}
let connectedClients: ConnectedClient[] = [];

export const startServer = () => {
  console.log("WebSocket Function");
  ws.on("connection", function (socket) {
    connectedClients.push({ socket });
    console.log("WebSocket connection established from VS Code extension");
    socket.on("message", async (message) => {
      const parsedMessage = JSON.parse(message.toString());
      console.log(parsedMessage);
      await handleWebSocketMessage(parsedMessage);
    });
    socket.on("close", () => {
      const index = connectedClients.findIndex(
        (client) => client.socket === socket
      );
      if (index !== -1) {
        connectedClients.splice(index, 1);
      }
    });
  });
};
interface ElementDetails {
  action?: string;
  details: {
    tagName?: string;
    id?: string | null;
    className?: string;
    textContent?: string | null;
    attributes?: { [key: string]: string };
    temporaryId?: string | null;
    path?: string;
  };
}
interface InlineStyles {
  [key: string]: string;
}

interface ExternalStyles {
  classes: { [key: string]: { [key: string]: string } };
  ids: { [key: string]: { [key: string]: string } };
  tags: { [key: string]: { [key: string]: string } };
  attribute: { [key: string]: { [key: string]: string } };
  descendant: { [key: string]: { [key: string]: string } };
  pseudoElementStyles: { [key: string]: { [key: string]: string } };
  pseudoClassStyles: { [key: string]: { [key: string]: string } };
  atRules: {
    [key: string]: {
      [key: string]: {
        [key: string]: string;
      };
    };
  };
}

export interface ElementStyles {
  action?: string;
  styles: {
    inline: InlineStyles;
    external: ExternalStyles;
    temporaryId?: string | null;
  };
}
type WebSocketMessage = ElementDetails | ElementStyles;
function isElementStyles(message: WebSocketMessage): message is ElementStyles {
  return (message as ElementStyles).action === "applyStylesToVscode";
}

function isElementDetails(
  message: WebSocketMessage
): message is ElementDetails {
  return (message as ElementDetails).action === "applyElementToVscode";
}
async function handleWebSocketMessage(message: ElementDetails | ElementStyles) {
  if (isElementDetails(message)) {
    const { temporaryId, tagName, textContent, attributes } = message.details;
    if (attributes && attributes["data-temporaryid"]) {
      delete attributes["data-temporaryid"];
    }
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      console.log("No workspace folders found.");
      return null;
    }
    const componentFile = await findComponentFileWithId(temporaryId!);
    if (componentFile) {
      // Read the file content
      const document = await vscode.workspace.openTextDocument(componentFile);
      const editor = await vscode.window.showTextDocument(document);

      // Locate the line and column of the unique ID
      // const position = findPositionInDocument(document, temporaryId!);
      const range = findElementRangeInDocument(document, temporaryId!);
      console.log("range:", range);

      if (range) {
        console.log("range found:", range);

        const elementContent = document.getText(range); //extractElementContent(document, range);
        console.log(`elementcontent: ${elementContent}`);
        const root = parse(elementContent);
        console.log(`root: ${root}`);
        const element = root.querySelector(
          `[data-temporaryid="${temporaryId}"]`
        ) as HTMLElement | null;
        console.log(`current element text: ${element}`);

        console.log(`current element text: ${getCurrentElementText(element)}`);
        if (element) {
          const currentText = getCurrentElementText(element);

          // Update the text content
          const updatedTextContent = textContent;

          // Construct the new HTML content with updated text content
          const newText = `<${tagName} data-temporaryid="${temporaryId}" ${Object.entries(
            attributes ? attributes : []
          )
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ")}>${updatedTextContent}${element.innerHTML.replace(
            currentText,
            ""
          )}</${tagName}>`;

          console.log("New text to replace with:", newText);

          const edit = new vscode.WorkspaceEdit();
          edit.replace(document.uri, range, newText);
          await vscode.workspace.applyEdit(edit);
        } else {
          console.log("Element with data-temporaryid not found.");
        }
        // const newText = `<${tagName} data-temporaryid="${temporaryId}" ${Object.entries(
        //   attributes ? attributes : []
        // )
        //   .map(([key, value]) => `${key}="${value}"`)
        //   .join(" ")}>${textContent} ${elementContent}</${tagName}>`;
        // console.log("New text to replace with:", newText);

        // const edit = new vscode.WorkspaceEdit();
        // edit.replace(document.uri, range, newText);
        // await vscode.workspace.applyEdit(edit);
      }
    } else {
      console.log("Raange not found.");
    }
  } else if (isElementStyles(message)) {
    const { temporaryId, inline, external } = message.styles;

    const files = await vscode.workspace.findFiles("**/*.{css}");

    for (const file of files) {
      console.log(`Processing file: ${file.toString()}`);
      const content = await vscode.workspace.fs.readFile(file);
      let contentString = content.toString();

      // Check if inline styles are defined and process them
      if (inline && typeof inline === "object") {
        Object.entries(inline).forEach(([key, value]) => {
          // handle inline styles logic here if applicable
        });
      }

      // Check if external styles are defined and process them
      if (external && typeof external === "object") {
        Object.entries(external).forEach(([styleType, styleContent]) => {
          if (styleContent && typeof styleContent === "object") {
            Object.entries(styleContent).forEach(([selector, rules]) => {
              if (
                rules &&
                typeof rules === "object" &&
                Object.keys(rules).length > 0
              ) {
                // Check if the selector exists in the content
                if (contentString.includes(selector)) {
                  console.log(
                    `Found selector ${selector} in file ${file.toString()}`
                  );
                  console.log(
                    `Existing rules: ${contentString.match(
                      new RegExp(selector + "\\s*{[^}]*}")
                    )}`
                  );
                  console.log(`New rules: ${JSON.stringify(rules)}`);

                  // Construct the new CSS rule
                  let newRule = `${selector} {`;
                  Object.entries(rules).forEach(([prop, val]) => {
                    // Format the value according to its type
                    const formattedValue =
                      typeof val === "object"
                        ? Object.entries(val)
                            .map(([innerProp, innerVal]) => {
                              return `${innerProp}: ${innerVal}`;
                            })
                            .join(", ")
                        : `${prop}: ${val}`;
                    newRule += `\n  ${formattedValue};`;
                  });
                  newRule += `\n}`;

                  // Improved regex to match the selector and its block
                  const regex = new RegExp(
                    `${selector.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      "\\$&"
                    )}\\s*{[^}]*}`,
                    "g"
                  );
                  const matches = contentString.match(regex);
                  if (matches) {
                    console.log(`Old rule: ${matches[0]}`);
                  } else {
                    console.log(`No match found for ${selector}`);
                  }
                  console.log(`New rule: ${newRule}`);

                  // Replace the old CSS rule with the new rule
                  contentString = contentString.replace(regex, newRule);
                } else {
                  console.log(
                    `Selector ${selector} not found in file ${file.toString()}`
                  );
                  /// This below code used to add new rules if not found
                  // let newRule = `${selector} {`;
                  // Object.entries(rules).forEach(([prop, val]) => {
                  //   // Format the value according to its type
                  //   const formattedValue =
                  //     typeof val === "object"
                  //       ? Object.entries(val)
                  //           .map(([innerProp, innerVal]) => {
                  //             return `${innerProp}: ${innerVal}`;
                  //           })
                  //           .join(", ")
                  //       : `${prop}: ${val}`;
                  //   newRule += `\n  ${formattedValue};`;
                  // });
                  // newRule += `\n}`;
                  // contentString += `\n${newRule}`;
                }
              }
            });
          } else {
            console.log(`Style type: ${styleType}`);
            console.log(`Style content: ${styleContent}`);
          }
        });
      }

      // Write the updated content back to the file
      const updatedContent = Buffer.from(contentString, "utf-8");
      await vscode.workspace.fs.writeFile(file, updatedContent);
    }

    console.log("CSS files updated successfully.");
  } else {
    console.log("Invalid WebSocket message action.");
  }
}
function getCurrentElementText(element: HTMLElement | null): string {
  let currentText = "";
  if (element === null) {
    return "";
  }
  // Iterate through the child nodes of the element
  element.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      currentText += node.textContent?.trim() ?? "";
    }
  });
  console.log(`current text - ${currentText}`);
  return currentText;
}
// function extractElementContent(document: vscode.TextDocument, range: vscode.Range): string {
//   const text = document.getText(range);

//   // Find the index of the opening and closing tags
//   const startIndex = text.indexOf('>');
//   const endIndex = text.lastIndexOf('<');

//   // Extract the content between the tags
//   const content = text.substring(startIndex + 1, endIndex).trim();

//   return content;
// }

function findElementRangeInDocument(
  document: vscode.TextDocument,
  id: string
): vscode.Range | null {
  const text = document.getText();
  const startTagRegex = new RegExp(
    `<([^\\s>]+)[^>]*\\s+data-temporaryid=["']${id}["'][^>]*>`,
    "i"
  );

  const startTagMatch = text.match(startTagRegex);
  if (!startTagMatch) {
    console.log("Start tag not found");
    return null;
  }

  const startIndex = startTagMatch.index!;
  const startPosition = document.positionAt(startIndex);
  console.log("Start tag found at index:", startIndex, startPosition);

  // Determine if the start tag is self-closing
  const selfClosingTagRegex = /\/\s*>$/;
  const isSelfClosing = selfClosingTagRegex.test(startTagMatch[0]);

  if (isSelfClosing) {
    // For self-closing tags, the end position is the end of the start tag
    const endPosition = document.positionAt(
      startIndex + startTagMatch[0].length
    );
    return new vscode.Range(startPosition, endPosition);
  } else {
    // For tags with end tags, handle nested tags
    const tagName = startTagMatch[1]; // Extract tag name
    const endTagRegex = new RegExp(`</${tagName}>`, "ig");
    const openTagRegex = new RegExp(`<${tagName}[^>]*>`, "ig");

    let nestedCount = 1;
    let match;
    let searchIndex = startIndex + startTagMatch[0].length;
    console.log("Starting search for end tag from index:", searchIndex);

    while ((match = endTagRegex.exec(text.substring(searchIndex)))) {
      const matchIndex = searchIndex + match.index;
      console.log("End tag match found at index:", matchIndex);

      const textUntilMatch = text.substring(searchIndex, matchIndex);
      const openTags = textUntilMatch.match(openTagRegex) || [];
      const closeTags = textUntilMatch.match(endTagRegex) || [];

      nestedCount += openTags.length - closeTags.length - 1;
      console.log(
        "Open tags found between indexes:",
        searchIndex,
        matchIndex,
        openTags.length
      );
      console.log("Nested count:", nestedCount);

      if (nestedCount <= 0) {
        const endIndex = matchIndex + match[0].length;
        const endPosition = document.positionAt(endIndex);
        console.log("End tag found at index:", endIndex, endPosition);
        return new vscode.Range(startPosition, endPosition);
      }

      searchIndex = matchIndex + match[0].length;
    }

    console.log("End tag not found");
    return null;
  }
}

async function findComponentFileWithId(id: string): Promise<vscode.Uri | null> {
  const files = await vscode.workspace.findFiles(
    "**/*.{js,jsx,ts,tsx}",
    "**/node_modules/**"
  );
  for (const file of files) {
    const content = await vscode.workspace.fs.readFile(file);
    const contentString = content.toString();
    if (
      contentString.includes(`data-temporaryid="${id}"`) ||
      contentString.includes(`data-temporaryid='${id}'`)
    ) {
      return file;
    }
  }
  return null;
}
function findPositionInDocument(
  document: vscode.TextDocument,
  id: string
): { line: number; startColumn: number; endColumn: number } | null {
  const text = document.getText();
  const regex = new RegExp(`data-temporaryid=["']${id}["']`);
  const match = text.match(regex);

  if (match) {
    const startIndex = match.index;
    const linesBeforeMatch = text.substring(0, startIndex).split("\n");
    const line = linesBeforeMatch.length - 1; // Zero-based indexing
    const startColumn =
      startIndex! - linesBeforeMatch.slice(0, -1).join("\n").length - 1; // Adjust for zero-based indexing
    const endColumn = startColumn + match[0].length;
    return { line, startColumn, endColumn };
  }

  return null;
}

export const sendMessageToChrome = () => {
  if (!connectedClients.length) {
    console.log("No clients connected to the WebSocket server");
    return;
  }

  for (const client of connectedClients) {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send("message from vscode "); // Send message to open connections
    } else {
      console.warn("Client not in open state, skipping message:");
    }
  }
};

export const stopServer = () => {
  ws.close();
};

async function updateInlineStyles(styles: InlineStyles, temporaryId: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const tempidRegex = new RegExp(`data-temporaryid="${temporaryId}"`);
  const text = document.getText();
  const match = tempidRegex.exec(text);

  if (!match) {
    vscode.window.showErrorMessage(
      `Element with temporary ID ${temporaryId} not found.`
    );
    return;
  }

  const lineIndex = document.positionAt(match.index).line;
  const line = document.lineAt(lineIndex);

  const startPosition = new vscode.Position(lineIndex, 0);
  const endPosition = new vscode.Position(lineIndex, line.text.length);
  const range = new vscode.Range(startPosition, endPosition);

  const updatedText = line.text.replace(/style="([^"]*)"/, (match, p1) => {
    const existingStyles = p1.split(";").map((style: string) => style.trim());
    const newStyles = Object.entries(styles).map(
      ([prop, value]) => `${prop}: ${value}`
    );
    const mergedStyles = [...existingStyles, ...newStyles].join("; ");
    return `style="${mergedStyles}"`;
  });

  await editor.edit((editBuilder) => {
    editBuilder.replace(range, updatedText);
  });
}
