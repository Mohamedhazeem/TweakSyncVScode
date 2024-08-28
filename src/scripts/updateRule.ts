import postcss, { Root, Rule, AtRule } from "postcss";
import safeParser from "postcss-safe-parser";

// export async function updateRule(
//   css: string,
//   selector: string,
//   newValues: { [key: string]: string }
// ): Promise<string> {
//   const root: Root = safeParser(css);
//   let ruleFound = false;

//   function updateOrCreateRule(rule: Rule, selector: string, newValues: { [key: string]: string }) {
//     let newSelector = rule.selector;
//     if (newSelector.includes(",")) {
//       newSelector = newSelector
//         .split(",")
//         .map((s) => s.trim())
//         .join(", ");
//     }
//     if (newSelector === selector) {
//       ruleFound = true;
//       // Remove all existing declarations for this rule
//       rule.removeAll();
//       // Add new declarations
//       Object.entries(newValues).forEach(([prop, value]) => {
//         rule.append({ prop, value });
//       });
//     }
//   }

//   // Update rules inside media queries
//   // root.walkAtRules((atRule: AtRule) => {
//   //   if (atRule.name === 'media') {
//   //     atRule.walkRules((rule: Rule) => {
//   //       updateOrCreateRule(rule, selector, newValues);
//   //     });
//   //   }
//   // });

//   // Update top-level rules
//   root.walkRules((rule: Rule) => {
//     updateOrCreateRule(rule, selector, newValues);
//   });

//   // If the selector was not found, create a new rule
//   if (!ruleFound) {
//     const newRule = postcss.rule({ selector });
//     Object.entries(newValues).forEach(([prop, value]) => {
//       newRule.append({ prop, value });
//     });
//     root.append(newRule);
//   }

//   // Return updated CSS if changes were made
//   return root.toString();
// }

export async function updateRule(
  css: string,
  selector: string,
  newValues: { [key: string]: string }
): Promise<string> {
  const root: Root = safeParser(css);
  let ruleFound = false;

  // Normalize the selector
  const normalizedSelector = selector
    .split(",")
    .map((s) => s.trim())
    .join(", ");

  function updateOrCreateRule(rule: Rule) {
    let currentSelector = rule.selector
      .split(",")
      .map((s) => s.trim())
      .join(", ");

    if (currentSelector === normalizedSelector) {
      ruleFound = true;
      rule.removeAll(); // Remove all existing declarations
      for (const [prop, value] of Object.entries(newValues)) {
        rule.append({ prop, value });
      }
      return true; // Exit early if a match is found and updated
    }
    return false;
  }

  // Walk through the rules and update if the selector matches
  root.walkRules((rule: Rule) => {
    if (updateOrCreateRule(rule)) {
      return false;
    } // Stop walking if update is successful
  });

  // If the selector was not found, create a new rule
  if (!ruleFound) {
    const newRule = postcss.rule({ selector: normalizedSelector });
    for (const [prop, value] of Object.entries(newValues)) {
      newRule.append({ prop, value });
    }
    root.append(newRule);
  }

  // Return the updated CSS
  return root.toString();
}
