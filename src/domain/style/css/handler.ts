import postcss from "postcss";
import { StyleLanguageHandler } from "../handler";
import { ParsedStyleDocument, StyleChanges, ValidationResult } from "../types";
import { parseCss } from "./parser";
import { updateCss } from "./updater";

/**
 * CSS implementation of {@link StyleLanguageHandler}. Stateless: all parsing and
 * update state lives in the returned {@link ParsedStyleDocument}. No method
 * throws; validation errors are reported through {@link ValidationResult}.
 */
export class CssStyleHandler implements StyleLanguageHandler {
  readonly name = "css";
  readonly extensions: string[] = [".css"];

  parse(content: string): ParsedStyleDocument {
    return parseCss(content);
  }

  update(document: ParsedStyleDocument, changes: StyleChanges): string {
    return updateCss(document, changes);
  }

  validate(content: string): ValidationResult {
    try {
      // The strict parser surfaces real syntax errors that the tolerant
      // parser used for `parse` silently recovers from.
      postcss.parse(content);
      return { isValid: true, errors: [] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { isValid: false, errors: [message] };
    }
  }
}
