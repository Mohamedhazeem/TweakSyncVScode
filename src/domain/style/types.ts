export interface StyleRule {
  /** CSS selector string */
  selector: string;
  /** Property-value declarations */
  declarations: Map<string, string>;
}

export interface AtRule {
  /** At-rule name (e.g., "media", "keyframes") */
  name: string;
  /** At-rule parameters (e.g., "(max-width: 768px)") */
  params: string;
  /** Nested rules within the at-rule */
  rules: StyleRule[];
}

export interface ParsedStyleDocument {
  /** Original raw content */
  raw: string;
  /** Parsed style rules */
  rules: StyleRule[];
  /** Optional at-rules (@media, @keyframes, etc.) */
  atRules: AtRule[];
}

export interface StyleChanges {
  classes?: Record<string, Record<string, string>>;
  ids?: Record<string, Record<string, string>>;
  tags?: Record<string, Record<string, string>>;
  attribute?: Record<string, Record<string, string>>;
  descendant?: Record<string, Record<string, string>>;
  pseudoElementStyles?: Record<string, Record<string, string>>;
  pseudoClassStyles?: Record<string, Record<string, string>>;
  atRules?: Record<string, Record<string, Record<string, string>>>;
}

export interface ValidationResult {
  /** Whether the content is valid */
  isValid: boolean;
  /** Human-readable error messages */
  errors: string[];
}
