# Agent Conformance Contract

## Purpose

Define a mandatory conformance check for each non-trivial Story execution in the ai4X expert-agent model.
This check runs within the 10-stage development workflow (per Story), not during planning phases (Idea → Epic → Story decomposition).

## Scope

Applies to all non-trivial changes routed through `ai4X`, `ai4x-requirements`, `ai4x-architecture-ddd`, `ai4x-ai-strategy`, `ai4x-capability-governance`, `ai4x-implementation`, `ai4x-testing-tdd`, and `ai4x-critical-reviewer`.

## Session Conformance Rule (MUST)

The orchestrator must run this check at least:

1. before implementation starts
2. before final acceptance/merge

A stage is blocked when required artifacts are missing, contradictory, not testable, or when unresolved high-severity findings exist.

Specialist stages issue `blocked` or `conditional-approve`.
Final `approved` is issued only by the orchestrator after mandatory remediation is closed.

Gate verdict definitions: see `adm/gdl/dev/protocols/workflow.md` (Governance Glossary, Verdict Terms).

## Required Artifacts

Artifact names follow the canonical definitions in `adm/gdl/dev/protocols/workflow.md` (Governance Glossary, Artifact Terms).

Mandatory (always required):
1. Requirements Pack (Epic-level ACs at minimum; Story-level refinement if Stage 2 ran)
2. Implementation Pack
3. Test Evidence Pack
4. Review B Findings

Conditional (required only when the corresponding stage ran):
5. Architecture Pack (Stage 3)
6. Review A Findings (Stage 4)
7. AI Strategy Note (Stage 5)
8. Capability Assessment Report (Stage 6)

## Conformance Template

Use `adm/gdl/dev/protocols/development-conformance-template.md` as the single conformance template for each non-trivial session. Copy and complete it per session.

## Quality Rule (MUST)

- The gate decision must be explicit.
- "Approved" is invalid when required remediation remains open.
- Missing conformance record for a non-trivial session is a governance violation.
