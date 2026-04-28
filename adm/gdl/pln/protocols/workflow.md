# Planning Workflow: Idea → Epic → Story → Done

## Overview

This document defines the planning workflow for ai4X, following established Scrum/SAFe conventions adapted for a small expert team.

- **Ideas** are drafted by the Product Owner (PO) in `adm/pbl/` as a temporary exploration area.
- The expert team refines Ideas into **Epics** with explicit acceptance criteria.
- The Tech Lead decomposes approved Epics into **Stories** (GitHub Issues).
- Development executes per Story through the 9-stage expert team workflow.
- GitHub Issues are the single source of truth once promoted. PBL entries are deleted after promotion.

## Work Item Hierarchy

| Level | What | Who creates | Who approves | GitHub representation |
|-------|------|-------------|-------------|----------------------|
| **Idea** | Vague intent, exploration | PO | — | `adm/pbl/*.md` (temporary) |
| **Epic** | Refined scope with acceptance criteria | RE (from Idea) | PO | Issue with label `epic` |
| **Story** | Implementable unit of work | Tech Lead (from Epic) | PO | Issue with label `story`, linked to Epic |
| **Task** | Implementation step within a Story | Dev team (implicit) | — | Checklist within Story Issue |

### Ownership Rules

1. The PO owns the backlog. No one changes priority without PO approval.
2. The PO writes Ideas. The expert team helps refine, but never overwrites PO intent.
3. The RE produces the Epic definition (Requirements Pack). The PO approves it.
4. The Tech Lead proposes the Story decomposition. The PO approves it.
5. Tasks are internal to the dev team and do not require PO approval.

## Phases

### Phase 1: Idea (PO, `adm/pbl/`)

**Scope**: New ideas, vague intents, exploration, and early discussion.

**Artifact**: Markdown file in `adm/pbl/` (temporary, not versioned long-term).

**Status**: `idea`

**Duration**: Days to a few weeks. Goal: reach enough clarity to start refinement.

**Exit**: PO decides to refine the Idea into an Epic (triggers Phase 2) or rejects it.

### Phase 2: Epic Refinement (RE + PO)

**Trigger**: PO submits Idea to the Tech Lead for refinement.

**Process**:
1. Tech Lead triages scope and delegates to Requirements Engineer.
2. RE works with PO to produce a **Requirements Pack** (= Epic definition):
   - Problem statement
   - In-scope and out-of-scope
   - Constraints and assumptions
   - Acceptance criteria (EARS format)
   - Non-goals
   - Risks and open decisions
3. PO reviews and approves the Requirements Pack.

**Status**: `ready-for-promotion`

**Exit**: PO approval of the Requirements Pack. This is the promotion gate.

### Phase 3: Epic Promotion (Tech Lead)

**Trigger**: PO approval of Requirements Pack.

**Action**:
1. Tech Lead creates a GitHub Issue with label `epic`.
2. Issue body contains the approved Requirements Pack content.
3. Issue references the original PBL artifact path for traceability.
4. **Delete PBL entry** from `adm/pbl/`. PBL is temporary; GitHub Issues are the single source of truth.

**Status**: Epic Issue is open on GitHub.

### Phase 4: Story Decomposition (Tech Lead → PO Approval)

**Trigger**: Epic Issue exists on GitHub.

**Process**:
1. Tech Lead decomposes the Epic into Stories based on:
   - Implementable scope (one Story = one PR-sized unit of work)
   - Architecture boundaries and dependencies
   - Acceptance criteria grouping
2. Tech Lead presents the proposed Story breakdown to PO.
3. PO reviews and approves the Story decomposition.

**Action**:
1. Tech Lead creates GitHub Issues with label `story` for each approved Story.
2. Each Story Issue is linked to the parent Epic Issue as a **GitHub Sub-Issue** (not via task lists or text references).
3. Each Story Issue contains:
   - Subset of acceptance criteria from the Epic
   - Implementation scope description
   - Link to parent Epic
4. Tech Lead adds an **AC Coverage Matrix** to the Epic Issue body showing which Story covers which acceptance criterion. This matrix is the authoritative traceability artifact for the Epic.

**Exit Gate**: After Story Issues are created and linked, the Tech Lead must explicitly request the PO's Ready decision for the Epic. No development work may begin until the PO transitions the Epic to Ready. The Tech Lead's prompt must offer support, not just request a binary decision. Example: *"Stories are created. The Epic is in Backlog. Your decision: set the Epic to Ready, or is there anything else I can help you with first?"*

### Phase 5: Development (Story → PR → Merge)

**Scope**: Each Story follows the 9-stage expert team workflow in `adm/gdl/dev/protocols/workflow.md`.

**Process**:
1. Tech Lead creates a topic branch (`feat/*`, `fix/*`, etc.) for the Story.
2. The 9-stage dev workflow executes against that Story. The Tech Lead determines in Stage 1 which conditional stages apply.
3. PR is linked to the Story Issue (via `closes #N`).
4. PR description references the parent Epic and summarizes key artifacts for traceability.

**Checks**: `make verify`, `make doctor`, GitHub Actions workflow.

### Phase 6: Closure

**Story closure**:
1. PR merged to trunk → Story Issue auto-closes (via `closes #N`).

**Epic closure**:
1. All Story Issues linked to the Epic are closed.
2. Tech Lead verifies Epic acceptance criteria are fully covered.
3. Tech Lead closes the Epic Issue.

## Policy

| Aspect | Decision |
|--------|----------|
| **Work item hierarchy** | Idea → Epic → Story → Task (standard Scrum/SAFe). |
| **Epic promotion** | Mandatory for Features and Fixes. Optional for Docs, Chore, and Refactor. |
| **Story linkage** | Every Story must link to a parent Epic via GitHub Sub-Issues. |
| **AC traceability** | Every Epic must contain an AC Coverage Matrix mapping each acceptance criterion to its covering Story. |
| **PBL retention** | Temporary only. Delete after Epic promotion. No archive. |
| **Single source of truth** | GitHub Issues once promoted. PBL is draft-only. |
| **PO control** | PO approves: Epic content, Story decomposition, and final acceptance. |
| **Backlog priority** | Only the PO sets and changes priority. |
| **Issue labels** | `epic` and `story` are mandatory. Additional labels optional. |
| **Issue linkage** | Mandatory for Features/Fixes. Optional for Docs/Chore/Refactor. |
| **Tracking board** | GitHub Project `#3` ([link](https://github.com/users/normenmueller/projects/3)). All Epics and Stories must be tracked there. Private visibility. |

## Board Transition Policy

Status transitions on the tracking board are gated. Items must not advance unless all prerequisites are met.

**Ownership principle**: PO controls Epic gates (Ready, Done). Tech Lead controls all Story transitions and Epic execution gates (In progress, In review).

### Epic Transitions

| Transition | Owner | Prerequisites |
|------------|-------|---------------|
| → **Backlog** | Tech Lead | Epic Issue created after PO approval of PBL draft. |
| **Backlog → Ready** | PO | Acceptance criteria are complete and testable. PO confirms release for development. |
| **Ready → In progress** | Tech Lead | Story decomposition is PO-approved. First Story is started. |
| **In progress → In review** | Tech Lead | All Stories are Done. AC Coverage Matrix is complete. All Story tests are green. |
| **In review → Done** | PO | PO confirms final acceptance of all ACs. |

### Story Transitions

All Story transitions are owned by the Tech Lead.

| Transition | Prerequisites |
|------------|---------------|
| → **Backlog** | Story Issue created. Linked as Sub-Issue to parent Epic. |
| **Backlog → Ready** | Implicitly Ready when parent Epic is Ready and Story decomposition is PO-approved. |
| **Ready → In progress** | Topic branch is created. Dev Workflow Stage 1 (Triage and Scope) is started. |
| **In progress → In review** | PR is created and linked to the Issue (`closes #N`). TDD cycle is complete: all Story tests are written and green. `make verify` is green. |
| **In review → Done** | PR is merged to trunk. Issue auto-closed via `closes #N`. |

## GitHub Labels

The following labels must exist in the repository:

| Label | Color | Description |
|-------|-------|-------------|
| `epic` | `#3E4B9E` | Epic: refined requirement scope with acceptance criteria |
| `story` | `#0E8A16` | Story: implementable unit of work within an Epic |
| `blocked` | `#D93F0B` | Blocked: cannot proceed, requires action |

Additional labels (optional but recommended):

| Label | Color | Description |
|-------|-------|-------------|
| `curate` | `#FBCA04` | Related to the curate sub-command |
| `spawn` | `#FBCA04` | Related to the spawn sub-command |
| `doctor` | `#FBCA04` | Related to the doctor sub-command |

## Verification

1. Run one end-to-end dry run: Idea in PBL → Epic refinement → Epic Issue → Story decomposition → Story Issues → PR → merge → closure.
2. Confirm PBL entry is deleted after Epic promotion.
3. Confirm Story Issues link to parent Epic Issue.
4. Confirm traceability chain: Epic Issue → Story Issue → PR → merged commit.
5. Confirm `make verify`, `make doctor`, and GitHub Actions remain green.
6. Confirm non-Feature/Fix changes (Docs, Chore, Refactor) can proceed without mandatory Epic/Story linkage.

## References

- `adm/gdl/dev/protocols/workflow.md` — 9-stage expert team routing, branching, commits, and completion gates.
- `.github/agents/ai4x.agent.md` — Tech Lead definition, interaction model, and product rules.
- `CONTRIBUTING.md` — informative contributor guidance.
