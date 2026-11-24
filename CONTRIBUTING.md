# Contributing

Thank you for contributing to ai4X.

## How a request becomes a contribution

```mermaid
flowchart TD
    A["Gertrud identifies the requested outcome"] --> B{"What does the request need?"}
    B -->|Explanation| C["Answer from the source responsible for the topic"]
    B -->|Change| D["Check scope, risk and authority"]
    D --> E{"Is this change authorized?"}
    E -->|No| F["Return the decision to nemron"]
    F -->|Scope or approval updated| D
    E -->|Yes| G["Gertrud carries out the change with specialist help when needed"]
    G --> H["Run the checks for this change"]
    H --> I{"Does the change require independent review?"}
    I -->|Yes| J["An independent reviewer assesses the change"]
    J -->|Material findings| G
    J -->|Material findings resolved and checks pass| K["Hand the checked change to nemron for review and merge"]
    I -->|No| K
```

[Team routing](.ai4x/TEAM.md) defines specialist and independent review triggers. [Work authority](.ai4x/governance/work-authority.md) defines what each approval covers and reserves the merge into `trunk` for the Product Owner.

## Before changing code

1. Read `.ai4x/BEHAVIOR.md` and `.ai4x/CONTEXT.md`.
2. Confirm the intended outcome and acceptance criteria. Follow [work authority](.ai4x/governance/work-authority.md#risk-paths) to determine when a Ready Issue is required.
3. Load only the context, source, tests, and documentation needed for the change.

## Delivery

- Branch from current `trunk` using `feat/*`, `fix/*`, `docs/*`, `chore/*`, or `refactor/*`.
- Keep one coherent, reviewable change per pull request.
- Add tests in proportion to behavior and risk.
- For changes confined to [CI’s documentation paths](.github/workflows/verify.yml), run `make structure-check licensing-check` and `git diff --check`. For technical, mixed or uncertain changes, run `make verify`. Exercise any changed entry behavior according to the [Cold Start rule](.ai4x/governance/cold-start-verification.md).
- Use clear Conventional Commit messages and squash merge.
- Update documentation when a public contract changes.

Repository checks and evidence support human review; they do not replace it.
See [GOVERNANCE.md](GOVERNANCE.md) for the lean decision and board model.

## Licensing

Submit only material you are authorized to license. Preserve notices and follow
the path assignments in [REUSE.toml](REUSE.toml) and [LICENSING.md](LICENSING.md).
