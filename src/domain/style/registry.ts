import { StyleLanguageHandler } from "./handler";
import { CssStyleHandler } from "./css/handler";

/**
 * Registry that manages styling language handlers. Resolves the appropriate
 * handler for a given file by extension, keeping the core unaware of any
 * specific language implementation (Open/Closed principle).
 */
export interface StyleLanguageRegistry {
  /** Register a new style language handler */
  register(handler: StyleLanguageHandler): void;

  /** Get the handler responsible for a given file URI */
  getHandlerForFile(fileUri: string): StyleLanguageHandler | undefined;

  /** Get all registered handler names */
  getRegisteredNames(): string[];
}

/**
 * In-memory implementation of {@link StyleLanguageRegistry}. Indexes handlers
 * by name and by file extension (O(1) lookup) to satisfy Big O compliance on
 * the hot path that resolves handlers for incoming file updates.
 */
export class InMemoryStyleLanguageRegistry implements StyleLanguageRegistry {
  private readonly handlersByName: Map<string, StyleLanguageHandler> = new Map();
  private readonly handlersByExtension: Map<string, StyleLanguageHandler> = new Map();

  register(handler: StyleLanguageHandler): void {
    this.handlersByName.set(handler.name, handler);
    for (const ext of handler.extensions) {
      this.handlersByExtension.set(ext.toLowerCase(), handler);
    }
  }

  getHandlerForFile(fileUri: string): StyleLanguageHandler | undefined {
    const lastDot = fileUri.lastIndexOf(".");
    if (lastDot === -1) {
      return undefined;
    }
    const ext = fileUri.slice(lastDot).toLowerCase();
    return this.handlersByExtension.get(ext);
  }

  getRegisteredNames(): string[] {
    return Array.from(this.handlersByName.keys());
  }
}

/**
 * Builds a registry pre-populated with the built-in CSS handler. New styling
 * languages can be added by registering additional handlers on the returned
 * instance without touching any core module (Open/Closed principle).
 */
export function createDefaultRegistry(): StyleLanguageRegistry {
  const registry = new InMemoryStyleLanguageRegistry();
  registry.register(new CssStyleHandler());
  return registry;
}
