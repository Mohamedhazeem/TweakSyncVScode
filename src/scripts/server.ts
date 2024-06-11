import * as vscode from "vscode";
import { HTMLElement, parse } from "node-html-parser";
import { ElementDetails, ElementStyles } from "../types/ElementTypes";
import { isElementDetails, isElementStyles } from "../utils/elementHelper";
import { findElementRangeInDocument } from "../utils/findElementRange";
import { findComponentFileWithId } from "../utils/findComponentFileWithId";
import { checkWorkspaceFolders } from "../utils/checkWorkspaceFolders";
import { getCurrentElementText } from "../utils/getCurrentElementText";
import path from "path";

export async function handleWebSocketMessage(
  message: ElementDetails | ElementStyles
) {
  if (isElementDetails(message)) {
    const { temporaryId, tagName, textContent, attributes } = message.details;
    if (attributes && attributes["data-temporaryid"]) {
      delete attributes["data-temporaryid"];
    }
    checkWorkspaceFolders();
    const componentFile = await findComponentFileWithId(temporaryId!);
    if (componentFile) {
      const fileExtension = path.extname(componentFile.fsPath).toLowerCase();
      // Read the file content
      const document = await vscode.workspace.openTextDocument(componentFile);
      const editor = await vscode.window.showTextDocument(document);

      const range = findElementRangeInDocument(document, temporaryId!);
      console.log("range:", range);

      if (range) {
        console.log("range found:", range);

        const elementContent = document.getText(range);
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
          let newText = "";
          // Construct the new HTML content with updated text content
          if ([".html"].includes(fileExtension)) {
            newText = `<${tagName} data-temporaryid="${temporaryId}" ${Object.entries(
              attributes ? attributes : []
            )
              .map(([key, value]) => `${key}="${value}"`)
              .join(" ")}>${updatedTextContent}${element.innerHTML.replace(
              currentText,
              ""
            )}</${tagName}>`;
          } else if ([".tsx", ".jsx"].includes(fileExtension)) {
            newText = `<${tagName} data-temporaryid="${temporaryId}" ${Object.entries(
              attributes ? attributes : []
            )
              .map(
                ([key, value]) =>
                  `${key === "class" ? "className" : key}="${value}"`
              )
              .join(" ")}>${updatedTextContent}${element.innerHTML.replace(
              currentText,
              ""
            )}</${tagName}>`;
          }

          console.log("New text to replace with:", newText);

          const edit = new vscode.WorkspaceEdit();
          edit.replace(document.uri, range, newText);
          await vscode.workspace.applyEdit(edit);
        } else {
          console.log("Element with data-temporaryid not found.");
        }
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
      if (external && typeof external === "object") {
        console.log(`external: ${external}`);
        Object.entries(external).forEach(([styleType, styleContent]) => {
          if (styleContent && typeof styleContent === "object") {
            Object.entries(styleContent).forEach(([selector, rules]) => {
              console.log(`selector and rules: ${selector} and ${rules}`);
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
                              console.log(
                                `innerProp and innerVal: ${innerProp} and ${innerVal}`
                              );
                              return `${innerProp}: ${innerVal}`;
                            })
                            .join(", ")
                        : `${prop}: ${val}`;
                    console.log(`prop and innerVal: ${prop} and ${val}`);
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
