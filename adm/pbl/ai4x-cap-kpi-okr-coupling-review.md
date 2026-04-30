# Capability Review: kpi-okr-coupling

## Scope

Review `kpi-okr-coupling` for domain correctness and agent-readiness. The original capability files have been removed from `dev/cap/` and are preserved inline below.

## Constraints

- Must remain independently reviewable from `okr-discipline` and `kpi-system`.

## Open Design Question

When `curate` materializes an agent system that includes both `kpi-system` and `okr-discipline`, how do we ensure that `kpi-okr-coupling` is automatically co-curated? The metadata `requires: ["kpi-system","okr-discipline"]` expresses a dependency, but no mechanism currently enforces co-curation in the reverse direction (i.e., "if both dependencies are present, this coupling capability must also be included").

## Review Criteria

1. **Domain correctness (Fachlichkeit):** Are rules, triggers, fallback, and output contract sound according to AM2 KPI-OKR coupling semantics?
2. **Agent-readiness (Agententauglichkeit):** Does the capability text satisfy the Capability Authoring Governance contract (`adm/gdl/dev/contracts/capability-authoring-governance.md`) — semantic triggers, deterministic rules, actionable fallback, material output contract?

---

## Inline Backup: kpi-okr-coupling.md

```markdown
# KPI-OKR Coupling (MUST)

## Purpose

Couple OKRs to KPIs according to AM2 semantics: Key Results set KPI targets, KPIs provide actual values, and their comparison reveals a performance gap.

## Trigger

Use when OKRs are defined, reviewed, or challenged against strategic measurement logic.

## Rules (MUST)

- Strategy defines direction and trade-offs.
- Objectives define qualitative desired states and must not set KPI targets directly.
- KPI-Domains define semantic measurement areas that make Objectives observable.
- KPIs define concrete measurement semantics, scope, source, cadence, and actual values.
- Key Results set target values for KPIs from a suitable KPI-Domain.
- A Gap is revealed by comparing the KPI actual value with the Key Result target value.
- Strategic OKRs may express durable strategic intent; operational OKRs define interventions that are expected to move a measurement basis.
- Every operational OKR recommendation must name exactly one primary KPI.
- The primary KPI must have an explicit measurement definition, baseline, and target date.
- If multiple metrics are affected, treat them as guardrails, side effects, or supporting indicators, not hidden primary goals.
- If a key result has no plausible effect on the primary KPI, make the conflict explicit.
- When the effect is indirect or delayed, define the leading indicator and validation rule explicitly.
- Courses of Action may address Gaps and contribute to Key Results, but they must not be modeled as Key Results.

## Fallback

- If KPI definitions, coupling logic, or validation rules are incomplete, keep the coupling provisional and name the missing measurement basis.

## Minimal Output Contract

- objective
- KPI-Domain or measurement rationale
- primary KPI
- Key Result target value for the KPI
- KPI actual value or baseline
- performance gap
- coupling logic between course of action, key result, and KPI
- guardrails or side effects (if relevant)
- validation rule
```

## Inline Backup: kpi-okr-coupling.meta.yaml

```yaml
id: kpi-okr-coupling
version: 0.1.2
status: active
approved_by: ["nemron"]
approved_at: 2026-03-19T00:00:00+01:00
scope: cognitive
owner: nemron
review_due: 2026-12-31
requires: ["kpi-system","okr-discipline"]
conflicts: []
do_not_use_when: []
distinguish_from: []
sources: []
```
