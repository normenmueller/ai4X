# ai4X Primer

## What ai4X Is

`ai4x` is a modular operating model for agentic AI.
It separates:

- operating framework: `ai4x`
- runtime orchestration: `ask`
- behavior curation: `kob`
- cognitive capability source of truth: `ccp`
- technical capability source of truth: `tcp`

This separation keeps runtime, behavior, cognitive rules, and technical capabilities independently reviewable and operationally consistent.

## Why the Split Matters

Without a clear split, agent behavior, technical tooling, and operating logic drift into one another.
That makes AI workflows harder to understand, harder to reproduce, and harder to operate safely.

ai4X avoids that by keeping each responsibility in one clear place:

![](<../acc/img/ai4X Initial Structure - v0.2.jpeg>)

- `ai4x` protects installation, integrity, and operating consistency
- `ask` starts a concrete profile run for a concrete client
- `kob` curates agent-specific cognitive bundles
- `ccp` owns reusable cognitive capabilities
- `tcp` owns reusable technical capabilities

## Minimal Quickstart

Run from the repository root:

```bash
git submodule update --init --recursive
npm --prefix ./utl/ai4x/src ci
make PREFIX="$HOME/.local" install CONFIG_MODE=keep
hash -r
ai4x doctor --strict
ai4x install --clean
ask --list-profiles
ask sigrid
```

Platform note:

- macOS, Linux, and Windows are supported.
- Productive runtime with `ask` requires symbolic link support in the workspace filesystem.
- On Windows, this may require Developer Mode or elevated permissions.

## Core Operating Flow

The default operator flow is:

1. validate the environment with `ai4x doctor --strict`
2. establish a reproducible target state with `ai4x install --clean`
3. inspect available profiles with `ask --list-profiles`
4. start the target profile with `ask <profile>`
5. inspect active runtime context with `ask status` or `ask status --effective` when needed

## Module Overview

| Module | Role | Why it exists |
| --- | --- | --- |
| `ai4x` | operating framework | keeps installation, integrity, and suite-level contracts reproducible |
| `ask` | runtime launcher | starts a concrete profile with a concrete client and capability context |
| `kob` | behavior kit | curates agent-specific cognitive bundles under `agn/**/ccc/` |
| `ccp` | cognitive source of truth | owns reusable, agent-agnostic cognitive capabilities |
| `tcp` | technical source of truth | owns reusable technical capabilities and skill specifications |

## What Makes ai4X Different

ai4X is not only a suite to run agentic AI work. It is also a reference implementation of a strict agent-first development model.

In practice, that means:

- ai4X is a blueprint for projects that want governed and reproducible agent-first development
- ai4X uses agent-guided documentation for human-facing onboarding and support
- ai4X keeps governance, runtime orchestration, behavior curation, and capability sources in explicit module boundaries
- ai4X separates behavior, cognitive capabilities, and technical capabilities instead of collapsing them into one mixed layer
- ai4X deliberately uses a small, minimally invasive tool stack

## How to Get Help

Choose the smallest fitting entry:

- Direct human overview: this file
- Agent-guided user/operator onboarding: [`../agn/user-onboarding.md`](../agn/user-onboarding.md)
- Agent-guided maintainer/developer onboarding: [`../agn/maintainer-onboarding.md`](../agn/maintainer-onboarding.md)
- Canonical source routing for agents: [`../agn/source-map.md`](../agn/source-map.md)

## Where to Go Next

- Root overview and project structure: [`../../README.md`](../../README.md)
- Contributor bridge and development entry: [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Runtime and client behavior: [`../../mod/ask/README.md`](../../mod/ask/README.md)
- Cognitive bundle curation: [`../../mod/kob/README.md`](../../mod/kob/README.md)
- Cognitive capability portfolio: [`../../mod/cap/cog/README.md`](../../mod/cap/cog/README.md)
- Technical capability portfolio: [`../../mod/cap/tec/README.md`](../../mod/cap/tec/README.md)

The primer is intentionally short.
For deeper explanation, use the agent-facing onboarding documents and the canonical sources they route to.
