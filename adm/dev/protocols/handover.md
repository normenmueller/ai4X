# Handover Protocol

This document is the cross-project agent instruction for creating a
`handover.md` as a fresh-session live-state and continuity artifact.
It is not the general project onboarding source.

Trigger example:
`Create a handover.md according to @adm/dev/protocols/handover.md.`

## 1) Goal (MUST)

Produce a fresh-session continuity artifact that enables an agent without session history to become productive quickly while:

- pointing to the canonical project onboarding and governance chain,
- making the current live state, risks, and special constraints explicit,
- defining a deterministic reboot reading order,
- making test/gate strategy directly executable,
- and enabling clean task intake for design and implementation without hidden session knowledge.

## 2) Output Artifact (MUST)

- target path: `adm/ops/reports/handover.md`
- document must be written as an operational start instruction
- document must position itself as a fresh-session continuity artifact, not as a general project primer
- no retro/migration language; target-state wording only
- output must be concise, high-signal, and immediately actionable
- result-relevant status, risks, and next actions must be visible without long narrative reading

## 3) Required Inputs Before Authoring (MUST)

1. Governance sources:
- project-wide `AGENTS.md`
- central development workflow (`adm/dev/protocols/workflow.md`)
- central quality rules (`review.md`)
- preserve the canonical bootstrap chain for fresh development sessions:
  - `AGENTS.md` -> `adm/dev/protocols/workflow.md` -> required task-specific protocol

2. System map:
- central primer (`doc/usr/primer.md`)
- central architecture reference (`doc/arc/arc42.md`)
- roadmap (`adm/pln/rdmp.md`)
- planning contract (`adm/dev/protocols/workflow.md`)
- governance and lifecycle explainers (`doc/agn/governance-model.md`, `doc/agn/ai4x-flow.md`)
- agent-guided onboarding and routing (`doc/agn/user-onboarding.md`, `doc/agn/maintainer-onboarding.md`, `doc/agn/source-map.md`)
- module READMEs, module `doc/usr/*`, module `doc/agn/*`, module `doc/arc/*`, and module `adm/dev/*` sources

3. Runtime and operations sources:
- install/doctor/run docs (`README.md`, `utl/ai4x/doc/arc/arc42.md`)
- `ask` configuration contract (`mod/ask/adm/dev/contracts/config.md`, `mod/ask/adm/dev/contracts/*`)
- optional maintainer operations via GitHub CLI (`gh`) (not a runtime MUST)

4. Domain sources:
- capability sources (`ccp` at `mod/cap/cog`, `tcp` at `mod/cap/tec`)
- agentic specifications in `kob`

5. Workstreams:
- task portfolio under `adm/pln/inbox/`, `adm/pln/assessed/`, `adm/pln/accepted/`, `adm/pln/rejected/`, `adm/pln/realized/`
- slot/status semantics from roadmap (`Working/Soonish/Icebox`) and status mapping
- accepted-task handoff model from `approval-transition.md`:
  - accepted tasks keep `# Content`
  - accepted tasks carry `## Plan`
  - `## Plan` contains one fenced block with one directly copy-pasteable `/plan ...` prompt
- required realization log:
  - `../HISTORY.md` must contain the current-day entry for every realized implementation package before completion

6. Live state:
- git state per module/repo (`clean`, `ahead`, `dirty`) including active branch
- active roadmap focus (`Working`, `Soonish`, `Icebox`) and explicit note on externalized/private tasks
- latest quality evidence (`adm/ops/reports/review.md`, latest green `verify`/`doctor` runs)
- delivery governance snapshot (branch protection, required checks, direct-commit policy)
- external dependencies outside repository scope (private trackers, private capability sources)

## 4) Authoring Process (MUST)

### Phase A: Context Capture

1. Capture directory structure and repos.
2. Validate integration structure (`mod/*` as submodules, `utl/ai4x` as utility).
3. If `mod/*` changed: update and verify submodule pointers in `ai4x` (`git submodule status`, `git status`).
4. Determine module roles and source-of-truth boundaries.
5. Confirm the current cold-start entry chain for a fresh agent:
   - `AGENTS.md`
   - `adm/dev/protocols/workflow.md`
   - `doc/agn/governance-model.md`
   - `doc/agn/ai4x-flow.md`
   - relevant root/module onboarding and architecture sources
6. Distinguish clearly between:
   - canonical project onboarding sources
   - current live-state continuity inputs that belong in the handover artifact

### Phase B: Runtime and Operations Model

1. Define a 15-minute quickstart as minimal path:
   - `doctor -> install -> smoke`
   - clear stop criteria and expected target output
2. Document standard lifecycle (`doctor`, `install`, `init`, `run`, `resume`).
3. Capture platform prerequisites and hard runtime assumptions (for example symlink capability).
4. Extract test/gate commands per module.
5. Explicitly include `ask` contract:
   - client contract (`adapter`, `run.command`, `run.options`)
   - profile contract (`agent`, `skills`, `client`, optional `params`)
   - param gates (`missing required`, `unknown param`, `unresolved placeholder` as `required`)
   - precedence order (`CLI override > workspace override > profile`)
   - observability via `ask status --effective`
6. Include install contract:
   - `ai4x install --clean` as reproducible full run
   - final install report (`ai4X INSTALL REPORT`) with `result`, `failed`, `steps`

### Phase C: Risk and Conflict Profile

1. Identify typical failure patterns and drift risks.
2. Write fail-recovery mini-runbook with concrete commands for common failures.
3. Define do-not-touch/high-risk zones (paths, files, operations only with approval).
4. Define behavior under uncertainty (no guessing, mandatory clarification).

### Phase D: Assemble Runbook

1. Define deterministic reboot sequence.
2. Make the canonical bootstrap chain explicit for fresh development tasks:
   - `AGENTS.md`
   - `adm/dev/protocols/workflow.md`
   - required task-specific protocol
3. Make the cold-start explanation chain explicit for fresh orientation:
   - `doc/usr/primer.md`
   - `doc/agn/user-onboarding.md`
   - `doc/agn/maintainer-onboarding.md`
   - `doc/agn/governance-model.md`
   - `doc/agn/ai4x-flow.md`
4. Define explicit result target per phase.
5. Define task intake protocol for new tasks.
6. Explicitly include assessment/approval contract:
   - proposal assessment ends with decision proposal
   - no transition to `accepted/` and no roadmap change without explicit approval
   - accepted tasks are execution handoff artifacts and therefore include `# Content` plus `## Plan`
   - `## Plan` carries one directly copy-pasteable `/plan ...` prompt
7. Include source-of-truth matrix (`topic -> source -> secondary sources`).
8. Include decision backlog (open decisions, owner, impact, next step).
9. Include Definition of Ready / Definition of Done.
10. Provide start prompts per goal type (`implement`, `review`, `assessment`, `docs`).
11. Include a live-context block for:
   - repo/submodule state
   - roadmap focus and externalized/private tasks
   - quality evidence
   - governance snapshot
   - external dependency register
12. Verify that the current realized package is represented in `../HISTORY.md` before declaring completion.

## 5) Mandatory Structure for `handover.md` (MUST)

The generated document must include at least these chapters:

1. document purpose
2. distinction between canonical onboarding and fresh-session continuity
3. 15-minute quickstart (`doctor -> install -> smoke`) with expected outcomes
4. operating mode for fresh sessions (MUST)
5. reboot sequence (MUST) with phases and reading order
6. bootstrap chain for fresh development tasks (MUST)
7. cold-start explanation chain for fresh orientation (MUST)
8. post-read quick check (git state + interpretation)
9. roadmap focus and externalized/private tasks (MUST)
10. quality evidence snapshot (MUST)
11. governance snapshot (MUST)
12. external dependency register (MUST)
13. architecture and behavior invariants (MUST)
14. source-of-truth matrix (MUST)
15. tests, gates, and verification (command-ready)
16. typical risks and mitigations
17. fail-recovery mini-runbook (MUST)
18. do-not-touch/high-risk zones (MUST)
19. planning and approval model (MUST)
20. task intake protocol (MUST)
21. review protocol (reference to review protocol)
22. Definition of Ready
23. Definition of Done
24. start prompts by goal type (`implement|review|assessment|docs`)

## 6) Quality Criteria (MUST)

- operational, not essay-like
- deterministic, not vague
- concrete file paths, not generic statements
- clear order, not loose collections
- no redundant duplication
- does not restate the full project primer or governance model when canonical sources already exist
- no implicit assumptions about session history
- no unsupported claims about current repo state
- no pre-approved task transition
- does not claim completion while the required `../HISTORY.md` entry for the realized package is still missing
- every high-risk step includes an explicit approval point

## 7) Freshness Rule (MUST)

- Do not write static status snapshots that expire.
- Express repo status as live checks via commands.
- If a snapshot is needed, mark it explicitly as a point-in-time view with re-check requirement.
- Every live-context chapter must contain:
  - capture timestamp (point in time)
  - check command(s)
  - re-check instruction before implementation starts

## 8) Style and Form (MUST)

- short, clear sentences
- imperative style for instructions
- reproducible command blocks
- unambiguous terminology for roles and module boundaries
- scan-friendly structure with high information density
- no essay-like sections, filler, or decorative framing
- chapter openings should make purpose, impact, and expected action immediately visible

## 9) Safety and Diligence Rules (MUST)

- no deleting instructions without a fallback/approval path
- no destructive git commands as default suggestion
- explicit approval points for risky steps

## 10) Documentation Integration Rule (MUST)

After creating `handover.md`:

1. check whether `doc/agn/source-map.md` still routes fresh-session continuity, handover, and review correctly; update it if routing changed
2. check whether `doc/agn/maintainer-onboarding.md` still routes fresh-session continuity correctly; update it if routing changed materially
3. ensure no orphan documentation artifact is created

## 11) Normalized Short Acceptance (MUST)

After completion, the agent must report briefly:

```text
HANDOVER_CREATED
path: <abs path to handover.md>
linked_in_source_map: <yes|no|not-needed>
linked_in_maintainer_docs: <yes|no|not-needed>
planning_contract_checked: <yes|no>
quickstart_verified: <yes|no>
recovery_playbook_present: <yes|no>
source_of_truth_matrix_present: <yes|no>
decision_backlog_present: <yes|no>
live_git_state_present: <yes|no>
roadmap_focus_present: <yes|no>
quality_evidence_present: <yes|no>
governance_snapshot_present: <yes|no>
external_dependency_register_present: <yes|no>
cold_start_chain_present: <yes|no>
open_risks: <none|short list>
```

## 12) Recommended User Prompt

```text
Create a handover.md according to @adm/dev/protocols/handover.md for this project.
Use the existing governance, architecture, operations, domain, and task sources,
avoid unsupported assumptions, and provide an operational reboot runbook
with deterministic reading order, tests/gates, and startup protocol.
```
