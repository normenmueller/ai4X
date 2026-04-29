![](<acc/img/ai4X Logo.jpg>)

> Operating model for fit-for-purpose, consistent agent curation and explicit runtime activation.

[![verify](https://github.com/normenmueller/ai4x/actions/workflows/verify.yml/badge.svg)](https://github.com/normenmueller/ai4x/actions/workflows/verify.yml)

ai4X is an operating model for agentic AI work. It exists to make agent work explicit, reviewable, and reusable — across any "bring your own agent" platform (`#byoa`).

> [!IMPORTANT]
> **What sets ai4X apart**
> 1. **Need-first discovery** — A structured interview process identifies the user's actual needs (*why* and *what*, not *how*). The result is a declarative requirements set that captures intent, not implementation.
> 2. **Curated agentic fulfilment** — From that requirements set, ai4X identifies the cognitive capabilities needed and assembles them as a curated agentic team with an explicit collaboration model — declaratively, reproducibly, and client-agnostic.

Rather than hiding behavior in ad hoc prompts, implicit local setup, or client-specific glue, ai4X brings declarative agent definition, deterministic materialization, and explicit client activation together in one coherent command surface.

In that model, agent creation and activation follow a clear lifecycle:

1. define what an agent is
2. materialize what the agent needs
3. activate it for an explicit client context

That makes agent work easier to understand, easier to reproduce, and easier to evolve with discipline.

This repository provides the canonical ai4X CLI:

- `ai4x curate`
- `ai4x spawn`
- `ai4x doctor`

## Core Model

- `curate` writes declarative, client-agnostic agent artifacts
- `spawn` materializes and activates an agent for an explicit client
- `doctor` validates configuration, declaration, and spawn-readiness

## Principles

- explicit configuration
- explicit command inputs
- client-agnostic declarations
- project-local runtime artifacts
- deterministic validation before activation

## Configuration

- Global config: `~/.config/ai4x/config.yaml`
- Project config: `<project>/.ai4x/config.yaml`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE). © 2026 [nemron](https://github.com/normenmueller) ([#hgtt](doc/hgtt.md))
