import { StyleLanguageRegistry } from "../../domain/style/registry";
import { StyleChanges } from "../../domain/style/types";

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

      if (updated !== original) {
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
