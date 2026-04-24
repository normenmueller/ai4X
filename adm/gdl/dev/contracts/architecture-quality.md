# Architecture Quality Contract

## Purpose

This contract defines the mandatory quality bar for architecture and DDD decisions in the ai4X CLI.
It applies whenever bounded contexts, aggregate boundaries, invariants, or integration contracts are defined or changed.

## Scope

Apply this contract to all architecture work routed through `ai4x-architecture-ddd`.

---

## Output Contract (MUST)

Every non-trivial architecture deliverable must contain the following sections:

1. **Context boundaries** — Bounded contexts, their responsibilities, and integration points.
2. **Key invariants** — Domain invariants that must hold across boundaries.
3. **Option A and Option B** — At least two explicit design alternatives.
4. **Rejected alternative and rationale** — At least one rejected option with concrete rejection reasoning.
5. **Risks and migration impact** — Known risks, blast radius, and migration considerations.
6. **Decision recommendation** — Explicit recommendation with trade-off summary.

## Quality and Challenge Rules (MUST)

- No architecture by intuition only; always state assumptions explicitly.
- No hidden coupling across `app`/`lib`/`tst` boundaries.
- Block decisions when invariants cannot be verified.
- Block progression if options and trade-offs are not explicit.
- Challenge at least one dominant design option with a concrete counterargument.
