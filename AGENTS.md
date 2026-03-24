---
name: ai4x
description: "Use this agent to govern ai4X architecture, module contracts, quality gates, and cross-repo delivery discipline."
---

# AGENTS - ai4x

This document is the bootstrap contract for agentic work in the ai4X suite context.
It defines order, priority, boundaries, and routing.
Detailed development execution does not live here. Use `adm/dev/protocols/workflow.md` and the task-specific protocol for that.

## Bootstrap Chain (MUST)

- `AGENTS.md` alone is not sufficient for development or governance work.
- After `AGENTS.md`, `adm/dev/protocols/workflow.md` must always be read for development and governance tasks.
- After `workflow.md`, the required task-specific protocol must be loaded before substantial planning, evaluation, or implementation begins.
- Work that skips this chain is governance-invalid.

## Conflict Order (MUST)

1. system and platform constraints plus safety rules
2. explicit user goal and hard user constraints
3. `AGENTS.md`
4. loaded cognitive rules and capabilities
5. user style and phrasing preferences

If rules conflict, the stricter MUST rule wins.

## Context Rule (MUST)

- `ai4x` is the suite utility.
- The root ai4X repository is the suite, integration, installation, and governance repository.
- `ask`, `kob`, `ccp`, and `tcp` are domain-owning repositories with their own technical and semantic artifacts.
- When module work is performed within ai4X, the canonical governance is owned by the root ai4X repository.
- Outside the ai4X context, governance is defined by the external environment, not by this repository.

## Project Boundaries (MUST)

- `ask`: neutral launcher and orchestrator; production code remains provider- and repo-neutral.
- `kob`: public behavior kit; contains agent profiles and cognitive composition, but no skill implementations.
- `ccp` (`mod/cap/cog`): source of truth for general, agent-agnostic cognitive capabilities.
- `tcp` (`mod/cap/tec`): source of truth for technical capabilities.
- `kob` may keep both imported `ccp` capabilities and agent-local cognitive artifacts in `agn/**/ccc/`.
- Physical repository locations are implementation detail; module binding happens through configuration only.
- Cross-repo relative paths as a system prerequisite are forbidden in code and documentation.

## Documentation and Governance Model (MUST)

- `doc/usr/*` is the direct human-facing documentation surface.
- `doc/agn/*` is the agent-facing onboarding and navigation surface.
- `doc/arc/*` is human-readable architecture and system-reference documentation.
- `doc/*` explains and references.
- `adm/dev/*` is agent-facing central ai4X development governance for suite-context work.
- `adm/ops/*` is agent-facing central ai4X operations governance for suite-context work.
- `adm/*` governs, routes, checks, and operationalizes.
- `AGENTS.md` is the entry contract.
- `adm/dev/protocols/workflow.md` is the process router.
- Task-specific files under `adm/dev/protocols/` are the execution contracts.
- Use `doc/agn/governance-model.md` when the model itself must be explained to a human or another agent.

Normative interpretation rule (MUST):

- `doc/*` is descriptive documentation.
- `adm/dev/*` and `adm/ops/*` are normative governance surfaces.
- `doc/agn/*` may explain governance, but it must not replace, redefine, or overrule governance.
- If explanatory and normative sources diverge, `AGENTS.md`, `adm/dev/protocols/workflow.md`, the active development contracts/protocols, and `adm/ops/*` win.

## Quality Model (MUST)

Two quality layers apply in parallel:

1. Deterministic gates
- TypeScript tests
- shell checks
- deterministic validation commands such as `verify` and `doctor`
- machine-checkable metadata, layout, path, and reference validation

2. Semantic development protocols
- review
- handover
- proposal assessment
- approval transition
- capability judgment
- conflict audit

Not everything important is programmatically checkable.
Higher-order semantic judgments are binding development protocols and must be reproducibly documented.

## Architecture and Quality Rules (MUST)

- production-grade solutions only; no prototypes
- clear module boundaries and low coupling
- robust error handling and traceable tests
- no ad hoc patches, special-case islands, or workaround layers
- use standard libraries for standard formats and protocols unless an explicit, approved reason exists not to
- update documentation whenever contracts, structure, or behavior change
- write documentation in the target-state voice; avoid retrospective or legacy-state wording
- governed textual artifacts do not use emojis; use plain text wording and headings instead
- `CHANGELOG` is the only regular exception for explicit change and breaking-change wording

## Capability Rules (MUST)

- Rules in `ccp` are strictly agent-agnostic.
- Agent names, runtime paths, and client-specific paths are forbidden in `ccp`.
- Client- or provider-specific operating instructions are forbidden in `ccp`.
- Capability texts must be deterministic: clear trigger, clear action, clear fallback.
- Missing required context is handled deterministically: no final recommendation without required context, missing points are named explicitly, and the result is marked provisional.
- Capability changes must be judged against the capability-quality contract and the capability-judgment protocol.

## Implementation Discipline (MUST)

- run relevant gates green before commit
- do not create commits with failing tests or gates
- commit messages follow Conventional Commits
- commit messages are in English; the text after `:` starts lowercase
- update or add tests when code changes materially require it
- if uncertain, do not guess; state the contradiction and ask targeted questions

## Reading Order (MUST)

### For Development Work

1. `AGENTS.md`
2. `adm/dev/protocols/workflow.md`
3. the required task-specific protocol under `adm/dev/protocols/`
4. affected README files
5. affected `doc/arc/*` and module `doc/arc/*` when architecture matters
6. affected module `adm/dev/*` only for module-specific contracts and deep normative detail
7. `doc/usr/*` and `doc/agn/*` only when explanatory or onboarding context is needed

### For Operations and Delivery Work

1. `AGENTS.md`
2. `adm/ops/*`
3. relevant runtime, release, and UAT artifacts

Without this reading chain, development work is not fully routed.

## Routing (MUST)

- new idea, planning intake, or proposal shaping -> `adm/dev/protocols/proposal-assessment.md`
- review or quality verdict -> `adm/dev/protocols/review.md`
- handover or fresh-session reboot readiness -> `adm/dev/protocols/handover.md`
- capability change -> `adm/dev/contracts/capability-quality.md` plus `adm/dev/protocols/capability-judgment.md`
- capability conflict or exclusivity audit -> `adm/dev/protocols/conflict-audit.md`
- planning, task, or roadmap transition -> `adm/dev/protocols/approval-transition.md`
- runtime, release, or maintainer operations -> `adm/ops/*`
