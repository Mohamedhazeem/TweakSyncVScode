import * as vscode from "vscode";
import { HTMLElement, parse } from "node-html-parser";
import { ElementDetails, FileIdMap } from "../types/ElementTypes";
import { findElementRangeInDocument } from "../utils/findElementRange";
import { checkWorkspaceFolders } from "../utils/checkWorkspaceFolders";
import { getCurrentElementText } from "../utils/getCurrentElementText";
import { createHtmlElement } from "../utils/createHtmlElement";
import * as path from "path";
import { TWEAKSYNC_ID } from "../utils/constant";
export async function elementDetails(message: ElementDetails, context: vscode.ExtensionContext) {
  console.time("Element Search Start");
  const { temporaryId, tagName, textContent, attributes } = message.details;

  if (attributes && attributes[TWEAKSYNC_ID]) {
    delete attributes[TWEAKSYNC_ID];
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
        `[${TWEAKSYNC_ID}="${temporaryId}"]`
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
        const success = await vscode.workspace.applyEdit(edit);

        if (success) {
          // Save the document after applying the edit
          await document.save();
          console.log("File saved successfully.");
        } else {
          console.log("Failed to apply workspace edit.");
        }
      } else {
        console.log("Element with data-tweaksync-id not found.");
      }
    } else {
      console.log("Range not found.");
    }
  } else {
    console.log("File with the specified temporary ID not found in the cached files.");
  }

  console.timeEnd("Element Search Start");
}
