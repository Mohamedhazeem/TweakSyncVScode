import * as vscode from "vscode";
import { TemporaryIds, TempororyIdMode } from "../scripts/temporaryId";

export let injectTemporaryId = (
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) => {
  return vscode.commands.registerCommand("tweakSync.injectTemporaryIds", () => {
    console.log("Inject Temporary IDs command executed.");
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const fileUri = document.uri.toString();
      if (
        document.languageId === "javascript" ||
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        TemporaryIds(document, TempororyIdMode.inject);
        console.log("Temporary IDs injected.");
        let collectedFiles: string[] = context.workspaceState.get("selectedFiles") || [];

        if (!collectedFiles.includes(fileUri)) {
          collectedFiles.push(fileUri);
          context.workspaceState.update("selectedFiles", collectedFiles);
          currentPanel?.webview.postMessage({ command: "updateFileList", files: collectedFiles });
        }
      } else {
        console.log("Document language is not supported for injecting temporary IDs.");
      }
    } else {
      console.log("No active text editor found.");
    }
  });
};
export let injectTemporaryIdToFiles = (context: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand("tweakSync.injectTemporaryIdsToFiles", async () => {
    console.log("Inject Temporary IDs command executed.");

    // Retrieve the collected files from workspace state
    const collectedFiles: string[] = context.workspaceState.get("selectedFiles", []);

    for (const fileUriString of collectedFiles) {
      const fileUri = vscode.Uri.parse(fileUriString);

      // Open the document
      const document = await vscode.workspace.openTextDocument(fileUri);

      // Check if the document's language is supported
      if (
        document.languageId === "javascript" ||
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        // Apply the TemporaryIds function
        TemporaryIds(document, TempororyIdMode.inject);
        console.log(`Temporary IDs injected into ${document.fileName}.`);
      } else {
        console.log(
          `Document language is not supported for injecting temporary IDs: ${document.fileName}`
        );
      }
    }
  });
};

export let removeTemporaryId = (
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) => {
  return vscode.commands.registerCommand("tweakSync.removeTemporaryIds", async () => {
    console.log("Remove Temporary IDs command executed.");
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const fileUri = document.uri.toString();

      // Check if the document's language is supported
      if (
        document.languageId === "javascript" ||
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        TemporaryIds(document, TempororyIdMode.remove);
        console.log("Temporary IDs removed.");

        // Optionally remove the file from workspace state
        let collectedFiles: string[] = context.workspaceState.get("selectedFiles") || [];

        // Remove the current file if it's in the list
        collectedFiles = collectedFiles.filter((uri) => uri !== fileUri);
        context.workspaceState.update("selectedFiles", collectedFiles);

        // If you have a reference to your Webview panel, you can send a message to update the list
        currentPanel?.webview.postMessage({ command: "updateFileList", files: collectedFiles });
      } else {
        console.log("Document language is not supported for removing temporary IDs.");
      }
    } else {
      console.log("No active text editor found.");
    }
  });
};
export let removeFile = (
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) => {
  return vscode.commands.registerCommand("tweakSync.removeFile", async (fileToRemove: string) => {
    console.log("Remove file command executed.");

    // Remove the file from workspace state
    let updatedFiles: string[] = context.workspaceState.get("selectedFiles", []);
    updatedFiles = updatedFiles.filter((file) => file !== fileToRemove);
    await context.workspaceState.update("selectedFiles", updatedFiles);

    // Also remove temporary IDs from the file
    const fileUri = vscode.Uri.parse(fileToRemove);
    const document = await vscode.workspace.openTextDocument(fileUri);

    if (
      document.languageId === "javascript" ||
      document.languageId === "javascriptreact" ||
      document.languageId === "typescriptreact" ||
      document.languageId === "html"
    ) {
      TemporaryIds(document, TempororyIdMode.remove);
      console.log(`Temporary IDs removed from ${document.fileName}.`);
    } else {
      console.log("Document language is not supported for removing temporary IDs.");
    }

    // Update the Webview with the new list of files
    currentPanel?.webview.postMessage({ command: "updateFileList", files: updatedFiles });
  });
};
