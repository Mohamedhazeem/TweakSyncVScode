import * as vscode from "vscode";
import { HTMLElement, parse } from "node-html-parser";
import { ElementDetails, FileIdMap } from "../types/ElementTypes";
import { findElementRangeInDocument } from "../utils/findElementRange";
import { findComponentFileWithId } from "../utils/findComponentFileWithId";
import { checkWorkspaceFolders } from "../utils/checkWorkspaceFolders";
import { getCurrentElementText } from "../utils/getCurrentElementText";
import { createHtmlElement } from "../utils/createHtmlElement";
import * as path from "path";
export async function elementDetails(message: ElementDetails, context: vscode.ExtensionContext) {
  console.time("Element Search Start");
  const { temporaryId, tagName, textContent, attributes } = message.details;

  if (attributes && attributes["data-temporaryid"]) {
    delete attributes["data-temporaryid"];
  }

  checkWorkspaceFolders();

  let htmlReactFiles: FileIdMap[] = context.workspaceState.get("selectedHtmlReactFiles", []);

  const targetFile = htmlReactFiles.find((file) => file.ids.includes(temporaryId!));

  if (targetFile) {
    const componentFileUri = vscode.Uri.parse(targetFile.fileUri);
    const document = await vscode.workspace.openTextDocument(componentFileUri);
    const editor = await vscode.window.showTextDocument(document);

    const range = findElementRangeInDocument(document, temporaryId!);
    console.log("range:", range);

    if (range) {
      console.log("range found:", range);

      const elementContent = document.getText(range);
      const root = parse(elementContent);
      const element = root.querySelector(
        `[data-temporaryid="${temporaryId}"]`
      ) as HTMLElement | null;

      if (element) {
        const currentText = getCurrentElementText(element);

        // Create the new element content
        const updatedTextContent = textContent;
        let newText = createHtmlElement({
          fileExtension: path.extname(componentFileUri.fsPath).toLowerCase(),
          newText: "",
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
    } else {
      console.log("Range not found.");
    }
  } else {
    console.log("File with the specified temporary ID not found in the cached files.");
  }

  console.timeEnd("Element Search Start");
}
