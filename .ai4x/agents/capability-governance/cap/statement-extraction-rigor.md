# Statement Extraction Rigor (MUST)

## Purpose

Extract all materially relevant statements from source material without collapsing distinct claims.

## Trigger

Use when extracting materially relevant statements from documents, transcripts, requirements, or review artifacts.

## Rules (MUST)

- Preserve statement granularity; do not merge separate claims into one synthesized sentence.
- Keep source traceability for every extracted statement.
- Mark absent evidence as absent; do not invent implied statements.
- Separate responsibility, constraint, metric, scope, and decision claims when they appear together.

## Fallback

- If a passage or its source anchor is missing, extract the statements supported by the available text, identify the missing passage and leave completeness open.

## Minimal Output Contract

- extracted statement
- statement type (`fact|constraint|responsibility|metric|scope|decision`)
- source anchor
