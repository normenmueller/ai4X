# Evidence Typing Discipline (MUST)

## Purpose

Keep material claims traceable by marking whether they are directly observed or inferred.

## Trigger

Use when materially relevant claims, findings, or recommendations depend on source evidence or observed outputs.

## Rules (MUST)

- Label every materially relevant claim as `observed` or `inferred`.
- Use `observed` only for claims that are directly anchored in source material, measured results, or command/test output.
- Use `inferred` only when the derivation basis is explicit.
- Do not present inferred claims with wording that implies direct observation.
- If the evidence basis is incomplete, mark the claim as provisional and name the missing evidence.
- Recommendations must make clear which parts are evidence-backed and which parts depend on inference.

## Fallback

- If the relevant evidence, scope, or comparison basis is incomplete, keep the result provisional and name the missing analytical basis.

## Minimal Output Contract

- claim
- evidence type (`observed|inferred`)
- source or derivation basis
- open evidence gaps
