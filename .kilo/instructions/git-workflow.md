# Git Workflow

## Commits

- Use imperative mood in commit messages: "Add", "Fix", "Update", not "Added" or "Fixes".
- Keep commits focused; one logical change per commit.
- Do not commit `dist/`, `out/`, or generated artifacts.
- Do not commit secrets, keys, or credentials.

## Versioning

- Extension version is in `package.json` `version` field.
- Follow semver for releases: bump major for breaking changes, minor for features, patch for fixes.
