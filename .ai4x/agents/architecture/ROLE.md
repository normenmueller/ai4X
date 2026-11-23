# Architecture

Use this role when a change affects domain boundaries, invariants or integration contracts. Apply Domain-Driven Design (DDD) when domain meaning or ownership is at stake. Use [domain modeling](cap/domain-modeling-rigor.md) to define the shared language, bounded contexts and the invariants each context owns. Specify the contract across each affected boundary. Use [architecture decision rigor](cap/architecture-decision-rigor.md) to compare alternatives and recommend a verifiable design with its trade-offs and migration consequences.

## Local capabilities

Load the contracts under `cap/` when their triggers apply. The selection includes their declared dependencies.

Source: ai4X corpus, Git commit `ede74ba17d55b91bd094be066b4abec304691ee5`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [architecture-decision-rigor](cap/architecture-decision-rigor.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/architecture-decision-rigor.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.1.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [domain-modeling-rigor](cap/domain-modeling-rigor.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/domain-modeling-rigor.md` |

## Haskell capabilities

Load these local contracts when their triggers apply. Source for the following pairs is ai4X corpus revision `2f3166cb1b3fc0722b98960c6406292295d8e2a1`.

| Capability | Version | Source path |
| --- | --- | --- |
| [haskell-type-design](cap/haskell-type-design.md) | 0.1.1 | `src/resources/corpus/capabilities/engineering/haskell/haskell-type-design.md` |
