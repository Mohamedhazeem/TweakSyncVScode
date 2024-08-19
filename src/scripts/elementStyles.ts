import * as vscode from "vscode";
import { ElementStyles } from "../types/ElementTypes";
import { updateCSSContent } from "./updateCSSContent";

export async function elementStyles(message: ElementStyles, context: vscode.ExtensionContext) {
  console.time("Style Search Start");

  const { styles } = message;
  const { external } = styles;

  const selectedCssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);

  if (selectedCssFiles.length === 0) {
    console.log("No selected CSS files");
    return;
  }
  for (const fileUri of selectedCssFiles) {
    const file = vscode.Uri.parse(fileUri);
    console.log(`Processing file: ${file.toString()}`);

    try {
      const document = await vscode.workspace.openTextDocument(file);
      let originalContent = document.getText();

      const updatedCSS = await updateCSSContent(originalContent, external);

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
  console.timeEnd("Style Search Start");
}
