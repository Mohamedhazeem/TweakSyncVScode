# WebSocket Message Contracts

**Date**: 2026-08-16  
**Feature**: Clean Architecture Refactor  
**Status**: Draft

## Overview

This document defines the JSON message contracts exchanged between the TweakSync Chrome client and the VS Code extension host over the WebSocket connection.

## Transport

- Protocol: WebSocket
- Host: `127.0.0.1`
- Port: `16016`
- Format: JSON with explicit TypeScript interfaces

## Incoming Messages (Chrome → Extension)

### ElementDetails

Sent when the Chrome client captures element information.

```typescript
interface ElementDetails {
  type: "ElementDetails";
  element: {
    tagName: string;
    attributes: Record<string, string>;
    textContent?: string;
    computedStyles?: Record<string, string>;
  };
  sourceFile: string;
  sourceLine: number;
}
```

**Fields**:
- `type`: Discriminator; always `"ElementDetails"`
- `element.tagName`: HTML tag name
- `element.attributes`: Key-value map of element attributes
- `element.textContent`: Optional text content of the element
- `element.computedStyles`: Optional computed CSS styles
- `sourceFile`: Path to the source file in the workspace
- `sourceLine`: Line number in the source file

### ElementStyles

Sent when the Chrome client captures style changes.

```typescript
interface ElementStyles {
  type: "ElementStyles";
  styles: ExternalStyles;
  sourceFile: string;
}
```

**Fields**:
- `type`: Discriminator; always `"ElementStyles"`
- `styles`: Structured style changes (see `ExternalStyles` in [data-model.md](../data-model.md))
- `sourceFile`: Path to the source file in the workspace

## Outgoing Messages (Extension → Chrome)

### ServerStatus

Sent to inform the Chrome client of server state.

```typescript
interface ServerStatus {
  type: "ServerStatus";
  isRunning: boolean;
  isConnected: boolean;
}
```

**Fields**:
- `type`: Discriminator; always `"ServerStatus"`
- `isRunning`: Whether the WebSocket server is active
- `isConnected`: Whether a Chrome client is currently connected

## Error Handling

- Invalid JSON: Connection is closed with error logged to console.
- Unknown message type: Logged as warning; no response sent.
- Missing required fields: Logged as error; message is discarded.

## Versioning

Message contracts are versioned implicitly by the presence of the `type` discriminator. New message types are additive; existing types must remain backward compatible.
