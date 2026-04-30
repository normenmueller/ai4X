# Capability Review: kpi-system

## Scope

Review `dev/cap/strategy/metrics/kpi-system.md` (and `.meta.yaml`) for domain correctness and agent-readiness.

## Constraints

- `kpi-system` must remain independently defined from `okr-discipline`.
- No implicit coupling between the two capabilities at the definition level.

## Review Criteria

1. **Domain correctness (Fachlichkeit):** Are rules, triggers, fallback, and output contract sound according to established KPI and measurement methodology?
2. **Agent-readiness (Agententauglichkeit):** Does the capability text satisfy the Capability Authoring Governance contract (`adm/gdl/dev/contracts/capability-authoring-governance.md`) — semantic triggers, deterministic rules, actionable fallback, material output contract?
