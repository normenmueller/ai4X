# Maintainer Onboarding

## Purpose

This document is the primary agent-facing onboarding guide for developers and maintainers of ai4X.
Use it to explain the suite architecture, route work through the correct governance chain, and keep module boundaries explicit.

## Audience

Use this document when the human primarily wants to:

- contribute to ai4X
- understand the development model
- work on one or more modules inside the ai4X suite context
- route a task correctly through governance
- understand where development, review, handover, capability, operations, or architecture sources live

## Canonical Sources

Read or cite these sources in this order when needed:

1. [`../../README.md`](../../README.md)
2. [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
3. [`../../AGENTS.md`](../../AGENTS.md)
4. [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md)
5. [`./governance-model.md`](./governance-model.md)
6. [`./ai4x-flow.md`](./ai4x-flow.md)
7. [`../arc/arc42.md`](../arc/arc42.md)
8. [`./source-map.md`](./source-map.md)
9. relevant module README(s)
10. relevant module `doc/agn/maintainer-onboarding.md`
11. relevant module `AGENTS.md`
12. relevant module `doc/arc/arc42.md` and module-specific `adm/dev/*` or `adm/ops/*`

## Bootstrap Path

For development and governance work in the ai4X suite context, the canonical bootstrap chain is always:

1. `AGENTS.md`
2. `adm/dev/protocols/workflow.md`
3. the required task-specific protocol

Do not present `doc/agn/*` as a replacement for that chain.
`doc/agn/*` exists to explain and route, not to supersede governance.

## How to Explain the Suite

Explain ai4X in this order:

1. root `ai4x` integrates the suite and owns the system-wide governance surface
2. `ask` owns runtime launching and client-specific link lifecycle
3. `kob` owns agent profiles and cognitive bundle curation
4. `ccp` owns reusable, agent-agnostic cognitive capabilities
5. `tcp` owns reusable technical capabilities

Make the separation explicit:

- runtime/orchestration belongs to `ask`
- behavior curation belongs to `kob`
- cognitive source of truth belongs to `ccp`
- technical source of truth belongs to `tcp`
- suite governance and integration belong to root `ai4x`
- architecture is documented under `doc/arc/*`
- contracts and execution protocols live under `adm/dev/*`

Also explain the context rule clearly:

- modules remain domain-owning repositories
- when they are evolved inside ai4X, root ai4X governance is binding
- outside ai4X, governance belongs to the external context

When the human wants the same model for a new single-repo project rather than the full ai4X suite, route them to [ai4x-tpl](https://github.com/normenmueller/ai4x-tpl), the ai4X-driven, minimal single-repo template for agent-first development and agent-guided documentation.

When the human asks what belongs in `AGENTS.md`, `adm/dev/*`, or `adm/ops/*`, explain from [`./governance-model.md`](./governance-model.md) before dropping into the governing protocol sources.
When the human asks what happens when, in which order, or which gate/protocol becomes binding, explain from [`./ai4x-flow.md`](./ai4x-flow.md).

## Task-Type Routing

Route by task type, not by guessed file layout:

- proposal/intake -> [`../../adm/dev/protocols/proposal-assessment.md`](../../adm/dev/protocols/proposal-assessment.md)
- review -> [`../../adm/dev/protocols/review.md`](../../adm/dev/protocols/review.md)
- handover / fresh-session continuity -> [`../../adm/dev/protocols/handover.md`](../../adm/dev/protocols/handover.md)
- capability quality or placement -> [`../../adm/dev/contracts/capability-quality.md`](../../adm/dev/contracts/capability-quality.md) plus [`../../adm/dev/protocols/capability-judgment.md`](../../adm/dev/protocols/capability-judgment.md)
- capability overlap/conflicts -> [`../../adm/dev/protocols/conflict-audit.md`](../../adm/dev/protocols/conflict-audit.md)
- roadmap/task transition -> [`../../adm/dev/protocols/approval-transition.md`](../../adm/dev/protocols/approval-transition.md)
- suite architecture -> [`../arc/arc42.md`](../arc/arc42.md)
- module architecture -> relevant module `doc/arc/arc42.md`
- runtime/release/maintainer operations -> `adm/ops/*`

## Common Pitfalls

Watch for these mistakes:

1. treating `doc/agn/*` as governance instead of guided documentation
2. using module-local governance docs as replacements for the central suite workflow
3. explaining `kob` as source of truth for general capabilities
4. moving capability decisions into general review without using the capability contract and judgment protocol
5. inferring workflow from repository layout alone
6. treating architecture documents as protocols

## Do Not Do

- Do not skip the bootstrap chain.
- Do not route development work directly from README structure.
- Do not treat user onboarding and maintainer onboarding as the same thing.
- Do not restate governance rules loosely when the canonical protocol should be cited.
- Do not hide module boundaries behind generic "AI platform" language.
