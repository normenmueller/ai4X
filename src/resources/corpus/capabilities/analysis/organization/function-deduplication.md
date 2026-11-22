# Function Deduplication (MUST)

## Purpose

Remove duplicate function statements without losing meaningful distinctions.

## Trigger

Use when a normalized function set may contain duplicate or near-duplicate function statements.

## Rules (MUST)

- Deduplicate only after functions are normalized.
- Preserve variants when trigger, outcome, scope, or accountable owner differs materially.
- Select one canonical formulation for each deduplicated function set.
- Keep alias and merge rationale auditable.

## Fallback

- If the relevant evidence, scope, or comparison basis is incomplete, keep the result provisional and name the missing analytical basis.

## Minimal Output Contract

- canonical function
- merged aliases
- reason for merge
