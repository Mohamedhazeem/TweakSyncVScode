import * as vscode from "vscode";
import * as path from "path";
import { TempororyIdMode, TemporaryIds } from "./scripts/temporaryId";
import { findAndReplaceCssSelectors } from "./scripts/test";
import { startServer, stopServer } from "./scripts/websocket";

export function activate(context: vscode.ExtensionContext) {
  let server = vscode.commands.registerCommand("vscode.startserver", () => {
    startServer();
  });

  //#region checking
  let disposable = vscode.commands.registerCommand("vscode.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from vscode!");
  });
  //#endregion
  let injectTemporaryId = vscode.commands.registerCommand("vscode.injectTemporaryIds", () => {
    console.log("Inject Temporary IDs command executed.");
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      if (
        document.languageId === "javascript" ||
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        TemporaryIds(document, TempororyIdMode.inject);
        console.log("Temporary IDs injected.");
      } else {
        console.log("Document language is not supported for injecting temporary IDs.");
      }
    } else {
      console.log("No active text editor found.");
    }
  });
  let removeTemporaryId = vscode.commands.registerCommand("vscode.removeTemporaryIds", () => {
    console.log("Inject Temporary IDs command executed.");
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      if (
        document.languageId === "javascript" ||
        document.languageId === "javascriptreact" ||
        document.languageId === "typescriptreact" ||
        document.languageId === "html"
      ) {
        TemporaryIds(document, TempororyIdMode.remove);
        console.log("Temporary IDs removed.");
      } else {
        console.log("Document language is not supported for remove temporary IDs.");
      }
    } else {
      console.log("No active text editor found.");
    }
  });
  const findcss = vscode.commands.registerCommand("vscode.findcss", () => {
    findAndReplaceCssSelectors()
      .then(() => {
        console.log("CSS selectors updated successfully.");
      })
      .catch((err) => {
        console.warn("Failed to find and replace CSS selectors", err);
      });
  });
  const sidePanel = vscode.commands.registerCommand("vscode.showPanel", () => {
    const panel = vscode.window.createWebviewPanel(
      "myWebviewPanel",
      "My Side Panel",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "webview"))],
      }
    );
    const scriptUri = panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(context.extensionPath, "out", "webview", "bundle.js"))
    );

    const styleUri = panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(context.extensionPath, "out", "webview", "styles", "index.css"))
    );

    panel.webview.html = getWebviewContent(scriptUri, styleUri);
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(server);
  context.subscriptions.push(injectTemporaryId);
  context.subscriptions.push(removeTemporaryId);
  context.subscriptions.push(findcss);
  context.subscriptions.push(sidePanel);
}
// async function handleWebSocketMessage(message: any) {
//   if (message.action === 'updateElement') {
//       const { path, changes } = message;
//       const sourceInfo = await getSourceInfoFromSourceMap(path);
//       if (sourceInfo) {
//           await updateReactComponent(sourceInfo, changes);
//       }
//   }
// }

function getWebviewContent(scriptUri: vscode.Uri, styleUri: vscode.Uri) {
  return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>React Webview</title>
          <link href="${styleUri}" rel="stylesheet">
      </head>
      <body>
          <div id="root"></div>
          <script src="${scriptUri}"></script>
      </body>
      </html>
  `;
}

export function deactivate() {
  stopServer();
}
