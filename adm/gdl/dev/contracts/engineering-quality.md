# Engineering Quality Contract

## Purpose

This contract defines the mandatory quality bar for implementation work in the ai4X CLI.
It applies whenever code is written, reviewed, or changed in `dev/cli/src` or `dev/cli/tst`.

## Scope

Apply this contract to all implementation work for `curate`, `spawn`, and `doctor`.

---

## Interface Contract First (MUST)

Define input, output, invariants, and failure semantics before internal implementation begins.

- Boundary validation belongs at the boundary, not scattered across callers.
- Prefer additive contract evolution over silent drift.
- Tests must exercise boundary behavior, not only internal helper logic.

## Abstraction Boundary Discipline (MUST)

Align module boundaries with change, policy, and responsibility — not with file convenience.

- `dev/cli/src/app` owns CLI entry points and command orchestration only.
- `dev/cli/src/lib` owns domain logic and reusable contracts only.
- `dev/cli/tst` owns test coverage for boundary and domain behavior.
- Boundaries must hide internal churn behind narrow semantic interfaces.
- Do not leak framework, transport, or filesystem details across domain boundaries.
- Cross-boundary contracts must be intentional, minimal, and explicit.

## Side-Effect Boundary Discipline (MUST)

Keep side effects explicit, bounded, and testable.

- Place side effects at explicit system boundaries: filesystem, process, network, environment.
- Keep domain logic as pure transformation — do not mix it with IO or process control.
- Side-effecting functions must have explicit inputs, outputs, and error paths.
- Global process state changes belong only at clear entry boundaries.
- Runtime validation of untrusted input must stay at explicit boundaries.
- IO-facing components require targeted runtime tests; domain logic must remain unit-testable without external IO.

## Functional Error Modeling (MUST)

Error states and optional values must be explicit in domain contracts.

- Prefer explicit result or optional modeling over implicit null or undefined signaling.
- Every recoverable failure path must be represented in the contract.
- Error channels must preserve actionable context for callers.
- Avoid ambiguous sentinel values to represent failure.
- Prefer discriminated error variants with typed `kind` discriminators over generic error records with message strings. Dispatch on error kinds must use exhaustive pattern matching, not string comparison.

## Immutability by Default (MUST)

Keep state transitions explicit and bounded.

- Treat domain values as immutable by default.
- Mutable state requires explicit ownership, lifecycle boundary, and mutation reason.
- Shared mutable state across domain boundaries is prohibited.
- When mutation is unavoidable, name the exception boundary explicitly.

## Domain Modeling Rigor (MUST)

Domain concepts must be explicit, stable, and mapped to unambiguous model boundaries.

- Model domain states explicitly; avoid implicit meaning in primitive fields.
- Distinguish domain model from transport format and CLI representation.
- Enforce invariants at model boundaries, not ad hoc in call sites.
- Keep ubiquitous language stable across code, tests, and docs.
- Name domain types and domain-facing APIs with domain terms, not technical container language.

## Composition Over Subtyping (MUST)

Prefer explicit composition of behavior over deep inheritance or subtype trees.

- New behavior should be introduced through composable units with clear contracts.
- Inheritance is allowed only when substitution is strict and stable.
- Domain behavior must remain testable in isolation.
- Composition boundaries must map to explicit domain responsibilities.

## Change Impact Rule (MUST)

For non-trivial changes, identify affected modules, contracts, data shapes, tests, and docs before implementation.

- Distinguish local change from cascading cross-boundary change.
- High-blast-radius changes require containment logic before execution.
- If impact cannot be estimated with confidence, mark the change as preliminary and name the open gaps.

## Language Rule (MUST)

All written artifacts must use English.

- All code, comments, variable names, and type names must be in English.
- All documentation, README content, and inline doc comments must be in English.
- All commit messages, branch names, GitHub Issue titles/descriptions, and PR content must be in English.
- Conversational interaction with the PO is in German; this rule applies only to persisted artifacts.
