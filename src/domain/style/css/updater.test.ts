import { updateCss } from "./updater";

const base = ".btn {\n  color: red;\n}\n\n.title {\n  font-size: 10px;\n}";

describe("updateCss", () => {
  it("replaces declarations on an existing selector", () => {
    const out = updateCss(
      { raw: base, rules: [], atRules: [] },
      { classes: { ".btn": { color: "green" } } }
    );
    expect(out).toContain("color: green");
    expect(out).not.toMatch(/color:\s*red/);
  });

  it("appends a new rule when the selector is missing", () => {
    const out = updateCss(
      { raw: base, rules: [], atRules: [] },
      { classes: { ".new": { margin: "0" } } }
    );
    expect(out).toContain(".new");
    expect(out).toContain("margin: 0");
  });

  it("updates rules nested inside at-rules", () => {
    const doc = "@media (max-width: 600px) { .box { color: red; } }";
    const out = updateCss(
      { raw: doc, rules: [], atRules: [] },
      { classes: { ".box": { color: "blue" } } }
    );
    expect(out).toContain("color: blue");
  });

  it("handles multiple selectors independently", () => {
    const out = updateCss(
      { raw: base, rules: [], atRules: [] },
      {
        classes: {
          ".btn": { color: "green" },
          ".title": { "font-size": "20px" },
        },
      }
    );
    expect(out).toContain("color: green");
    expect(out).toContain("font-size: 20px");
  });
});
