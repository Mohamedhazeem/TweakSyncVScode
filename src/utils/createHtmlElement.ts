import { HTMLElement } from "node-html-parser";
import { CreateHtmlElement } from "../types/ElementTypes";

export function createHtmlElement({
  fileExtension,
  newText,
  tagName,
  temporaryId,
  attributes,
  updatedTextContent,
  element,
  currentText,
}: CreateHtmlElement) {
  if ([".html"].includes(fileExtension)) {
    newText = `<${tagName} data-temporaryid="${temporaryId}" ${Object.entries(
      attributes ? attributes : []
    )
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>${updatedTextContent}${element.innerHTML.replace(
      currentText,
      ""
    )}</${tagName}>`;
  } else if ([".tsx", ".jsx"].includes(fileExtension)) {
    newText = `<${tagName} data-temporaryid="${temporaryId}" ${Object.entries(
      attributes ? attributes : []
    )
      .map(
        ([key, value]) => `${key === "class" ? "className" : key}="${value}"`
      )
      .join(" ")}>${updatedTextContent}${element.innerHTML.replace(
      currentText,
      ""
    )}</${tagName}>`;
  }
  return newText;
}
