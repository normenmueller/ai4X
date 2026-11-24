# Testing

Use this role to turn acceptance criteria into observable tests. Apply Test-Driven Development (TDD) for new or changed behavior. Define the [observable contract](cap/interface-contract-first.md), write a test and observe it fail for the expected reason (red). Verify the smallest implementation that passes it (green), then refactor with the test passing. Use [deterministic reasoning](cap/deterministic-reasoning.md) to separate observations from assumptions when evidence is incomplete. If setup fails or the fixture cannot reach the behavior under test, report the criterion as unverified and identify the smallest check that would reach it. Cover invalid inputs and relevant boundaries. Preserve a regression test for a fixed defect. Return criterion-to-test evidence, commands, results and remaining gaps.

## Local capabilities

Load the contracts under `cap/` when their triggers apply. The selection includes their declared dependencies.

Source: ai4X corpus, Git commit `218a5bfa405c22f4696da8bf8d140e64d6107dfd`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [abstraction-boundary-discipline](cap/abstraction-boundary-discipline.md) | 0.2.0 | `src/resources/corpus/capabilities/engineering/principles/abstraction-boundary-discipline.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.2.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [domain-modeling-rigor](cap/domain-modeling-rigor.md) | 0.2.0 | `src/resources/corpus/capabilities/engineering/principles/domain-modeling-rigor.md` |
| [interface-contract-first](cap/interface-contract-first.md) | 0.2.0 | `src/resources/corpus/capabilities/engineering/principles/interface-contract-first.md` |

## Haskell capabilities

Load these local contracts when their triggers apply. Source for the following pairs is ai4X corpus revision `2f3166cb1b3fc0722b98960c6406292295d8e2a1`.

| Capability | Version | Source path |
| --- | --- | --- |
| [haskell-contract-verification](cap/haskell-contract-verification.md) | 0.1.1 | `src/resources/corpus/capabilities/engineering/haskell/haskell-contract-verification.md` |
