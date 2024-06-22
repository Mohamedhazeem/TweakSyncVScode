import { HTMLElement } from "node-html-parser";
import { CreateHtmlElement, eventHandlerType } from "../types/ElementTypes";
import { eventAttributes, selfClosingTags } from "./constant";

const mapEventAttributes = (key: string, fileExtension: string): string => {
  if ([".tsx", ".jsx"].includes(fileExtension)) {
    if (key.startsWith("on")) {
      return key.slice(0, 2) + key.charAt(2).toUpperCase() + key.slice(3); // Convert "onclick" to "onClick"
    }
    if (key === "class") {
      return "className";
    }
  }
  return key;
};

type SelfClosingTag = (typeof selfClosingTags)[number];

const isSelfClosingTag = (tag: string): tag is SelfClosingTag => {
  return (selfClosingTags as readonly string[]).includes(tag);
};

const formatAttributes = (
  attributes: eventHandlerType,
  fileExtension: string
): string => {
  return Object.entries(attributes)
    .map(([key, value]) => {
      const formattedKey = mapEventAttributes(key, fileExtension);
      const formattedValue =
        key.startsWith("on") && [".tsx", ".jsx"].includes(fileExtension)
          ? `${value}`
          : `"${value}"`;
      return `${formattedKey}=${formattedValue}`;
    })
    .join(" ");
};

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
  // Capture existing event handlers
  const eventHandlers: { [key: string]: string } = {};

  eventAttributes.forEach((eventAttr) => {
    const handler = element.getAttribute(eventAttr);
    if (handler) {
      eventHandlers[eventAttr] = handler;
    }
  });

  // Merge attributes with event handlers
  const allAttributes = { ...attributes, ...eventHandlers };

  // Create the opening tag with attributes
  const formattedAttributes = formatAttributes(allAttributes, fileExtension);
  const openingTag = `<${tagName} ${formattedAttributes} data-temporaryid="${temporaryId}" ${
    isSelfClosingTag(tagName!) ? " /" : ""
  }>`;

  // Create the closing tag only if the tag is not self-closing
  const closingTag = isSelfClosingTag(tagName!) ? "" : `</${tagName}>`;

  // Construct the newText based on the file extension
  newText = `${openingTag}${updatedTextContent}${
    isSelfClosingTag(tagName!)
      ? ""
      : element.innerHTML.replace(currentText, "") + closingTag
  }`;

  return newText;
}
