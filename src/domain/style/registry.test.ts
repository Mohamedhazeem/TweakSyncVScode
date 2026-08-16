import {
  InMemoryStyleLanguageRegistry,
  createDefaultRegistry,
} from "./registry";
import { StyleLanguageHandler } from "./handler";
import { ParsedStyleDocument, StyleChanges, ValidationResult } from "./types";

class FakeHandler implements StyleLanguageHandler {
  constructor(
    public readonly name: string,
    public readonly extensions: string[]
  ) {}

  parse(_content: string): ParsedStyleDocument {
    return { raw: _content, rules: [], atRules: [] };
  }
  update(doc: ParsedStyleDocument, _changes: StyleChanges): string {
    return doc.raw;
  }
  validate(_content: string): ValidationResult {
    return { isValid: true, errors: [] };
  }
}

describe("InMemoryStyleLanguageRegistry", () => {
  it("registers handlers and resolves them by file extension (case-insensitive)", () => {
    const registry = new InMemoryStyleLanguageRegistry();
    registry.register(new FakeHandler("sass", [".scss", ".sass"]));

    expect(registry.getHandlerForFile("styles.SCSS")).toBeDefined();
    expect(registry.getHandlerForFile("a/b/c.sass")).toBeDefined();
    expect(registry.getHandlerForFile("noext")).toBeUndefined();
    expect(registry.getHandlerForFile("x.css")).toBeUndefined();
  });

  it("returns the registered names", () => {
    const registry = new InMemoryStyleLanguageRegistry();
    registry.register(new FakeHandler("less", [".less"]));
    expect(registry.getRegisteredNames()).toEqual(["less"]);
  });

  it("gracefully ignores malformed handlers (US1 edge case)", () => {
    const registry = new InMemoryStyleLanguageRegistry();
    const good = new FakeHandler("good", [".good"]);
    // @ts-expect-error intentionally malformed
    registry.register({ name: "", extensions: [".x"] });
    // @ts-expect-error intentionally malformed
    registry.register({ name: "bad" });
    // @ts-expect-error intentionally malformed
    registry.register(null);

    expect(registry.getRegisteredNames()).toEqual([]);
    registry.register(good);
    expect(registry.getRegisteredNames()).toEqual(["good"]);
  });

  it("createDefaultRegistry ships with the CSS handler", () => {
    const registry = createDefaultRegistry();
    expect(registry.getHandlerForFile("app.css")).toBeDefined();
    expect(registry.getRegisteredNames()).toContain("css");
  });
});
