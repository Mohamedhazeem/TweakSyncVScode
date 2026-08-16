import { CssStyleHandler } from "./handler";

describe("CssStyleHandler", () => {
  const handler = new CssStyleHandler();

  it("reports its name and extensions", () => {
    expect(handler.name).toBe("css");
    expect(handler.extensions).toEqual([".css"]);
  });

  it("parses and returns a structured document", () => {
    const doc = handler.parse(".a { color: red; }");
    expect(doc.raw).toContain("color: red");
    expect(doc.rules[0].selector).toBe(".a");
  });

  it("applies changes through update", () => {
    const doc = handler.parse(".a { color: red; }");
    const updated = handler.update(doc, { classes: { ".a": { color: "blue" } } });
    expect(updated).toContain("color: blue");
  });

  it("validates content and surfaces syntax errors", () => {
    expect(handler.validate(".a { color: red; }").isValid).toBe(true);
    // postcss is tolerant, but unbalanced braces are still reported
    const result = handler.validate(".a { color: red; ");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
