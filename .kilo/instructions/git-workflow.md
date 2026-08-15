# Git Workflow

## Commits

- Use imperative mood in commit messages: "Add", "Fix", "Update", not "Added" or "Fixes".
- Keep commits focused; one logical change per commit.
- Do not commit `dist/`, `out/`, or generated artifacts.
- Do not commit secrets, keys, or credentials.

## Branches

- Use feature branches for non-trivial work.
- Branch names should be short and descriptive, e.g., `add-server-restart`.

## Pull Requests

- Ensure `npm run lint` passes before opening a PR.
- Include a clear description of the change and the motivation.
- Link relevant issues or feature requests.

## Versioning

- Extension version is in `package.json` `version` field.
- Follow semver for releases: bump major for breaking changes, minor for features, patch for fixes.
