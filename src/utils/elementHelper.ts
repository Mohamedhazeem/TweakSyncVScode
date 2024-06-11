import {
  ElementDetails,
  ElementStyles,
  WebSocketMessage,
} from "../types/ElementTypes";

export function isElementDetails(
  message: WebSocketMessage
): message is ElementDetails {
  return (message as ElementDetails).action === "applyElementToVscode";
}
export function isElementStyles(
  message: WebSocketMessage
): message is ElementStyles {
  return (message as ElementStyles).action === "applyStylesToVscode";
}
