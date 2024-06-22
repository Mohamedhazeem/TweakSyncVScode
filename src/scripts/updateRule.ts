import postcss, { Root } from "postcss";
import safeParser from "postcss-safe-parser";
export async function updateRule(
  css: string,
  selector: string,
  newValues: { [key: string]: string }
): Promise<string> {
  // const root = postcss.parse(css);
  const root: Root = safeParser(css);

  // let ruleFound = false;
  root.walkAtRules((atRule) => {
    if (atRule.name === "media") {
      // Walk through all rules inside this @media rule
      console.log(atRule);
      atRule.walkRules((rule) => {
        if (`@${atRule.name} ${atRule.params} ${rule.selector}` === selector) {
          //ruleFound = true;
          console.info(
            `rule.selector is ${atRule.params} ${rule.selector} and selector is ${selector}`
          );
          rule.removeAll(); // Remove all existing declarations for the selector
          Object.entries(newValues).forEach(([prop, value]) => {
            rule.append({ prop, value });
          });
        } else {
          // TO CREATE A NEW RULE//
          // if (!ruleFound) {
          //   const newRule = postcss.rule({ selector: selector.split(' ').slice(1).join(' ') });
          //   Object.entries(newValues).forEach(([prop, value]) => {
          //     newRule.append({ prop, value });
          //   });
          //   atRule.append(newRule);
          // }
          console.warn(
            `rule.selector is @${atRule.name} ${atRule.params} ${rule.selector} and selector is ${selector}`
          );
        }
      });
    } else if (atRule.name === "font-face") {
      // individual atrule logics
    }
  });

  root.walkRules((rule) => {
    if (rule.selector === selector) {
      //ruleFound=true;
      rule.removeAll(); // Remove all existing declarations
      Object.entries(newValues).forEach(([prop, value]) => {
        rule.append({ prop, value });
      });
    }
    // TO CREATE A NEW RULE//
    // if (!ruleFound) {
    //   const newRule = postcss.rule({ selector });
    //   Object.entries(newValues).forEach(([prop, value]) => {
    //     newRule.append({ prop, value });
    //   });
    //   root.append(newRule);
    // }
  });

  return root.toString();
}
