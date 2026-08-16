import * as vscode from "vscode";
import { CommandDeps } from "./types";
import { FileIdMap } from "../../types/ElementTypes";
import { injectTemporaryIds } from "../../domain/watcher/temporary-id";
import { extractIdsFromCode } from "../../utils/extractIdsFromCode";
import { isSupportedFileType } from "../../utils/isSupportedFileType";

/**
 * Application command: inject temporary IDs into every selected HTML/React
 * file and push the updated file list to the webview. Reuses the pure
 * `injectTemporaryIds` domain logic; all I/O goes through injected ports.
 */
export function createWatchFilesHandler(deps: CommandDeps) {
  return async (): Promise<void> => {
    console.time("watchFiles");

    const collected: FileIdMap[] = deps.workspaceState.get("selectedHtmlReactFiles", []);
    if (collected.length === 0) {
      deps.window.showInformationMessage("No files to watch.");
      console.timeEnd("watchFiles");
      return;
    }

    const fileIdMapDict = new Map<string, FileIdMap>(
      collected.map((file) => [file.fileUri, file])
    );

    const processFile = async (fileEntry: FileIdMap): Promise<void> => {
      const fileUri = vscode.Uri.parse(fileEntry.fileUri);

      if (!isSupportedFileType(fileUri)) {
        console.log(`Skipping unsupported file type: ${fileUri.fsPath}`);
        return;
      }

      try {
        await deps.fs.stat(fileUri);
        const fileContent = await deps.fs.readFile(fileUri);
        let fileText = Buffer.from(fileContent).toString();

        fileText = injectTemporaryIds(fileText);

        const newIds = extractIdsFromCode(fileText);

        if (fileIdMapDict.has(fileUri.toString())) {
          const fileIdMap = fileIdMapDict.get(fileUri.toString())!;
          fileIdMap.ids = Array.from(new Set([...fileIdMap.ids, ...newIds]));
        } else {
          fileIdMapDict.set(fileUri.toString(), { fileUri: fileUri.toString(), ids: newIds });
        }

        await deps.fs.writeFile(fileUri, Buffer.from(fileText));
        console.log(`Temporary IDs injected and updated in ${fileUri.fsPath}.`);
      } catch (error) {
        if (error instanceof vscode.FileSystemError && error.code === "FileNotFound") {
          console.error(`File not found: ${fileUri.fsPath}`);
        } else {
          console.error(`Failed to process file ${fileUri.fsPath}:`, error);
        }
      }
    };

    const concurrencyLimit = 10;
    const chunks: FileIdMap[][] = [];
    for (let i = 0; i < collected.length; i += concurrencyLimit) {
      chunks.push(collected.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(processFile));
    }

    console.timeEnd("watchFiles");

    deps.workspaceState.update("selectedHtmlReactFiles", Array.from(fileIdMapDict.values()));

    const updatedFiles = {
      css: deps.workspaceState.get<string[]>("selectedCssFiles", []),
      htmlReact: Array.from(fileIdMapDict.values()),
    };

    deps.bus.postMessage({ command: "updateFileList", files: updatedFiles });
    deps.window.showInformationMessage("File lists watched successfully");
  };
}
