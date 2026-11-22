# Composition Over Subtyping (MUST)

## Purpose

Prefer explicit composition of behavior over deep inheritance or subtype trees.

## Trigger

Use when designing extensible behavior or type relationships.

## Rules (MUST)

- New behavior should be introduced through composable units with clear contracts.
- Inheritance is allowed only when substitution is strict and stable.
- Domain behavior must remain testable in isolation.
- Composition boundaries must map to explicit domain responsibilities.

## Fallback

- If the relevant boundary, contract, or design context is incomplete, keep the judgment provisional and name the missing engineering information.

## Minimal Output Contract

- candidate composition units or subtype rationale
- responsibility boundaries
- isolation/testability consequence
- substitution risk or justification
