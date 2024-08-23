// import postcss, { Root } from "postcss";
// import safeParser from "postcss-safe-parser";
// import * as vscode from "vscode";

// export async function updateRule(
//   css: string,
//   selector: string,
//   newValues: { [key: string]: string }
// ): Promise<string> {
//   const root: Root = safeParser(css);
//   let ruleFound = false;
//   let ruleUpdated = false;

//   // Walk through the rules to find the matching selector
//   // root.walkAtRules((atRule) => {
//   //   if (atRule.name === "media") {
//   //     atRule.walkRules((rule) => {
//   //       if (`@${atRule.name} ${atRule.params} ${rule.selector}` === selector) {
//   //         ruleFound = true;
//   //         ruleUpdated = true;
//   //         rule.removeAll(); // Remove all existing declarations for the selector
//   //         Object.entries(newValues).forEach(([prop, value]) => {
//   //           rule.append({ prop, value });
//   //         });
//   //       }
//   //     });
//   //   } else if (atRule.name === "font-face") {
//   //     // Handle @font-face rule if needed
//   //   }
//   // });

//   root.walkRules((rule) => {
//     if (rule.selector === selector) {
//       ruleFound = true;
//       ruleUpdated = true;
//       rule.removeAll(); // Remove all existing declarations
//       Object.entries(newValues).forEach(([prop, value]) => {
//         rule.append({ prop, value });
//       });
//     }
//   });

//   // If the selector was not found, create a new rule
//   if (!ruleFound) {
//     const newRule = postcss.rule({ selector });
//     Object.entries(newValues).forEach(([prop, value]) => {
//       newRule.append({ prop, value });
//     });
//     root.append(newRule);
//     ruleUpdated = true;
//   }

//   // If the rule was updated, return the updated CSS string
//   if (ruleUpdated) {
//     return root.toString();
//   }

//   // If the rule was not updated, and no new rule was created, return the original CSS
//   return css;
// }
import postcss, { Root, Rule, AtRule } from "postcss";
import safeParser from "postcss-safe-parser";

export async function updateRule(
  css: string,
  selector: string,
  newValues: { [key: string]: string }
): Promise<string> {
  const root: Root = safeParser(css);
  let ruleFound = false;

  function updateOrCreateRule(rule: Rule, selector: string, newValues: { [key: string]: string }) {
    let newSelector = rule.selector;
    if (newSelector.includes(",")) {
      newSelector = newSelector
        .split(",")
        .map((s) => s.trim())
        .join(", ");
      console.log(`newSelector ${newSelector}`);
    }
    if (newSelector === selector) {
      ruleFound = true;
      // Remove all existing declarations for this rule
      rule.removeAll();
      // Add new declarations
      Object.entries(newValues).forEach(([prop, value]) => {
        rule.append({ prop, value });
      });
    }
  }

  // Update rules inside media queries
  // root.walkAtRules((atRule: AtRule) => {
  //   if (atRule.name === 'media') {
  //     atRule.walkRules((rule: Rule) => {
  //       updateOrCreateRule(rule, selector, newValues);
  //     });
  //   }
  // });

  // Update top-level rules
  root.walkRules((rule: Rule) => {
    updateOrCreateRule(rule, selector, newValues);
  });

  // If the selector was not found, create a new rule
  if (!ruleFound) {
    const newRule = postcss.rule({ selector });
    Object.entries(newValues).forEach(([prop, value]) => {
      newRule.append({ prop, value });
    });
    root.append(newRule);
  }

  // Return updated CSS if changes were made
  return root.toString();
}
