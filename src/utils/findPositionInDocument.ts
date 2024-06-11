import * as vscode from "vscode";

export function findPositionInDocument(
  document: vscode.TextDocument,
  id: string
): { line: number; startColumn: number; endColumn: number } | null {
  const text = document.getText();
  const regex = new RegExp(`data-temporaryid=["']${id}["']`);
  const match = text.match(regex);

  if (match) {
    const startIndex = match.index;
    const linesBeforeMatch = text.substring(0, startIndex).split("\n");
    const line = linesBeforeMatch.length - 1; // Zero-based indexing
    const startColumn =
      startIndex! - linesBeforeMatch.slice(0, -1).join("\n").length - 1; // Adjust for zero-based indexing
    const endColumn = startColumn + match[0].length;
    return { line, startColumn, endColumn };
  }

  return null;
}
