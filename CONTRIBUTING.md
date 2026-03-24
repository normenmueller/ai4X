# Contributing

Thank you for contributing to ai4X.

## Working Model

ai4X uses an agent-first development model.

- `ai4x` is the suite, integration, and governance repository.
- `doc/usr/*` is user-facing documentation.
- `doc/agn/*` is agent-facing onboarding and navigation documentation.
- `doc/arc/*` is architecture and system-reference documentation.
- `doc/*` explains and describes.
- `adm/dev/*` contains centralized development governance for the ai4X suite context: contracts and execution protocols.
- `adm/ops/*` contains centralized runtime, delivery, and maintainer operations for the ai4X suite context.
- `adm/*` governs, routes, checks, and operationalizes.
- `doc/agn/governance-model.md` is the agent-facing explanation of what belongs in `AGENTS.md`, `adm/dev/*`, `adm/ops/*`, and `doc/*`.
- module-local `doc/arc/*` and `adm/*` remain module-specific and do not replace the shared suite governance owned here.

What this means in practice:

- deterministic checks are handled through TypeScript tests, shell checks, `verify`, and `doctor`
- higher-order semantic review, judgment, proposal assessment, handover, and capability assessment are intentionally executed with agentic AI actors
- in this model, developer and operator roles are primarily modeled as agentic AI roles
- `doc/agn/*` is the explanatory bridge for agent-guided onboarding and source routing
- modules remain domain-owning repositories, but when they are used or evolved within ai4X, the canonical governance is defined here in root `ai4x`
- outside the ai4X context, governance is defined by the external environment, not by ai4X
- human maintainers should use `README.md` and `CONTRIBUTING.md` as the entry bridge, then continue into `AGENTS.md`, `workflow.md`, and the task-specific protocols

If you work with an AI agent, do not improvise the workflow from repository layout alone.
Start with the canonical contracts below.

The canonical bootstrap chain for development work is:

1. `./AGENTS.md`
2. `./adm/dev/protocols/workflow.md`
3. the required task-specific protocol

Development work that skips this chain is not governance-valid.

## Canonical Reading Order for Agentic Development

1. `./AGENTS.md`
2. `./adm/dev/protocols/workflow.md`
3. the task-specific protocol in `./adm/dev/protocols/`
4. affected README(s)
5. `./doc/arc/arc42.md` and affected module `doc/arc/arc42.md` when architecture matters
6. `./doc/agn/maintainer-onboarding.md` when agent-guided maintainer explanation is useful
7. affected module `adm/dev/*` only for module-specific contracts and deep normative detail

## Standard Agent Invocations

- Review:
  - `Please run a review according to @adm/dev/protocols/review.md.`
- Handover:
  - `Please create or refresh the handover report according to @adm/dev/protocols/handover.md.`
- Proposal assessment:
  - `Please assess proposal adm/pln/inbox/<slug>.md according to @adm/dev/protocols/proposal-assessment.md.`
- Capability judgment:
  - `Please judge <capability> according to @adm/dev/contracts/capability-quality.md and @adm/dev/protocols/capability-judgment.md.`
- Conflict audit:
  - `Please run a conflict audit according to @adm/dev/protocols/conflict-audit.md.`

## Manual Deterministic Verification

```bash
npm --prefix ./utl/ai4x/src ci
npm --prefix ./utl/ai4x/src run verify
npm --prefix ./mod/ask/src run verify
npm --prefix ./mod/kob/utl/kob/src run verify
make -C ./mod/cap/cog verify
make -C ./mod/cap/tec verify
```

Use `doctor` commands in addition when runtime/configuration integrity matters.

## Contribution Flow

1. Create a topic branch from `trunk` (`feat/*`, `fix/*`, `docs/*`, `chore/*`, `refactor/*`).
2. Keep one logical change per pull request.
3. Run the relevant deterministic verify gates locally before opening a PR.
4. If the change affects planning, review, handover, or capability semantics, run the relevant development protocol as well.
5. Open a pull request to `trunk` with a clear summary and test evidence.
6. Use Conventional Commits (for example: `feat: add ...`, `fix: resolve ...`).

When materially relevant implementation work was completed, keep `../HISTORY.md` updated with short daily outcome summaries.

## Pull Request Expectations

- PR scope is minimal and reviewable.
- Documentation is updated when behavior, contracts, or structure changed.
- CI verify workflow must be green before merge.
- Merging uses squash as standard.
