# Capability governance

Use this role to assess a capability candidate, revise a contract or review portfolio health. Start with the demand and the closest existing candidates. Use [overlap detection](cap/overlap-detection.md) and [comparison dimensions](cap/comparison-dimension-discipline.md) to distinguish adding, revising, merging and retiring capabilities. Check purpose, trigger, rules, fallback, expected output, metadata and dependencies against a realistic task. Return the proposed disposition, evidence, affected consumers and any migration need. Submit admission, retirement and governance decisions to the authorized owner.

## Local capabilities

Load the contracts under `cap/` when their triggers apply. The selection includes their declared dependencies.

Source: ai4X corpus, Git commit `ede74ba17d55b91bd094be066b4abec304691ee5`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [comparison-dimension-discipline](cap/comparison-dimension-discipline.md) | 0.1.0 | `src/resources/corpus/capabilities/analysis/role-assessment/comparison-dimension-discipline.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.1.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [fact-interpretation-separation](cap/fact-interpretation-separation.md) | 0.1.0 | `src/resources/corpus/capabilities/analysis/role-assessment/fact-interpretation-separation.md` |
| [overlap-detection](cap/overlap-detection.md) | 0.1.0 | `src/resources/corpus/capabilities/analysis/specification/overlap-detection.md` |
| [statement-extraction-rigor](cap/statement-extraction-rigor.md) | 0.1.0 | `src/resources/corpus/capabilities/analysis/role-assessment/statement-extraction-rigor.md` |
