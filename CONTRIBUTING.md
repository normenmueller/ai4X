# Contributing

Thank you for contributing to ai4X.

## Project Scope

This repository targets one product:

- a single TypeScript CLI named `ai4x`
- command surface: `curate`, `spawn`, `doctor`

Keep the implementation focused on the single-CLI scope.

## Working Rules

- Read `adm/gdl/index.yaml` for task routing and document dependencies.
- Keep behavior explicit:
  - no hidden config defaults
  - no hidden CLI argument defaults
  - missing required values must fail with clear errors

## Configuration Principles

- Global config path: `~/.config/ai4x/config.yaml`
- Project config path: `<project>/.ai4x/config.yaml`
- The config model must remain aligned with the ai4X CLI contract.

## Runtime Linking Principles

- Runtime links are allowed for client interoperability.
- Runtime links must point only to project-local generated artifacts.
- Never link directly to external capability source repositories.

## Code Organization

- `dev/src/app`: CLI entry and command wiring
- `dev/src/lib`: command/domain implementation
- `dev/tst`: tests
- Keep `curate`, `spawn`, `doctor` concerns separated.

## Verification

Before opening a pull request:

1. Run typecheck and tests for affected code.
2. Ensure changed behavior is covered by tests, especially for:
   - argument parsing
   - config validation
   - core command lifecycle
3. Ensure docs are updated if command contracts changed.

## Contribution Flow

1. Create a topic branch from `trunk` (`feat/*`, `fix/*`, `docs/*`, `chore/*`, `refactor/*`).
2. Keep one logical change per pull request.
3. Open a pull request to `trunk` with a clear summary and test evidence.
4. Use Conventional Commits:
   - default format: `<type>: <summary>`
   - use scope only when useful (for example: `fix(cli): ...`, `test(spawn): ...`)

## Pull Request Expectations

- PR scope is minimal and reviewable.
- Changes must remain consistent with the single-CLI architecture.
- CI checks must be green before merge.
- Merging uses squash as standard.
