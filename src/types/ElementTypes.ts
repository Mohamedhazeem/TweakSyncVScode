import { HTMLElement } from "node-html-parser";

export interface ElementDetails {
  action?: string;
  details: {
    tagName?: string;
    id?: string | null;
    className?: string;
    textContent?: string | null;
    attributes?: { [key: string]: string };
    temporaryId?: string | null;
    path?: string;
  };
}
export interface InlineStyles {
  [key: string]: string;
}

export interface ExternalStyles {
  classes: { [key: string]: { [key: string]: string } };
  ids: { [key: string]: { [key: string]: string } };
  tags: { [key: string]: { [key: string]: string } };
  attribute: { [key: string]: { [key: string]: string } };
  descendant: { [key: string]: { [key: string]: string } };
  pseudoElementStyles: { [key: string]: { [key: string]: string } };
  pseudoClassStyles: { [key: string]: { [key: string]: string } };
  atRules: {
    [key: string]: {
      [key: string]: {
        [key: string]: string;
      };
    };
  };
}

export interface ElementStyles {
  action?: string;
  styles: {
    inline: InlineStyles;
    external: ExternalStyles;
    temporaryId?: string | null;
  };
}

export type SelectorProcessType = [
  string,
  {
    [key: string]: string;
  }
];

export type WebSocketMessage = ElementDetails | ElementStyles;

/**
 * Outbound message sent from the extension host to the connected Chrome client
 * over the WebSocket. Mirrors the loose `{ action, message }` envelope the
 * Chrome client already understands. Inbound messages are described by
 * {@link WebSocketMessage} (same `action` discriminator, opposite direction).
 */
export interface ClientOutboundMessage {
  action: string;
  message: string;
}

export type CreateHtmlElement = {
  fileExtension: string;
  newText: string;
  tagName: string | undefined;
  temporaryId: string | null | undefined;
  attributes: { [key: string]: string } | undefined;
  updatedTextContent: string | null | undefined;
  element: HTMLElement;
  currentText: string;
};
export type eventHandlerType = {
  [key: string]: string;
};
export interface FileIdMap {
  fileUri: string;
  ids: string[];
}
