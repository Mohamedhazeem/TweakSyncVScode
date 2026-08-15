import * as vscode from "vscode";
import * as path from "path";
import {
  CommandsPort,
  WorkspaceStatePort,
  WorkspaceFsPort,
  WindowPort,
} from "../interfaces";
import { WebviewMessageBus } from "../../webview/message-bus";
import { FileIdMap } from "../../../types/ElementTypes";
import { injectTemporaryIds, removeTemporaryIds } from "../../../domain/watcher/file-watcher";
import { extractIdsFromCode } from "../../../utils/extractIdsFromCode";
import {
  isSupportedFileType,
  allowedCssExtensions,
  allowedHtmlExtensions,
} from "../../../utils/isSupportedFileType";
import { createInjectIdsHandler } from "../../../application/commands/inject-ids";

const SUPPORTED_LANGS = ["javascriptreact", "typescriptreact", "html"];

export interface TemporaryIdDeps {
  commands: CommandsPort;
  workspaceState: WorkspaceStatePort;
  fs: WorkspaceFsPort;
  window: WindowPort;
  bus: WebviewMessageBus;
  context: vscode.ExtensionContext;
}

/**
 * Registers the temporary-ID related commands (`injectTemporaryIds`,
 * `removeTemporaryIds`, `watchSingleFile`, `removeSingleFile`) behind the
 * {@link CommandsPort}. All four handlers reuse the pure domain logic and the
 * injected ports, so this module can be changed/tested without disturbing the
 * rest of the system (User Story 2).
 */
export function createTemporaryIdDisposables(deps: TemporaryIdDeps): vscode.Disposable[] {
  const removeTemporaryIdsHandler = async (): Promise<void> => {
    console.log("Remove Temporary IDs command executed.");
    const editor = deps.window.activeTextEditor;

    if (!editor) {
      console.log("No active text editor found.");
      return;
    }

    const document = editor.document;
    const fileUri = document.uri;

    if (!SUPPORTED_LANGS.includes(document.languageId)) {
      console.log("Document language is not supported for removing temporary IDs.");
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

    let collected: FileIdMap[] = deps.workspaceState.get("selectedHtmlReactFiles", []);
    const updated = collected.map((file) => {
      if (file.fileUri === fileUri.toString()) {
        file.ids = [];
      }
      return file;
    });
    collected = updated.filter((file) => file.fileUri !== fileUri.toString());
    deps.workspaceState.update("selectedHtmlReactFiles", collected);
    deps.bus.postMessage({
      command: "updateFileList",
      files: {
        css: deps.workspaceState.get<string[]>("selectedCssFiles", []),
        htmlReact: collected,
      },
    });
  };

  const watchSingleFileHandler = async (...args: unknown[]): Promise<void> => {
    console.time("watchSingleFiles");
    const fileUriString = args[0] as string;
    const fileUri = vscode.Uri.parse(fileUriString);

    try {
      await deps.fs.stat(fileUri);
      const fileContent = await deps.fs.readFile(fileUri);
      const fileText = Buffer.from(fileContent).toString();
      const newFileText = injectTemporaryIds(fileText);
      const newIds = extractIdsFromCode(newFileText);

      const existingFileIdMaps: FileIdMap[] = deps.workspaceState.get("selectedHtmlReactFiles", []);
      const fileIdMapDict = new Map<string, FileIdMap>(
        existingFileIdMaps.map((file) => [file.fileUri, file])
      );

      if (fileIdMapDict.has(fileUriString)) {
        const fileIdMap = fileIdMapDict.get(fileUriString)!;
        fileIdMap.ids = Array.from(new Set([...fileIdMap.ids, ...newIds]));
      } else {
        fileIdMapDict.set(fileUriString, { fileUri: fileUriString, ids: newIds });
      }

      await deps.fs.writeFile(fileUri, Buffer.from(newFileText));
      console.log(`Temporary IDs injected and updated in ${fileUri.fsPath}.`);

      await deps.workspaceState.update(
        "selectedHtmlReactFiles",
        Array.from(fileIdMapDict.values())
      );
      deps.window.showInformationMessage("File watched successfully");
    } catch (error) {
      if (error instanceof vscode.FileSystemError && error.code === "FileNotFound") {
        console.log(`File not found: ${fileUri.fsPath}`);
      } else {
        console.log(`Failed to process file ${fileUri.fsPath}:`, error);
      }
    }
    console.timeEnd("watchSingleFiles");
  };

  const removeSingleFileHandler = async (...args: unknown[]): Promise<void> => {
    console.time("removeSingleFile");
    console.log("Remove file command executed.");
    const fileToRemove = args[0] as string;

    let cssFiles: string[] = deps.workspaceState.get("selectedCssFiles", []);
    let htmlReactFiles: FileIdMap[] = deps.workspaceState.get("selectedHtmlReactFiles", []);

    const fileExt = path.extname(fileToRemove);

    if (allowedHtmlExtensions.includes(fileExt)) {
      htmlReactFiles = htmlReactFiles.filter((fileIdMap) => fileIdMap.fileUri !== fileToRemove);
    } else if (allowedCssExtensions.includes(fileExt)) {
      cssFiles = cssFiles.filter((file) => file !== fileToRemove);
    } else {
      console.log(`Unsupported file type: ${fileExt}`);
      console.timeEnd("removeSingleFile");
      return;
    }

    await Promise.all([
      deps.workspaceState.update("selectedHtmlReactFiles", htmlReactFiles),
      deps.workspaceState.update("selectedCssFiles", cssFiles),
    ]);

    const panel = deps.bus.getPanel();
    if (panel) {
      const updatedFiles = { css: cssFiles, htmlReact: htmlReactFiles };
      await panel.webview.postMessage({ command: "updateFileList", files: updatedFiles });
      deps.window.showInformationMessage("File removed successfully");
    } else {
      console.log("Current panel is undefined");
    }

    const fileUri = vscode.Uri.parse(fileToRemove);
    if (isSupportedFileType(fileUri)) {
      try {
        await deps.fs.stat(fileUri);
        const fileContent = await deps.fs.readFile(fileUri);
        const fileText = removeTemporaryIds(Buffer.from(fileContent).toString());
        await deps.fs.writeFile(fileUri, Buffer.from(fileText));
        console.log(`Temporary IDs removed from ${fileUri.fsPath}.`);
      } catch (error) {
        console.log(`Failed to remove temporary IDs from ${fileUri.fsPath}:`, error);
      }
    } else {
      console.log(`File type not supported for temporary ID removal: ${fileUri.fsPath}`);
    }

    console.timeEnd("removeSingleFile");
  };

  return [
    deps.commands.registerCommand(
      "tweakSync.injectTemporaryIds",
      createInjectIdsHandler(deps)
    ),
    deps.commands.registerCommand("tweakSync.removeTemporaryIds", removeTemporaryIdsHandler),
    deps.commands.registerCommand("tweakSync.watchSingleFile", watchSingleFileHandler),
    deps.commands.registerCommand("tweakSync.removeSingleFile", removeSingleFileHandler),
  ];
}
