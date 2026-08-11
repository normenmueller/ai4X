---
version: 1.2.0
last_updated: 2026-08-11
---

# Board Policy

## Purpose

Define status transitions, ownership gates, and label conventions for the ai4X tracking board.

## Scope

Applies to all Epics, Stories, and standalone Issues tracked on GitHub Project `#3` ([link](https://github.com/users/normenmueller/projects/3)). Private visibility.

## Ownership Principle (MUST)

PO controls intake gates (Ready for Epics and standalone Issues), priority, and final acceptance (Done). Tech Lead controls activity transitions (`In progress`, `In review`) without gaining authority to bypass Ready.

## Status Semantics (MUST)

- `Backlog` means the Issue is retained but no work is currently active.
- `In progress` means work is active. For an Epic, it may mean Requirements refinement, Story decomposition, or approved delivery.
- `Ready` means the PO has granted implementation authority after the applicable intake prerequisites passed.
- An Epic's disclosed gate facts, using the canonical template in `adm/gdl/planning-workflow.md`, must distinguish planning `In progress` from delivery `In progress`.
- Issue creation, a semantic label, a native parent relationship, and planning `In progress` never grant implementation authority.

## Issue Delivery (MUST)

All Issues — Stories, Epics' sub-issues, and standalone Issues alike — follow the same delivery lifecycle once they reach Ready. This is standard GitHub Flow.

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| **Ready → In progress** | Tech Lead | Topic branch created (`feat/*`, `fix/*`, `docs/*`, `chore/*`, or `refactor/*`). |
| **In progress → In review** | Tech Lead | PR created and linked to Issue (`closes #N`). Applicable checks green. |
| **In review → Done** | PO | PO reviews and approves the PR. Merge closes the Issue. |

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
| **Backlog -> In progress** | Tech Lead | Requirements refinement or Story decomposition is actively being performed. Implementation authority remains `no`. |
| **In progress -> Backlog** | Tech Lead | Planning activity pauses before Ready. |
| **Backlog / In progress -> Ready** | PO | Requirements Pack and Story decomposition are PO-approved, every Epic AC is covered, and Planning Conformance passed. |

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
| **Backlog -> Ready** | Tech Lead | Parent Epic has explicit PO Ready authority and the Story belongs to the approved decomposition. |

### Standalone Issue Intake

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| -> **Backlog** | Tech Lead | Issue created with a semantic label such as `enhancement`, `chore`, `documentation`, or `research`; any originating PBL entry is retained. |
| **Content promotion** (status unchanged) | PO approves; Tech Lead consolidates | PO explicitly approves scope and content. The Tech Lead makes that content authoritative in the Issue and only then deletes any originating PBL entry. |
| **Backlog -> Ready** | PO | Approved content is authoritative and any originating PBL entry is deleted. PO explicitly releases the standalone Issue for development. Content approval and Ready may be one PO decision, but promotion completes before Ready is recorded. |

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

> **Note**: Mutual reference - `adm/gdl/planning-workflow.md` references this document for board transitions. Neither is subordinate; they are complementary protocols with distinct scope (planning lifecycle vs. board mechanics).
- `adm/gdl/planning-conformance.md` — Planning conformance check.
- `crp/gov/prc/workflow.md` — 10-stage development workflow (Story execution).
- `utl/gh/RUNBOOK.md` — deterministic branch and pull-request scope evidence.
