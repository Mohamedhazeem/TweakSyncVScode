import * as vscode from "vscode";
import * as path from "path";
import { CommandDeps } from "./types";
import { FileIdMap } from "../../types/ElementTypes";
import { removeTemporaryIds } from "../../domain/watcher/temporary-id";
import { isSupportedFileType, allowedCssExtensions, allowedHtmlExtensions } from "../../utils/isSupportedFileType";

/**
 * Application command: remove a group of selected files (CSS + HTML/React) from
 * the session, stripping temporary IDs from any that still exist on disk.
 * Reuses the pure `removeTemporaryIds` domain logic; I/O goes through ports.
 */
export function createRemoveFilesHandler(deps: CommandDeps) {
  return async (): Promise<void> => {
    console.time("removeFiles");
    console.log("Remove group of files command executed.");

    let cssFiles: string[] = deps.workspaceState.get("selectedCssFiles", []);
    let htmlReactFiles: FileIdMap[] = deps.workspaceState.get("selectedHtmlReactFiles", []);

    if (cssFiles.length === 0 && htmlReactFiles.length === 0) {
      deps.window.showInformationMessage("No files to Remove.");
      console.timeEnd("removeFiles");
      return;
    }

    const filesToRemove = [...cssFiles, ...htmlReactFiles.map((file) => file.fileUri)];

    const concurrencyLimit = 10;
    const chunks: string[][] = [];
    for (let i = 0; i < filesToRemove.length; i += concurrencyLimit) {
      chunks.push(filesToRemove.slice(i, i + concurrencyLimit));
    }

    const processChunk = async (files: string[]): Promise<void> => {
      await Promise.all(
        files.map(async (fileToRemove) => {
          const fileExt = path.extname(fileToRemove);

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

          const fileUri = vscode.Uri.parse(fileToRemove);
          if (!isSupportedFileType(fileUri)) {
            console.log(`File type not supported for temporary ID removal: ${fileUri.fsPath}`);
            return;
          }

          try {
            await deps.fs.stat(fileUri);
            const fileContent = await deps.fs.readFile(fileUri);
            const fileText = removeTemporaryIds(Buffer.from(fileContent).toString());
            await deps.fs.writeFile(fileUri, Buffer.from(fileText));
            console.log(`Temporary IDs removed from ${fileUri.fsPath}.`);
          } catch (error) {
            console.log(`Failed to remove temporary IDs from ${fileUri.fsPath}:`, error);
          }
        })
      );
    };

    for (const chunk of chunks) {
      await processChunk(chunk);
    }

    deps.workspaceState.update("selectedHtmlReactFiles", htmlReactFiles);
    deps.workspaceState.update("selectedCssFiles", cssFiles);

    const updatedFiles = {
      css: cssFiles,
      htmlReact: htmlReactFiles,
    };

    deps.bus.postMessage({ command: "updateFileList", files: updatedFiles });
    deps.window.showInformationMessage("File lists removed successfully");

    console.timeEnd("removeFiles");
  };
}
