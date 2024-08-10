import * as vscode from "vscode";
import { ElementStyles } from "../types/ElementTypes";
import { updateCSSContent } from "./updateCSSContent";

export async function elementStyles(message: ElementStyles) {
  const { styles } = message;
  const { inline, external, temporaryId } = styles;
  const files = await vscode.workspace.findFiles("**/*.{css}");

  for (const file of files) {
    console.log(`Processing file: ${file.toString()}`);

    try {
      const document = await vscode.workspace.openTextDocument(file);
      let originalContent = document.getText();

      const updatedCSS = await updateCSSContent(originalContent, external);

      // Check if the updated CSS is different from the current content
      if (originalContent !== updatedCSS) {
        console.warn(`Updating file: ${file.toString()}`);
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(originalContent.length)
        );
        await vscode.window.showTextDocument(document).then((editor) => {
          editor.edit((editBuilder) => {
            editBuilder.replace(fullRange, updatedCSS);
          });
        });
      } else {
        console.log(`No changes needed for file: ${file.toString()}`);
      }
    } catch (error) {
      console.error(`Error processing file ${file.toString()}: ${error}`);
    }
  }
}
