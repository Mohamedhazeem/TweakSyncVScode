import safeParser from "postcss-safe-parser";
import type { Root, Rule, AtRule as PostcssAtRule, Node } from "postcss";
import { ParsedStyleDocument, StyleRule, AtRule } from "../types";

/**
 * Parse raw CSS content into a {@link ParsedStyleDocument}. Uses the fault
 * tolerant `postcss-safe-parser` so malformed input never throws (the
 * `StyleLanguageHandler` contract forbids throwing from `parse`). The original
 * `raw` text is preserved so downstream updates can retain formatting.
 */
export function parseCss(content: string): ParsedStyleDocument {
  const rules: StyleRule[] = [];
  const atRules: AtRule[] = [];

  const root: Root = safeParser(content);

  for (const node of root.nodes ?? []) {
    if (isRule(node)) {
      rules.push(toStyleRule(node));
    } else if (isAtRule(node)) {
      const nested: StyleRule[] = [];
      for (const child of node.nodes ?? []) {
        if (isRule(child)) {
          nested.push(toStyleRule(child));
        }
      }
      atRules.push({
        name: node.name,
        params: typeof node.params === "string" ? node.params : "",
        rules: nested,
      });
    }
  }

  return { raw: content, rules, atRules };
}

function toStyleRule(rule: Rule): StyleRule {
  const declarations = new Map<string, string>();
  for (const child of rule.nodes ?? []) {
    if (child.type === "decl") {
      declarations.set(child.prop, child.value);
    }
  }
  return {
    selector: normalizeSelector(rule.selector),
    declarations,
  };
}

function isRule(node: Node): node is Rule {
  return node.type === "rule";
}

function isAtRule(node: Node): node is PostcssAtRule {
  return node.type === "atrule";
}

export function normalizeSelector(selector: string): string {
  return selector
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(", ");
}
