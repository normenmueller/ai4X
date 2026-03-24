# Source Map

## Purpose

This document is the canonical navigation map for agents that need to explain, route, or support work in ai4X.
Use it to find the right source for a topic quickly and consistently.

## Maintenance Contract

- This file is the central routing map for canonical ai4X topics.
- Update it whenever canonical source ownership, routing role, classification, or path changes.
- This file is explanatory, but its freshness is governed by root ai4X governance sources.
- Do not turn it into a dump of every file; keep only routing-relevant canonical targets here.
- Keep module-role terminology and README box usage aligned with `doc/agn/governance-model.md`.

## Source Selection Rules

Apply these rules strictly:

1. prefer the primary source over a secondary explanation
2. use `doc/usr/*` for the minimal direct human overview
3. use `doc/agn/*` for explanation and routing behavior
4. use `doc/arc/*` for architecture and system structure
5. use `adm/dev/*` for central ai4X development governance
6. use `adm/ops/*` for central ai4X operations and maintainer procedures
7. use module READMEs plus module `doc/usr/*` and `doc/agn/*` for public module purpose, guided explanation, and routing
8. use module `AGENTS.md`, module `doc/arc/*`, and module `adm/dev/*` only for module-specific context, architecture, contracts, and deep technical detail

## Root Sources

| Topic | Primary source | Secondary sources |
| --- | --- | --- |
| suite overview | [`../usr/primer.md`](../usr/primer.md) | [`../../README.md`](../../README.md) |
| suite architecture | [`../arc/arc42.md`](../arc/arc42.md) | [`../../README.md`](../../README.md) |
| minimal single-repo starter derived from ai4X | [ai4x-tpl](https://github.com/normenmueller/ai4x-tpl) | [`../../README.md`](../../README.md) |
| user/operator guided explanation | [`./user-onboarding.md`](./user-onboarding.md) | [`../usr/primer.md`](../usr/primer.md) |
| maintainer/developer guided explanation | [`./maintainer-onboarding.md`](./maintainer-onboarding.md) | [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) |
| governance model and taxonomy | [`./governance-model.md`](./governance-model.md) | [`../../AGENTS.md`](../../AGENTS.md), [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md) |
| documentation terminology and README box policy | [`./governance-model.md`](./governance-model.md) | [`../../adm/dev/protocols/review.md`](../../adm/dev/protocols/review.md) |
| full lifecycle and governance flow | [`./ai4x-flow.md`](./ai4x-flow.md) | [`./governance-model.md`](./governance-model.md), [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md) |
| topic routing | this file | [`../../README.md`](../../README.md) |

## User and Operator Topics

| Topic | Primary source | Secondary sources |
| --- | --- | --- |
| install and doctor | [`../../utl/ai4x/README.md`](../../utl/ai4x/README.md) | [`../../README.md`](../../README.md) |
| first suite run | [`../usr/primer.md`](../usr/primer.md) | [`./user-onboarding.md`](./user-onboarding.md) |
| profile start and resume | [`../../mod/ask/README.md`](../../mod/ask/README.md) | [`../../mod/ask/doc/usr/primer.md`](../../mod/ask/doc/usr/primer.md) |
| agent bundle curation | [`../../mod/kob/README.md`](../../mod/kob/README.md) | [`../../mod/kob/utl/kob/README.md`](../../mod/kob/utl/kob/README.md) |

## Maintainer and Development Topics

| Topic | Primary source | Secondary sources |
| --- | --- | --- |
| contributor entry | [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) | [`../../README.md`](../../README.md) |
| new single-repo project starter based on the ai4X model | [ai4x-tpl](https://github.com/normenmueller/ai4x-tpl) | [`../../README.md`](../../README.md) |
| governance model and taxonomy | [`./governance-model.md`](./governance-model.md) | [`../../AGENTS.md`](../../AGENTS.md), [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md) |
| documentation terminology and README box policy | [`./governance-model.md`](./governance-model.md) | [`../../adm/dev/protocols/review.md`](../../adm/dev/protocols/review.md) |
| full lifecycle and governance flow | [`./ai4x-flow.md`](./ai4x-flow.md) | [`../../AGENTS.md`](../../AGENTS.md), [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md) |
| bootstrap and rule order | [`../../AGENTS.md`](../../AGENTS.md) | [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md) |
| development workflow routing | [`../../adm/dev/protocols/workflow.md`](../../adm/dev/protocols/workflow.md) | [`./maintainer-onboarding.md`](./maintainer-onboarding.md) |
| suite architecture | [`../arc/arc42.md`](../arc/arc42.md) | [`../../README.md`](../../README.md) |
| module-local maintainer bootstrap | relevant module `doc/agn/maintainer-onboarding.md` | relevant module `AGENTS.md` and `doc/agn/source-map.md` |
| review | [`../../adm/dev/protocols/review.md`](../../adm/dev/protocols/review.md) | [`../../adm/ops/reports/review.md`](../../adm/ops/reports/review.md) |
| handover / fresh-session continuity | [`../../adm/dev/protocols/handover.md`](../../adm/dev/protocols/handover.md) | [`../../adm/ops/reports/handover.md`](../../adm/ops/reports/handover.md) |
| proposal assessment | [`../../adm/dev/protocols/proposal-assessment.md`](../../adm/dev/protocols/proposal-assessment.md) | [`../../adm/pln/inbox/`](../../adm/pln/inbox/) |
| approval transition | [`../../adm/dev/protocols/approval-transition.md`](../../adm/dev/protocols/approval-transition.md) | [`../../adm/pln/rdmp.md`](../../adm/pln/rdmp.md) |
| capability quality and placement | [`../../adm/dev/contracts/capability-quality.md`](../../adm/dev/contracts/capability-quality.md) | [`../../adm/dev/protocols/capability-judgment.md`](../../adm/dev/protocols/capability-judgment.md) |
| capability discoverability and applicability | [`../../adm/dev/contracts/capability-discoverability.md`](../../adm/dev/contracts/capability-discoverability.md) | [`../../adm/dev/contracts/capability-quality.md`](../../adm/dev/contracts/capability-quality.md), [`../../adm/dev/protocols/capability-judgment.md`](../../adm/dev/protocols/capability-judgment.md) |
| capability conflicts | [`../../adm/dev/protocols/conflict-audit.md`](../../adm/dev/protocols/conflict-audit.md) | [`../../adm/dev/contracts/capability-quality.md`](../../adm/dev/contracts/capability-quality.md) |

## Operations Topics

| Topic | Primary source | Secondary sources |
| --- | --- | --- |
| UAT | [`../../adm/ops/runbooks/UAT.md`](../../adm/ops/runbooks/UAT.md) | [`../../README.md`](../../README.md) |
| GitHub repo metadata | [`../../adm/ops/runbooks/github-repo-metadata.md`](../../adm/ops/runbooks/github-repo-metadata.md) | [`../../utl/gh/repo-metadata.sh`](../../utl/gh/repo-metadata.sh) |
| fresh-session continuity and reboot context | [`../../adm/ops/reports/handover.md`](../../adm/ops/reports/handover.md) | [`../../adm/dev/protocols/handover.md`](../../adm/dev/protocols/handover.md) |

## Module Sources

| Module | Primary source | Secondary sources |
| --- | --- | --- |
| `ai4x` | [`../../README.md`](../../README.md) | [`../usr/primer.md`](../usr/primer.md), [`../arc/arc42.md`](../arc/arc42.md), [`./source-map.md`](./source-map.md) |
| `ask` | [`../../mod/ask/README.md`](../../mod/ask/README.md) | [`../../mod/ask/doc/usr/primer.md`](../../mod/ask/doc/usr/primer.md), [`../../mod/ask/doc/agn/source-map.md`](../../mod/ask/doc/agn/source-map.md), [`../../mod/ask/doc/arc/arc42.md`](../../mod/ask/doc/arc/arc42.md) |
| `kob` | [`../../mod/kob/README.md`](../../mod/kob/README.md) | [`../../mod/kob/doc/usr/primer.md`](../../mod/kob/doc/usr/primer.md), [`../../mod/kob/doc/agn/source-map.md`](../../mod/kob/doc/agn/source-map.md), [`../../mod/kob/doc/arc/arc42.md`](../../mod/kob/doc/arc/arc42.md) |
| `ccp` | [`../../mod/cap/cog/README.md`](../../mod/cap/cog/README.md) | [`../../mod/cap/cog/doc/usr/primer.md`](../../mod/cap/cog/doc/usr/primer.md), [`../../mod/cap/cog/doc/agn/source-map.md`](../../mod/cap/cog/doc/agn/source-map.md), [`../../mod/cap/cog/doc/arc/arc42.md`](../../mod/cap/cog/doc/arc/arc42.md) |
| `tcp` | [`../../mod/cap/tec/README.md`](../../mod/cap/tec/README.md) | [`../../mod/cap/tec/doc/usr/primer.md`](../../mod/cap/tec/doc/usr/primer.md), [`../../mod/cap/tec/doc/agn/source-map.md`](../../mod/cap/tec/doc/agn/source-map.md), [`../../mod/cap/tec/doc/arc/arc42.md`](../../mod/cap/tec/doc/arc/arc42.md) |

## Topic Escalation Rules

Escalate from user-facing explanation to maintainer/development routing when:

- the human asks about governance, review, handover, or roadmap mechanics
- the human asks how to change modules or capability portfolios
- the human asks for repo-internal architecture rather than normal usage

Escalate from README-level sources to `adm/*` only when a canonical contract or protocol is actually needed.
