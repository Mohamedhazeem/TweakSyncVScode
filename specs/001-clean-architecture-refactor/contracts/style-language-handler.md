# Style Language Handler Contract

**Date**: 2026-08-16  
**Feature**: Clean Architecture Refactor  
**Status**: Draft

## Overview

This document defines the interface contract that all styling language handlers must implement. This contract enables the extension to support multiple styling languages (CSS, Sass, Less, Tailwind) through a plug-in mechanism without modifying core logic.

## Interface

```typescript
interface StyleLanguageHandler {
  /** Unique identifier for the language (e.g., "css", "sass", "less", "tailwind") */
  readonly name: string;

  /** File extensions this handler supports (e.g., [".css", ".scss"]) */
  readonly extensions: string[];

  /**
   * Parse raw file content into a structured document.
   * @param content Raw file content as string
   * @returns Parsed representation of the style document
   */
  parse(content: string): ParsedStyleDocument;

  /**
   * Apply style changes to a parsed document and return updated content.
   * @param document Previously parsed document
   * @param changes Structured style changes to apply
   * @returns Updated file content as string
   */
  update(document: ParsedStyleDocument, changes: StyleChanges): string;

  /**
   * Validate file content and return any errors.
   * @param content Raw file content as string
   * @returns Validation result with optional errors
   */
  validate(content: string): ValidationResult;
}
```

## Supporting Types

### ParsedStyleDocument

```typescript
interface ParsedStyleDocument {
  /** Original raw content */
  raw: string;
  /** Parsed style rules */
  rules: StyleRule[];
  /** Optional at-rules (@media, @keyframes, etc.) */
  atRules: AtRule[];
}
```

### StyleRule

```typescript
interface StyleRule {
  /** CSS selector string */
  selector: string;
  /** Property-value declarations */
  declarations: Map<string, string>;
}
```

### AtRule

```typescript
interface AtRule {
  /** At-rule name (e.g., "media", "keyframes") */
  name: string;
  /** At-rule parameters (e.g., "(max-width: 768px)") */
  params: string;
  /** Nested rules within the at-rule */
  rules: StyleRule[];
}
```

### StyleChanges

```typescript
interface StyleChanges {
  classes?: Record<string, Record<string, string>>;
  ids?: Record<string, Record<string, string>>;
  tags?: Record<string, Record<string, string>>;
  attribute?: Record<string, Record<string, string>>;
  descendant?: Record<string, Record<string, string>>;
  pseudoElementStyles?: Record<string, Record<string, string>>;
  pseudoClassStyles?: Record<string, Record<string, string>>;
  atRules?: Record<string, Record<string, Record<string, string>>>;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  /** Whether the content is valid */
  isValid: boolean;
  /** Human-readable error messages */
  errors: string[];
}
```

## Registration

Handlers are registered with the `StyleLanguageRegistry`:

```typescript
interface StyleLanguageRegistry {
  /** Register a new style language handler */
  register(handler: StyleLanguageHandler): void;

  /** Get the handler responsible for a given file URI */
  getHandlerForFile(fileUri: string): StyleLanguageHandler | undefined;

  /** Get all registered handler names */
  getRegisteredNames(): string[];
}
```

## Existing Implementations

### CssStyleHandler

The current CSS-only implementation. Provides:
- `parse`: Tokenizes CSS into rules and declarations
- `update`: Applies selector-based changes to rule declarations
- `validate`: Checks for malformed selectors or declarations

## Extension Rules

- New handlers MUST implement all interface methods.
- Handlers MUST NOT throw exceptions from `parse`, `update`, or `validate`; errors must be returned via `ValidationResult` or logged.
- Handlers MUST be stateless; all state is managed by the registry or calling service.
- Handlers MUST preserve formatting and comments in the `raw` field when possible.
