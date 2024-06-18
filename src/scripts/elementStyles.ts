import * as vscode from "vscode";
import { ElementStyles } from "../types/ElementTypes";
import { updateCSSContent } from "./updateCSSContent";

export async function elementStyles(message: ElementStyles) {
  const { styles } = message;
  const { inline, external, temporaryId } = styles;
  const files = await vscode.workspace.findFiles("**/*.{css}");
  let updatedCSS: string;
  for (const file of files) {
    console.log(`Processing file: ${file.toString()}`);

    try {
      const document = await vscode.workspace.openTextDocument(file);
      let contentString = document.getText();

      updatedCSS = await updateCSSContent(contentString, external);
      console.warn(`${updatedCSS}`);
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(contentString.length)
      );
      await vscode.window.showTextDocument(document).then((editor) => {
        editor.edit((editBuilder) => {
          editBuilder.replace(fullRange, updatedCSS);
        });
      });
    } catch (error) {
      console.error(`Error processing file ${file.toString()}: ${error}`);
    }
  }
}
