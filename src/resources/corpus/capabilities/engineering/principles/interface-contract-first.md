# Interface Contract First (MUST)

## Purpose

Define semantic boundary contracts before implementation details accumulate around them.

## Trigger

Use when defining or reviewing interface boundaries before implementation details spread.

## Rules (MUST)

- Define input, output, invariants, and failure semantics before internal optimization.
- Boundary validation belongs at the boundary, not scattered across callers.
- Prefer additive evolution over silent contract drift.
- Tests must exercise boundary behavior, not only internal helper logic.

## Fallback

- If the relevant boundary, contract, or design context is incomplete, keep the judgment provisional and name the missing engineering information.

## Minimal Output Contract

- boundary inputs and outputs
- invariants and failure semantics
- validation placement
- evolution or drift constraints
