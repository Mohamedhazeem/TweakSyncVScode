import postcss from "postcss";
import safeParser from "postcss-safe-parser";
import type { Root, Rule, AtRule as PostcssAtRule } from "postcss";
import { ParsedStyleDocument, StyleChanges } from "../types";
import { normalizeSelector } from "./parser";

interface ResolvedChange {
  selector: string;
  values: Record<string, string>;
  atRule?: string;
}

/**
 * Apply structured style changes to a previously parsed CSS document and return
 * the updated file content. Re-parses the preserved `raw` text with postcss so
 * comments and formatting are retained, then mutates matching rules (or appends
 * new ones) per selector. Hot path is O(selectors * changes).
 */
export function updateCss(document: ParsedStyleDocument, changes: StyleChanges): string {
  const root: Root = safeParser(document.raw);
  const resolved = resolveChanges(changes);

  for (const change of resolved) {
    if (change.atRule) {
      applyToAtRule(root, change.atRule, change.selector, change.values);
    } else {
      applyToSelector(root, change.selector, change.values);
    }
  }

  return root.toString();
}

function resolveChanges(changes: StyleChanges): ResolvedChange[] {
  const result: ResolvedChange[] = [];
  const collect = (
    map: Record<string, Record<string, string>> | undefined,
    atRule?: string
  ): void => {
    if (!map) {
      return;
    }
    for (const [selector, values] of Object.entries(map)) {
      result.push({ selector: normalizeSelector(selector), values, atRule });
    }
  };

  collect(changes.classes);
  collect(changes.ids);
  collect(changes.tags);
  collect(changes.attribute);
  collect(changes.descendant);
  collect(changes.pseudoElementStyles);
  collect(changes.pseudoClassStyles);

  if (changes.atRules) {
    for (const [atRule, selectors] of Object.entries(changes.atRules)) {
      collect(selectors, atRule);
    }
  }

  return result;
}

function applyToSelector(root: Root, selector: string, values: Record<string, string>): void {
  let found = false;
  root.walkRules((rule: Rule) => {
    if (found) {
      return false;
    }
    if (normalizeSelector(rule.selector) === selector) {
      replaceDeclarations(rule, values);
      found = true;
      return false;
    }
    return undefined;
  });

  if (!found) {
    const newRule = postcss.rule({ selector });
    appendDeclarations(newRule, values);
    root.append(newRule);
  }
}

function applyToAtRule(
  root: Root,
  atRuleName: string,
  selector: string,
  values: Record<string, string>
): void {
  let found = false;
  root.walkAtRules((at: PostcssAtRule) => {
    if (found || at.name !== atRuleName) {
      return undefined;
    }
    at.walkRules((rule: Rule) => {
      if (found) {
        return false;
      }
      if (normalizeSelector(rule.selector) === selector) {
        replaceDeclarations(rule, values);
        found = true;
        return false;
      }
      return undefined;
    });
    return undefined;
  });

  if (!found) {
    const at = postcss.atRule({ name: atRuleName, params: "" });
    const newRule = postcss.rule({ selector });
    appendDeclarations(newRule, values);
    at.append(newRule);
    root.append(at);
  }
}

function replaceDeclarations(rule: Rule, values: Record<string, string>): void {
  rule.removeAll();
  appendDeclarations(rule, values);
}

function appendDeclarations(rule: Rule, values: Record<string, string>): void {
  for (const [prop, value] of Object.entries(values)) {
    rule.append({ prop, value });
  }
}
