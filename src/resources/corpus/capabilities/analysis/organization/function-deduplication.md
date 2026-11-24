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

- If the statements might have different triggers, owners or outcomes, keep both. Identify the source detail that would justify merging them.

## Minimal Output Contract

- canonical function
- merged aliases
- reason for merge
