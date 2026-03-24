# User Onboarding

## Purpose

This document is the primary agent-guided onboarding guide for users and operators of ai4X.
Use it to explain ai4X at the right depth, guide first usage, and route to the canonical project sources.

## Audience

Use this document when the human primarily wants to:

- understand what ai4X is
- install or start ai4X
- choose a profile or runtime path
- understand the role of `ai4x`, `ask`, `kob`, `ccp`, and `tcp`
- troubleshoot normal user/operator issues

Do not use this as the primary source for development governance or maintainer operations.
Use [`./maintainer-onboarding.md`](./maintainer-onboarding.md) instead for that.

## Canonical Sources

Read or cite these sources in this order when needed:

1. [`../usr/primer.md`](../usr/primer.md)
2. [`../../README.md`](../../README.md)
3. [`../../utl/ai4x/README.md`](../../utl/ai4x/README.md)
4. [`../../mod/ask/README.md`](../../mod/ask/README.md)
5. [`../../mod/ask/doc/usr/primer.md`](../../mod/ask/doc/usr/primer.md)
6. [`../../mod/kob/README.md`](../../mod/kob/README.md)
7. [`../../mod/kob/doc/usr/primer.md`](../../mod/kob/doc/usr/primer.md)
8. [`./source-map.md`](./source-map.md)

## First-Answer Baseline

When the human asks basic first-visit questions, answer directly from this section first.
Do not respond only with file navigation when a simple explanation is possible.
After the short answer, route to the smallest fitting canonical source.

### What ai4X Is

ai4X is a modular suite for reproducible agentic AI workflows.
It separates suite operations, runtime launching, behavior curation, cognitive capability sources, and technical capability sources into distinct modules.

### What ai4X Is For

ai4X exists to keep agentic AI work reproducible, inspectable, and operationally consistent.
It gives you one suite-level operating framework, one runtime launcher, one behavior kit layer, and two capability source-of-truth repositories.

### What You Can Do with ai4X

With ai4X, you can:

- validate a local environment with `ai4x doctor --strict`
- establish a clean suite state with `ai4x install --clean`
- inspect available runtime profiles
- launch a configured profile through `ask`
- understand how `ai4x`, `ask`, `kob`, `ccp`, and `tcp` fit together
- troubleshoot normal installation and operator issues

## Guidance Modes

### Quick

Use when the human wants a short orientation.
Return:

- what ai4X is
- the five module roles
- the minimal quickstart path
- the next best source if deeper detail is needed

### Guided

Use when the human wants help getting started safely.
Return:

- short explanation of the module split
- a step-by-step path for install, doctor, and first run
- the first command block to execute
- the next validation command to run
- the next source to consult if the user gets stuck

### Deep

Use when the human wants a thorough explanation.
Return:

- system boundaries
- why the modular split exists
- how runtime, behavior curation, and capability sources fit together
- the canonical sources for follow-up detail per topic

## Mandatory Concepts to Explain

When relevant, make these points explicit:

1. `ai4x` is the operating framework, not the runtime launcher itself.
2. `ask` starts a concrete runtime profile.
3. `kob` curates agent-specific cognitive bundles.
4. `ccp` and `tcp` are sources of truth, not runtime launchers.
5. `ai4x doctor --strict` and `ai4x install --clean` are the normal integrity-first start path.
6. Symbolic link support is a hard runtime prerequisite for productive `ask` usage.

## First Questions to Ask

Before giving detailed guidance, ask what the human actually needs:

1. overview or installation?
2. first run or resume?
3. user/operator help or maintainer/developer help?
4. explanation only or execution guidance?
5. one module or the whole suite?

## Recommended Guidance Flow

Use this routing by intent:

1. If the user wants a suite overview:
   - explain from [`../usr/primer.md`](../usr/primer.md)
2. If the user wants installation or repair:
   - route through [`../../utl/ai4x/README.md`](../../utl/ai4x/README.md)
3. If the user wants to start or resume a runtime profile:
   - route through [`../../mod/ask/doc/usr/primer.md`](../../mod/ask/doc/usr/primer.md) and [`../../mod/ask/README.md`](../../mod/ask/README.md)
4. If the user asks about agent bundles or capability updates:
   - route through [`../../mod/kob/doc/usr/primer.md`](../../mod/kob/doc/usr/primer.md) and [`../../mod/kob/README.md`](../../mod/kob/README.md)
5. If the user wants the same development and documentation model for a new single-repo project rather than the full ai4X suite:
   - route to [ai4x-tpl](https://github.com/normenmueller/ai4x-tpl)
6. If the user starts asking about contracts, governance, or contribution flow:
   - switch to [`./maintainer-onboarding.md`](./maintainer-onboarding.md)

## Escalation Rules

Escalate to maintainer/developer onboarding when the human asks about:

- governance and protocol routing
- `adm/dev/*` or `adm/ops/*`
- review, handover, proposal assessment, or capability judgment
- repository structure beyond normal usage
- module-internal development details

Escalate to [`./source-map.md`](./source-map.md) when the human needs an authoritative answer to where a topic is documented.

## Do Not Do

- Do not improvise governance from repository layout.
- Do not send normal users into `adm/dev/*` by default.
- Do not merge module roles into one generic explanation.
- Do not invent commands, flags, or runtime behavior.
- Do not treat `ccp` or `tcp` as runtime launchers.
