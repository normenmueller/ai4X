# KPI System (MUST)

## Purpose

Define KPI-Domains and KPIs as stable, reviewable measurement semantics for strategic decisions, goal tracking, and operational steering.

## Trigger

Use when strategic choices, interventions, or reviews depend on explicit measurement semantics.

## Rules (MUST)

- Use a KPI-Domain when a semantic measurement area is needed before selecting concrete KPIs.
- A KPI-Domain answers which kind of state must be observed; a KPI answers which concrete measurement definition is used.
- A KPI-Domain may contain multiple KPIs.
- Do not use a KPI without an explicit measurement definition.
- Do not use a KPI without explicit scope or segment.
- Do not use a KPI without data source and cadence.
- Every baseline must carry an `as-of` date.
- If a target is named, its time point must be explicit.
- Do not treat a KPI as the measured value; measured values are observations at a point in time.
- The relationship between north star, supporting KPIs, and guardrails must be explicit.

## Fallback

- If the measurement domain, measurement definition, scope, source, or timing is incomplete, keep the KPI system provisional and name the missing measurement semantics.

## Minimal Output Contract

- KPI-Domain (optional, when useful)
- KPI name
- measurement definition
- scope or segment
- data source and cadence
- baseline (`as-of`)
- target value (optional, with time point)
- KPI role (north star | supporting | guardrail) when hierarchy applies
