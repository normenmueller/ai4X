# Contributing

Thank you for contributing to ai4X.

## Before changing code

1. Read `.ai4x/BEHAVIOR.md` and `.ai4x/CONTEXT.md`.
2. Confirm the owning GitHub Issue, intended outcome, and acceptance criteria.
3. Load only the context, source, tests, and documentation needed for the change.

## Delivery

- Branch from current `trunk` using `feat/*`, `fix/*`, `docs/*`, `chore/*`, or `refactor/*`.
- Keep one coherent, reviewable change per pull request.
- Add tests in proportion to behavior and risk.
- Run `make verify` before requesting review.
- Use clear Conventional Commit messages and squash merge.
- Update documentation when a public contract changes.

Repository checks and evidence support human review; they do not replace it.
See [GOVERNANCE.md](GOVERNANCE.md) for the lean decision and board model.

## Licensing

Submit only material you are authorized to license. Preserve notices and follow
the path assignments in [REUSE.toml](REUSE.toml) and [LICENSING.md](LICENSING.md).
