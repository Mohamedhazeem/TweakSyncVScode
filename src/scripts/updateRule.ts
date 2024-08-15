import postcss, { Root } from "postcss";
import safeParser from "postcss-safe-parser";
import * as vscode from "vscode";

export async function updateRule(
  css: string,
  selector: string,
  newValues: { [key: string]: string }
): Promise<string> {
  const root: Root = safeParser(css);
  let ruleFound = false;
  let ruleUpdated = false;

  // Walk through the rules to find the matching selector
  root.walkAtRules((atRule) => {
    if (atRule.name === "media") {
      atRule.walkRules((rule) => {
        if (`@${atRule.name} ${atRule.params} ${rule.selector}` === selector) {
          ruleFound = true;
          ruleUpdated = true;
          rule.removeAll(); // Remove all existing declarations for the selector
          Object.entries(newValues).forEach(([prop, value]) => {
            rule.append({ prop, value });
          });
        }
      });
    } else if (atRule.name === "font-face") {
      // Handle @font-face rule if needed
    }
  });

  root.walkRules((rule) => {
    if (rule.selector === selector) {
      ruleFound = true;
      ruleUpdated = true;
      rule.removeAll(); // Remove all existing declarations
      Object.entries(newValues).forEach(([prop, value]) => {
        rule.append({ prop, value });
      });
    }
  });

  // If the selector was not found, create a new rule
  if (!ruleFound) {
    const newRule = postcss.rule({ selector });
    Object.entries(newValues).forEach(([prop, value]) => {
      newRule.append({ prop, value });
    });
    root.append(newRule);
    ruleUpdated = true;
  }

  // If the rule was updated, return the updated CSS string
  if (ruleUpdated) {
    return root.toString();
  }

  // If the rule was not updated, and no new rule was created, return the original CSS
  return css;
}
