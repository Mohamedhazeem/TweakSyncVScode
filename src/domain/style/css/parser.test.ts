import { parseCss, normalizeSelector } from "./parser";

describe("parseCss", () => {
  it("extracts rules with normalized selectors and declarations", () => {
    const doc = parseCss(".a, .b { color: red; } .c { font-size: 12px; }");
    expect(doc.rules).toHaveLength(2);
    expect(doc.rules[0].selector).toBe(".a, .b");
    expect(doc.rules[0].declarations.get("color")).toBe("red");
    expect(doc.rules[1].selector).toBe(".c");
    expect(doc.rules[1].declarations.get("font-size")).toBe("12px");
  });

  it("extracts nested rules inside at-rules", () => {
    const doc = parseCss("@media (max-width: 600px) { .box { color: blue; } }");
    expect(doc.atRules).toHaveLength(1);
    expect(doc.atRules[0].name).toBe("media");
    expect(doc.atRules[0].rules).toHaveLength(1);
    expect(doc.atRules[0].rules[0].selector).toBe(".box");
  });

  it("never throws on malformed input (tolerant parser)", () => {
    expect(() => parseCss("}} broken { :: }")).not.toThrow();
  });
});

describe("normalizeSelector", () => {
  it("trims and dedupes comma-separated selectors", () => {
    expect(normalizeSelector("  .a ,.b , .a ")).toBe(".a, .b, .a");
  });
});
