# luxe_cafe_dashboard project notes

## Changelog workflow

When a user-facing change is ready to ship (new feature, behavior change, bug fix, license or analytics change), update `CHANGELOG.md` and `package.json` in the same commit:

- Bump `version` in `package.json` per semver: patch for bug fixes, minor for features and behavior changes, major for breaking changes.
- Add a new section at the top of `CHANGELOG.md` as `## [X.Y.Z] - YYYY-MM-DD` with categorized bullets (`### Added`, `### Changed`, `### Fixed`, `### Removed`).
- Skip the `[Unreleased]` convention. Only entries for shipped versions belong in the changelog.
- Skip internal-only changes (refactors, folder reorg, line-ending normalization, build or dev tooling, scaffolding cleanup). The changelog is for users, not contributors.
- No preamble. The file is just `# Changelog` followed by versioned sections.
