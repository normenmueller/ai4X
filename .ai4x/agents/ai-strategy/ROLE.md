# AI strategy

Use this role to evaluate an AI use case and the conditions under which an agent can perform it reliably. Apply [use case framing](cap/ai-use-case-framing.md) to identify the beneficiary, success measure, cost of failure and simpler baseline. Use [model selection](cap/model-selection-and-boundary-fit.md) to define what the model and tools may do, what context they require and when to escalate or fall back. Return a recommendation with uncertainty, safeguards and one realistic failure case.

## Local capabilities

Load the contracts under `cap/` when their triggers apply. The selection includes their declared dependencies.

Source: ai4X corpus, Git commit `ede74ba17d55b91bd094be066b4abec304691ee5`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [ai-use-case-framing](cap/ai-use-case-framing.md) | 0.1.0 | `src/resources/corpus/capabilities/ai/consulting/ai-use-case-framing.md` |
| [clarification-before-guessing](cap/clarification-before-guessing.md) | 0.1.0 | `src/resources/corpus/capabilities/foundation/clarification-before-guessing.md` |
| [decision-gates](cap/decision-gates.md) | 0.1.0 | `src/resources/corpus/capabilities/strategy/governance/decision-gates.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.1.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [interaction-contract](cap/interaction-contract.md) | 0.1.0 | `src/resources/corpus/capabilities/strategy/workflow/interaction-contract.md` |
| [kpi-system](cap/kpi-system.md) | 0.2.0 | `src/resources/corpus/capabilities/strategy/metrics/kpi-system.md` |
| [model-selection-and-boundary-fit](cap/model-selection-and-boundary-fit.md) | 0.1.0 | `src/resources/corpus/capabilities/ai/architecture/solution/model-selection-and-boundary-fit.md` |
| [portfolio-prioritization](cap/portfolio-prioritization.md) | 0.1.0 | `src/resources/corpus/capabilities/strategy/analysis/portfolio-prioritization.md` |
| [strategic-fit](cap/strategic-fit.md) | 0.1.0 | `src/resources/corpus/capabilities/strategy/evaluation/strategic-fit.md` |
| [strategy-diagnosis](cap/strategy-diagnosis.md) | 0.1.0 | `src/resources/corpus/capabilities/strategy/analysis/strategy-diagnosis.md` |
