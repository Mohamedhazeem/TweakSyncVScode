import postcss from "postcss";

// normal logiconly not scss specify logic
async function convertCSStoSCSS(css: string) {
  const root = postcss.parse(css);
  let scss = "";

  root.walk((node) => {
    if (node.type === "rule") {
      scss += `${node.selector} {\n`;
      node.walkDecls((decl) => {
        scss += `  ${decl.prop}: ${decl.value};\n`;
      });
      scss += "}\n";
    } else if (node.type === "atrule") {
      scss += `@${node.name} ${node.params} {\n`;
      node.walkRules((rule) => {
        scss += `  ${rule.selector} {\n`;
        rule.walkDecls((decl) => {
          scss += `    ${decl.prop}: ${decl.value};\n`;
        });
        scss += "  }\n";
      });
      scss += "}\n";
    }
  });

  return scss;
}
