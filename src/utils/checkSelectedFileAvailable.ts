import * as vscode from "vscode";
export async function validateStoredFiles(context: vscode.ExtensionContext) {
  let storedCssFiles = context.workspaceState.get<string[]>("selectedCssFiles", []);
  let storedHtmlReactFiles = context.workspaceState.get<string[]>("selectedHtmlReactFiles", []);

  // Filter out non-existent CSS files
  storedCssFiles = await filterExistingFiles(storedCssFiles);
  storedHtmlReactFiles = await filterExistingFiles(storedHtmlReactFiles);

  // Update workspace state
  await context.workspaceState.update("selectedCssFiles", storedCssFiles);
  await context.workspaceState.update("selectedHtmlReactFiles", storedHtmlReactFiles);

  return {
    css: storedCssFiles,
    htmlReact: storedHtmlReactFiles,
  };
}

async function filterExistingFiles(files: string[]): Promise<string[]> {
  const existingFiles = [];
  for (const fileUri of files) {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.parse(fileUri));
      existingFiles.push(fileUri); // If no error is thrown, the file exists
    } catch (err) {
      // File does not exist, so it is not added to existingFiles
    }
  }
  return existingFiles;
}
