import { FileIdMap } from "@/types/ElementTypes";
import * as vscode from "vscode";

// Main function to validate stored files
export async function validateStoredFiles(context: vscode.ExtensionContext) {
  // Retrieve stored files from workspace state
  let storedCssFiles = context.workspaceState.get<string[]>("selectedCssFiles", []);
  let storedHtmlReactFiles = context.workspaceState.get<FileIdMap[]>("selectedHtmlReactFiles", []);

  // Filter out non-existent files
  storedCssFiles = await filterExistingCssFiles(storedCssFiles);
  storedHtmlReactFiles = await filterExistingHtmlReactFiles(storedHtmlReactFiles);

  // Update workspace state with existing files
  await context.workspaceState.update("selectedCssFiles", storedCssFiles);
  await context.workspaceState.update("selectedHtmlReactFiles", storedHtmlReactFiles);

  return {
    css: storedCssFiles,
    htmlReact: storedHtmlReactFiles,
  };
}

// Function to filter existing CSS files
async function filterExistingCssFiles(files: string[]): Promise<string[]> {
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

// Function to filter existing HTML/React files
async function filterExistingHtmlReactFiles(files: FileIdMap[]): Promise<FileIdMap[]> {
  const existingFiles = [];
  for (const file of files) {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.parse(file.fileUri)); // Adjust based on actual FileIdMap structure
      existingFiles.push(file); // If no error is thrown, the file exists
    } catch (err) {
      // File does not exist, so it is not added to existingFiles
    }
  }
  return existingFiles;
}
