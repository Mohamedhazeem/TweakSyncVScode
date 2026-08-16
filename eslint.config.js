const tseslintParser = require("@typescript-eslint/parser");
const tseslintPlugin = require("@typescript-eslint/eslint-plugin");

/**
 * Flat ESLint config (ESLint 9+/10). Replaces the legacy `.eslintrc.json`.
 * Mirrors the previous rule set: TypeScript parsing, relaxed naming
 * convention (imports may be camelCase/PascalCase), and the same lint warnings.
 */
module.exports = [
  {
    ignores: ["out/**", "dist/**", "node_modules/**", "**/*.d.ts"],
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "import",
          format: ["camelCase", "PascalCase"],
        },
      ],
      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      semi: "warn",
    },
  },
];
