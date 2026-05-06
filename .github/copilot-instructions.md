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
