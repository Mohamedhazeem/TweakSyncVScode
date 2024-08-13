import * as vscode from "vscode";

import { HTMLElement, parse } from "node-html-parser";
import { ElementDetails } from "../types/ElementTypes";
import { findElementRangeInDocument } from "../utils/findElementRange";
import { findComponentFileWithId } from "../utils/findComponentFileWithId";
import { checkWorkspaceFolders } from "../utils/checkWorkspaceFolders";
import { getCurrentElementText } from "../utils/getCurrentElementText";
import { createHtmlElement } from "../utils/createHtmlElement";
import * as path from "path";

export async function elementDetails(message: ElementDetails) {
  console.time("Element Search Start");
  const { temporaryId, tagName, textContent, attributes } = message.details;
  if (attributes && attributes["data-temporaryid"]) {
    delete attributes["data-temporaryid"];
  }
  checkWorkspaceFolders();
  const componentFile = await findComponentFileWithId(temporaryId!);
  if (componentFile) {
    const fileExtension = path.extname(componentFile.fsPath).toLowerCase();
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

        const updatedTextContent = textContent;
        let newText = "";
        newText = createHtmlElement({
          fileExtension,
          newText,
          tagName,
          temporaryId,
          attributes,
          updatedTextContent,
          element,
          currentText,
        });

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
  console.timeEnd("Element Search Start");
}
