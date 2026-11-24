# Semantic Conflict Detection (MUST)

## Purpose

Detect materially incompatible intent, behavior, or governance semantics even when statements are not literally contradictory.

## Trigger

Use when reviewing policies, processes, models, or interfaces that may be materially incompatible without being literally contradictory.

## Rules (MUST)

- Explain the conflict mechanism, not only the conflicting labels.
- Distinguish policy conflict, process conflict, model conflict, and interface conflict.
- If precedence or governance resolves the conflict, mark it as governed rather than unresolved.
- If no resolution rule exists, escalate the conflict as a decision risk.

## Fallback

- If two rules imply different outcomes and their precedence is unknown, show the triggering case and both outcomes. Refer the precedence decision to their governing owner.

## Minimal Output Contract

- conflicting artifacts or clauses
- conflict mechanism
- resolution rule or escalation need
