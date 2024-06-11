import {
  ElementDetails,
  ElementStyles,
  WebSocketMessage,
} from "../types/ElementTypes";
import { APPLY_ELEMENT_TO_VSCODE, APPLY_STYLES_TO_VSCODE } from "./constant";

export function isElementDetails(
  message: WebSocketMessage
): message is ElementDetails {
  return (message as ElementDetails).action === APPLY_ELEMENT_TO_VSCODE;
}
export function isElementStyles(
  message: WebSocketMessage
): message is ElementStyles {
  return (message as ElementStyles).action === APPLY_STYLES_TO_VSCODE;
}
