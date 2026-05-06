---
version: 1.0.0
last_updated: 2026-05-06
---

# Planning Conformance Contract

## Purpose

Define a mandatory conformance check for the planning lifecycle (Idea → Epic → Story).
This check ensures all planning deliverables are present and complete before the Tech Lead requests the PO's Ready decision.

## Scope

Applies to all Epics promoted through the planning workflow defined in `adm/gdl/pln/protocols/workflow.md`.
This contract is the planning counterpart to the development session conformance check in `adm/gdl/dev/protocols/development-conformance.md`.

## Planning Conformance Rule (MUST)

The Tech Lead must execute this check once per Epic, after Phase 4 (Story Decomposition) and before requesting the PO's Ready decision.

If any deliverable is missing, the Tech Lead must resolve it before issuing the Ready-Gate prompt.

## Required Deliverables

| Deliverable | Phase | Presence |
|-------------|-------|----------|
| Requirements Pack in Epic Issue body | Phase 2 | present / missing |
| PBL entry deleted | Phase 3 | yes / no |
| Epic on project board (Backlog) | Phase 3 | yes / no |
| Story Issues created with label `story` | Phase 4 | yes / no |
| All Stories linked as Sub-Issues to parent Epic | Phase 4 | yes / no |
| All Stories on project board | Phase 4 | yes / no |
| AC Coverage Matrix in Epic Issue body | Phase 4 | yes / no |
| All Epic ACs covered (no gaps, no orphans) | Phase 4 | yes / no |

## Gate Rule (MUST)

- The conformance check result is confirmed inline in the Ready-Gate prompt to the PO.
- Missing deliverables block the Ready-Gate prompt.
- The Tech Lead's prompt must offer support, not just request a binary decision. Example: *"Stories are created. The Epic is in Backlog. Your decision: set the Epic to Ready, or is there anything else I can help you with first?"*

## Quality Rule (MUST)

- A skipped conformance check is a governance violation.
- The Tech Lead may not auto-advance to development without the PO's explicit Ready decision.

## References

- `adm/gdl/pln/protocols/workflow.md` — Phase definitions and completion checklists.
- `adm/gdl/shr/protocols/board-policy.md` — Board transitions and ownership rules.
- `adm/gdl/dev/protocols/development-conformance.md` — Development session conformance (counterpart).
