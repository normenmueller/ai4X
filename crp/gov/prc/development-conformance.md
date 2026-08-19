---
version: 1.2.0
last_updated: 2026-08-19
---

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

Specialist stages issue `blocked` or `pass`.
Final `approved` is issued only by the orchestrator after all blockers are closed.

Gate verdict definitions: see `crp/gov/prc/workflow.md` (Governance Glossary, Verdict Terms).

## Required Artifacts

Artifact names follow the canonical definitions in `crp/gov/prc/workflow.md` (Governance Glossary, Artifact Terms).

Mandatory (always required):
1. Requirements Pack (Epic-level ACs at minimum; Story-level refinement if Stage 2 ran)
2. AI-suitability classification artifact required by `crp/gov/qlt/ai-strategy-quality.md`
3. Implementation Pack
4. Test Evidence Pack
5. Review B Findings

Conditional (required only when the corresponding stage ran):
6. Architecture Pack (Stage 3)
7. Review A Findings (Stage 4)
8. AI Strategy Note and any specialist-evidence artifact applicable under `crp/gov/qlt/ai-strategy-quality.md`
9. Capability Assessment Report (Stage 6)

## Conformance Template

Use `crp/gov/prc/development-conformance-template.md` as the single conformance template for each non-trivial session. Copy and complete it per session.

## Quality Rule (MUST)

- The gate decision must be explicit.
- Evaluate classification and specialist-evidence conformance exclusively against `crp/gov/qlt/ai-strategy-quality.md`; any nonconformance blocks this gate.
- "Approved" is invalid when required remediation remains open.
- Missing conformance record for a non-trivial session is a governance violation.
- The Implementation Pack check must bind the exact candidate and verify one canonical PR section against `crp/gov/qlt/implementation-quality.md`. Before PR creation, the transient map is admissible only as Stage 8/9 input and must later compare consistently with the published section.
- Deterministic Pack validation proves only structure, limits, and exact bindings. Final conformance still requires independent semantic authority/evidence review against the exact candidate.
- Any material Review B finding must show its stable lifecycle state. More than one remediation or one finding-bounded re-review, a renamed same finding, or an exhausted finding without explicit PO escalation blocks conformance.
