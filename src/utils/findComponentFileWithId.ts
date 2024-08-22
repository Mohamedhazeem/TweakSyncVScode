import * as vscode from "vscode";
import { TWEAKSYNC_ID } from "./constant";
export async function findComponentFileWithId(id: string): Promise<vscode.Uri | null> {
  const files = await vscode.workspace.findFiles("**/*.{js,jsx,ts,tsx,html}");
  for (const file of files) {
    const content = await vscode.workspace.fs.readFile(file);
    const contentString = content.toString();
    if (
      contentString.includes(`${TWEAKSYNC_ID}="${id}"`) ||
      contentString.includes(`${TWEAKSYNC_ID}='${id}'`)
    ) {
      return file;
    }
  }
  return null;
}
