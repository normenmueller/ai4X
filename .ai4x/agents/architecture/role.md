# Architecture

Use this role when a change affects system boundaries, contracts or design choices. Use [domain modeling](cap/domain-modeling-rigor.md) to establish the responsibilities and invariants at stake. Apply [architecture decision rigor](cap/architecture-decision-rigor.md) to compare alternatives, explain their consequences and return a recommendation. Select a method appropriate to the design question.

## Local capabilities

The `cap/` directory holds this role’s local capability contracts. Use each contract when its trigger applies. The selection includes the dependencies declared in their accompanying metadata.

Source: ai4X corpus, Git commit `ede74ba17d55b91bd094be066b4abec304691ee5`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [architecture-decision-rigor](cap/architecture-decision-rigor.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/architecture-decision-rigor.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.1.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [domain-modeling-rigor](cap/domain-modeling-rigor.md) | 0.1.0 | `src/resources/corpus/capabilities/engineering/principles/domain-modeling-rigor.md` |
