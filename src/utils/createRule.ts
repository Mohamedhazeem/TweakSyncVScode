export function createRule(
  selector: string,
  rules: object,
  contentString: string
) {
  let newRule = `${selector} {`;
  Object.entries(rules).forEach(([prop, val]) => {
    // Format the value according to its type
    const formattedValue =
      typeof val === "object"
        ? Object.entries(val)
            .map(([innerProp, innerVal]) => {
              return `${innerProp}: ${innerVal}`;
            })
            .join(", ")
        : `${prop}: ${val}`;
    newRule += `\n  ${formattedValue};`;
  });
  newRule += `\n}`;
  contentString += `\n${newRule}`;
  return contentString;
}
