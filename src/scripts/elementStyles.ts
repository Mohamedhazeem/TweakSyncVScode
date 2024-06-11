import * as vscode from "vscode";
import { ElementStyles } from "../types/ElementTypes";
import { updateRule } from "../utils/updateRule";

export async function elementStyles(message: ElementStyles) {
  const { temporaryId, inline, external } = message.styles;
  const files = await vscode.workspace.findFiles("**/*.{css}");

  for (const file of files) {
    console.log(`Processing file: ${file.toString()}`);
    const content = await vscode.workspace.fs.readFile(file);
    let contentString = content.toString();
    if (external && typeof external === "object") {
      Object.entries(external).forEach(([styleType, styleContent]) => {
        if (styleContent && typeof styleContent === "object") {
          Object.entries(styleContent).forEach(([selector, rules]) => {
            console.log(`selector and rules: ${selector} and ${rules}`);
            if (
              rules &&
              typeof rules === "object" &&
              Object.keys(rules).length > 0
            ) {
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

                contentString = updateRule(selector, rules, contentString);
              } else {
                console.log(
                  `Selector ${selector} not found in file ${file.toString()}`
                );
                /// This below code used to add new rules if not found
                //contentString = createRule(selector, rules, contentString);
              }
            }
          });
        } else {
          console.log(`Style type: ${styleType}`);
          console.log(`Style content: ${styleContent}`);
        }
      });
    }
    const updatedContent = Buffer.from(contentString, "utf-8");
    await vscode.workspace.fs.writeFile(file, updatedContent);
  }
}
