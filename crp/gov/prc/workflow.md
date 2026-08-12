---
version: 1.2.0
last_updated: 2026-08-12
---

# Development Workflow

## Purpose

This workflow defines development routing for the ai4x CLI.
It applies to implementation work for curate, spawn, and doctor.

## Scope

This workflow governs development work for the ai4x CLI in this repository.

## Normative vs Informative Sources

Normative development governance for this repository lives in:

1. .github/agents/ai4x.agent.md
2. crp/gov/qlt/*
3. crp/gov/prc/*

All artifacts under adm/gdl are normative governance artifacts.

CONTRIBUTING.md is informative contributor guidance.
It may explain process and expectations, but it is not a normative governance source.

## Command Surface Rule

All implementation work must keep the command surface explicit:

1. ai4x curate
2. ai4x spawn
3. ai4x doctor

No hidden defaults in config or CLI resolution.

## Branching and Merge Rule

1. `trunk` is the integration line.
2. Every Issue (Story or standalone) is developed on a short-lived topic branch.
3. Topic branches use the standard prefixes `feat/*`, `fix/*`, `docs/*`, `chore/*`, or `refactor/*`.
4. Every topic branch is merged to `trunk` through a pull request linked to the Issue (`closes #N`).
5. No direct commits to `trunk`.
6. Merging uses squash as standard.
7. Before branch creation, the Tech Lead records a Base Authorization and creates the branch from its exact target OID.
8. After the intended commits exist and before verification or push, the Tech Lead records a Publication Intent Revision containing the complete commit set and provider-neutral file delta.
9. The deterministic preflight in `utl/gh/branch-scope.sh` must pass locally, immediately before every push, and against the pull request at the lifecycle boundaries defined in its runbook.
10. A moved target, changed HEAD, dirty index/worktree, stale approval, incomplete provider evidence, or local/GitHub disagreement blocks publication until authority and evidence are refreshed.
11. Clean status, `git show HEAD`, the last commit, commit count alone, and local-only proof never substitute for complete scope reconciliation.
12. Target movement preserves the original branch and pull request. Any replacement uses a newly approved base, an exact digest-bound predecessor lineage, and renewed Publication Intent; force-push, branch/PR deletion, or destructive history rewrite requires explicit PO approval and is never performed by the preflight.

The authority model, intent shape, lifecycle boundaries, and commands are
defined in `utl/gh/RUNBOOK.md` under **Branch and Pull-Request Scope**. The
machine-readable intent and emitted proofs are evidence projections; the Issue
remains the approval authority.

## Commit Message Rule

1. Use Conventional Commits.
2. Default format: `<type>: <summary>`.
3. Use a scope only when it improves clarity.
4. Keep type, optional scope, and summary lowercase.
5. Keep the summary concise and behavior-oriented.

## Routing

1. CLI argument behavior changes
- update parser tests and command docs

2. Config model changes
- update global and project config contract descriptions
- keep required fields explicit

3. Runtime link behavior changes
- ensure links target project-local generated artifacts only

4. Verification changes
- keep `make verify` green and apply the Completion Gate's Doctor and Capability evidence rules
- keep required repository structure versioned so fresh checkouts satisfy verification

5. GitHub automation changes
- keep GitHub Actions workflows aligned with the current repository layout and active verification entrypoints

6. Repository metadata changes
- follow the runbook in `utl/gh/RUNBOOK.md`

7. Branch or pull-request publication
- follow the Branch and Pull-Request Scope contract in `utl/gh/RUNBOOK.md`

## Expert Team Routing

For non-trivial work, route execution through the expert team below.
This workflow executes **per Story**. Epic refinement and Story decomposition are defined in `adm/gdl/planning-workflow.md`.

1. Triage and Scope (`ai4X`) — mandatory
- takes Story scope from the parent Epic
- confirms constraints and required artifacts
- determines which stages are needed for this Story (see Stage Applicability below)

2. Requirements Refinement (`ai4x-requirements`) — conditional
- refines Story-level acceptance criteria only when the Epic ACs are too coarse for the Story scope
- skipped when the Tech Lead determines the Epic decomposition already provides sufficient Story-level ACs
- if run, updates the Story Issue with refined ACs

3. Architecture (`ai4x-architecture-ddd`) — conditional
- defines context boundaries, invariants, and alternatives with trade-offs
- skipped for scope-limited changes that do not affect module boundaries or domain invariants

4. Critical Review Pass A (`ai4x-critical-reviewer`) — conditional
- challenges requirements and architecture before implementation
- blocks progression on unresolved high-severity findings
- mandatory when Stage 2 or Stage 3 produced new artifacts; skipped when both were skipped

5. AI Strategy (`ai4x-ai-strategy`) — conditional
- validates model/tool constraints, fallback behavior, uncertainty policy, and prompt/context discipline
- required when the Story involves AI/LLM behavior or shapes agent planning, context, capability consumption, or review behavior

6. Capability Governance (`ai4x-capability-governance`) — conditional
- validates portfolio coverage, authors or revises capabilities, performs semantic fitness checks
- only when the Story involves cognitive capability authoring, evaluation, or portfolio change

7. Implementation (`ai4x-implementation`) — mandatory
- implements approved behavior with explicit error handling and modular boundaries

8. Testing (`ai4x-testing-tdd`) — mandatory
- drives behavior-first tests and regression safeguards

9. Critical Review Pass B (`ai4x-critical-reviewer`) — mandatory
- independent review of implementation and tests before merge

10. Final Acceptance (`ai4X`) — mandatory
- final gate decision and completion check
- only this stage can issue final `approved`

### Stage Applicability

The Tech Lead determines in Stage 1 which stages are needed for the current Story.

| Stage | Applicability | Skip condition |
|-------|--------------|----------------|
| 1. Triage and Scope | Always | — |
| 2. Requirements Refinement | Conditional | Epic ACs are already sufficient for the Story scope |
| 3. Architecture | Conditional | No module boundary or domain invariant changes |
| 4. Critical Review A | Conditional | Stages 2 and 3 were both skipped |
| 5. AI Strategy | Conditional | Story does not involve AI/LLM behavior and does not shape agent planning, context, capability consumption, or review behavior |
| 6. Capability Governance | Conditional | Story does not involve cognitive capability authoring, evaluation, or portfolio change |
| 7. Implementation | Always | — |
| 8. Testing | Always | — |
| 9. Critical Review B | Always | — |
| 10. Final Acceptance | Always | — |

### Stage Input/Output Contract

1. Requirements Refinement stage, if run, must produce an updated Requirements Pack (or confirm the Epic-level ACs are sufficient).
2. Architecture stage, if run, must consume the Requirements Pack and produce an Architecture Pack.
3. Critical Review Pass A, if run, must consume all artifacts produced by preceding stages and produce Review A Findings.
4. AI Strategy stage, if run, must consume Requirements Pack and Architecture Pack (if produced), and produce an AI Strategy Note.
5. Capability Governance stage, if run, must consume Requirements Pack, Architecture Pack (if produced), and portfolio state (`crp/cap/**`); it must produce a Capability Assessment Report and, when applicable, new or revised capability artifacts.
6. Implementation stage must consume all available upstream artifacts (Requirements Pack, Architecture Pack if produced, Review A Findings if produced, AI Strategy Note if produced, Capability Assessment Report if produced); it must produce the exact candidate plus a transient concise Implementation Pack map conforming to `crp/gov/qlt/implementation-quality.md`.
7. Testing stage must consume Requirements Pack, Architecture Pack (if produced), the exact candidate, and the transient Implementation Pack map; it must derive behavior from Requirements/candidate rather than Pack prose and produce a Test Evidence Pack.
8. Critical Review Pass B must consume the exact candidate, Implementation Pack, and Test Evidence Pack and produce Review B Findings. It must inspect cited executable evidence and independently review semantic authority/duplication.
9. Missing mandatory artifacts, unresolved contradictions, or unresolved high-severity findings block progression.
10. When a conditional stage is skipped, its output artifact is marked `n/a` in the conformance record.
11. When Review B blocks and returns to Implementation, Stages 7–8 re-execute before resubmitting to Review B.

### Implementation Pack Publication and Review Loop

1. `crp/gov/qlt/implementation-quality.md` is the sole current definition of the canonical six-class Implementation Pack and its deterministic limits.
2. Before PR creation, the map is a transient active-session projection for Stage 8/9. It is not a repository artifact or approval authority.
3. PR publication creates exactly one canonical `## Implementation Pack` section. Its canonical authority bindings, decisions, acceptance evidence, candidate identity, and residual risks must match the transient map. Missing, invalid, oversized, contradictory, or changed facts block publication.
4. The validator may establish structural facts only. Review B must inspect the exact revision-bound candidate/evidence and owns semantic authority, evidence-fitness, and duplication judgment.
5. Every material Review B finding receives one stable identity, one minimal remediation, and at most one independent finding-bounded re-review. If the same obligation remains unsatisfied, stop and escalate one PO decision with both evidence-backed positions and one concrete Tech Lead recommendation.
6. A genuinely different material defect requires new evidence, a distinct violated obligation or executable risk, and accepted-scope proof. Wording/style observations without such evidence do not block and cannot require Pack expansion.
7. If accepted upstream authority intentionally leaves an exact boundary open and dependent work cannot proceed, Stage 7 may produce one executable foundation closure under `crp/gov/qlt/implementation-quality.md`. It must be independently reviewed before dependent implementation and cannot be replaced by speculative prose.

### Gate Decision Semantics

1. Specialist gate outputs are `blocked` or `pass`.
2. Final `approved` is issued only by orchestration after all blockers are closed.
3. A `pass` verdict may include observations. Observations are non-blocking findings that the orchestrator captures as separate PBL entries or Stories. They do not affect progression.

## Governance Glossary

This glossary defines canonical terms for workflow execution, reviews, and onboarding.

> **Planning Terms** and **Qualifier Terms** — see `adm/gdl/glossary.md` for canonical definitions.

### Gate Terms

1. Stage Gate
- A mandatory decision point between workflow stages.

2. Progression
- Advancing from one stage to the next stage.

3. Remediation
- Required corrective action before progression or final approval.

### Artifact Terms

1. Requirements Pack
- Problem statement, scope, constraints, and acceptance criteria.

2. Architecture Pack
- Boundaries, invariants, alternatives, and recommendation.

3. Review A Findings
- Pre-implementation findings and blocker status from critical review.

4. AI Strategy Note
- Model/tool limits, fallback behavior, uncertainty policy, and safeguards.

5. Capability Assessment Report
- Portfolio health verdict, gap analysis, overlap findings, and recommended portfolio actions.

6. Implementation Pack
- Concise six-class decision-and-evidence map into immutable upstream authorities and the exact candidate. It contains authority bindings, changed boundaries, implementation decisions/failure behavior not owned elsewhere, AC evidence, exact verification/candidate identity, and residual risks/follow-ups. It is not a second specification.

7. Test Evidence Pack
- Behavior matrix, test strategy evidence, and regression safeguards.

8. Review B Findings
- Pre-merge findings, blocker status, and residual risk statement.

### Verdict Terms

1. blocked
- Stage cannot proceed. Blocking reasons and remediation owners are mandatory.

2. pass
- No blockers found. Stage may proceed. May include observations — non-blocking findings that the orchestrator captures as separate PBL entries or Stories.

3. approved
- Final acceptance verdict by orchestration only, after all blockers are closed.

## Session Conformance Check

For non-trivial work, the orchestrator must execute the session conformance check defined in `crp/gov/prc/development-conformance.md`:

1. before implementation starts
2. before final acceptance/merge

The conformance record must include artifact presence, coherence/testability status, explicit gate decision, blocker list, and remediation ownership.

## Artifact Persistence

Artifacts produced during workflow execution persist as follows:

| Artifact | Persistence location |
|----------|---------------------|
| Idea | `adm/pbl/*.md` (temporary, deleted after Epic promotion) |
| Requirements Pack (Epic-level) | GitHub Epic Issue body |
| Story-level ACs | GitHub Story Issue body |
| Architecture Pack | Chat session (referenced in PR description for traceability) |
| Review A/B Findings | Chat session (blocking findings summarized in PR description) |
| AI Strategy Note | Chat session (referenced in PR description when applicable) |
| Capability Assessment Report | Chat session (referenced in PR description when applicable) |
| New/Revised Capability Artifacts | `crp/cap/**` in topic branch |
| Implementation Pack | Exact candidate in topic branch + one canonical PR-description section; transient active-session map before PR creation only |
| Test Evidence Pack | Test files in topic branch + CI results |
| Conformance Record | Chat session (summary in PR description) |

For cross-session traceability, the PR description must reference the parent Story Issue and bind key artifacts. The canonical Implementation Pack section is limited to 100 non-empty lines and 12,000 raw UTF-8 bytes and is validated by `utl/gh/implementation-pack.mjs`; it references rather than restates upstream or executable authority. No repository Pack, attachment, or chained companion comment is permitted.

## Visual Flow

### Planning Flow (Idea → Epic → Stories)

The planning flow diagram is maintained in `adm/gdl/planning-workflow.md` (Visual Flow section).

### Development Flow (per Story)

```mermaid
flowchart TD
	STORY[Story Issue] --> O1[ai4X Tech Lead<br/>Stage 1: Triage and Scope]
	O1 --> NEED_REQ{Story ACs<br/>sufficient?}
	NEED_REQ -->|No| R[ai4x-requirements<br/>Stage 2: Refine Story ACs]
	NEED_REQ -->|Yes| NEED_ARCH{Architecture<br/>impact?}
	R --> NEED_ARCH
	NEED_ARCH -->|Yes| A[ai4x-architecture-ddd<br/>Stage 3: Architecture]
	NEED_ARCH -->|No| NEED_CRA{Stage 2 or 3<br/>ran?}
	A --> CR1[ai4x-critical-reviewer<br/>Stage 4: Review Pass A]
	NEED_CRA -->|Yes| CR1
	NEED_CRA -->|No| NEED_AI{AI-heavy?}
	CR1 -->|Blocked| DQ[Decision Question to PO]
	DQ --> CR1_FIX[Remediate blocked stage]
	CR1_FIX --> CR1
	CR1 -->|Conditional approve| NEED_AI
	NEED_AI -->|Yes| S[ai4x-ai-strategy<br/>Stage 5: AI Strategy]
	NEED_AI -->|No| NEED_CAP{Capability<br/>work?}
	S --> NEED_CAP
	NEED_CAP -->|Yes| CG[ai4x-capability-governance<br/>Stage 6: Capability Governance]
	NEED_CAP -->|No| I
	CG --> I[ai4x-implementation<br/>Stage 7: Implementation]
	I --> T[ai4x-testing-tdd<br/>Stage 8: Testing]
	T --> CR2[ai4x-critical-reviewer<br/>Stage 9: Review Pass B]
	CR2 -->|Blocked| I
	CR2 -->|Conditional approve| O2[ai4X Tech Lead<br/>Stage 10: Final Acceptance]
	O2 --> DONE[Done: Completion Gate satisfied]
```

## Completion Gate

A change is complete only if:

1. make verify passes
2. Doctor evidence is `n/a` until a deliberately implemented and tested `make doctor` target exists
3. reintroducing a Doctor gate requires an executable command contract and associated tests; a no-op target does not satisfy this gate
4. Capability evidence is `n/a` until a deliberately implemented and tested entrypoint exists; once applicable, it must pass
5. reintroducing Capability quality gates or tests requires an implemented entrypoint and associated tests; a no-op target or placeholder directory does not satisfy this gate
6. docs affected by behavior changes are updated
7. GitHub workflow changes remain consistent with the current repository structure
8. repository metadata changes are reconciled through the metadata runbook when applicable
9. required repository structure is versioned so fresh checkouts contain the paths that verification expects
