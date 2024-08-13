import * as vscode from "vscode";
export class TweakSyncTreeDataProvider implements vscode.TreeDataProvider<TweakSyncTreeItem> {
  // Implement the required methods
  getTreeItem(element: TweakSyncTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TweakSyncTreeItem): vscode.ProviderResult<TweakSyncTreeItem[]> {
    // Define the items in the tree view
    if (element) {
      return []; // Sub-items if needed
    } else {
      return [
        new TweakSyncTreeItem(
          "Open Webview",
          "tweakSync.showPanel",
          vscode.TreeItemCollapsibleState.None
        ),
        new TweakSyncTreeItem(
          "Start Server",
          "tweakSync.startserver",
          vscode.TreeItemCollapsibleState.None
        ),
        new TweakSyncTreeItem("Support", "support", vscode.TreeItemCollapsibleState.None),
        new TweakSyncTreeItem(
          "Documentation",
          "documentation",
          vscode.TreeItemCollapsibleState.None
        ),
        new TweakSyncTreeItem("Visit Site", "visitSite", vscode.TreeItemCollapsibleState.None),
      ];
    }
  }
}

class TweakSyncTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly commandId: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.command = {
      command: commandId,
      title: label,
    };
    this.contextValue = commandId;
  }
}

export function activityPanelIntercative(context: vscode.ExtensionContext) {
  //   context.subscriptions.push(
  //     vscode.commands.registerCommand("openWebview", () => {
  //       vscode.window.showInformationMessage("Opening Webview...");
  //       // Add code to open the webview
  //     })
  //   );

  context.subscriptions.push(
    vscode.commands.registerCommand("startServer", () => {
      vscode.window.showInformationMessage("Starting Server...");
      // Add code to start the server
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("support", () => {
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://code.visualstudio.com/api/references/icons-in-labels#icon-listing"
        )
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("documentation", () => {
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://code.visualstudio.com/api/references/icons-in-labels#icon-listing"
        )
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("visitSite", () => {
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://code.visualstudio.com/api/references/icons-in-labels#icon-listing"
        )
      );
    })
  );
}
