---
version: 1.0.0
last_updated: 2026-05-06
---

# Implementation Quality Contract

## Purpose

This contract defines the mandatory quality bar for production implementation deliverables in the ai4X CLI.
It supplements the engineering and TypeScript quality contracts with implementation-specific output and challenge requirements.

## Scope

Apply this contract to all implementation work routed through `ai4x-implementation`.

---

## Output Contract (MUST)

Every non-trivial implementation deliverable must contain the following sections:

1. **Intended behavior** — What the implementation does, mapped to acceptance criteria.
2. **Implementation strategy** — Approach chosen, with rationale for key decisions.
3. **Failure modes and handling** — Explicit error paths and recovery behavior.
4. **Performance considerations** — Known performance implications for CLI and filesystem workflows.
5. **Trade-offs and rejected alternative** — At least one rejected implementation approach with concrete reasoning.
6. **Required tests** — Tests that must exist to verify the implementation.

## Quality and Challenge Rules (MUST)

- Never implement implicit defaults.
- Reject requirement ambiguities before coding.
- Keep module boundaries clear across `cli/src/app` and `cli/src/lib`.
- Block progression if required upstream artifacts are missing.
- Document one rejected implementation approach per non-trivial change.
