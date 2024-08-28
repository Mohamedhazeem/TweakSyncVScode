import * as vscode from "vscode";
import { ElementStyles } from "../types/ElementTypes";
import { updateCSSContent } from "./updateCSSContent";

import { sendMessageToClient } from "./websocket";

export async function elementStyles(message: ElementStyles, context: vscode.ExtensionContext) {
  console.time("elementStyles");
  const { styles } = message;
  const { external } = styles;

  const selectedCssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);

  if (selectedCssFiles.length === 0) {
    console.log("No selected CSS files");
    sendMessageToClient({
      action: "noSelectedCssFiles",
      message: "No selected CSS files found in TweakSync VS Code",
    });
    console.timeEnd("elementStyles");
    return;
  }

  let selectorFound = false;

  // Accumulate changes for bulk update
  const changes: Map<string, string> = new Map();

  for (const fileUri of selectedCssFiles) {
    const file = vscode.Uri.parse(fileUri);
    console.log(`Processing file: ${file.toString()}`);

    try {
      const document = await vscode.workspace.openTextDocument(file);
      const originalContent = document.getText();

      const updatedCSS = await updateCSSContent(originalContent, external);

      if (originalContent !== updatedCSS) {
        console.warn(`Changes detected for file: ${file.toString()}`);
        changes.set(file.toString(), updatedCSS);
        selectorFound = true;
        break; // Stop if you find a file with changes
      }
    } catch (error) {
      sendMessageToClient({
        action: "failedToApply",
        message: "Failed to apply edits.",
      });
      console.timeEnd("elementStyles");
      return;
    }
  }

  if (!selectorFound && selectedCssFiles.length > 0) {
    const firstFileUri = vscode.Uri.parse(selectedCssFiles[0]);
    try {
      const document = await vscode.workspace.openTextDocument(firstFileUri);
      const originalContent = document.getText();
      const updatedCSS = await updateCSSContent(originalContent, external);

      if (originalContent !== updatedCSS) {
        changes.set(firstFileUri.toString(), updatedCSS);
      } else {
        sendMessageToClient({
          action: "appliedStyleSucessfully",
          message: "Applied Style Sucessfully.",
        });
      }
    } catch (error) {
      console.log(`Error processing first file ${firstFileUri.toString()}: ${error}`);
      sendMessageToClient({
        action: "failedToApply",
        message:
          "Failed to apply edits. Make sure you are connected with VS Code and select the element you want to apply changes.",
      });
      console.timeEnd("elementStyles");
      return;
    }
  }

  // Apply changes to all modified files
  for (const [fileUri, newContent] of changes.entries()) {
    const file = vscode.Uri.parse(fileUri);
    try {
      const document = await vscode.workspace.openTextDocument(file);
      const success = await vscode.window.showTextDocument(document).then((editor) => {
        return editor.edit((editBuilder) => {
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          editBuilder.replace(fullRange, newContent);
        });
      });
      if (success) {
        await document.save();
        console.log(`File saved successfully: ${file.toString()}`);
        sendMessageToClient({
          action: "appliedStyleSucessfully",
          message: "Applied Style Sucessfully.",
        });
      } else {
        console.log(`Failed to apply edit for file: ${file.toString()}`);
        sendMessageToClient({
          action: "failedToApply",
          message:
            "Failed to apply edits. Make sure you are connected with VS Code and select the element you want to apply changes.",
        });
      }
    } catch (error) {
      console.error(`Error applying changes to file ${fileUri}: ${error}`);
    }
  }
  console.timeEnd("elementStyles");
}
