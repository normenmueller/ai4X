# Capability Review: okr-discipline

Ich möchte, dass ein AI Agent, welcher mit dieser kognitiven Fähigkeit ausgestattet ist, oder soll ich sagen, welcher mit dieser kognitiven Fähigkeit kuratiert wurde, das OKR Framework nach den in .meta referenzierten Ressourcen perfekt beherrscht und anwenden kann. Er soll also das OKR Framework sozusagen in und auswendig kennen und anwenden können. 

## Scope

Review `dev/cap/strategy/goal-management/okr-discipline.md` (and `.meta.yaml`) for domain correctness and agent-readiness.

## Constraints

- `okr-discipline` must remain independently defined from `kpi-system`.
- No implicit coupling between the two capabilities at the definition level.

## Review Criteria

1. **Domain correctness (Fachlichkeit):** Are rules, triggers, fallback, and output contract sound according to established OKR methodology?
2. **Agent-readiness (Agententauglichkeit):** Does the capability text satisfy the Capability Authoring Governance contract (`adm/gdl/dev/contracts/capability-authoring-governance.md`) — semantic triggers, deterministic rules, actionable fallback, material output contract?
