# Styling

## CSS Updates

- CSS parsing and updates are handled by the domain CSS handler (`src/domain/style/css/handler.ts`) using PostCSS (`postcss-safe-parser`).
- The application `StyleService` (`src/application/services/style-service.ts`) coordinates reading, parsing, updating, and writing style files.
- Selector normalization strips redundant whitespace before matching.

## Webview Styles

- Webview styles live in `src/webview/styles/index.css`.
- Built with `css-loader` / `style-loader` or `mini-css-extract-plugin`.

## Tailwind CSS

- Tailwind CSS v4 is configured via `tailwind.config.js` and PostCSS.
- Uses shadcn/ui components and Tailwind utility classes in the webview.
