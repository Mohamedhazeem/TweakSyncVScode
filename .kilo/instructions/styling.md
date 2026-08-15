# Styling

## CSS Updates

- CSS files are updated via PostCSS (`postcss-safe-parser`) in `src/scripts/updateRule.ts` and `src/scripts/updateCSSContent.ts`.
- Selector normalization strips redundant whitespace before matching.

## Webview Styles

- Webview styles live in `src/webview/styles/index.css`.
- Built with `css-loader` / `style-loader` or `mini-css-extract-plugin`.

## Tailwind CSS

- Tailwind CSS v4 is configured via `tailwind.config.js` and PostCSS.
- Uses shadcn/ui components and Tailwind utility classes in the webview.
