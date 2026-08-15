# Data Model: Clean Architecture Refactor

**Date**: 2026-08-16  
**Feature**: Clean Architecture Refactor  
**Status**: Draft

## Entities

### StyleLanguageHandler

A self-contained module responsible for parsing, validating, and transforming a specific styling language format.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique language identifier (e.g., `"css"`, `"sass"`, `"less"`) |
| `extensions` | `string[]` | File extensions this handler supports (e.g., `[".css", ".scss"]`) |
| `parse` | `(content: string) => ParsedStyleDocument` | Parses raw file content into a structured document |
| `update` | `(document: ParsedStyleDocument, changes: StyleChanges) => string` | Applies style changes and returns updated content |
| `validate` | `(content: string) => ValidationResult` | Validates content and returns errors if invalid |

**Relationships**: Registered with `StyleLanguageRegistry`; used by `StyleService` to process files.

### StyleLanguageRegistry

Maintains the collection of registered styling language handlers.

| Field | Type | Description |
|-------|------|-------------|
| `handlers` | `Map<string, StyleLanguageHandler>` | Registered handlers keyed by language name |
| `register` | `(handler: StyleLanguageHandler) => void` | Adds a new handler |
| `getHandlerForFile` | `(fileUri: Uri) => StyleLanguageHandler \| undefined` | Returns the appropriate handler for a file |

**Relationships**: Owns `StyleLanguageHandler` instances; queried by `StyleService`.

### FileIdMap

Represents a tracked HTML/React file and its injected temporary IDs.

| Field | Type | Description |
|-------|------|-------------|
| `fileUri` | `string` | VS Code file URI string |
| `ids` | `string[]` | Array of injected temporary IDs found in the file |

**Relationships**: Stored in `WorkspaceState`; managed by `FileWatcherService` and temporary ID disposables.

### ParsedStyleDocument

Internal representation of a parsed styling language document.

| Field | Type | Description |
|-------|------|-------------|
| `raw` | `string` | Original file content |
| `rules` | `StyleRule[]` | Parsed style rules with selectors and declarations |
| `atRules` | `AtRule[]` | Optional at-rules (`@media`, `@keyframes`, etc.) |

**Relationships**: Produced by `StyleLanguageHandler.parse`; consumed by `StyleLanguageHandler.update`.

### StyleRule

A single style rule within a styling language document.

| Field | Type | Description |
|-------|------|-------------|
| `selector` | `string` | CSS selector string |
| `declarations` | `Map<string, string>` | Property-value pairs |

**Relationships**: Part of `ParsedStyleDocument.rules`.

### ExternalStyles (Message Contract)

Incoming style changes from the Chrome client.

| Field | Type | Description |
|-------|------|-------------|
| `classes` | `Record<string, Record<string, string>>` | Class-based style changes |
| `ids` | `Record<string, Record<string, string>>` | ID-based style changes |
| `tags` | `Record<string, Record<string, string>>` | Tag-based style changes |
| `attribute` | `Record<string, Record<string, string>>` | Attribute-based style changes |
| `descendant` | `Record<string, Record<string, string>>` | Descendant selector changes |
| `pseudoElementStyles` | `Record<string, Record<string, string>>` | Pseudo-element changes |
| `pseudoClassStyles` | `Record<string, Record<string, string>>` | Pseudo-class changes |
| `atRules` | `Record<string, Record<string, Record<string, string>>>` | At-rule nested changes |

**Relationships**: Deserialized from WebSocket messages; applied via `StyleService`.

### WebviewMessage (Message Contract)

Messages sent from the extension host to the webview panel.

| Field | Type | Description |
|-------|------|-------------|
| `command` | `string` | Message command identifier |
| `value` | `unknown` | Command payload |
| `files` | `{ css: string[]; htmlReact: FileIdMap[] }` | Updated file lists |

**Relationships**: Dispatched by `WebviewMessageBus`; consumed by React webview.

### ExtensionMessage (Message Contract)

Messages sent from the webview to the extension host.

| Field | Type | Description |
|-------|------|-------------|
| `command` | `string` | Message command identifier |
| `value` | `unknown` | Command payload |

**Relationships**: Dispatched by webview; handled by `CommandRegistry`.

## State Transitions

### File Tracking Lifecycle

1. **Collected**: User selects a file via webview or command palette.
2. **Watched**: File is injected with temporary IDs and added to the watch list.
3. **Updated**: File changes on disk; watcher detects change and re-injects IDs.
4. **Removed**: User removes file; temporary IDs are cleaned up and file is removed from state.

### Style Update Lifecycle

1. **Received**: Chrome client sends `ElementStyles` via WebSocket.
2. **Routed**: WebSocket server routes message to `StyleService`.
3. **Resolved**: `StyleService` selects appropriate `StyleLanguageHandler` based on file extension.
4. **Applied**: Handler updates the style document and returns new content.
5. **Persisted**: Updated content is written to disk via VS Code API.
6. **Acknowledged**: Success or error is logged and optionally shown to user.
