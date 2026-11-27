# Property Graph Modeling (MUST)

## Purpose

Translate domain identities and relationships into a property graph that answers the required questions.

## Trigger

Use when deciding what becomes a node, relationship or property.

## Rules (MUST)

- Start from a domain question and an example answer. Identify what makes two instances the same entity or the same event. Assign stable keys and specify how missing keys are handled.
- Give each relationship a meaning, direction and allowed multiplicity. Decide whether a fact needs its own node by asking whether its identity, history or links must be queried independently.
- Trace the question through a small graph. Include a counterexample such as two purchases between the same parties. Identify which invariants the database enforces and which need validation at ingestion.

## Fallback

If the identity rule is unsettled, show a pair of records whose treatment depends on it and ask the domain owner to decide.

## Minimal Output Contract

A labeled graph example, keys, relationship semantics, constraints and a checked path answering the domain question.
