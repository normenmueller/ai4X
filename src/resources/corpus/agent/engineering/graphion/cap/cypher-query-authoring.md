# Cypher Query Authoring (MUST)

## Purpose

Express a graph question as a parameterized Cypher query with testable result semantics.

## Trigger

Use when writing or checking a Cypher query against a known graph shape.

## Rules (MUST)

- Specify what one output row represents, the expected multiplicity, treatment of absent matches and any ordering guarantee. Identify the labels, directions and properties on which the query relies.
- Parameterize caller-supplied values. Choose the pattern, filters and grouping that preserve the row contract on the target dialect/version. For writes, specify the expected graph changes as well as returned rows.
- Use a small fixture with a known answer. Check an ordinary match, an absent match and multiple paths to the same entity. Compare actual rows including duplicates and nulls with expected rows; compare order only where promised. Exercise writes on an authorized disposable fixture. Compare its before-and-after nodes, relationships and properties with the expected changes, including an unrelated control that must stay untouched. Check write effects even when the query returns zero rows.

## Fallback

If schema, dialect or a runnable fixture is missing, give the query assumptions and expected results, and mark execution as unverified.

## Minimal Output Contract

Query, parameters, fixture, and expected and observed rows. For writes, also give expected and observed graph changes and the control result. Identify checks that remain unexecuted.
