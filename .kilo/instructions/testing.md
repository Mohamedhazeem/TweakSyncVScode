# Testing

## Framework

- Integration tests use `vscode-test` (see `npm run test`).
- Test files live in `src/test/`.

## Running Tests

- `npm run test` - runs the full integration test suite.
- `npm run compile-tests` - compiles tests to `out/`.
- `npm run watch-tests` - watches test compilation.
- `npm run pretest` - compiles tests, builds the extension, and runs lint before test.

## Conventions

- Write integration tests against the extension's VS Code API surface.
- Mock WebSocket and file system interactions where possible; avoid requiring Chrome or a real server in unit tests.
- Keep test files alongside the code they test, or in `src/test/` for cross-cutting integration tests.
- Assert behavior, not implementation details.
