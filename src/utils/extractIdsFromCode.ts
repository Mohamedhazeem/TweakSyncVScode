import * as vscode from "vscode";
import * as fs from "fs";
import { TWEAKSYNC_ID } from "./constant";

export function extractIdsFromCode(code: string): string[] {
  const idRegex = new RegExp(`${TWEAKSYNC_ID}="([^"]*)"`, "g");
  const ids: string[] = [];
  let match;
  while ((match = idRegex.exec(code)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

export async function getIdsForFile(uri: vscode.Uri): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const filePath = uri.fsPath;

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(extractIdsFromCode(data));
    });
  });
}
