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

- If callers disagree on a boundary outcome, show one input and the competing results. Keep that part of the contract open until an authoritative requirement settles it.

## Minimal Output Contract

- boundary inputs and outputs
- invariants and failure semantics
- validation placement
- evolution or drift constraints
