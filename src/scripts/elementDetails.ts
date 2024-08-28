import * as vscode from "vscode";
import { HTMLElement, parse } from "node-html-parser";
import { ElementDetails, FileIdMap } from "../types/ElementTypes";
import { findElementRangeInDocument } from "../utils/findElementRange";
import { checkWorkspaceFolders } from "../utils/checkWorkspaceFolders";
import { getCurrentElementText } from "../utils/getCurrentElementText";
import { createHtmlElement } from "../utils/createHtmlElement";
import * as path from "path";
import { TWEAKSYNC_ID } from "../utils/constant";
import { sendMessageToClient } from "./websocket";

export async function elementDetails(message: ElementDetails, context: vscode.ExtensionContext) {
  console.time("Element Search Start");

  const { temporaryId, tagName, textContent, attributes } = message.details;

  if (attributes && attributes[TWEAKSYNC_ID]) {
    delete attributes[TWEAKSYNC_ID];
  }

  checkWorkspaceFolders();

  const htmlReactFiles: FileIdMap[] = context.workspaceState.get("selectedHtmlReactFiles", []);

  if (htmlReactFiles.length === 0) {
    sendMessageToClient({
      action: "failedToApply",
      message: "No HTML files found in TweakSync VS Code.",
    });
    console.timeEnd("Element Search Start");
    return;
  }

  // Accumulate workspace edits
  const workspaceEdit = new vscode.WorkspaceEdit();
  const filesToSave: vscode.Uri[] = [];

  const filePromises = htmlReactFiles.map(async (file) => {
    if (!file.ids.includes(temporaryId!)) {
      return;
    } // Skip if ID is not in this file

    const componentFileUri = vscode.Uri.parse(file.fileUri);
    const document = await vscode.workspace.openTextDocument(componentFileUri);

    const range = findElementRangeInDocument(document, temporaryId!);
    if (!range) {
      return;
    }

    const elementContent = document.getText(range);
    const root = parse(elementContent);
    const element = root.querySelector(`[${TWEAKSYNC_ID}="${temporaryId}"]`) as HTMLElement | null;

    if (!element) {
      return;
    }

    const currentText = getCurrentElementText(element);
    const updatedTextContent = textContent;
    const newText = createHtmlElement({
      fileExtension: path.extname(componentFileUri.fsPath).toLowerCase(),
      newText: "",
      tagName,
      temporaryId,
      attributes,
      updatedTextContent,
      element,
      currentText,
    });

    console.log(`New text to replace with in ${componentFileUri.toString()}:`, newText);

    workspaceEdit.replace(document.uri, range, newText);
    filesToSave.push(document.uri);
  });

  // Await all file processing promises
  await Promise.all(filePromises);

  // Apply all workspace edits
  const success = await vscode.workspace.applyEdit(workspaceEdit);

  if (success) {
    // Save all documents after applying the edits
    const savePromises = filesToSave.map((uri) =>
      vscode.workspace.openTextDocument(uri).then((doc) => doc.save())
    );
    await Promise.all(savePromises);
    console.log("All files saved successfully.");
    sendMessageToClient({
      action: "appliedElementSucessfully",
      message: "Applied Element Sucessfully.",
    });
  } else {
    console.log("Failed to apply workspace edits.");
    sendMessageToClient({
      action: "failedToApply",
      message: "Failed to apply edits",
    });
  }

  console.timeEnd("Element Search Start");
}
