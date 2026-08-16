import * as vscode from "vscode";
import { WebSocketServerPort } from "../websocket/types";
import { WebviewMessageBus } from "../webview/message-bus";

/**
 * Registers the TweakSync status bar item and its click command. Depends only on
 * the {@link WebSocketServerPort} (start/stop + running state) and the
 * {@link WebviewMessageBus} (open the hub) abstractions, replacing the legacy
 * `scripts/statusBar.ts` that reached into the `ws` singleton directly.
 */
export function createStatusBar(
  context: vscode.ExtensionContext,
  server: WebSocketServerPort,
  bus: WebviewMessageBus
): vscode.Disposable {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.tooltip = "TweakSync (show Options)";
  statusBar.text = "$(tweakSync-icon) TweakSync";

  const command = vscode.commands.registerCommand(
    "tweakSync.showStatusBarOptions",
    async () => {
      const choice = await vscode.window.showInformationMessage(
        "TweakSync Options",
        "Open Hub",
        `${!server.isRunning ? "Start TweakSync" : "Stop TweakSync"}`
      );

      if (choice === "Open Hub") {
        vscode.commands.executeCommand("tweakSync.showPanel");
        vscode.window.showInformationMessage("TweakSync Hub opened!");
      } else if (choice === "Start TweakSync") {
        server.start();
        vscode.window.showInformationMessage("TweakSync started!");
      } else if (choice === "Stop TweakSync") {
        server.stop();
        vscode.window.showInformationMessage("TweakSync Stoped!");
      }
    }
  );

  statusBar.command = "tweakSync.showStatusBarOptions";
  statusBar.show();

  context.subscriptions.push(statusBar, command);

  return new vscode.Disposable(() => {
    statusBar.dispose();
    command.dispose();
  });
}
