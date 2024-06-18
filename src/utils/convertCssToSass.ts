import postcss, { Root, ChildNode, Rule, AtRule } from "postcss";

// normal logiconly not sass specify logic
async function convertCSStoSASS(css: string): Promise<string> {
  const root: Root = postcss.parse(css);
  let sass = "";

  function walkNode(node: ChildNode, level: number = 0): void {
    const indent = "  ".repeat(level);

    if (node.type === "rule") {
      const rule = node as Rule;
      sass += `${indent}${rule.selector}\n`;
      rule.walkDecls((decl) => {
        sass += `${indent}  ${decl.prop}: ${decl.value}\n`;
      });
    } else if (node.type === "atrule") {
      const atRule = node as AtRule;
      sass += `${indent}@${atRule.name} ${atRule.params}\n`;
      atRule.each((child) => {
        walkNode(child, level + 1);
      });
    }
  }

  root.each((node) => {
    walkNode(node);
  });

  return sass;
}
