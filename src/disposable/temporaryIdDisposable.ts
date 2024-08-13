import * as vscode from "vscode";
import * as path from "path";
import {
  injectTemporaryIds,
  removeTemporaryIds,
  TemporaryIds,
  TempororyIdMode,
} from "../scripts/temporaryId";
import {
  allowedCssExtensions,
  allowedHtmlExtensions,
  isSupportedFileType,
} from "../utils/isSupportedFileType";

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
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        TemporaryIds(document, TempororyIdMode.inject);
        console.log("Temporary IDs injected.");
        let collectedFiles: string[] = context.workspaceState.get("selectedHtmlReactFiles") || [];

        if (!collectedFiles.includes(fileUri)) {
          collectedFiles.push(fileUri);
          context.workspaceState.update("selectedHtmlReactFiles", collectedFiles);
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
    const collectedFiles: string[] = context.workspaceState.get("selectedHtmlReactFiles", []);

    for (const fileUriString of collectedFiles) {
      const fileUri = vscode.Uri.parse(fileUriString);

      if (!isSupportedFileType(fileUri)) {
        console.log(`Skipping unsupported file type: ${fileUri.fsPath}`);
        continue; // Skip this file if it's not supported
      }

      try {
        // Check if the file exists
        await vscode.workspace.fs.stat(fileUri);

        // Read the file content
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        let fileText = fileContent.toString();

        // Apply the TemporaryIds function
        fileText = injectTemporaryIds(fileText); // Assuming TemporaryIds works on string content

        // Write the updated content back to the file
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileText));
        console.log(`Temporary IDs injected into ${fileUri.fsPath}.`);
      } catch (error) {
        if (error instanceof vscode.FileSystemError && error.code === "FileNotFound") {
          console.error(`File not found: ${fileUri.fsPath}`);
        } else {
          console.error(`Failed to process file ${fileUri.fsPath}:`, error);
        }
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
      if (
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        TemporaryIds(document, TempororyIdMode.remove);
        console.log("Temporary IDs removed.");

        // Optionally remove the file from workspace state
        let collectedFiles: string[] = context.workspaceState.get("selectedHtmlReactFiles") || [];

        // Remove the current file if it's in the list
        collectedFiles = collectedFiles.filter((uri) => uri !== fileUri);
        context.workspaceState.update("selectedHtmlReactFiles", collectedFiles);
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
  return vscode.commands.registerCommand(
    "tweakSync.removeFile",
    async (fileToRemove: string, index: number) => {
      console.log("Remove file command executed.");

      // Retrieve current files from workspace state
      let cssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);
      let htmlReactFiles: string[] = context.workspaceState.get("selectedHtmlReactFiles", []);

      const fileExt = path.extname(fileToRemove);

      // Determine file type and remove from appropriate array
      if ([".html", ".jsx", ".tsx"].includes(fileExt)) {
        htmlReactFiles = htmlReactFiles.filter((file) => file !== fileToRemove);
        await context.workspaceState.update("selectedHtmlReactFiles", htmlReactFiles);
      } else if (fileExt === ".css") {
        cssFiles = cssFiles.filter((file) => file !== fileToRemove);
        await context.workspaceState.update("selectedCssFiles", cssFiles);
      } else {
        console.log(`Unsupported file type: ${fileExt}`);
        return;
      }

      // Post the updated file lists to the Webview
      if (currentPanel?.webview) {
        const updatedFiles = {
          css: cssFiles,
          htmlReact: htmlReactFiles,
        };
        await currentPanel.webview.postMessage({ command: "updateFileList", files: updatedFiles });
      }

      // Attempt to remove temporary IDs from the file
      const fileUri = vscode.Uri.parse(fileToRemove);
      if (!isSupportedFileType(fileUri)) {
        console.log(`File type not supported for temporary ID removal: ${fileUri.fsPath}`);
        return;
      }

      try {
        // Check if file exists before reading
        await vscode.workspace.fs.stat(fileUri);
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        let fileText = fileContent.toString();

        // Use the updated TemporaryIds function
        fileText = removeTemporaryIds(fileText);

        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileText));
        console.log(`Temporary IDs removed from ${fileUri.fsPath}.`);
      } catch (error) {
        console.log(`Failed to remove temporary IDs from ${fileUri.fsPath}:`, error);
      }
    }
  );
};
