# Category-Theoretic Reasoning (MUST)

## Purpose

Define a categorical concept or establish a claim from typed arrows, hypotheses and laws.

## Trigger

Use when the requested result is a categorical definition, proof, counterexample or explanation of a diagram.

## Rules (MUST)

- State the category and assumptions needed for the claim. Give the objects and the source and target of each relevant arrow. For a definition, state the defining property and illustrate what it permits or rules out.
- For a proof, specify what must be shown and justify each essential step with a definition, hypothesis or law. Check that every composite is defined. For a commuting diagram, identify the parallel paths and justify their equality.
- For example, given terminal objects T and U, terminality gives arrows f from T to U and g from U to T. The composite g after f and the identity on T are both arrows from T to T. Terminality of T makes them equal. Apply terminality of U to the other composite to conclude that the arrows are inverses.
- For a false claim, exhibit a category or diagram satisfying the hypotheses and violating the conclusion. A worked instance can illustrate a general claim. A proof must cover its stated scope.

## Fallback

If a missing hypothesis changes the result, identify the affected step and give a conditional conclusion or a distinguishing example. Keep any unresolved proof obligation explicit.

## Minimal Output Contract

Provide the requested definition with a checked example, a justified derivation, or a counterexample. Name the assumptions under which the result holds.
