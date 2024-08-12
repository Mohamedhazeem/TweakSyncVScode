import { ElementDetails, ElementStyles } from "../types/ElementTypes";
import { isElementDetails, isElementStyles } from "../utils/elementHelper";
import { elementStyles } from "./elementStyles";
import { elementDetails } from "./elementDetails";

export async function handleWebSocketMessage(message: ElementDetails | ElementStyles) {
  if (isElementDetails(message)) {
    await elementDetails(message);
    console.log("Element updated successfully.");
  } else if (isElementStyles(message)) {
    await elementStyles(message);
    console.log("CSS files updated successfully.");
  } else {
    console.log("Invalid WebSocket message action.");
  }
}
