import { StyleLanguageRegistry } from "../../domain/style/registry";
import { StyleChanges, StyleRule, AtRule, ParsedStyleDocument } from "../../domain/style/types";

/** Reads the current text content of a style file identified by URI string. */
export interface StyleFileReader {
  read(fileUri: string): Promise<string>;
}

/** Persists updated text content for a style file identified by URI string. */
export interface StyleFileWriter {
  write(fileUri: string, content: string): Promise<void>;
}

export interface StyleServiceDeps {
  reader: StyleFileReader;
  writer: StyleFileWriter;
  /** Optional callback invoked for each file that was actually modified. */
  onApplied?: (fileUri: string) => void;
}

export interface StyleApplyResult {
  fileUri: string;
  updated: boolean;
}

/**
 * Application-layer use case that resolves the appropriate
 * {@link StyleLanguageHandler} for each file (via the registry) and applies a
 * set of style changes. Depends only on the registry abstraction and injected
 * file ports, keeping the domain logic free of VS Code and WebSocket concerns.
 */
export class StyleService {
  constructor(
    private readonly registry: StyleLanguageRegistry,
    private readonly deps: StyleServiceDeps
  ) {}

  async applyToFiles(
    fileUris: string[],
    changes: StyleChanges
  ): Promise<StyleApplyResult[]> {
    const results: StyleApplyResult[] = [];

    for (const fileUri of fileUris) {
      const handler = this.registry.getHandlerForFile(fileUri);
      if (!handler) {
        results.push({ fileUri, updated: false });
        continue;
      }

      const original = await this.deps.reader.read(fileUri);
      const document = handler.parse(original);
      const updated = handler.update(document, changes);

      // Compare structurally rather than by raw string: `update` re-serializes
      // via postcss, which reformats (e.g. re-indents) even when the change is
      // a no-op, so an exact-string check would always report a write. The
      // declaration maps are normalized to plain objects for stable comparison.
      const changed = !isStructurallyEqual(handler.parse(updated), document);

      if (changed) {
        await this.deps.writer.write(fileUri, updated);
        this.deps.onApplied?.(fileUri);
        results.push({ fileUri, updated: true });
      } else {
        results.push({ fileUri, updated: false });
      }
    }

    return results;
  }
}

/**
 * Structural equality that ignores raw-text formatting. Declaration `Map`s are
 * converted to plain objects so `JSON.stringify` reflects their contents
 * (it would otherwise serialize a `Map` as `{}`).
 */
function isStructurallyEqual(
  a: ParsedStyleDocument,
  b: ParsedStyleDocument
): boolean {
  return (
    JSON.stringify(normalizeRules(a.rules)) ===
      JSON.stringify(normalizeRules(b.rules)) &&
    JSON.stringify(normalizeAtRules(a.atRules)) ===
      JSON.stringify(normalizeAtRules(b.atRules))
  );
}

function normalizeRules(rules: StyleRule[]): unknown {
  return rules.map((rule) => ({
    selector: rule.selector,
    declarations: Object.fromEntries(rule.declarations),
  }));
}

function normalizeAtRules(atRules: AtRule[]): unknown {
  return atRules.map((at) => ({
    name: at.name,
    params: at.params,
    rules: normalizeRules(at.rules),
  }));
}
