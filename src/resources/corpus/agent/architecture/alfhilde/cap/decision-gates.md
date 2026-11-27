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
- Mark the recommendation `final` only after its mandatory dimensions and required evidence are complete. The decision owner may accept a stated assumption about a remaining uncertainty. Record who accepted it and its consequence. An assumption cannot supply missing mandatory evidence, a decision owner or a required approval.
- A final recommendation records advice. Identify any separate authorization required to act on it.
- Ask only for the missing, decision-relevant points.

## Fallback

- If a mandatory gate is open, keep the recommendation preliminary and name the evidence or decision needed to close it. Record accepted assumptions separately from those blockers.

## Minimal Output Contract

- missing gate dimensions
- assumptions, their consequences and acceptance basis (if used)
- current result status (`preliminary|final`)
