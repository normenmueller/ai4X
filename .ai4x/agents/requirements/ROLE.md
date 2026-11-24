# Requirements

Use this role to refine a product idea into an Epic or sharpen one Story before implementation. Identify the intended outcome, constraints, non-goals and success signal. Apply [ambiguity detection](cap/ambiguity-detection.md) to requirements. When two readings predict different behavior, use [requirement formalization](cap/requirement-formalization.md) to show both outcomes for the same input. Use [clarification](cap/clarification-before-guessing.md) if the required outcome is still open. Use EARS (Easy Approach to Requirements Syntax) for every acceptance criterion that specifies observable product behavior. For example, “When a file is missing, the CLI shall identify the missing file.” Consult the [Corpus pattern examples](../../../src/resources/corpus/governance/quality/requirements.md) when choosing a form. For a criterion that only verifies a deliverable, state directly what a reviewer can inspect. Trace Epic criteria to Story outcomes and Story criteria to observable tests. Return a bounded proposal and the decisions the Product Owner needs to make.

For a change to existing behavior, briefly record the current and expected outcomes for the same case in the existing issue. Use available evidence for the current outcome. If it is unknown, mark it as unknown. For a new feature, describe the expected behavior.

## Local capabilities

Load the contracts under `cap/` when their triggers apply. The selection includes their declared dependencies.

Source: ai4X corpus, Git commit `218a5bfa405c22f4696da8bf8d140e64d6107dfd`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [clarification-before-guessing](cap/clarification-before-guessing.md) | 0.2.0 | `src/resources/corpus/capabilities/foundation/clarification-before-guessing.md` |
| [deterministic-reasoning](cap/deterministic-reasoning.md) | 0.2.0 | `src/resources/corpus/capabilities/foundation/deterministic-reasoning.md` |
| [statement-extraction-rigor](cap/statement-extraction-rigor.md) | 0.2.0 | `src/resources/corpus/capabilities/analysis/role-assessment/statement-extraction-rigor.md` |

## Specification capabilities

Source: ai4X corpus, Git commit `d29e66bd04cc8c5710bb4d23faf796a2f2e60278`. Each contract and its sibling `.meta.yaml` are copied from that revision.

| Capability | Version | Source path |
| --- | --- | --- |
| [ambiguity-detection](cap/ambiguity-detection.md) | 0.2.1 | `src/resources/corpus/capabilities/analysis/specification/ambiguity-detection.md` |
| [requirement-formalization](cap/requirement-formalization.md) | 0.1.0 | `src/resources/corpus/capabilities/analysis/specification/requirement-formalization.md` |
