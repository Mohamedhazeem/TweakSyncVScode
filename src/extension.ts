import * as vscode from "vscode";
import { startServer, stopServer, sendMessageToChrome } from "./server/server";
import { TempororyIdMode, TemporaryIds } from "./server/temporaryId";
import { findAndReplaceCssSelectors, findCssFiles } from "./server/test";

export function activate(context: vscode.ExtensionContext) {
  let server = vscode.commands.registerCommand("vscode.startserver", () => {
    startServer();
  });

  //#region checking
  let disposable = vscode.commands.registerCommand("vscode.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from vscode!");
  });
  //#endregion

  let Message = vscode.commands.registerCommand(
    "vscode.sendMessageToChrome",
    () => {
      console.log("vscode.sendMessageToChrome");
      sendMessageToChrome();
    }
  );
  let injectTemporaryId = vscode.commands.registerCommand(
    "vscode.injectTemporaryIds",
    () => {
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
          console.log(
            "Document language is not supported for injecting temporary IDs."
          );
        }
      } else {
        console.log("No active text editor found.");
      }
    }
  );
  let removeTemporaryId = vscode.commands.registerCommand(
    "vscode.removeTemporaryIds",
    () => {
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
          console.log(
            "Document language is not supported for remove temporary IDs."
          );
        }
      } else {
        console.log("No active text editor found.");
      }
    }
  );
  const findcss = vscode.commands.registerCommand("vscode.findcss", () => {
    findAndReplaceCssSelectors()
      .then(() => {
        console.log("CSS selectors updated successfully.");
      })
      .catch((err) => {
        console.warn("Failed to find and replace CSS selectors", err);
      });
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(server);
  context.subscriptions.push(Message);
  context.subscriptions.push(injectTemporaryId);
  context.subscriptions.push(removeTemporaryId);
  context.subscriptions.push(findcss);
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

export function deactivate() {
  stopServer();
}
