import { ExternalStyles, SelectorProcessType } from "../types/ElementTypes";
import { updateRule } from "./updateRule";

export async function updateCSSContent(css: string, styles: ExternalStyles): Promise<string> {
  let updatedCSS = css;

  const selectorsToProcess: Array<SelectorProcessType> = [];

  // Collect all selectors and newValues into an array
  externalSelectors(styles, selectorsToProcess);

  // Process selectors within @media rules
  // atRulesSelectors(styles, selectorsToProcess);

  // Process each selector
  for (const [selector, newValues] of selectorsToProcess) {
    updatedCSS = await updateRule(updatedCSS, selector, newValues);
  }

  return updatedCSS;
}
function atRulesSelectors(
  styles: ExternalStyles,
  selectorsToProcess: [string, { [key: string]: string }][]
) {
  if (styles.atRules) {
    Object.entries(styles.atRules).forEach(([atRule, nestedSelectors]) => {
      Object.entries(nestedSelectors).forEach(([selector, newValues]) => {
        selectorsToProcess.push([`${atRule} ${selector}`, newValues]);
      });
    });
  }
}

function externalSelectors(
  styles: ExternalStyles,
  selectorsToProcess: [string, { [key: string]: string }][]
) {
  if (styles.classes) {
    Object.entries(styles.classes).forEach(([selector, newValues]) => {
      selectorsToProcess.push([selector, newValues]);
    });
  }
  if (styles.ids) {
    Object.entries(styles.ids).forEach(([selector, newValues]) => {
      selectorsToProcess.push([selector, newValues]);
    });
  }
  if (styles.tags) {
    Object.entries(styles.tags).forEach(([selector, newValues]) => {
      selectorsToProcess.push([selector, newValues]);
    });
  }
  if (styles.attribute) {
    Object.entries(styles.attribute).forEach(([selector, newValues]) => {
      selectorsToProcess.push([selector, newValues]);
    });
  }
  if (styles.descendant) {
    Object.entries(styles.descendant).forEach(([selector, newValues]) => {
      selectorsToProcess.push([selector, newValues]);
    });
  }
  if (styles.pseudoElementStyles) {
    Object.entries(styles.pseudoElementStyles).forEach(([selector, newValues]) => {
      selectorsToProcess.push([selector, newValues]);
    });
  }
  if (styles.pseudoClassStyles) {
    Object.entries(styles.pseudoClassStyles).forEach(([selector, newValues]) => {
      selectorsToProcess.push([selector, newValues]);
    });
  }
}
