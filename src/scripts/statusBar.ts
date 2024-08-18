import * as vscode from "vscode";
import { startServer, stopServer } from "../scripts/websocket";
import { getCurrentPanel, setCurrentPanel } from "../utils/webviewPanel";
import { isServerRunning } from "../scripts/websocket";
export function registerStatusBarCommands(context: vscode.ExtensionContext) {
  // Create a status bar item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  //   statusBar.text = "$(server) TweakSync";
  statusBar.tooltip = "TweakSync (show Options)";
  statusBar.text = "$(tweakSync-icon) TweakSync";

  // Command to handle status bar click
  const statusBarCommand = vscode.commands.registerCommand(
    "tweakSync.showStatusBarOptions",
    async () => {
      // Show an information message with two buttons
      const choice = await vscode.window.showInformationMessage(
        "TweakSync Options",
        "Open Hub",
        `${!isServerRunning ? "Start TweakSync" : "Stop TweakSync"}`
      );

      if (choice === "Open Hub") {
        vscode.commands.executeCommand("tweakSync.showPanel");
        vscode.window.showInformationMessage("TweakSync Hub opened!");
      } else if (choice === "Start TweakSync") {
        // Start the server
        startServer(getCurrentPanel(), context);
        vscode.window.showInformationMessage("TweakSync started!");
      } else if (choice === "Stop TweakSync") {
        // Start the server
        stopServer(getCurrentPanel());
        vscode.window.showInformationMessage("TweakSync Stoped!");
      }
    }
  );

  // Assign the command to the status bar item
  statusBar.command = "tweakSync.showStatusBarOptions";

  // Show the status bar item
  statusBar.show();

  // Add status bar item and command to context subscriptions
  context.subscriptions.push(statusBar);
  context.subscriptions.push(statusBarCommand);
}
