# Model Selection and Boundary Fit (MUST)

## Purpose

Choose model boundaries that fit the actual problem, control needs, and fallback strategy.

## Trigger

Use when deciding whether and how AI capabilities should be introduced into a solution.

## Rules (MUST)

- Start from task semantics, risk, latency, privacy, and control needs before considering model breadth or novelty.
- Prefer the smallest model or service boundary that can satisfy the required capability with acceptable control burden.
- Separate model choice from surrounding system responsibilities such as retrieval, validation, and escalation.
- Define deterministic fallback or non-AI handling where the task does not justify fully autonomous generation.
- Do not treat model selection as a branding or benchmark exercise detached from system fit.

## Fallback

- If workload characteristics or constraints are incomplete, state the choice as provisional and list the missing fit criteria.

## Minimal Output Contract

- task and constraint profile
- chosen model boundary
- fit rationale
- control and fallback rationale
- unresolved selection risks
