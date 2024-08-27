import * as vscode from "vscode";
import { ElementStyles } from "../types/ElementTypes";
import { updateCSSContent } from "./updateCSSContent";
import { getCurrentPanel } from "@/utils/webviewPanel";
import { sendMessageToClient } from "./websocket";

export async function elementStyles(message: ElementStyles, context: vscode.ExtensionContext) {
  const { styles } = message;
  const { external } = styles;

  const selectedCssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);

  if (selectedCssFiles.length === 0) {
    console.log("No selected CSS files");
    sendMessageToClient({
      action: "noSelectedCssFiles",
      message: "No selected CSS files found in TweakSync VS Code",
    });
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
      } else {
        console.log(`No changes needed for file: ${file.toString()}`);
      }
    } catch (error) {
      sendMessageToClient({
        action: "failedToApply",
        message: "Failed to apply edits.",
      });
      console.log(`Error processing file ${file.toString()}: ${error}`);
    }
  }

  if (!selectorFound && selectedCssFiles.length > 0) {
    const firstFileUri = vscode.Uri.parse(selectedCssFiles[0]);
    try {
      const document = await vscode.workspace.openTextDocument(firstFileUri);
      const originalContent = document.getText();
      const updatedCSS = await updateCSSContent(originalContent, external);

      if (originalContent !== updatedCSS) {
        console.warn(`Adding selectors to first file: ${firstFileUri.toString()}`);
        changes.set(firstFileUri.toString(), updatedCSS);
      }
    } catch (error) {
      console.log(`Error processing first file ${firstFileUri.toString()}: ${error}`);
    }
  }

  // Apply changes to all modified files
  for (const [fileUri, newContent] of changes.entries()) {
    const file = vscode.Uri.parse(fileUri);
    try {
      const document = await vscode.workspace.openTextDocument(file);
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(newContent.length)
      );

      const success = await vscode.window.showTextDocument(document).then((editor) => {
        return editor.edit((editBuilder) => {
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
          message: "Failed to apply edits",
        });
      }
    } catch (error) {
      console.error(`Error applying changes to file ${fileUri}: ${error}`);
    }
  }
}
