# #120 Capability Coverage and Admission Matrix

## Purpose, scope, and immutable source binding

This document is the sole #120 per-Capability preservation, disposition, and exact-target matrix. It supersedes the earlier #83 matrix for the Greenfield cut without changing any source Capability. It authorizes neither implementation nor deletion.

The reviewed source authorities are:

| Source | Revision |
| --- | --- |
| Preserved #112 final state | `5b9ba632b3d9af82f1eb63ca969deda40f4d9387` |
| Accepted Target Architecture | `2632207f834bcddf5fd57240d5eec87574208a51` |
| R15 comparison and evidence | `74bc0dfd9cf51f1f2263a4a3fa2bc62833f65d8d` |
| Reviewed #120 integration base | `b2c6ca96930def7477f91f648b8f85e6f24275b8` |

All four revisions expose the same `crp/cap` tree OID, `ec6872d46ef1939557eac699abb24888a3a24e8f`. The immutable source set contains 70 Markdown/metadata Capability pairs and ten `index.md` files. Brace notation is exact shorthand: `x/{a,b,c}` names exactly those three files.

## Authority and field ownership

| Authority | Sole responsibility |
| --- | --- |
| `CAPABILITY.md` | Reusable cognitive contract: purpose, trigger, rules, fallback, and output contract |
| `capability.meta.yaml` | Stable portfolio identity, version, lifecycle/admission, owner, dependencies, conflicts, negative applicability, distinctions, and provenance after the schema conflict below is resolved |
| `contract.dhall` | Formal supply signature only; it owns no cognitive prose, metadata relationships, project selections, composition decisions, or search behavior |
| Product Haskell | Closed decoding, validation, deterministic compatibility/composition/coverage/gap search, and opaque witness construction |
| Generated catalogue | Read-only deterministic projection; never an independent authority |

Project Needs and Cognitive Jobs remain Project Intent facts. Curation consumes their published summaries and the pinned Corpus view; formal compatibility never proves semantic fitness. Semantic review and governance acceptance remain separate, explicit decisions.

## Disposition and admission semantics

- `adopt`: preserve the stable identity and current cognitive semantics. #103 must still create and validate the target triplet before admission.
- `revise`: preserve the stable identity and useful core, but close every named reason before admission under #103.
- `merge`, `defer`, and `reject`: available only with explicit identity/lineage or exclusion evidence. No Capability pair currently receives one of these dispositions.

Preservation is not admission. Every source pair is retained even where its future target is `revise`. No `contract.dhall` placeholder or empty Capability package is created by #120.

## Revision reason register

| Code | Meaning | Exact affected set |
| --- | --- | --- |
| `R-TBD-NEIGHBOR` | Replace unresolved `TBD` neighbor distinctions with substantive boundaries. | All 15 `crp/cap/architecture/**` Capability pairs |
| `R-GENERIC-FALLBACK` | Replace repeated category-generic fallback prose with job-specific safe-degradation behavior. | 12 Analysis, 9 Engineering Principles, 7 Architecture, and 3 Foundation Capabilities; 31 total |
| `R-INVALID-NEIGHBOR-REFERENCE` | Replace the non-portfolio pseudo-ID `project handover protocol/report` with a valid typed boundary decision. | `expert-continuity-briefing` only |

Multiple reasons may apply to one row. The resulting distribution is exactly **30 adopt / 40 revise**.

## Complete Capability matrix

### AI architecture

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `ai-operating-model-architecture@0.1.0` | `crp/cap/ai/architecture/enterprise/ai-operating-model-architecture.md` | `crp/cap/ai/architecture/enterprise/ai-operating-model-architecture.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/architecture/enterprise/ai-operating-model-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `ai-evaluation-and-control-architecture@0.1.0` | `crp/cap/ai/architecture/governance/ai-evaluation-and-control-architecture.md` | `crp/cap/ai/architecture/governance/ai-evaluation-and-control-architecture.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/architecture/governance/ai-evaluation-and-control-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `agentic-solution-architecture@0.1.0` | `crp/cap/ai/architecture/solution/agentic-solution-architecture.md` | `crp/cap/ai/architecture/solution/agentic-solution-architecture.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/architecture/solution/agentic-solution-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `grounding-and-context-architecture@0.1.0` | `crp/cap/ai/architecture/solution/grounding-and-context-architecture.md` | `crp/cap/ai/architecture/solution/grounding-and-context-architecture.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/architecture/solution/grounding-and-context-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `model-selection-and-boundary-fit@0.1.0` | `crp/cap/ai/architecture/solution/model-selection-and-boundary-fit.md` | `crp/cap/ai/architecture/solution/model-selection-and-boundary-fit.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/architecture/solution/model-selection-and-boundary-fit/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |

### AI consulting

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `ai-adoption-roadmapping@0.1.0` | `crp/cap/ai/consulting/ai-adoption-roadmapping.md` | `crp/cap/ai/consulting/ai-adoption-roadmapping.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/consulting/ai-adoption-roadmapping/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `ai-center-of-excellence-design@0.1.0` | `crp/cap/ai/consulting/ai-center-of-excellence-design.md` | `crp/cap/ai/consulting/ai-center-of-excellence-design.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/consulting/ai-center-of-excellence-design/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `ai-readiness-assessment@0.1.0` | `crp/cap/ai/consulting/ai-readiness-assessment.md` | `crp/cap/ai/consulting/ai-readiness-assessment.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/consulting/ai-readiness-assessment/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `ai-use-case-framing@0.1.0` | `crp/cap/ai/consulting/ai-use-case-framing.md` | `crp/cap/ai/consulting/ai-use-case-framing.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/consulting/ai-use-case-framing/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `ai-value-risk-prioritization@0.1.0` | `crp/cap/ai/consulting/ai-value-risk-prioritization.md` | `crp/cap/ai/consulting/ai-value-risk-prioritization.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/consulting/ai-value-risk-prioritization/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |

### AI engineering

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `agent-loop-and-state-design@0.1.0` | `crp/cap/ai/engineering/agent-loop-and-state-design.md` | `crp/cap/ai/engineering/agent-loop-and-state-design.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/engineering/agent-loop-and-state-design/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `context-engineering-discipline@0.1.0` | `crp/cap/ai/engineering/context-engineering-discipline.md` | `crp/cap/ai/engineering/context-engineering-discipline.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/engineering/context-engineering-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `evaluation-driven-iteration@0.1.0` | `crp/cap/ai/engineering/evaluation-driven-iteration.md` | `crp/cap/ai/engineering/evaluation-driven-iteration.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/engineering/evaluation-driven-iteration/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `expert-continuity-briefing@0.1.0` | `crp/cap/ai/engineering/expert-continuity-briefing.md` | `crp/cap/ai/engineering/expert-continuity-briefing.meta.yaml` | `revise` | `R-INVALID-NEIGHBOR-REFERENCE` | `src/corpus/capabilities/ai/engineering/expert-continuity-briefing/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-INVALID-NEIGHBOR-REFERENCE` before admission under #103. |
| `failure-mode-and-guardrail-design@0.1.0` | `crp/cap/ai/engineering/failure-mode-and-guardrail-design.md` | `crp/cap/ai/engineering/failure-mode-and-guardrail-design.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/engineering/failure-mode-and-guardrail-design/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `prompt-contract-design@0.1.0` | `crp/cap/ai/engineering/prompt-contract-design.md` | `crp/cap/ai/engineering/prompt-contract-design.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/engineering/prompt-contract-design/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `tool-use-and-action-boundary-design@0.1.0` | `crp/cap/ai/engineering/tool-use-and-action-boundary-design.md` | `crp/cap/ai/engineering/tool-use-and-action-boundary-design.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/ai/engineering/tool-use-and-action-boundary-design/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |

### Analysis

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `function-deduplication@0.1.0` | `crp/cap/analysis/organization/function-deduplication.md` | `crp/cap/analysis/organization/function-deduplication.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/organization/function-deduplication/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `function-extraction@0.1.0` | `crp/cap/analysis/organization/function-extraction.md` | `crp/cap/analysis/organization/function-extraction.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/organization/function-extraction/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `function-ownership-allocation@0.1.0` | `crp/cap/analysis/organization/function-ownership-allocation.md` | `crp/cap/analysis/organization/function-ownership-allocation.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/organization/function-ownership-allocation/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `value-stream-organization-design@0.1.0` | `crp/cap/analysis/organization/value-stream-organization-design.md` | `crp/cap/analysis/organization/value-stream-organization-design.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/organization/value-stream-organization-design/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `comparison-dimension-discipline@0.1.0` | `crp/cap/analysis/role-assessment/comparison-dimension-discipline.md` | `crp/cap/analysis/role-assessment/comparison-dimension-discipline.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/role-assessment/comparison-dimension-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `evidence-typing-discipline@0.1.0` | `crp/cap/analysis/role-assessment/evidence-typing-discipline.md` | `crp/cap/analysis/role-assessment/evidence-typing-discipline.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/role-assessment/evidence-typing-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `fact-interpretation-separation@0.1.0` | `crp/cap/analysis/role-assessment/fact-interpretation-separation.md` | `crp/cap/analysis/role-assessment/fact-interpretation-separation.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/role-assessment/fact-interpretation-separation/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `statement-extraction-rigor@0.1.0` | `crp/cap/analysis/role-assessment/statement-extraction-rigor.md` | `crp/cap/analysis/role-assessment/statement-extraction-rigor.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/role-assessment/statement-extraction-rigor/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `ambiguity-detection@0.1.0` | `crp/cap/analysis/specification/ambiguity-detection.md` | `crp/cap/analysis/specification/ambiguity-detection.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/specification/ambiguity-detection/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `contradiction-detection@0.1.0` | `crp/cap/analysis/specification/contradiction-detection.md` | `crp/cap/analysis/specification/contradiction-detection.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/specification/contradiction-detection/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `overlap-detection@0.1.0` | `crp/cap/analysis/specification/overlap-detection.md` | `crp/cap/analysis/specification/overlap-detection.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/specification/overlap-detection/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `semantic-conflict-detection@0.1.0` | `crp/cap/analysis/specification/semantic-conflict-detection.md` | `crp/cap/analysis/specification/semantic-conflict-detection.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/analysis/specification/semantic-conflict-detection/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |

### Architecture

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `application-integration-architecture@0.1.0` | `crp/cap/architecture/domain/application-integration-architecture.md` | `crp/cap/architecture/domain/application-integration-architecture.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/domain/application-integration-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `business-service-architecture@0.1.0` | `crp/cap/architecture/domain/business-service-architecture.md` | `crp/cap/architecture/domain/business-service-architecture.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/domain/business-service-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `data-governance-architecture@0.1.0` | `crp/cap/architecture/domain/data-governance-architecture.md` | `crp/cap/architecture/domain/data-governance-architecture.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/domain/data-governance-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `segment-architecture-stewardship@0.1.0` | `crp/cap/architecture/domain/segment-architecture-stewardship.md` | `crp/cap/architecture/domain/segment-architecture-stewardship.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/domain/segment-architecture-stewardship/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `technology-platform-architecture@0.1.0` | `crp/cap/architecture/domain/technology-platform-architecture.md` | `crp/cap/architecture/domain/technology-platform-architecture.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/domain/technology-platform-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `architecture-practice-leadership@0.1.0` | `crp/cap/architecture/enterprise/architecture-practice-leadership.md` | `crp/cap/architecture/enterprise/architecture-practice-leadership.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/enterprise/architecture-practice-leadership/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `capability-map-governance@0.1.0` | `crp/cap/architecture/enterprise/capability-map-governance.md` | `crp/cap/architecture/enterprise/capability-map-governance.meta.yaml` | `revise` | `R-TBD-NEIGHBOR`, `R-GENERIC-FALLBACK` | `src/corpus/capabilities/architecture/enterprise/capability-map-governance/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` and `R-GENERIC-FALLBACK` before admission under #103. |
| `enterprise-architecture-integration@0.1.0` | `crp/cap/architecture/enterprise/enterprise-architecture-integration.md` | `crp/cap/architecture/enterprise/enterprise-architecture-integration.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/enterprise/enterprise-architecture-integration/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `togaf-adm-discipline@0.1.0` | `crp/cap/architecture/enterprise/togaf-adm-discipline.md` | `crp/cap/architecture/enterprise/togaf-adm-discipline.meta.yaml` | `revise` | `R-TBD-NEIGHBOR`, `R-GENERIC-FALLBACK` | `src/corpus/capabilities/architecture/enterprise/togaf-adm-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` and `R-GENERIC-FALLBACK` before admission under #103. |
| `architecture-compliance-review@0.1.0` | `crp/cap/architecture/governance/architecture-compliance-review.md` | `crp/cap/architecture/governance/architecture-compliance-review.meta.yaml` | `revise` | `R-TBD-NEIGHBOR`, `R-GENERIC-FALLBACK` | `src/corpus/capabilities/architecture/governance/architecture-compliance-review/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` and `R-GENERIC-FALLBACK` before admission under #103. |
| `archimate-cross-layer-consistency@0.1.0` | `crp/cap/architecture/modeling/archimate-cross-layer-consistency.md` | `crp/cap/architecture/modeling/archimate-cross-layer-consistency.meta.yaml` | `revise` | `R-TBD-NEIGHBOR`, `R-GENERIC-FALLBACK` | `src/corpus/capabilities/architecture/modeling/archimate-cross-layer-consistency/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` and `R-GENERIC-FALLBACK` before admission under #103. |
| `archimate-viewpoint-selection@0.1.0` | `crp/cap/architecture/modeling/archimate-viewpoint-selection.md` | `crp/cap/architecture/modeling/archimate-viewpoint-selection.meta.yaml` | `revise` | `R-TBD-NEIGHBOR`, `R-GENERIC-FALLBACK` | `src/corpus/capabilities/architecture/modeling/archimate-viewpoint-selection/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` and `R-GENERIC-FALLBACK` before admission under #103. |
| `baseline-target-gap-analysis@0.1.0` | `crp/cap/architecture/solution/baseline-target-gap-analysis.md` | `crp/cap/architecture/solution/baseline-target-gap-analysis.meta.yaml` | `revise` | `R-TBD-NEIGHBOR`, `R-GENERIC-FALLBACK` | `src/corpus/capabilities/architecture/solution/baseline-target-gap-analysis/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` and `R-GENERIC-FALLBACK` before admission under #103. |
| `solution-realization-architecture@0.1.0` | `crp/cap/architecture/solution/solution-realization-architecture.md` | `crp/cap/architecture/solution/solution-realization-architecture.meta.yaml` | `revise` | `R-TBD-NEIGHBOR` | `src/corpus/capabilities/architecture/solution/solution-realization-architecture/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` before admission under #103. |
| `transition-architecture-planning@0.1.0` | `crp/cap/architecture/solution/transition-architecture-planning.md` | `crp/cap/architecture/solution/transition-architecture-planning.meta.yaml` | `revise` | `R-TBD-NEIGHBOR`, `R-GENERIC-FALLBACK` | `src/corpus/capabilities/architecture/solution/transition-architecture-planning/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-TBD-NEIGHBOR` and `R-GENERIC-FALLBACK` before admission under #103. |

### Engineering

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `abstraction-boundary-discipline@0.1.0` | `crp/cap/engineering/principles/abstraction-boundary-discipline.md` | `crp/cap/engineering/principles/abstraction-boundary-discipline.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/abstraction-boundary-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `architecture-decision-rigor@0.1.0` | `crp/cap/engineering/principles/architecture-decision-rigor.md` | `crp/cap/engineering/principles/architecture-decision-rigor.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/architecture-decision-rigor/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `change-impact-analysis@0.1.0` | `crp/cap/engineering/principles/change-impact-analysis.md` | `crp/cap/engineering/principles/change-impact-analysis.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/change-impact-analysis/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `composition-over-subtyping@0.1.0` | `crp/cap/engineering/principles/composition-over-subtyping.md` | `crp/cap/engineering/principles/composition-over-subtyping.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/composition-over-subtyping/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `domain-modeling-rigor@0.1.0` | `crp/cap/engineering/principles/domain-modeling-rigor.md` | `crp/cap/engineering/principles/domain-modeling-rigor.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/domain-modeling-rigor/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `functional-error-modeling@0.1.0` | `crp/cap/engineering/principles/functional-error-modeling.md` | `crp/cap/engineering/principles/functional-error-modeling.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/functional-error-modeling/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `immutability-by-default@0.1.0` | `crp/cap/engineering/principles/immutability-by-default.md` | `crp/cap/engineering/principles/immutability-by-default.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/immutability-by-default/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `interface-contract-first@0.1.0` | `crp/cap/engineering/principles/interface-contract-first.md` | `crp/cap/engineering/principles/interface-contract-first.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/interface-contract-first/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `side-effect-boundary-discipline@0.1.0` | `crp/cap/engineering/principles/side-effect-boundary-discipline.md` | `crp/cap/engineering/principles/side-effect-boundary-discipline.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/engineering/principles/side-effect-boundary-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |

### Foundation

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `clarification-before-guessing@0.1.0` | `crp/cap/foundation/clarification-before-guessing.md` | `crp/cap/foundation/clarification-before-guessing.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/foundation/core/clarification-before-guessing/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `critical-peer-discipline@0.1.0` | `crp/cap/foundation/critical-peer-discipline.md` | `crp/cap/foundation/critical-peer-discipline.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/foundation/core/critical-peer-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `deterministic-reasoning@0.1.0` | `crp/cap/foundation/deterministic-reasoning.md` | `crp/cap/foundation/deterministic-reasoning.meta.yaml` | `revise` | `R-GENERIC-FALLBACK` | `src/corpus/capabilities/foundation/core/deterministic-reasoning/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and useful semantics; resolve `R-GENERIC-FALLBACK` before admission under #103. |
| `task-understanding-confirmation@0.1.0` | `crp/cap/foundation/task-understanding-confirmation.md` | `crp/cap/foundation/task-understanding-confirmation.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/foundation/core/task-understanding-confirmation/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |

### Strategy

| Stable identity | Source Markdown | Source metadata | Disposition | Revision reasons | Exact future target triplet | Admission rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `portfolio-prioritization@0.1.0` | `crp/cap/strategy/analysis/portfolio-prioritization.md` | `crp/cap/strategy/analysis/portfolio-prioritization.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/analysis/portfolio-prioritization/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `strategy-diagnosis@0.1.0` | `crp/cap/strategy/analysis/strategy-diagnosis.md` | `crp/cap/strategy/analysis/strategy-diagnosis.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/analysis/strategy-diagnosis/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `strategy-narrative-structure@0.1.0` | `crp/cap/strategy/analysis/strategy-narrative-structure.md` | `crp/cap/strategy/analysis/strategy-narrative-structure.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/analysis/strategy-narrative-structure/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `decision-structuring-discipline@0.1.0` | `crp/cap/strategy/delivery/decision-structuring-discipline.md` | `crp/cap/strategy/delivery/decision-structuring-discipline.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/delivery/decision-structuring-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `strategic-fit@0.1.0` | `crp/cap/strategy/evaluation/strategic-fit.md` | `crp/cap/strategy/evaluation/strategic-fit.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/evaluation/strategic-fit/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `cadence-and-review-discipline@0.1.0` | `crp/cap/strategy/goal-management/cadence-and-review-discipline.md` | `crp/cap/strategy/goal-management/cadence-and-review-discipline.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/goal-management/cadence-and-review-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `goal-cascade-and-alignment@0.1.0` | `crp/cap/strategy/goal-management/goal-cascade-and-alignment.md` | `crp/cap/strategy/goal-management/goal-cascade-and-alignment.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/goal-management/goal-cascade-and-alignment/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `goal-quality-discipline@0.1.0` | `crp/cap/strategy/goal-management/goal-quality-discipline.md` | `crp/cap/strategy/goal-management/goal-quality-discipline.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/goal-management/goal-quality-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `okr-discipline@0.3.0` | `crp/cap/strategy/goal-management/okr-discipline.md` | `crp/cap/strategy/goal-management/okr-discipline.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/goal-management/okr-discipline/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `decision-gates@0.1.0` | `crp/cap/strategy/governance/decision-gates.md` | `crp/cap/strategy/governance/decision-gates.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/governance/decision-gates/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `kpi-system@0.2.0` | `crp/cap/strategy/metrics/kpi-system.md` | `crp/cap/strategy/metrics/kpi-system.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/metrics/kpi-system/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `technical-output-validation@0.1.0` | `crp/cap/strategy/operation/technical-output-validation.md` | `crp/cap/strategy/operation/technical-output-validation.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/operation/technical-output-validation/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |
| `interaction-contract@0.1.0` | `crp/cap/strategy/workflow/interaction-contract.md` | `crp/cap/strategy/workflow/interaction-contract.meta.yaml` | `adopt` | -- | `src/corpus/capabilities/strategy/workflow/interaction-contract/{CAPABILITY.md,capability.meta.yaml,contract.dhall}` | Preserve identity and semantic contract; admit only after #103 creates and validates the governed target triplet. |

## Metadata authority conflict

The current 70 metadata files all omit `status`, `approved_by`, `approved_at`, and `scope`. Current Capability authoring governance describes those fields as required, while the normative central schema and closed #38 contract exclude them. #120 must not invent either authority.

Before any Capability is admitted, #103 must choose and document one normative metadata contract, align authoring guidance, schema, decoder, examples, and tests, and then populate only the fields authorized by that contract. This is a portfolio-wide pre-admission dependency, not a reason to edit or discard source Capabilities during #120.

## Catalogue index dispositions

| Source index | Disposition | Lossless target handling |
| --- | --- | --- |
| `crp/cap/index.md` | `split/revise` | Preserve useful human orientation in `src/corpus/README.md`; derive inventory rows into `src/corpus/catalog.yaml`. |
| `crp/cap/ai/index.md` | `reject-as-authority` | Derive hierarchy and rows into the catalogue; consolidate non-derived orientation in the README. |
| `crp/cap/ai/architecture/index.md` | `reject-as-authority` | Derive entries into the catalogue; do not retain obsolete `kob` composition wording as current guidance. |
| `crp/cap/ai/consulting/index.md` | `reject-as-authority` | Derive entries into the catalogue; do not retain obsolete `kob` composition wording as current guidance. |
| `crp/cap/ai/engineering/index.md` | `reject-as-authority` | Derive entries into the catalogue; do not retain obsolete `kob` composition wording as current guidance. |
| `crp/cap/analysis/index.md` | `reject-as-authority` | Derive hierarchy and rows into the catalogue; retain only non-derived orientation in the README. |
| `crp/cap/architecture/index.md` | `reject-as-authority` | Derive hierarchy, rows, and later-remediated boundaries into the catalogue. |
| `crp/cap/engineering/index.md` | `reject-as-authority` | Derive hierarchy and rows into the catalogue. |
| `crp/cap/foundation/index.md` | `reject-as-authority` | Derive hierarchy and rows into the catalogue. |
| `crp/cap/strategy/index.md` | `reject-as-authority` | Derive hierarchy and rows into the catalogue. |

`reject-as-authority` rejects only a hand-maintained index as a second authority. It preserves every derivable inventory fact through `src/corpus/catalog.yaml` and every useful non-derived orientation through `src/corpus/README.md`.

## Formal-contract and implementation boundary

The exact target triplets reserve the accepted authority split, but #120 creates no Capability package or `contract.dhall` file. #103 must implement representative vertical slices first, including schema/decoder alignment, formal signatures, deterministic validation, semantic review, admission, digests, and catalogue derivation. Only proven patterns may then be applied to the remaining rows.

## Deterministic verification contract

The successor matrix must verify all of the following:

1. 70 unique source Markdown files and 70 unique sibling metadata files.
2. 70 unique stable IDs and 70 unique target roots.
3. 210 unique future target files: exactly one `CAPABILITY.md`, `capability.meta.yaml`, and `contract.dhall` per row.
4. Exactly 30 `adopt`, 40 `revise`, and no unassigned Capability row.
5. Exactly 15 `R-TBD-NEIGHBOR`, 31 `R-GENERIC-FALLBACK`, and one `R-INVALID-NEIGHBOR-REFERENCE` assignments, allowing overlaps.
6. All 123 `requires` references resolve and the dependency graph is acyclic.
7. Declared conflicts are symmetric; the current portfolio declares zero conflict edges.
8. All typed neighbor references resolve; the one current pseudo-ID remains an explicit revision reason.
9. Exactly ten index dispositions and no index retained as a writable authority.
10. #120 changes zero files under `crp/cap/**` and creates zero target Capability files.

## Gate verdict

**Candidate pass, independent narrow re-review required.** The correction is limited to the sole Capability disposition artifact: all 70 pairs and ten indexes are losslessly covered, exact `src/` triplet targets are recorded, the 30/40 split and reasons are explicit, and #103 owns all later source repair and admission. This document grants no implementation, movement, deletion, or admission authority.
