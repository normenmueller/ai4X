# Decision Gates (MUST)

## Purpose

Ensure that strategic recommendations are finalized only when the mandatory decision context is explicit.

## Trigger

Use when a strategic recommendation, prioritization, or decision artifact may move from provisional to final.

## Rules (MUST)

- Before a final strategic recommendation, make decision owner, decision date, and required approvals explicit.
- Make scope, affected unit or market, and relevant interfaces explicit.
- Make the decision horizon explicit.
- Make budget, capacity, regulatory, and technical constraints explicit.
- Make the relevant baseline and target state explicit whenever they materially affect the decision.
- Missing gate dimensions must be named explicitly, never assumed silently.
- If mandatory gate dimensions are missing, the result remains `preliminary`.
- If work must continue despite gaps, assumptions must be explicit and their consequence must be stated.
- `final` is allowed only when gate dimensions are complete or the remaining assumptions were explicitly accepted.
- Ask only for the missing, decision-relevant points.

## Fallback

- If gate dimensions remain incomplete, keep the result preliminary and list the blocking gate gaps or explicit assumptions.

## Minimal Output Contract

- missing gate dimensions
- explicit assumptions (if used)
- current result status (`preliminary|final`)
