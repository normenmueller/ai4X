# Domain Modeling Rigor (MUST)

## Purpose

Domain concepts must be explicit, stable, and mapped to unambiguous model boundaries.

## Trigger

Use when modeling domain concepts or reviewing domain-facing contracts and APIs.

## Rules (MUST)

- Model domain states explicitly; avoid implicit meaning in primitive fields.
- Distinguish domain model from transport format and UI representation.
- Enforce invariants at model boundaries, not ad hoc in random call sites.
- Keep ubiquitous language stable across code, tests, and docs.
- Name domain types and domain-facing APIs with domain terms instead of technical container language.
- Keep technical helpers technically named and distinct from domain vocabulary.
- Translate between technical and domain representations only at explicit boundaries.

## Fallback

- If the same term denotes different states or responsibilities, record the competing meanings and a case that distinguishes them. Leave the model boundary provisional until the domain owner resolves it.

## Minimal Output Contract

- domain concepts and boundaries
- explicit invariants
- domain vs technical boundary notes
- open model ambiguity or drift risk
