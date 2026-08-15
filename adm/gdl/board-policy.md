---
version: 1.4.0
last_updated: 2026-08-14
---

# Board Policy

## Purpose

Define status transitions, ownership gates, and label conventions for the ai4X tracking board.

## Scope

Applies to all Roadmaps, Epics, Stories, and standalone Issues tracked on GitHub Project `#3` ([link](https://github.com/users/normenmueller/projects/3)). Public visibility.

## Ownership Principle (MUST)

PO controls intake gates (Ready for Epics and standalone Issues), priority, and final acceptance (Done). Tech Lead controls truthful activity transitions without gaining authority to bypass Ready. The canonical lifecycle and kind applicability are owned only by `adm/gdl/planning-workflow.md`.

## Status Semantics (MUST)

- Project Status uses exactly `Backlog`, `Refinement`, `Ready`, `In progress`, `Paused`, `In review`, and `Done` in the order, colors, and meanings defined by `adm/gdl/planning-workflow.md`.
- `Backlog` is admitted inactive work; `Refinement` is active Requirements, decomposition, or Planning-Conformance work with implementation authority `no`.
- Executable `In progress` is reserved for PO-authorized delivery after `Ready`. Roadmap `In progress` is active non-executable coordination and grants no implementation authority.
- `Paused` is an optional genuine-suspension side state requiring the canonical conditional block. Ordinary approval waiting is not Paused.
- Issue creation, a semantic label, a native parent relationship, Board order, dependency relation, status, or validator result never grants implementation authority.
- Board status never substitutes for the additional high-blast-radius
  `Plan -> explicit PO approval -> Apply -> Receipt` gate owned by
  `adm/gdl/planning-workflow.md`. Ordinary waiting for that approval is not
  `Paused`; `Paused` means genuine suspension.

## Issue Delivery (MUST)

All Issues — Stories, Epics' sub-issues, and standalone Issues alike — follow the same delivery lifecycle once they reach Ready. This is standard GitHub Flow.

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| **Ready → In progress** | Tech Lead | Topic branch created (`feat/*`, `fix/*`, `docs/*`, `chore/*`, or `refactor/*`). |
| **In progress → In review** | Tech Lead | PR created and linked to Issue (`closes #N`). Applicable checks green. |
| **In review → Done** | PO | PO reviews and approves the PR. Merge closes the Issue. |
| **Refinement / Ready / In progress / In review → Paused** | Tech Lead | Origin is applicable to the work-item kind per the canonical workflow; genuine suspension; exactly one complete canonical Pause facts block. |
| **Paused → Paused from** | Tech Lead | Observable resume condition holds; return first to the recorded state and remove the Pause facts block. |

### Issue Delivery Lifecycle

```mermaid
flowchart LR
    R[Ready] -->|Tech Lead: branch created| IP[In progress]
    IP -->|Tech Lead: PR created, checks green| IR[In review]
    IR -->|PO: PR approved + merged| D[Done]
```

The topic branch must originate from the exact Base Authorization OID before
delivery starts. Before an Issue enters `In review`, its current pull request
must have a passing reconciliation for the current Publication Intent Revision.
PR creation, any base/head change, `Ready for review`, Issue `In review`, and
final conformance each require their own fresh reconciliation; an unchanged
prior proof is consumed, while changed facts require renewed local proof. No
proof can be reused as an evergreen verdict. A clean status,
`git show HEAD`, last-commit inspection, commit count alone, or local-only proof
is insufficient. If the base moved, the original branch and PR remain
preserved while renewed authority governs any replacement; force-push,
deletion, or destructive rewrite requires explicit PO approval.
Every replacement authority must retain a contiguous, digest-bound link to its
exact predecessor; changing the authorized revision or base OID without that
lineage is invalid.
The normative lifecycle and commands are defined in `utl/gh/RUNBOOK.md` under
**Branch and Pull-Request Scope** and in the Branching and Merge Rule of
`crp/gov/prc/workflow.md`.

## Issue Intake

Issue intake defines how an Issue reaches Ready. This differs by type.

### Epic Intake

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| -> **Backlog** | Tech Lead | A PO-approved roadmap identifies a coherent planned Epic, or the Requirements Pack is approved. The Issue has label `epic` and discloses all gate facts. |
| **Backlog -> Refinement** | Tech Lead | Requirements refinement, Story decomposition, or Planning Conformance is actively being performed. Implementation authority remains `no`. |
| **Refinement -> Backlog** | Tech Lead | Planning becomes inactive before Ready; this is not a genuine suspension requiring Paused. |
| **Backlog / Refinement -> Ready** | PO | Requirements Pack and Story decomposition are PO-approved, every Epic AC is covered, and Planning Conformance passed. |

### Epic Delivery

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| **Ready -> In progress** | Tech Lead | First Story of the Epic enters In progress; disclosed gate facts show Ready authority was granted. |
| **In progress -> In review** | Tech Lead | Every native Story Sub-Issue is closed (`Done`); a Story still `In review` blocks this transition. Final acceptance pending. |
| **In review -> Done** | PO | PO confirms final acceptance of all Epic ACs across all Stories. |

### Story Intake

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| -> **Backlog** | Tech Lead | PO-approved PR-sized Story is created with label `story` as a native Sub-Issue of its Epic. |
| **Backlog -> Refinement** | Tech Lead | Story-level Requirements or Planning Conformance work is active; implementation authority remains `no`. |
| **Refinement -> Backlog** | Tech Lead | Planning becomes inactive before Ready. |
| **Backlog / Refinement -> Ready** | Tech Lead | Parent Epic has explicit PO Ready authority and the Story belongs to the approved decomposition. |

### Standalone Issue Intake

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| -> **Backlog** | Tech Lead | Issue created with a semantic label such as `enhancement`, `chore`, `documentation`, or `research`; any originating PBL entry is retained. |
| **Backlog -> Refinement** | Tech Lead | Standalone content or applicable Planning Conformance work is active; implementation authority remains `no`. |
| **Refinement -> Backlog** | Tech Lead | Planning becomes inactive before Ready. |
| **Content promotion** (status unchanged) | PO approves; Tech Lead consolidates | PO explicitly approves scope and content. The Tech Lead makes that content authoritative in the Issue and only then deletes any originating PBL entry. |
| **Backlog / Refinement -> Ready** | PO | Approved content is authoritative and any originating PBL entry is deleted. PO explicitly releases the standalone Issue for development. Content approval and Ready may be one PO decision, but promotion completes before Ready is recorded. |

### Roadmap Coordination

Roadmaps use only the kind-specific states defined by the canonical workflow.
`Backlog -> In progress` starts active non-executable coordination;
`In progress -> In review` presents coordination evidence; and `Done` requires
the applicable PO acceptance and Issue closure. A Roadmap may pause only from
`In progress` or `In review`, and its status never grants implementation authority.

## GitHub Labels

Canonical role definitions remain in `adm/gdl/glossary.md`. The descriptions below are operational label projections, not independent term definitions.

The following labels must exist in the repository:

| Label | Color | Description |
|-------|-------|-------------|
| `roadmap` | project-defined | No implementation authority |
| `epic` | `#3E4B9E` | Strict Ready gate applies |
| `story` | `#0E8A16` | Native Sub-Issue relationship required |
| `blocked` | `#D93F0B` | Blocked: cannot proceed, requires action |

Additional labels (optional but recommended):

| Label | Color | Description |
|-------|-------|-------------|
| `enhancement` | project-defined | Standalone product or process enhancement |
| `chore` | `#C5DEF5` | Standalone maintenance, governance, or housekeeping work |
| `documentation` | project-defined | Standalone documentation work |
| `research` | project-defined | Standalone research or exploration |
| `refactor` | `#C5DEF5` | Standalone refactoring without behavior change |
| `curate` | `#FBCA04` | Related to the curate sub-command |
| `spawn` | `#FBCA04` | Related to the spawn sub-command |
| `doctor` | `#FBCA04` | Related to the doctor sub-command |

## References

- `adm/gdl/planning-workflow.md` — Phase definitions and completion checklists.

> **Authority note**: `adm/gdl/planning-workflow.md` is the sole lifecycle and gate-fact authority. This document is its board-mechanics projection and must not redefine it.
- `adm/gdl/planning-conformance.md` — Planning conformance check.
- `crp/gov/prc/workflow.md` — 10-stage development workflow (Story execution).
- `utl/gh/RUNBOOK.md` — deterministic branch and pull-request scope evidence.
