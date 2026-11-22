# ArchiMate Cross Layer Consistency (MUST)

## Purpose

Keep ArchiMate models consistent across business, application, data, and technology layers.

## Trigger

Use when reviewing ArchiMate models across multiple layers, views, or lifecycle updates.

## Rules (MUST)

- Equivalent elements and relationships must not contradict across views.
- A renamed, split, or retired element must be reconciled across impacted models.
- Relationship semantics must stay stable between diagrams and supporting prose.
- Material decisions require traceability from motivation to implementation-relevant elements.

## Fallback

- If scope, stakeholders, or model boundaries are unclear, keep the output provisional and name the unresolved architecture decisions.

## Minimal Output Contract

- affected layers
- consistency finding
- traceability gap or confirmation
