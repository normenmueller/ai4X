# Architecture Decision Rigor (MUST)

## Purpose

Keep architecture decisions explicit, comparable, and reviewable before they shape the system.

## Trigger

Use when making or reviewing significant architecture decisions.

## Rules (MUST)

- Every significant architecture decision must state context, alternatives, trade-offs, and consequences.
- Reversible decisions are preferred when uncertainty is high and downside is material.
- Constraint-changing decisions must propagate into contracts, tests, and documentation.
- Unrecorded architecture decisions are risk, not convenience.

## Fallback

- If a material trade-off cannot be assessed, record the undecided alternatives, the constraint that would distinguish them and the consequence of deferring the decision.

## Minimal Output Contract

- decision context
- relevant alternatives
- trade-offs and consequences
- explicit uncertainty or reversibility note
