import * as vscode from "vscode";
import { ElementStyles } from "@/types/ElementTypes";
import { StyleService } from "@/application/services/style-service";
import { createDefaultRegistry } from "@/domain/style/registry";
import { sendMessageToClient } from "@/scripts/websocket";

/**
 * Handles an incoming `ElementStyles` message from the Chrome extension by
 * applying the reported style changes to every selected CSS file via the
 * application-layer {@link StyleService}. Lives under `messaging/handlers`
 * because it is the inbound adapter that translates a web message into a use
 * case invocation; it is intentionally infrastructure (not domain) because it
 * is coupled to VS Code file I/O and the WebSocket client.
 */
export async function elementStyles(message: ElementStyles, context: vscode.ExtensionContext) {
  console.time("elementStyles");
  const { styles } = message;
  const { external } = styles;

  const selectedCssFiles: string[] = context.workspaceState.get("selectedCssFiles", []);

  if (selectedCssFiles.length === 0) {
    console.log("No selected CSS files");
    sendMessageToClient({
      action: "noSelectedCssFiles",
      message: "No selected CSS files found in TweakSync VS Code",
    });
    console.timeEnd("elementStyles");
    return;
  }

  const service = new StyleService(createDefaultRegistry(), {
    reader: {
      read: async (fileUri: string) => {
        const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(fileUri));
        return document.getText();
      },
    },
    writer: {
      write: async (fileUri: string, content: string) => {
        const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(fileUri));
        const editor = await vscode.window.showTextDocument(document);
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        );
        const success = await editor.edit((builder) => {
          builder.replace(fullRange, content);
        });
        if (!success) {
          throw new Error(`Failed to apply edit to ${fileUri}`);
        }
        await document.save();
        console.log(`File saved successfully: ${fileUri}`);
      },
    },
  });

  try {
    await service.applyToFiles(selectedCssFiles, external);
    sendMessageToClient({
      action: "appliedStyleSucessfully",
      message: "Applied Style Sucessfully.",
    });
  } catch (error) {
    console.error("Error applying styles:", error);
    sendMessageToClient({
      action: "failedToApply",
      message:
        "Failed to apply edits. Make sure you are connected with VS Code and select the element you want to apply changes.",
    });
  } finally {
    console.timeEnd("elementStyles");
  }
}
