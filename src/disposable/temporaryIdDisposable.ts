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
import { getCurrentPanel } from "../utils/webviewPanel";
import { FileIdMap } from "../types/ElementTypes";
import { extractIdsFromCode } from "../utils/extractIdsFromCode";

export let injectTemporaryId = (context: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand("tweakSync.injectTemporaryIds", async () => {
    console.log("Inject Temporary IDs command executed.");
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const fileUri = document.uri;
      if (
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        // TemporaryIds(document, TempororyIdMode.inject);
        // console.log("Temporary IDs injected.");
        // await document.save();
        try {
          // Check if file exists before reading
          await vscode.workspace.fs.stat(fileUri);
          const fileContent = await vscode.workspace.fs.readFile(fileUri);
          let fileText = fileContent.toString();

          // Use the updated TemporaryIds function
          fileText = injectTemporaryIds(fileText);

          await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileText));
          console.log(`Temporary IDs removed from ${fileUri.fsPath}.`);
        } catch (error) {
          console.log(`Failed to remove temporary IDs from ${fileUri.fsPath}:`, error);
        }
        let previousHtmlReactFiles: FileIdMap[] = context.workspaceState.get(
          "selectedHtmlReactFiles",
          []
        );
        const existingFile = previousHtmlReactFiles.find(
          (file) => file.fileUri === fileUri.toString()
        );

        if (existingFile) {
          existingFile.ids = extractIdsFromCode(document.getText());
        } else {
          const newFile: FileIdMap = {
            fileUri: fileUri.toString(),
            ids: extractIdsFromCode(document.getText()),
          };
          previousHtmlReactFiles.push(newFile);
        }
        context.workspaceState.update("selectedHtmlReactFiles", previousHtmlReactFiles);
        const getPanel = getCurrentPanel();
        getPanel?.webview.postMessage({
          command: "updateFileList",
          files: previousHtmlReactFiles,
        });
      } else {
        console.log("Document language is not supported for injecting temporary IDs.");
      }
    } else {
      console.log("No active text editor found.");
    }
  });
};
export let watchFiles = (context: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand("tweakSync.watchFiles", async () => {
    console.time("watchFiles");

    const collectedFiles: FileIdMap[] = context.workspaceState.get("selectedHtmlReactFiles", []);
    if (collectedFiles.length === 0) {
      vscode.window.showInformationMessage("No files to watch.");
      console.timeEnd("watchFiles");
      return; // Exit early if there are no collected files
    }

    const fileIdMapDict = new Map<string, FileIdMap>(
      collectedFiles.map((file) => [file.fileUri, file])
    );

    const processFile = async (fileEntry: FileIdMap) => {
      const fileUri = vscode.Uri.parse(fileEntry.fileUri);

      if (!isSupportedFileType(fileUri)) {
        console.log(`Skipping unsupported file type: ${fileUri.fsPath}`);
        return; // Skip this file if it's not supported
      }

      try {
        await vscode.workspace.fs.stat(fileUri);
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        let fileText = fileContent.toString();

        fileText = injectTemporaryIds(fileText);

        const newIds = extractIdsFromCode(fileText);

        if (fileIdMapDict.has(fileUri.toString())) {
          const fileIdMap = fileIdMapDict.get(fileUri.toString())!;
          fileIdMap.ids = Array.from(new Set([...fileIdMap.ids, ...newIds]));
        } else {
          fileIdMapDict.set(fileUri.toString(), { fileUri: fileUri.toString(), ids: newIds });
        }

        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileText));
        console.log(`Temporary IDs injected and updated in ${fileUri.fsPath}.`);
      } catch (error) {
        if (error instanceof vscode.FileSystemError && error.code === "FileNotFound") {
          console.error(`File not found: ${fileUri.fsPath}`);
        } else {
          console.error(`Failed to process file ${fileUri.fsPath}:`, error);
        }
      }
    };

    // Process files with concurrency control (e.g., 5 concurrent processes)
    const concurrencyLimit = 10;
    const chunks = [];
    for (let i = 0; i < collectedFiles.length; i += concurrencyLimit) {
      chunks.push(collectedFiles.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(processFile));
    }

    console.timeEnd("watchFiles");

    context.workspaceState.update("selectedHtmlReactFiles", Array.from(fileIdMapDict.values()));

    const updatedFiles = {
      css: context.workspaceState.get<string[]>("selectedCssFiles", []),
      htmlReact: Array.from(fileIdMapDict.values()),
    };

    const getPanel = getCurrentPanel();
    getPanel?.webview.postMessage({
      command: "updateFileList",
      files: updatedFiles,
    });

    vscode.window.showInformationMessage("File lists watched successfully");
  });
};

export let watchSingleFile = (context: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand(
    "tweakSync.watchSingleFile",
    async (fileUriString: string) => {
      console.time("watchSingleFiles");
      const fileUri = vscode.Uri.parse(fileUriString);

      if (!context) {
        console.log("Extension context not available.");
        console.timeEnd("watchSingleFiles");
        return;
      }

      try {
        // Check if the file exists
        await vscode.workspace.fs.stat(fileUri);

        // Read the file content
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        let fileText = fileContent.toString();

        // Inject temporary IDs into the file content
        const newFileText = injectTemporaryIds(fileText);
        const newIds = extractIdsFromCode(newFileText);

        // Retrieve existing FileIdMap from workspace state
        const existingFileIdMaps = context.workspaceState.get<FileIdMap[]>(
          "selectedHtmlReactFiles",
          []
        );
        const fileIdMapDict = new Map<string, FileIdMap>(
          existingFileIdMaps.map((file) => [file.fileUri, file])
        );

        // Update FileIdMap with new IDs
        if (fileIdMapDict.has(fileUriString)) {
          const fileIdMap = fileIdMapDict.get(fileUriString)!;
          fileIdMap.ids = Array.from(new Set([...fileIdMap.ids, ...newIds]));
        } else {
          fileIdMapDict.set(fileUriString, { fileUri: fileUriString, ids: newIds });
        }

        // Write the updated content back to the file
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(newFileText));
        console.log(`Temporary IDs injected and updated in ${fileUri.fsPath}.`);

        // Update workspace state with the new FileIdMap entries
        await context.workspaceState.update(
          "selectedHtmlReactFiles",
          Array.from(fileIdMapDict.values())
        );

        vscode.window.showInformationMessage("File watched successfully");
      } catch (error) {
        if (error instanceof vscode.FileSystemError && error.code === "FileNotFound") {
          console.log(`File not found: ${fileUri.fsPath}`);
        } else {
          console.log(`Failed to process file ${fileUri.fsPath}:`, error);
        }
      }
      console.timeEnd("watchSingleFiles");
    }
  );
};

export let removeTemporaryId = (context: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand("tweakSync.removeTemporaryIds", async () => {
    console.log("Remove Temporary IDs command executed.");
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const fileUri = document.uri;

      if (
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        console.log("Temporary IDs removed.");

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

        let collectedFiles: FileIdMap[] = context.workspaceState.get("selectedHtmlReactFiles", []);
        const updatedFiles = collectedFiles.map((fileIdMap) => {
          if (fileIdMap.fileUri === fileUri.toString()) {
            // Remove IDs from the file
            fileIdMap.ids = [];
          }
          return fileIdMap;
        });
        collectedFiles = updatedFiles.filter(
          (fileIdMap) => fileIdMap.fileUri !== fileUri.toString()
        );
        context.workspaceState.update("selectedHtmlReactFiles", collectedFiles);

        // Optionally update the Webview
        const getPanel = getCurrentPanel(); // Define this function if needed
        getPanel?.webview.postMessage({ command: "updateFileList", files: collectedFiles });
      } else {
        console.log("Document language is not supported for removing temporary IDs.");
      }
    } else {
      console.log("No active text editor found.");
    }
  });
};

export let removeSingleFile = (context: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand(
    "tweakSync.removeSingleFile",
    async (fileToRemove: string) => {
      console.time("removeSingleFile");
      console.log("Remove file command executed.");

      // Retrieve current files from workspace state
      let cssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);
      let htmlReactFiles: FileIdMap[] = context.workspaceState.get("selectedHtmlReactFiles", []);

      const fileExt = path.extname(fileToRemove);

      // Filter out the file from the appropriate array
      if (allowedHtmlExtensions.includes(fileExt)) {
        htmlReactFiles = htmlReactFiles.filter((fileIdMap) => fileIdMap.fileUri !== fileToRemove);
      } else if (allowedCssExtensions.includes(fileExt)) {
        cssFiles = cssFiles.filter((file) => file !== fileToRemove);
      } else {
        console.log(`Unsupported file type: ${fileExt}`);
        return;
      }

      // Update workspace state with the remaining files
      await Promise.all([
        context.workspaceState.update("selectedHtmlReactFiles", htmlReactFiles),
        context.workspaceState.update("selectedCssFiles", cssFiles),
      ]);

      // Post the updated file lists to the Webview
      const getPanel = getCurrentPanel();
      if (getPanel) {
        const updatedFiles = {
          css: cssFiles,
          htmlReact: htmlReactFiles,
        };
        await getPanel.webview.postMessage({ command: "updateFileList", files: updatedFiles });
        vscode.window.showInformationMessage("File removed successfully");
      } else {
        console.log("Current panel is undefined");
      }

      // Attempt to remove temporary IDs from the file if it still exists
      const fileUri = vscode.Uri.parse(fileToRemove);
      if (isSupportedFileType(fileUri)) {
        try {
          await vscode.workspace.fs.stat(fileUri); // Check if file exists before reading
          const fileContent = await vscode.workspace.fs.readFile(fileUri);
          let fileText = fileContent.toString();

          // Use the updated TemporaryIds function
          fileText = removeTemporaryIds(fileText);

          await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileText));
          console.log(`Temporary IDs removed from ${fileUri.fsPath}.`);
        } catch (error) {
          console.log(`Failed to remove temporary IDs from ${fileUri.fsPath}:`, error);
        }
      } else {
        console.log(`File type not supported for temporary ID removal: ${fileUri.fsPath}`);
      }

      console.timeEnd("removeSingleFile");
    }
  );
};

export let removeFiles = (context: vscode.ExtensionContext) => {
  return vscode.commands.registerCommand("tweakSync.removeFiles", async () => {
    console.time("removeFiles");
    console.log("Remove group of files command executed.");

    // Retrieve current files from workspace state
    let cssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);
    let htmlReactFiles: FileIdMap[] = context.workspaceState.get("selectedHtmlReactFiles", []);

    if (cssFiles.length === 0 && htmlReactFiles.length === 0) {
      vscode.window.showInformationMessage("No files to Remove.");
      console.timeEnd("removeFiles");
      return; // Exit early if there are no collected files
    }

    // Combine both lists into one array for removal
    const filesToRemove = [...cssFiles, ...htmlReactFiles.map((file) => file.fileUri)];

    // Concurrency limit for file operations
    const concurrencyLimit = 10;
    const chunks = [];
    for (let i = 0; i < filesToRemove.length; i += concurrencyLimit) {
      chunks.push(filesToRemove.slice(i, i + concurrencyLimit));
    }

    // Function to process a chunk of files
    const processChunk = async (files: string[]) => {
      const filePromises = files.map(async (fileToRemove) => {
        const fileExt = path.extname(fileToRemove);

        // Determine file type and update arrays
        if (allowedHtmlExtensions.includes(fileExt)) {
          htmlReactFiles = htmlReactFiles
            .map((fileIdMap) => {
              if (fileIdMap.fileUri === fileToRemove) {
                fileIdMap.ids = [];
              }
              return fileIdMap;
            })
            .filter((file) => file.fileUri !== fileToRemove);
        } else if (allowedCssExtensions.includes(fileExt)) {
          cssFiles = cssFiles.filter((file) => file !== fileToRemove);
        } else {
          console.log(`Unsupported file type: ${fileExt}`);
          return;
        }

        // Attempt to remove temporary IDs from the file
        const fileUri = vscode.Uri.parse(fileToRemove);
        if (!isSupportedFileType(fileUri)) {
          console.log(`File type not supported for temporary ID removal: ${fileUri.fsPath}`);
          return;
        }

        try {
          // Check if the file exists before reading
          await vscode.workspace.fs.stat(fileUri);
          const fileContent = await vscode.workspace.fs.readFile(fileUri);
          let fileText = fileContent.toString();

          // Remove temporary IDs from the file content
          fileText = removeTemporaryIds(fileText);

          await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileText));
          console.log(`Temporary IDs removed from ${fileUri.fsPath}.`);
        } catch (error) {
          console.log(`Failed to remove temporary IDs from ${fileUri.fsPath}:`, error);
        }
      });

      await Promise.all(filePromises);
    };

    // Process all chunks with concurrency
    for (const chunk of chunks) {
      await processChunk(chunk);
    }

    // Update workspace state with the remaining files
    await context.workspaceState.update("selectedHtmlReactFiles", htmlReactFiles);
    await context.workspaceState.update("selectedCssFiles", cssFiles);

    // Post the updated file lists to the Webview
    const getPanel = getCurrentPanel();
    if (getPanel) {
      const updatedFiles = {
        css: cssFiles,
        htmlReact: htmlReactFiles,
      };
      await getPanel.webview.postMessage({ command: "updateFileList", files: updatedFiles });
      vscode.window.showInformationMessage("File lists removed successfully");
    } else {
      console.log("Current panel is undefined.");
    }

    console.timeEnd("removeFiles");
  });
};
