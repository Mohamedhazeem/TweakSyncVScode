import { ParsedStyleDocument, StyleChanges, ValidationResult } from "./types";

/**
 * Contract that all styling language handlers must implement. Enables the
 * extension to support multiple styling languages (CSS, Sass, Less, Tailwind)
 * through a plug-in mechanism without modifying core logic.
 *
 * Implementations MUST be stateless. All state is managed by the registry or
 * the calling service. Implementations MUST NOT throw from any method; errors
 * are surfaced via {@link ValidationResult} or logged.
 */
export interface StyleLanguageHandler {
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
