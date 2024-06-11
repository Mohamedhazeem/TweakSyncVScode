import { HTMLElement } from "node-html-parser";

export function getCurrentElementText(element: HTMLElement | null): string {
  let currentText = "";
  if (element === null) {
    return "";
  }
  // Iterate through the child nodes of the element
  element.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      currentText += node.textContent?.trim() ?? "";
    }
  });
  console.log(`current text - ${currentText}`);
  return currentText;
}
