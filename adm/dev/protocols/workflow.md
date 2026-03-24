# Development Workflow

## Purpose

This document routes development work in the public ai4X suite to the correct execution protocol.
It is not the global bootstrap contract and it is not the place for detailed execution steps.

Use `AGENTS.md` first.
Use this file second.
Use the task-specific protocol third.

Development work is governance-valid only when this bootstrap chain was followed explicitly.

## Scope

This workflow applies to development and governance work in `ai4x`, `ask`, `kob`, `ccp`, and `tcp` when that work is performed in the ai4X suite context.
It covers planning, review, capability quality, documentation quality, and release-preparation from a development perspective.

Operational runtime, delivery, UAT, and maintainer procedures belong to `adm/ops/*`.

## Documentation and Governance Taxonomy (MUST)

1. `doc/usr/*` = direct human-facing documentation.
2. `doc/agn/*` = agent-facing onboarding and navigation documentation.
3. `doc/arc/*` = architecture and system-reference documentation.
4. `doc/*` = explanation and reference.
5. `adm/dev/*` = centralized ai4X development governance.
6. `adm/ops/*` = centralized ai4X runtime, delivery, and maintainer operations.
7. module-local `doc/arc/*` = module architecture and structure references.
8. module-local `adm/dev/*` = module-specific contracts, protocols, and deep normative technical documentation.
9. module-local `adm/ops/*` = module-specific operations.
10. `adm/dev/contracts/*` = binding development contracts.
11. `adm/dev/protocols/*` = development execution protocols.
12. `adm/ops/runbooks/*` = operational runbooks.
13. `adm/ops/reports/*` = operational evidence and status reports.

For an explanatory treatment of this split, use `doc/agn/governance-model.md`.
This workflow remains procedural and routing-oriented.

Normative interpretation rule (MUST):

- `doc/*` is descriptive documentation.
- `adm/dev/*` and `adm/ops/*` are normative governance surfaces.
- `doc/agn/*` may explain governance, but it must not replace, redefine, or overrule governance.
- If explanatory and normative sources diverge, `AGENTS.md`, this workflow, the active development contracts/protocols, and `adm/ops/*` win.

## Context Rule (MUST)

- `ai4x` is the suite, integration, and governance repository.
- The modules are domain-owning repositories with their own technical and semantic artifacts.
- When module work is performed inside the ai4X suite context, the canonical governance is owned here in root `ai4x`.
- Module-local governance documents must therefore be read as module-specific extensions, not as replacements for this central workflow.
- Outside the ai4X suite context, governance is defined by the external environment, not by this workflow.

## Protocol Map (MUST)

Use the following canonical protocols:

- planning intake / proposal sharpening -> `adm/dev/protocols/proposal-assessment.md`
- planning/task/roadmap transition -> `adm/dev/protocols/approval-transition.md`
- review and quality verdict -> `adm/dev/protocols/review.md`
- handover / fresh-session reboot -> `adm/dev/protocols/handover.md`
- capability quality / placement judgment -> `adm/dev/protocols/capability-judgment.md`
- capability exclusivity / `conflicts` audit -> `adm/dev/protocols/conflict-audit.md`

Protocol routing must be explicit.
Do not infer the execution path from repository layout alone.

## Process Routing (MUST)

No development action is valid unless the correct protocol path was identified first.

### 1. Planning intake

Use when:
- a new idea enters `adm/pln/inbox/`
- a proposal needs professionalization

Required protocol:
- `proposal-assessment.md`

### 2. Planning transition

Use when:
- moving work between `assessed`, `accepted`, `rejected`, `realized`
- changing roadmap slots in `adm/pln/rdmp.md`

Required protocol:
- `approval-transition.md`

### 3. General review

Use when:
- a neutral quality verdict is required
- a change package must be assessed before merge or release
- documentation, software, or capability quality must be judged holistically

Required protocol:
- `review.md`

### 4. Capability change

Use when:
- a `ccp` or `tcp` capability is created, renamed, split, moved, or retired
- capability semantics, metadata, composition, or placement are touched

Required artifacts and protocols:
- `adm/dev/contracts/capability-quality.md`
- `adm/dev/contracts/capability-discoverability.md`
- `adm/dev/protocols/capability-judgment.md`
- `adm/dev/protocols/conflict-audit.md` if `requires/conflicts` or portfolio exclusivity is affected

Capability quality, placement, and `keep|sharpen|split|move|drop` decisions must be made through the capability-quality contract and the capability-judgment protocol, not ad hoc from general review or repository layout.

### 5. Handover / reboot readiness

Use when:
- the suite or a major module changed materially
- a fresh agent must be able to continue without hidden session knowledge
- release preparation requires refreshed reboot evidence

Required protocol:
- `handover.md`

### 6. Runtime / delivery / maintainer operations

Use when:
- UAT is executed
- release/go-live/repo-ops/CI settings are changed
- operational recovery or maintainer procedures are required

Canonical location:
- `adm/ops/*`

## Capability Quality Gate (MUST)

Capability-related development work is incomplete unless:

1. the capability-quality contract was applied,
2. the capability-discoverability contract was applied,
3. the explicit placement decision was documented (`ccp|tcp|governance|split`),
4. the action decision was documented (`keep|sharpen|split|move|drop`),
5. real conflicts were audited where exclusivity could matter.

## Planning Contract (MUST)

1. `adm/pln/inbox/` contains only `Proposal` with `status: draft`.
2. `adm/pln/assessed/` contains only `Proposal` with `status: assessed`.
3. `adm/pln/accepted/` contains `Task` artifacts with `status: none|open|wip|blocked` plus the single reserved helper file `adm/pln/accepted/_template.md`.
4. `adm/pln/rejected/` and `adm/pln/realized/` contain only `status: done` with matching tags.
5. No transition into `accepted/` and no roadmap change without explicit approval.
6. Proposal assessment must end with an explicit decision proposal.
7. Every future `assessed -> accepted` transition must produce an accepted task with:
   - `# Content`
   - `## Plan`
   - one fenced text block under `## Plan`
   - one directly copy-pasteable `/plan ...` prompt in that fenced text block
8. The `/plan` prompt must be short, direct, and derived from the approved proposal rather than from the title alone.

## Consistency Before Commit (MUST)

1. run relevant deterministic gates (`verify`, `doctor`, module-local checks)
2. sync documentation when contracts, structures, or behaviors changed
3. keep submodule pointers aligned with module worktrees
4. review and update `doc/agn/source-map.md` whenever canonical source ownership, routing role, classification, or path changed
5. validate links and canonical paths after documentation moves
6. refresh development evidence reports when review or handover was part of the change
7. keep GitHub metadata reproducible via `bash ./utl/gh/repo-metadata.sh --check-local`
8. update `../HISTORY.md` for every realized implementation package before declaring completion

## External Daily History (MUST)

Maintain `../HISTORY.md` as an external daily work log:

1. use one date heading per day
2. keep entries short and outcome-oriented
3. summarize implemented results, not command history or every file touch
4. do not use `../HISTORY.md` as a substitute for `CHANGELOG`, `adm/ops/reports/review.md`, or `adm/ops/reports/handover.md`
5. every realized implementation package must add or extend the current day entry before completion
6. if `../HISTORY.md` cannot be written in the current environment, the package remains incomplete until the entry is added

## Branching and Merge Policy (MUST)

1. `trunk` is the only integration line.
2. Non-trivial work goes on short-lived topic branches.
3. Branches use the standard prefixes:
   - `feat/`
   - `fix/`
   - `docs/`
   - `chore/`
   - `refactor/`
4. Merge to `trunk` normally happens through pull requests.
5. Direct commits to `trunk` require explicit approval.
6. Approved owner-only emergency direct pushes require post-fact review evidence in `adm/ops/reports/review.md`.

## Reading Order for Fresh Development Sessions

1. `AGENTS.md`
2. this file
3. the required task-specific protocol
4. affected README(s)
5. affected `doc/arc/*` and module `doc/arc/*` when architecture matters
6. affected module `adm/dev/*` only for module-specific contracts and deep normative detail
7. supporting explanation docs in `doc/usr/*` and `doc/agn/*` if needed
