# ai4X Repository

## Language Convention

- Conversation with the PO is in **German**.
- All artifacts (code, comments, documentation, commit messages, GitHub Issues, PRs) are in **English**.

## Bootstrap

Before any work, read `.github/agents/ai4x.agent.md` — the canonical agent definition for this repository.

## Product Contract

### CLI Model

- `curate` writes declarative, client-agnostic agent artifacts.
- `spawn` materializes and activates an agent for an explicit target client (Agent Host).
- `doctor` validates configuration, declaration, and spawn-readiness.

### Explicitness Rule

- No hidden defaults in config interpretation.
- No hidden defaults in command argument resolution.
- Missing required values must fail with clear errors.

### Configuration Rule

- Global config path: `~/.config/ai4x/config.yaml`.
- Project config path: `<project>/.ai4x/config.yaml`.
- Schema design must remain aligned with the ai4X CLI contract.

### Runtime Linking Rule

- Runtime links may be used for client interoperability.
- Runtime links must target project-local generated artifacts only.
- Never link directly into external capability source repositories.

## Authority Stack

<!-- Canonical source: .github/agents/ai4x.agent.md § Authority Stack -->

In case of conflict, authority resolves top-down:

1. Quality Contracts (`crp/gov/qlt/*`)
2. Protocols (`crp/gov/prc/*`)
3. Orchestrator directives (`.github/agents/ai4x.agent.md`)
4. Specialist judgment
5. PO Override (explicit, documented)

## Contract Precedence

<!-- Canonical source: .github/agents/ai4x.agent.md § Contract Precedence -->

When two contracts impose conflicting requirements:

1. The more specific contract takes precedence.
2. If both are at the same specificity level, escalate to the orchestrator.
