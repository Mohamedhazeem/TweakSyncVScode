import * as vscode from "vscode";
import * as path from "path";
export const isSupportedFileType = (fileUri: vscode.Uri): boolean => {
  const fileExtension = fileUri.fsPath.split(".").pop();
  return ["jsx", "tsx", "html"].includes(fileExtension || "");
};
export const allowedCssExtensions = [".css"];
export const allowedHtmlExtensions = [".html", ".jsx", ".tsx"];
export function htmlFile(uris: vscode.Uri[], allowedHtmlExtensions: string[]) {
  return uris.filter((uri) => {
    const ext = path.extname(uri.fsPath);
    return allowedHtmlExtensions.includes(ext);
  });
}

export function cssFile(uris: vscode.Uri[], allowedCssExtensions: string[]) {
  return uris.filter((uri) => {
    const ext = path.extname(uri.fsPath);
    return allowedCssExtensions.includes(ext);
  });
}
