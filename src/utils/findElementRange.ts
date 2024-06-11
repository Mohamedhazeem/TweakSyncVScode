import * as vscode from "vscode";
export function findElementRangeInDocument(
  document: vscode.TextDocument,
  id: string
): vscode.Range | null {
  const text = document.getText();
  const startTagRegex = new RegExp(
    `<([^\\s>]+)[^>]*\\s+data-temporaryid=["']${id}["'][^>]*>`,
    "i"
  );

  const startTagMatch = text.match(startTagRegex);
  if (!startTagMatch) {
    console.log("Start tag not found");
    return null;
  }

  const startIndex = startTagMatch.index!;
  const startPosition = document.positionAt(startIndex);
  console.log("Start tag found at index:", startIndex, startPosition);

  // Determine if the start tag is self-closing
  const selfClosingTagRegex = /\/\s*>$/;
  const isSelfClosing = selfClosingTagRegex.test(startTagMatch[0]);

  if (isSelfClosing) {
    // For self-closing tags, the end position is the end of the start tag
    const endPosition = document.positionAt(
      startIndex + startTagMatch[0].length
    );
    return new vscode.Range(startPosition, endPosition);
  } else {
    // For tags with end tags, handle nested tags
    const tagName = startTagMatch[1]; // Extract tag name
    const endTagRegex = new RegExp(`</${tagName}>`, "ig");
    const openTagRegex = new RegExp(`<${tagName}[^>]*>`, "ig");

    let nestedCount = 1;
    let match;
    let searchIndex = startIndex + startTagMatch[0].length;
    console.log("Starting search for end tag from index:", searchIndex);

    while ((match = endTagRegex.exec(text.substring(searchIndex)))) {
      const matchIndex = searchIndex + match.index;
      console.log("End tag match found at index:", matchIndex);

      const textUntilMatch = text.substring(searchIndex, matchIndex);
      const openTags = textUntilMatch.match(openTagRegex) || [];
      const closeTags = textUntilMatch.match(endTagRegex) || [];

      nestedCount += openTags.length - closeTags.length - 1;
      console.log(
        "Open tags found between indexes:",
        searchIndex,
        matchIndex,
        openTags.length
      );
      console.log("Nested count:", nestedCount);

      if (nestedCount <= 0) {
        const endIndex = matchIndex + match[0].length;
        const endPosition = document.positionAt(endIndex);
        console.log("End tag found at index:", endIndex, endPosition);
        return new vscode.Range(startPosition, endPosition);
      }

      searchIndex = matchIndex + match[0].length;
    }

    console.log("End tag not found");
    return null;
  }
}
