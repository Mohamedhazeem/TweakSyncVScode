import * as vscode from "vscode";
import { CommandDeps } from "./types";
import { FileIdMap } from "../../types/ElementTypes";
import { injectTemporaryIds } from "../../domain/watcher/file-watcher";
import { extractIdsFromCode } from "../../utils/extractIdsFromCode";

const SUPPORTED_LANGS = ["javascriptreact", "typescriptreact", "html"];

/**
 * Application command: inject temporary IDs into the active editor's file and
 * register it in the selected file list. Reuses the pure `injectTemporaryIds`
 * domain logic; editor/state I/O goes through injected ports.
 */
export function createInjectIdsHandler(deps: CommandDeps) {
  return async (): Promise<void> => {
    console.log("Inject Temporary IDs command executed.");
    const editor = deps.window.activeTextEditor;

    if (!editor) {
      console.log("No active text editor found.");
      return;
    }

    const document = editor.document;
    const fileUri = document.uri;

    if (!SUPPORTED_LANGS.includes(document.languageId)) {
      console.log("Document language is not supported for injecting temporary IDs.");
      return;
    }

    try {
      await deps.fs.stat(fileUri);
      const fileContent = await deps.fs.readFile(fileUri);
      const fileText = injectTemporaryIds(Buffer.from(fileContent).toString());
      await deps.fs.writeFile(fileUri, Buffer.from(fileText));
      console.log(`Temporary IDs injected into ${fileUri.fsPath}.`);
    } catch (error) {
      console.log(`Failed to inject temporary IDs into ${fileUri.fsPath}:`, error);
    }

    const previous: FileIdMap[] = deps.workspaceState.get("selectedHtmlReactFiles", []);
    const ids = extractIdsFromCode(document.getText());
    const existingFile = previous.find((file) => file.fileUri === fileUri.toString());

    if (existingFile) {
      existingFile.ids = ids;
    } else {
      previous.push({ fileUri: fileUri.toString(), ids });
    }

    deps.workspaceState.update("selectedHtmlReactFiles", previous);
    deps.bus.postMessage({
      command: "updateFileList",
      files: {
        css: deps.workspaceState.get<string[]>("selectedCssFiles", []),
        htmlReact: previous,
      },
    });
  };
}
