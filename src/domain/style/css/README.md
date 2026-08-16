# `domain/style/css`

Pure, framework-agnostic CSS handling for the style-language extension point.

| File | Responsibility |
|------|---------------|
| `parser.ts` | `parseCss(content)` — turns raw CSS text into a `ParsedStyleDocument` using the fault-tolerant `postcss-safe-parser`. The original text is preserved so later updates keep formatting. |
| `updater.ts` | `updateCss(document, changes)` — applies `StyleChanges` (the structured style edits from the Chrome client) back to the parsed document and returns updated CSS text. |
| `handler.ts` | `CssStyleHandler` — the CSS implementation of the `StyleLanguageHandler` contract (stateless `parse` / `update` / `validate`). |

**Why this module exists:** these files are the clean replacement for the legacy
`src/scripts/updateCSSContent.ts` and `src/scripts/updateRule.ts`. New styling
languages (Sass, Less, Tailwind) are added by implementing `StyleLanguageHandler`
and registering them on the registry — no change to this module (Open/Closed).
