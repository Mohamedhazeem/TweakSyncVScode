import { StyleService } from "./style-service";
import { createDefaultRegistry } from "@/domain/style/registry";

describe("StyleService.applyToFiles", () => {
  const changes = { classes: { ".btn": { color: "green" } } };

  it("applies changes to files resolvable by the registry and writes them", async () => {
    const written: Record<string, string> = {};
    const service = new StyleService(createDefaultRegistry(), {
      reader: { read: async () => ".btn { color: red; }" },
      writer: { write: async (uri, content) => { written[uri] = content; } },
    });

    const results = await service.applyToFiles(["a.css", "b.css"], changes);

    expect(results).toEqual([
      { fileUri: "a.css", updated: true },
      { fileUri: "b.css", updated: true },
    ]);
    expect(written["a.css"]).toContain("color: green");
    expect(written["b.css"]).toContain("color: green");
  });

  it("skips files with no matching handler", async () => {
    const service = new StyleService(createDefaultRegistry(), {
      reader: { read: async () => "x" },
      writer: { write: async () => {} },
    });

    const results = await service.applyToFiles(["a.txt"], changes);
    expect(results).toEqual([{ fileUri: "a.txt", updated: false }]);
  });

  it("invokes onApplied for each file that changed", async () => {
    const applied: string[] = [];
    const service = new StyleService(createDefaultRegistry(), {
      reader: { read: async () => ".btn { color: red; }" },
      writer: { write: async () => {} },
      onApplied: (uri) => applied.push(uri),
    });

    await service.applyToFiles(["a.css"], changes);
    expect(applied).toEqual(["a.css"]);
  });

  it("does not write when content is unchanged", async () => {
    let writes = 0;
    const service = new StyleService(createDefaultRegistry(), {
      reader: { read: async () => ".btn { color: green; }" },
      writer: { write: async () => { writes += 1; } },
    });

    const results = await service.applyToFiles(["a.css"], changes);
    expect(results[0].updated).toBe(false);
    expect(writes).toBe(0);
  });
});
