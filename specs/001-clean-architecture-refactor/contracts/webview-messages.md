# Webview Message Contracts

**Date**: 2026-08-16  
**Feature**: Clean Architecture Refactor  
**Status**: Draft

## Overview

This document defines the message contracts exchanged between the VS Code extension host and the embedded React webview panel.

## Transport

- Mechanism: `WebviewPanel.postMessage` (extension → webview) and `window.postMessage` (webview → extension)
- Serialization: VS Code handles serialization; messages must be JSON-compatible
- Direction: Bidirectional

## Extension → Webview Messages

### ServerStateUpdate

Informs the webview of WebSocket server state changes.

```typescript
interface ServerStateUpdate {
  command: "serverStarted" | "serverConnected";
  value: boolean;
}
```

**Commands**:
- `"serverStarted"`: Server active state
- `"serverConnected"`: Client connection state

### FileListUpdate

Sends the current list of tracked files to the webview.

```typescript
interface FileListUpdate {
  command: "updateFileList";
  files: {
    css: string[];
    htmlReact: FileIdMap[];
  };
}
```

**Fields**:
- `command`: Always `"updateFileList"`
- `files.css`: Array of CSS file URIs
- `files.htmlReact`: Array of tracked HTML/React files with IDs

### ErrorNotification

Sends an error message to be displayed in the webview.

```typescript
interface ErrorNotification {
  command: "error";
  value: string;
}
```

**Fields**:
- `command`: Always `"error"`
- `value`: Human-readable error message

## Webview → Extension Messages

### SelectFiles

User requests to select CSS or HTML/React files.

```typescript
interface SelectFiles {
  command: "selectFiles";
  value: {
    type: "css" | "htmlReact";
  };
}
```

**Fields**:
- `command`: Always `"selectFiles"`
- `value.type`: `"css"` for CSS file selection, `"htmlReact"` for HTML/React selection

### WatchAll

User requests to watch all tracked files.

```typescript
interface WatchAll {
  command: "watchAll";
}
```

**Fields**:
- `command`: Always `"watchAll"`

### WatchSingleFile

User requests to watch a single file.

```typescript
interface WatchSingleFile {
  command: "watchSingleFile";
  value: string;
}
```

**Fields**:
- `command`: Always `"watchSingleFile"`
- `value`: File URI string

### RemoveFile

User requests to remove a single file from tracking.

```typescript
interface RemoveFile {
  command: "removeFile";
  value: string;
}
```

**Fields**:
- `command`: Always `"removeFile"`
- `value`: File URI string

### RemoveAllFiles

User requests to remove all tracked files.

```typescript
interface RemoveAllFiles {
  command: "removeAllFiles";
}
```

**Fields**:
- `command`: Always `"removeAllFiles"`

### StartServer

User requests to start the WebSocket server.

```typescript
interface StartServer {
  command: "startServer";
}
```

**Fields**:
- `command`: Always `"startServer"`

## Error Handling

- Unknown command: Logged as warning; ignored.
- Malformed message: Logged as error; ignored.

## Versioning

Message contracts are versioned by the `command` string. New commands are additive; existing commands must remain backward compatible.
