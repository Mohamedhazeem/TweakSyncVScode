import * as vscode from "vscode";
import { TemporaryIds, TempororyIdMode } from "../scripts/temporaryId";

export let injectTemporaryId = vscode.commands.registerCommand("vscode.injectTemporaryIds", () => {
  console.log("Inject Temporary IDs command executed.");
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    if (
      document.languageId === "javascript" ||
      document.languageId === "javascriptreact" ||
      document.languageId === "typescriptreact" ||
      document.languageId === "html"
    ) {
      TemporaryIds(document, TempororyIdMode.inject);
      console.log("Temporary IDs injected.");
    } else {
      console.log("Document language is not supported for injecting temporary IDs.");
    }
  } else {
    console.log("No active text editor found.");
  }
});
export let removeTemporaryId = vscode.commands.registerCommand("vscode.removeTemporaryIds", () => {
  console.log("Inject Temporary IDs command executed.");
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    if (
      document.languageId === "javascript" ||
      document.languageId === "javascriptreact" ||
      document.languageId === "typescriptreact" ||
      document.languageId === "html"
    ) {
      TemporaryIds(document, TempororyIdMode.remove);
      console.log("Temporary IDs removed.");
    } else {
      console.log("Document language is not supported for remove temporary IDs.");
    }
  } else {
    console.log("No active text editor found.");
  }
});
