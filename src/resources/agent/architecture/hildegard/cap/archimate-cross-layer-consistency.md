# ArchiMate Cross Layer Consistency (MUST)

## Purpose

Keep ArchiMate models consistent across the three core layers (Business, Application, and Technology), including the data objects represented in those models.

## Trigger

Use when reviewing ArchiMate models across multiple layers, views, or lifecycle updates.

## Rules (MUST)

- Equivalent elements and relationships must not contradict across views.
- A renamed, split, or retired element must be reconciled across impacted models.
- Relationship semantics must stay stable between diagrams and supporting prose.
- Material decisions require traceability from motivation to implementation-relevant elements.

## Fallback

- If a cross-view element cannot be matched, identify both views and the missing identity or relationship evidence. Leave the consistency finding open until the match is established.

## Minimal Output Contract

- affected layers
- consistency finding
- traceability gap or confirmation
