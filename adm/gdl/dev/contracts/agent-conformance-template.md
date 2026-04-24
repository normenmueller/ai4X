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
- Architecture Pack: present | n/a | missing
- Review A Findings: present | n/a | missing
- AI Strategy Note: present | n/a | missing
- Implementation Pack: present | missing
- Test Evidence Pack: present | missing
- Review B Findings: present | missing

## Critical Checks
- Contradictions: none | yes ->
- Unverifiable assumptions: none | yes ->
- Acceptance criteria -> tests traceable: yes | no

## Reviewer Snapshot
- High:
- Medium:
- Low:
- Residual risk:

## Gate Decision
- Status: blocked | conditional-approve | approved
- Blockers:
- Required remediation:
- Owner per remediation:

## Final Orchestrator Decision
- Proceed: yes | no
- PO escalation question (if needed):
```

## Usage Rule

- This template is a convenience format.
- Normative requirements remain defined in `adm/gdl/dev/contracts/agent-conformance.md`.
