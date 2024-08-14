import * as vscode from "vscode";
import * as fs from "fs";

export function extractIdsFromCode(code: string): string[] {
  const idRegex = /data-temporaryid="(tempid-[^"]*)"/g;
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
