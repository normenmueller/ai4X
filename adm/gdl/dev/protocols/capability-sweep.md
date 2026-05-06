---
version: 1.0.0
last_updated: 2026-05-06
---

# Capability Sweep Protocol

## Purpose

Define a protocol for proactive cognitive capability portfolio health assessments. Findings enter the Planning Workflow as PBL entries and follow the normal Idea-to-Story path.

## Scope

This protocol governs portfolio-wide sweeps initiated by the Tech Lead or PO. It complements the per-Story conditional stage (Stage 6) defined in `adm/gdl/dev/protocols/workflow.md`.

## Trigger

A capability sweep is initiated when:

1. Tech Lead or PO explicitly requests a portfolio health check.
2. A major feature milestone approaches that depends on capability composition (e.g., curate release).
3. Periodic cadence as agreed with PO (recommended: before each release milestone).

## Executor

`ai4x-capability-governance` — performs the sweep and produces the assessment report.

## Process

1. **Scope Definition** — Tech Lead or PO defines sweep scope (full portfolio or specific domains).
2. **Execution** — `ai4x-capability-governance` evaluates:
   - Staleness: capabilities with outdated triggers, stale wording, or missing semantic precision.
   - Overlap: capabilities with insufficiently differentiated triggers or purposes.
   - Gaps: demand signals (from PBL, feature requirements) not covered by existing capabilities.
   - Metadata health: missing or incorrect `distinguish_from`, `do_not_use_when`, `sources`.
3. **Report** — Produce a Capability Assessment Report with findings categorized by severity.
4. **Remediation** — High-severity findings are promoted to Stories in the PBL via the Tech Lead. Low-severity findings are tracked for next sweep or attached as tasks to existing Stories.

## Output

- Capability Assessment Report (persisted in chat session, summary referenced in PBL if Stories are created).
- New PBL entries for high-severity findings requiring remediation.

## Governance

- Quality gates (`utl/cap/` checks) must pass after any portfolio change resulting from sweep findings.
- The sweep is an assessment, not implementation. It produces PBL entries that enter the Planning Workflow (`adm/gdl/pln/protocols/workflow.md`).
- Remediation of sweep findings follows the normal Idea-to-Story path (including Stage 6 when applicable).

## Distinction from Stage 6

| Aspect | Stage 6 (per-Story) | Capability Sweep |
|--------|---------------------|------------------|
| Trigger | Story involves capability work | Tech Lead/PO initiative |
| Scope | Story-scoped (validate coverage for feature) | Portfolio-wide or domain-wide |
| Output | Targeted assessment + capability artifacts | Comprehensive health report + PBL entries |
| Workflow | Part of 10-stage flow | Portfolio assessment; findings enter Planning Workflow |
