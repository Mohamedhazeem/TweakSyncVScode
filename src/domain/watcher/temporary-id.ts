import { TWEAKSYNC_ID } from "../../utils/constant";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { JSXAttribute, jsxIdentifier, stringLiteral } from "@babel/types";

/**
 * Pure, editor-agnostic logic for injecting and removing TweakSync temporary
 * identifiers into JSX/TSX/HTML source. Living in the domain layer keeps the
 * algorithm free of any VS Code dependency so it can be unit tested in
 * isolation (User Story 2: modify one module without breaking others).
 */

function generateRandomId(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 9;
  let randomId = "";
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomId;
}

export function injectTemporaryIds(code: string): string {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    JSXOpeningElement(path) {
      const attributes = path.get("attributes");

      const hasTweakSyncId = attributes.some((attrPath) => {
        const attr = attrPath.node;
        return attr.type === "JSXAttribute" && attr.name.name === TWEAKSYNC_ID;
      });

      if (!hasTweakSyncId) {
        const newId = generateRandomId();
        const newAttribute: JSXAttribute = {
          type: "JSXAttribute",
          name: jsxIdentifier(TWEAKSYNC_ID),
          value: stringLiteral(newId),
        };

        path.pushContainer("attributes", newAttribute);
      }
    },
  });

  const { code: transformedCode } = generate(ast);
  return transformedCode;
}

export function removeTemporaryIds(code: string): string {
  const regex = new RegExp(`\\s*${TWEAKSYNC_ID}="[^"]*"`, "g");
  return code.replace(regex, "");
}
