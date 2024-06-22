import { HTMLElement } from "node-html-parser";
import { CreateHtmlElement, eventHandlerType } from "../types/ElementTypes";
import { eventAttributes, selfClosingTags } from "./constant";

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
  // if(tagName === undefined) {return;}
  const eventHandlers: eventHandlerType = {};

  eventAttributes.forEach((eventAttr) => {
    const handler = element.getAttribute(eventAttr);
    if (handler) {
      eventHandlers[eventAttr] = handler;
    }
  });

  console.log(eventHandlers);
  // Merge attributes with event handlers
  const allAttributes = { ...attributes, ...eventHandlers };
  console.log(allAttributes);

  const mapEventAttributes = (key: string): string => {
    if (key.startsWith("on")) {
      return key.slice(0, 2) + key.charAt(2).toUpperCase() + key.slice(3);
    } else if (key === "class") {
      return "className";
    }
    return key;
  };

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
      allAttributes ? allAttributes : []
    )
      .map(([key, value]) => {
        console.warn(`key is ${key}and value is ${value}`);
        const formattedKey = mapEventAttributes(key);
        const formattedValue = key.startsWith("on") ? value : `"${value}"`;
        return `${formattedKey}=${formattedValue}`;
      })
      .join(" ")}${
      selfClosingTags.includes(tagName!) ? " /" : ""
    }> ${updatedTextContent}${element.innerHTML.replace(currentText, "")} ${
      !selfClosingTags.includes(tagName!) ? `</${tagName}>` : ""
    } `;
  }
  return newText;
}
