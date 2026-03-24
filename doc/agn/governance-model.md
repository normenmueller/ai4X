# Governance Model

## Purpose

This document explains how ai4X splits bootstrap, explanation, architecture, development governance, and operations governance.
Use it when an agent must explain what belongs in `AGENTS.md`, `adm/dev/*`, `adm/ops/*`, and `doc/*` without improvising from repository layout.

This file is explanatory and reviewable.
It is not an execution contract and it does not replace `AGENTS.md`, `adm/dev/protocols/workflow.md`, or any task-specific protocol.
For full lifecycle sequencing, trigger routing, and gate timing, use [`./ai4x-flow.md`](./ai4x-flow.md).

## Audience

Use this document when the human primarily wants to:

- understand how ai4X governance is structured
- ask what belongs in `AGENTS.md`
- ask when to use `adm/dev/*` versus `adm/ops/*`
- understand why `doc/agn/*` exists if governance already exists
- understand how agents should explain the governance model correctly

## Canonical Sources

Read or cite these sources in this order when needed:

1. [`../../AGENTS.md`](../../AGENTS.md)
2. [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md)
3. [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
4. [`./source-map.md`](./source-map.md)

## Core Distinctions

### `AGENTS.md`

`AGENTS.md` is the bootstrap contract.
It defines:

- the mandatory bootstrap chain
- conflict order
- suite context and module-boundary rules
- the high-level documentation and governance split
- the top-level routing into the correct governance path

It does not carry detailed execution steps for specific task types.

### `adm/dev/protocols/workflow.md`

`workflow.md` is the process router.
It defines:

- the central ai4X development taxonomy
- the context rule for suite-context work
- the canonical protocol map
- task-type routing into the correct protocol

It is procedural, but still high-level.
It routes into the binding protocol that actually governs the task.

### Task-specific files under `adm/dev/protocols/*`

These are execution contracts.
They define how a specific governed action is carried out, for example:

- review
- proposal assessment
- approval transition
- handover
- capability judgment
- conflict audit

When a task-specific protocol applies, that protocol is binding for execution.

### `adm/dev/*`

`adm/dev/*` is central ai4X development governance for suite-context work.
It contains:

- binding development contracts
- execution protocols
- deep normative development detail

Use `adm/dev/*` when the human asks how development, review, planning transition, handover, capability judgment, or governance-valid implementation work is governed.

### `adm/ops/*`

`adm/ops/*` is central ai4X operations governance for suite-context work.
It contains:

- runbooks
- reports
- operational evidence
- runtime, release, delivery, UAT, and maintainer procedures

Use `adm/ops/*` when the human asks about operational execution, operational recovery, release procedures, UAT, or maintainer operations.

### `doc/usr/*`

`doc/usr/*` is the direct human-facing documentation surface.
Use it for concise human-readable entry documentation, not for governance execution.

### `doc/agn/*`

`doc/agn/*` is the agent-facing explanation and routing layer.
Use it to help an agent explain the system, route the human to the right canonical source, and avoid guessing from file layout alone.

`doc/agn/*` explains governance.
It does not replace governance.

### `doc/arc/*`

`doc/arc/*` is architecture and system-reference documentation.
It explains structure, boundaries, and system design.
It is descriptive, not an execution protocol.

## How to Explain This to a Human

Use this order:

1. `AGENTS.md` tells the agent how bootstrap and rule order work.
2. `workflow.md` tells the agent how to route development work.
3. task-specific protocols tell the agent how a specific governed action is executed.
4. `adm/dev/*` and `adm/ops/*` contain the deep governance material.
5. `doc/usr/*`, `doc/agn/*`, and `doc/arc/*` exist so the model can be understood and explained cleanly.

If the human asks "where is the truth?", answer:

- bootstrap truth -> `AGENTS.md`
- development-routing truth -> `adm/dev/protocols/workflow.md`
- task-execution truth -> the relevant task-specific protocol
- development-governance truth -> `adm/dev/*`
- operations-governance truth -> `adm/ops/*`
- explanatory truth -> `doc/agn/*`
- architecture truth -> `doc/arc/*`

## Documentation Consistency Rules

### README Box Policy

Keep the public README callout topology stable:

- root `README.md`: one compact, intentional top-level positioning callout area, rendered either as two visible callouts or as one collapsible `<details>` block when the same content reads better as one continuous argument
- module `README.md`: one compact module-governance/model callout area, rendered either as one `[!IMPORTANT]` callout or as one collapsible `<details>` block
- `doc/hgtt.md`: one `[!IMPORTANT]` identity/positioning box
- primers, onboarding docs, and governance protocols do not require box callouts by default

Use these callout areas intentionally.
Do not proliferate alternate callout styles or callout-heavy mirrors across the suite.

### Canonical Terminology

Use these terms consistently in public and governance-facing documentation:

- `ai4X` = modular suite and operating model
- `ask` = runtime launcher
- `kob` = behavior kit
- `ccp` = cognitive source of truth
- `tcp` = technical source of truth
- `DFA` = demand-fulfillment assistant pattern
- TOGAF-native architecture cognition = `ccp/cap/architecture/*`
- ai4X AI-/agentic-architecture overlays = `ccp/cap/ai/architecture/*`, mixed only at `kob` bundle level where documented
- handover = fresh-session live-state and continuity artifact, not general project onboarding

Descriptive documentation must stay in target-state voice.
Avoid workaround, migration, backlog, or retrospective wording unless the artifact is explicitly a report, runbook, or changelog.

### No-Emoji Text Standard

Governed textual artifacts do not use emojis.

Scope:

- `AGENTS.md`
- `README.md`
- `doc/**`
- `adm/**`
- `mod/**/AGENTS.md`
- `mod/cap/cog/cap/**`
- `mod/cap/tec/cap/**`
- `mod/kob/agn/**/ccc/**`

Use plain text headings, labels, and emphasis instead of decorative symbols.

## Governance Status and Reviewability

This file is part of the reviewable ai4X documentation surface.
It must stay consistent with:

- `AGENTS.md`
- `adm/dev/protocols/workflow.md`
- `adm/ops/*`
- the active development protocols and contracts

If these sources diverge, the normative governance sources win and this file must be updated.

## Common Misreadings

Avoid these mistakes:

1. treating `doc/agn/*` as a replacement for governance
2. treating `AGENTS.md` as a full workflow document
3. treating `workflow.md` as the execution contract for every task
4. treating `adm/dev/*` as general onboarding prose
5. treating `adm/ops/*` as user-facing product documentation
6. treating module-local governance docs as replacements for root ai4X governance inside the ai4X suite context

## Routing Rules

Use these rules when the human asks where to go next:

- "How do I start governed development work?" -> `AGENTS.md`, then `workflow.md`
- "Which protocol applies to this task?" -> `workflow.md`
- "How is review or handover governed?" -> relevant file in `adm/dev/protocols/*`
- "How is release or UAT handled?" -> `adm/ops/*`
- "What belongs where in this model?" -> this file

## Do Not Do

- Do not infer governance from repository layout alone.
- Do not cite `doc/agn/*` as if it were the governing execution contract.
- Do not send normal users into `adm/dev/*` or `adm/ops/*` by default.
- Do not collapse bootstrap, workflow routing, and execution contracts into one vague explanation.
