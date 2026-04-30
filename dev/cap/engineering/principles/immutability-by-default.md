# Immutability by Default (MUST)

## Purpose

Keep state transitions explicit and bounded so domain behavior remains predictable and composable.

## Trigger

Use when designing or reviewing stateful domain behavior and mutation boundaries.

## Rules (MUST)

- Treat domain values as immutable by default.
- Mutable state requires explicit ownership, lifecycle boundary, and mutation reason.
- Side effects must be isolated from pure domain transformations.
- Shared mutable state across domain boundaries is prohibited.
- When mutation is unavoidable, state the exception boundary explicitly instead of normalizing it as a default pattern.

## Fallback

- If the relevant boundary, contract, or design context is incomplete, keep the judgment provisional and name the missing engineering information.

## Minimal Output Contract

- immutable default assumption
- mutation boundary (if any)
- mutation owner
- exception rationale (if any)
- side-effect boundary
