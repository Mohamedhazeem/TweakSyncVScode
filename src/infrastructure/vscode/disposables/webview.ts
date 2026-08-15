import * as vscode from "vscode";
import { webViewPanelOpen } from "../../../disposable/webViewDisposable";

/**
 * Disposable that registers the webview panel command and wires the webview's
 * inbound message handling. Delegates to the existing `webViewPanelOpen` so the
 * panel lifecycle and message dispatch stay consistent while the composition
 * root owns the registration.
 */
export function createWebviewDisposable(
  setPanel: (panel: vscode.WebviewPanel | undefined) => void,
  context: vscode.ExtensionContext
): vscode.Disposable {
  return webViewPanelOpen(setPanel, context);
}
