export function updateRule(
  selector: string,
  rules: object,
  contentString: string
) {
  let newRule = `${selector} {`;
  Object.entries(rules).forEach(([prop, val]) => {
    const formattedValue =
      typeof val === "object"
        ? Object.entries(val)
            .map(([innerProp, innerVal]) => {
              console.log(
                `innerProp and innerVal: ${innerProp} and ${innerVal}`
              );
              return `${innerProp}: ${innerVal}`;
            })
            .join(", ")
        : `${prop}: ${val}`;
    console.log(`prop and innerVal: ${prop} and ${val}`);
    newRule += `\n  ${formattedValue};`;
  });
  newRule += `\n}`;
  const regex = new RegExp(
    `${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*{[^}]*}`,
    "g"
  );
  const matches = contentString.match(regex);
  if (matches) {
    console.log(`Old rule: ${matches[0]}`);
  } else {
    console.log(`No match found for ${selector}`);
  }
  console.log(`New rule: ${newRule}`);
  contentString = contentString.replace(regex, newRule);
  return contentString;
}
