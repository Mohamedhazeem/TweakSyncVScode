# Testing

## Framework

- Integration tests use `vscode-test` (see `npm run test`).
- Unit tests use Jest with per-layer project configs (`jest.config.js`).
- Test files live in `src/test/` for integration tests; unit tests live alongside source files (`*.test.ts`).

## Running Tests

- `npm run test` - runs the full integration test suite.
- `npm run test:unit` - runs all Jest unit tests.
- `npm run test:domain` - runs domain layer unit tests only.
- `npm run test:application` - runs application layer unit tests only.
- `npm run test:infrastructure` - runs infrastructure layer unit tests only.
- `npm run compile-tests` - compiles tests to `out/`.
- `npm run watch-tests` - watches test compilation.
- `npm run pretest` - compiles tests, builds the extension, and runs lint before test.

## Conventions

- Write integration tests against the extension's VS Code API surface.
- Mock WebSocket and file system interactions where possible; avoid requiring Chrome or a real server in unit tests.
- Assert behavior, not implementation details.
- Domain and application tests should not import from `infrastructure/` or `vscode`.
