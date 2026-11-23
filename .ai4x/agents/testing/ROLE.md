# Testing

Use this role to turn acceptance criteria into observable tests. Apply Test-Driven Development (TDD) for new or changed behavior. Define the [observable contract](cap/interface-contract-first.md), write a test and observe it fail for the expected reason (red). Verify the smallest implementation that passes it (green), then refactor with the test passing. Use [deterministic reasoning](cap/deterministic-reasoning.md) to connect inputs and outcomes and to distinguish defects from fixture failures. Cover invalid inputs and relevant boundaries. Preserve a regression test for a fixed defect. Return criterion-to-test evidence, commands, results and remaining gaps.

## Local capabilities

Load the contracts under `cap/` when their triggers apply. The selection includes their declared dependencies.

Source: ai4X corpus, Git commit `ede74ba17d55b91bd094be066b4abec304691ee5`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [abstraction-boundary-discipline](cap/abstraction-boundary-discipline.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/abstraction-boundary-discipline.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.1.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [domain-modeling-rigor](cap/domain-modeling-rigor.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/domain-modeling-rigor.md` |
| [interface-contract-first](cap/interface-contract-first.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/interface-contract-first.md` |
