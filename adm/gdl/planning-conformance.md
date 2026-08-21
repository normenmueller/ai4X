---
version: 1.3.0
last_updated: 2026-08-19
---

# Planning Conformance Contract

## Purpose

Define a mandatory conformance check for the planning lifecycle (Idea -> Epic -> Story).
This check ensures all planning deliverables are present and complete before the Tech Lead requests the PO's Ready decision.

## Scope

Applies to all Epics in the planning workflow defined in `adm/gdl/planning-workflow.md`, including early Epic containers created before Requirements approval.
This contract is the planning counterpart to the development session conformance check in `crp/gov/prc/development-conformance.md`.

## Planning Conformance Rule (MUST)

The Tech Lead must execute this check once per Epic, after Phase 4 (Story Decomposition) and before requesting the PO's Ready decision.

If any deliverable is missing, the Tech Lead must resolve it before issuing the Ready-Gate prompt.

## Required Deliverables

| Deliverable | Phase | Presence |
|-------------|-------|----------|
| Exactly one Epic Issue with label `epic` | Phase 2 or 3 | yes / no |
| Current gate facts disclosed in Epic body using the canonical template in `adm/gdl/planning-workflow.md` | Phase 2 onward | yes / no |
| Requirements Pack in Epic Issue body and PO-approved | Phase 2/3 | present / missing |
| PBL entry deleted after approved Requirements became authoritative | Phase 3 | yes / no / n/a |
| Epic on project board (`Backlog` while inactive or `Refinement` while planning is active) | Phase 2/3 | yes / no |
| Story decomposition PO-approved | Phase 4 | yes / no |
| PR-sized Story Issues created with label `story` | Phase 4 | yes / no |
| All Stories linked as Sub-Issues to parent Epic | Phase 4 | yes / no |
| All Stories on project board | Phase 4 | yes / no |
| AC Coverage Matrix in Epic Issue body | Phase 4 | yes / no |
| All Epic ACs covered (no gaps, no orphans) | Phase 4 | yes / no |
| AI-suitability planning gate per `crp/gov/qlt/ai-strategy-quality.md` | Phase 2 onward | conforming / nonconforming |

## Gate Rule (MUST)

- The conformance check result is confirmed inline in the Ready-Gate prompt to the PO.
- Missing deliverables block the Ready-Gate prompt.
- Nonconformance with `crp/gov/qlt/ai-strategy-quality.md` blocks the Ready-Gate prompt.
- The Epic must not enter `Ready` unless the Requirements Pack and Story decomposition are PO-approved, every Epic AC is covered, and this check passes.
- Planning Conformance runs while the Epic is `Refinement`, with implementation authority `no`.
- The Epic's existence, label, parent relationship, `Refinement` state, or validator result is not implementation authority.
- Before a governed transition, run the explicit live read-only lifecycle verification in `utl/gh/RUNBOOK.md` and preserve its result as transition evidence.
- The Tech Lead's prompt must offer support, not just request a binary decision. Example: *"Stories are created and Planning Conformance passed. The Epic is not yet Ready. Would you like to grant Ready authority, or is there anything else I can help you with first?"*

## Quality Rule (MUST)

- A skipped conformance check is a governance violation.
- The Tech Lead may not auto-advance to development without the PO's explicit Ready decision.
- The PO retains ownership of Ready, priority, and final acceptance.

## References

- `adm/gdl/planning-workflow.md` — Phase definitions and completion checklists.
- `adm/gdl/board-policy.md` — Board transitions and ownership rules.
- `crp/gov/prc/development-conformance.md` — Development session conformance (counterpart).
