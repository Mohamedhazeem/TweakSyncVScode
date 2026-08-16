import { ElementDetails, ElementStyles } from "../types/ElementTypes";
import { isElementDetails, isElementStyles } from "../utils/elementHelper";
import { elementStyles } from "@/infrastructure/messaging/handlers/elementStyles";
import { elementDetails } from "@/infrastructure/messaging/handlers/elementDetails";
import * as vscode from "vscode";
export async function handleWebSocketMessage(
  message: ElementDetails | ElementStyles,
  context: vscode.ExtensionContext
) {
  if (isElementDetails(message)) {
    await elementDetails(message, context);
    console.log("Element updated successfully.");
  } else if (isElementStyles(message)) {
    await elementStyles(message, context);
    console.log("CSS files updated successfully.");
  } else {
    console.log("Invalid WebSocket message action.");
  }
}
