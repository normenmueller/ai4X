---
version: 1.2.0
last_updated: 2026-08-19
---

# Agent Conformance One-Page Template

Use this compact template during active sessions.

```md
# Conformance Snapshot

## Metadata
- Date:
- Story: (GitHub Issue ref)
- Parent Epic: (GitHub Issue ref)
- Stage:
- Orchestrator:

## Artifact Check
- Requirements Pack: present (Epic-level) | present (Story-refined) | missing
- AI-suitability classification gate per `crp/gov/qlt/ai-strategy-quality.md`: conforming | nonconforming ->
- AI-suitability specialist gate per `crp/gov/qlt/ai-strategy-quality.md`: conforming | n/a | nonconforming ->
- Architecture Pack: present | n/a | missing
- Review A Findings: present | n/a | missing
- AI Strategy Note: present | n/a | missing
- Capability Assessment Report: present | n/a | missing
- Implementation Pack: transient map present | canonical PR section present | missing
- Implementation Pack validation: pass | blocked ->
- Candidate revision bound: yes | no
- Transient/published fact comparison: pass | n/a before PR | blocked ->
- Test Evidence Pack: present | missing
- Review B Findings: present | missing

## Critical Checks
- Contradictions: none | yes ->
- Unverifiable assumptions: none | yes ->
- Acceptance criteria -> tests traceable: yes | no
- Semantic authority/evidence review against exact candidate: pass | pending | blocked ->
- Material finding lifecycle: n/a | within bound | escalation required | invalid ->

## Reviewer Snapshot
- High:
- Medium:
- Low:
- Residual risk:

## Gate Decision
- Status: blocked | pass | approved
- Blockers:
- Required remediation:
- Owner per remediation:

## Final Orchestrator Decision
- Proceed: yes | no
- PO escalation question (if needed):
```

## Usage Rule

- This template is a convenience format.
- Normative requirements remain defined in `crp/gov/prc/development-conformance.md`.
