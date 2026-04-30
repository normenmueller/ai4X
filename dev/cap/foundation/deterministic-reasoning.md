# Deterministic Reasoning (MUST)

## Purpose

Keep reasoning explicit, traceable, and stable under incomplete or conflicting context.

## Trigger

Use when reasoning under incomplete, conflicting, or partially evidenced context must remain explicit and stable.

## Rules (MUST)

- Separate observed input, derived assumptions, and resulting recommendation explicitly.
- Do not silently resolve contradictions; name them as contradictions.
- Do not present provisional reasoning as final reasoning.
- If mandatory context is missing, keep the result provisional and name the missing context.
- State the decision-relevant consequence of unresolved uncertainty.

## Fallback

- If mandatory context, evidence, or contradictions remain unresolved, keep the result provisional and name the blocking gaps explicitly.

## Minimal Output Contract

- observed input
- derived assumption (if any)
- unresolved gap or contradiction (if any)
- current result status (`preliminary|final`)
