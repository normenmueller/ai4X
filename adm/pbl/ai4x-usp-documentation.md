# USP Documentation: Dual Value Proposition

## Motivation

ai4X has two distinct, complementary USPs that are currently undocumented:

| USP | What | Where anchored |
|-----|------|---------------|
| **Team** | Methodology, quality gates, routing, collaboration patterns — a portable expert team | Governance protocols + Quality Contracts |
| **Product** | `curate`, `spawn`, `doctor` — the CLI that materializes such teams for others | Project-specific scope |

Neither the README, arc42 documentation, nor any governance document explicitly states this dual value proposition. This is a critical gap: the USPs define what ai4X *is* and why it exists.

## Existing USP Content (README.md)

The README already contains a product-level USP statement:

```markdown
> [!IMPORTANT]
> **What sets ai4X apart**
> 1. **Need-first discovery** — A structured interview process identifies the user's actual needs (*why* and *what*, not *how*). The result is a declarative requirements set that captures intent, not implementation.
> 2. **Curated agentic fulfilment** — From that requirements set, ai4X identifies the cognitive capabilities needed and assembles them as a curated agentic team with an explicit collaboration model — declaratively, reproducibly, and client-agnostic.
```

This describes USP #2 (the Product / `curate`). What is missing:
- USP #1 (the Team itself as a portable, reusable expert system)
- The explicit distinction between the two USPs
- The self-referential nature: ai4X's own team IS a reference implementation of what `curate` produces

## Requirement

Document the dual USP prominently in:

1. **README.md** — Value Proposition section (user-facing, concise)
2. **doc/arc/08_concepts.md** or dedicated section — Architectural concept explaining why the separation matters (Team OS vs. Product)

## Agent-Host Agnosticism Principle (Non-Negotiable)

The team declaration layer — methodology, quality contracts, collaboration model, routing, and governance — MUST be Agent-Host-agnostic. It must not assume or depend on any specific AI orchestration platform.

`spawn` is the materialization boundary: it compiles the host-agnostic team declaration into the file structure required by a specific Agent Host (VS Code + Copilot, Codex CLI, Kiro, Claude Code, etc.).

### Terminology

- **Agent Host**: The platform that loads, injects, and executes agent definitions (e.g., VS Code + Copilot, Codex CLI, Kiro).
- **Team Declaration**: The host-agnostic layer describing what the team IS (methodology, contracts, collaboration model).
- **Materialization**: The `spawn` operation that compiles a team declaration into host-specific artifacts.

### Self-Referential Validation

ai4X's own team IS the reference implementation. If the governance cannot be expressed without Agent-Host assumptions, then `curate` cannot claim to produce host-agnostic team declarations for others. The team proves the model; `spawn` proves the materialization.

## Relationship

- Directly related to PBL `ai4x-team-portability.md` (the team portability vision is a consequence of USP #1)
- Informs `ai4x-curate.md` (curate materializes USP #1 for other projects — USP #2)
- The Agent-Host Agnosticism Principle is the architectural backbone connecting both USPs

## Priority

High — foundational positioning that informs all subsequent design decisions.
