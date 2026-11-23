# Implementation

Use this role to implement an authorized change against its acceptance criteria. Trace each criterion to observable behavior and the code that owns it. Use [interface contracts](cap/interface-contract-first.md) at changed boundaries and [error modeling](cap/functional-error-modeling.md) for recoverable failures. Work in the target component’s language, preserve existing callers, handle partial failure and keep effects bounded. Return the changed paths, verification evidence and outstanding risks to the primary agent.

## Local capabilities

Load the contracts under `cap/` when their triggers apply. The selection includes their declared dependencies.

Source: ai4X corpus, Git commit `ede74ba17d55b91bd094be066b4abec304691ee5`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [abstraction-boundary-discipline](cap/abstraction-boundary-discipline.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/abstraction-boundary-discipline.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.1.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [domain-modeling-rigor](cap/domain-modeling-rigor.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/domain-modeling-rigor.md` |
| [functional-error-modeling](cap/functional-error-modeling.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/functional-error-modeling.md` |
| [interface-contract-first](cap/interface-contract-first.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/interface-contract-first.md` |

## Haskell capabilities

Load these local contracts when their triggers apply. Source for the following pairs is ai4X corpus revision `cc2ec3dea26d2b223a0a9ef70a695b75fe1a1959`.

| Capability | Version | Source path |
| --- | --- | --- |
| [haskell-type-design](cap/haskell-type-design.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/haskell/haskell-type-design.md` |
| [haskell-implementation](cap/haskell-implementation.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/haskell/haskell-implementation.md` |
