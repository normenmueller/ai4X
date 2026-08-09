# Capability Coverage Matrix

## Purpose, scope, and authority

This document is the sole authoritative #83 inventory of per-Capability dispositions and exact Greenfield targets for the current `crp/cap/**` Capability source set. The normative target architecture owns the surrounding boundaries in [Project Intent and curation](README.md#project-intent-and-curation) and [authority and publication boundaries](README.md#authority-and-publication-boundaries); the Information Disposition Matrix must reference this matrix for Capability-level outcomes instead of copying its rows.

The inventory is bound to repository revision `74bc0dfd9cf51f1f2263a4a3fa2bc62833f65d8d`. It contains all 70 tracked Capability pairs: 70 cognitive Markdown contracts and 70 sibling metadata files. The ten tracked `index.md` files are catalogue projections, not Capabilities, and `crp/cap/ai/architecture/modeling/.gitkeep` is neither content nor metadata; their file-level disposition belongs in `information-disposition.md`.

Brace notation in this document is exact shorthand. For example, `x/foo.{md,meta.yaml}` means exactly `x/foo.md` and `x/foo.meta.yaml`; `y/foo/{CAPABILITY.md,capability.meta.yaml}` means exactly those two files in the named package directory.

## Context boundaries

| Context | Responsibility | Owned facts | Integration point |
| --- | --- | --- | --- |
| Corpus Capability package | Reusable supply-side cognitive behavior and governed portfolio identity | `CAPABILITY.md` owns cognitive instructions; `capability.meta.yaml` owns stable ID, semantic version, lifecycle, owner, dependencies, conflicts, negative applicability, neighbor distinctions, and provenance | The versioned Corpus manifest publishes exact package and content digests through the Corpus Port |
| Project Intent | Sole ownership of demand-side purpose, desired outcomes, multiple Needs, constraints, anti-requirements, priorities, acceptance evidence, and required Cognitive Jobs | Project-authored Dhall contains the authoritative Cognitive Job definitions and is evaluated only at the explicit declaration-update boundary | `scout` authors and validates Cognitive Jobs as part of Project Intent, then publishes read-only summaries bound to each Job's exact identity, revision, and digest |
| Curation and Capabilities | Candidate discovery, deterministic graph checks, semantic fitness review, governance acceptance, and Agent Composition | The Need-to-Capability Trace and explicit curation decision; it never owns or rewrites Cognitive Jobs | Reads published Project Intent summaries and the pinned Corpus view; publishes accepted composition |
| Project declaration | Project selection and composition only | Exact Capability ID, version, digest, project conditions, composition, and bindings | Dhall pins Corpus content; it never copies reusable Capability facts |

The Corpus provides Capabilities; it does not own project Needs, Cognitive Jobs, project selection, or host placement. `scout` owns WHY and WHAT, including authoring and validating required Cognitive Jobs in Project Intent. `curate` owns WHO and HOW cognitive work is composed, but consumes identity-, revision-, and digest-bound Job summaries without changing their meaning. `spawn` owns WHERE and WITH WHICH HOST and therefore cannot select, repair, or reinterpret a Capability or Cognitive Job.

## Key invariants

1. A Capability has one stable ID and one governed metadata authority. The package directory is a lookup path, not a second identity.
2. `CAPABILITY.md` contains the reusable cognitive contract: purpose, trigger, mandatory rules, fallback, and output contract. It does not repeat ID, version, lifecycle, dependencies, conflicts, owner, or provenance.
3. `capability.meta.yaml` contains identity and portfolio facts. It does not copy cognitive instructions.
4. Project Dhall stores only pinned ID, exact version, digest, explicit selection/composition, project conditions, and bindings. It does not duplicate Capability instructions, `requires`, `conflicts`, lifecycle, owner, sources, or other provenance.
5. A Corpus manifest or catalogue is a deterministic projection from admitted packages. It is never a separately writable Capability authority.
6. A Need and a Capability remain different concepts: a Need expresses demand; a Cognitive Job classifies demanded cognitive work and is owned solely by Project Intent; a Capability is governed reusable supply. Curation may reference a published Cognitive Job summary but cannot own or rewrite it.
7. Need-to-Capability derivation is many-to-many across the complete Project Intent. One Need may require a composition; one Capability may contribute to several Needs; gaps and overlaps remain explicit.
8. Formal compatibility, dependency closure, conflict absence, digest integrity, and declared coverage are deterministic evidence. Semantic fitness and governance acceptance are separate decisions and cannot be inferred from formal success.
9. A changed Need, Cognitive Job identity, Cognitive Job revision or digest, Capability version, Capability digest, dependency, conflict, or constraint invalidates the affected trace through deterministic impact analysis and requires a new explicit `curate` decision. `spawn` must fail on stale pins rather than re-curate.
10. No row in this matrix authorizes implementation, movement, deletion, facade generation, host materialization, or a Greenfield cut.

## Target identity and admission contract

Every target package is rooted at `mod/corpus/capabilities/<semantic-category...>/<capability-id>/`. The mandatory files are `CAPABILITY.md` and `capability.meta.yaml`. Semantic category depth is intentional: `foundation` uses the explicit `foundation/core/` category, while AI architecture retains `ai/architecture/<enterprise|governance|solution>/`.

All current entries have a non-empty `id` and semantic `version`; no stable identity is missing. All current metadata also has an `owner`, `requires`, `conflicts`, `do_not_use_when`, `distinguish_from`, and `sources` field. Individual lifecycle status is absent from all current metadata. This matrix does not invent a historical status: on later authorized target admission, `adopt` entries receive an explicit admitted lifecycle state, while `revise` entries remain non-admitted until their stated remediation is complete and independently accepted. Admission generates a new target content digest; project declarations pin that target digest, never a path-derived or manually copied value.

`adopt` accepts the individual semantic contract; it does not waive release-level dependency closure. An adopted Capability that requires a `revise` entry cannot become selectable in a Corpus release until that required entry is revised, admitted, and resolvable at the pinned version.

Disposition semantics are:

- `adopt`: preserve the stable ID and current semantic contract; mechanically normalize it into the target package and add target-governed lifecycle/digest evidence without changing cognitive meaning.
- `revise`: preserve the stable ID and valuable core contract, but correct the stated semantic defect, assign the appropriate new semantic version, and obtain a new digest before admission.
- `merge`: combine two or more source identities into one named target identity with explicit alias and lineage evidence.
- `defer`: retain evidence but create no admitted target package in this architecture.
- `reject`: create no target package and record why the source is not a valid target Capability.

No current pair has sufficient evidence for `merge`, `defer`, or `reject`. Similar wording or shared prerequisites alone is not evidence of duplicate cognitive responsibility.

## Complete matrix

### AI architecture

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `ai-operating-model-architecture@0.1.0` | `crp/cap/ai/architecture/enterprise/ai-operating-model-architecture.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/architecture/enterprise/ai-operating-model-architecture/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `ai-evaluation-and-control-architecture@0.1.0` | `crp/cap/ai/architecture/governance/ai-evaluation-and-control-architecture.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/architecture/governance/ai-evaluation-and-control-architecture/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `agentic-solution-architecture@0.1.0` | `crp/cap/ai/architecture/solution/agentic-solution-architecture.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/architecture/solution/agentic-solution-architecture/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `grounding-and-context-architecture@0.1.0` | `crp/cap/ai/architecture/solution/grounding-and-context-architecture.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/architecture/solution/grounding-and-context-architecture/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `model-selection-and-boundary-fit@0.1.0` | `crp/cap/ai/architecture/solution/model-selection-and-boundary-fit.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/architecture/solution/model-selection-and-boundary-fit/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |

### AI consulting

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `ai-adoption-roadmapping@0.1.0` | `crp/cap/ai/consulting/ai-adoption-roadmapping.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/consulting/ai-adoption-roadmapping/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `ai-center-of-excellence-design@0.1.0` | `crp/cap/ai/consulting/ai-center-of-excellence-design.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/consulting/ai-center-of-excellence-design/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `ai-readiness-assessment@0.1.0` | `crp/cap/ai/consulting/ai-readiness-assessment.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/consulting/ai-readiness-assessment/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `ai-use-case-framing@0.1.0` | `crp/cap/ai/consulting/ai-use-case-framing.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/consulting/ai-use-case-framing/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `ai-value-risk-prioritization@0.1.0` | `crp/cap/ai/consulting/ai-value-risk-prioritization.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/consulting/ai-value-risk-prioritization/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |

### AI engineering

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `agent-loop-and-state-design@0.1.0` | `crp/cap/ai/engineering/agent-loop-and-state-design.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/engineering/agent-loop-and-state-design/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `context-engineering-discipline@0.1.0` | `crp/cap/ai/engineering/context-engineering-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/engineering/context-engineering-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `evaluation-driven-iteration@0.1.0` | `crp/cap/ai/engineering/evaluation-driven-iteration.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/engineering/evaluation-driven-iteration/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `expert-continuity-briefing@0.1.0` | `crp/cap/ai/engineering/expert-continuity-briefing.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/engineering/expert-continuity-briefing/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and its negative boundary against repository handover is explicit. |
| `failure-mode-and-guardrail-design@0.1.0` | `crp/cap/ai/engineering/failure-mode-and-guardrail-design.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/engineering/failure-mode-and-guardrail-design/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `prompt-contract-design@0.1.0` | `crp/cap/ai/engineering/prompt-contract-design.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/engineering/prompt-contract-design/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `tool-use-and-action-boundary-design@0.1.0` | `crp/cap/ai/engineering/tool-use-and-action-boundary-design.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/ai/engineering/tool-use-and-action-boundary-design/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |

### Analysis

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `function-deduplication@0.1.0` | `crp/cap/analysis/organization/function-deduplication.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/organization/function-deduplication/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and retains auditable merge rationale. |
| `function-extraction@0.1.0` | `crp/cap/analysis/organization/function-extraction.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/organization/function-extraction/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `function-ownership-allocation@0.1.0` | `crp/cap/analysis/organization/function-ownership-allocation.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/organization/function-ownership-allocation/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `value-stream-organization-design@0.1.0` | `crp/cap/analysis/organization/value-stream-organization-design.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/organization/value-stream-organization-design/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `comparison-dimension-discipline@0.1.0` | `crp/cap/analysis/role-assessment/comparison-dimension-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/role-assessment/comparison-dimension-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `evidence-typing-discipline@0.1.0` | `crp/cap/analysis/role-assessment/evidence-typing-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/role-assessment/evidence-typing-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `fact-interpretation-separation@0.1.0` | `crp/cap/analysis/role-assessment/fact-interpretation-separation.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/role-assessment/fact-interpretation-separation/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `statement-extraction-rigor@0.1.0` | `crp/cap/analysis/role-assessment/statement-extraction-rigor.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/role-assessment/statement-extraction-rigor/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `ambiguity-detection@0.1.0` | `crp/cap/analysis/specification/ambiguity-detection.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/specification/ambiguity-detection/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `contradiction-detection@0.1.0` | `crp/cap/analysis/specification/contradiction-detection.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/specification/contradiction-detection/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `overlap-detection@0.1.0` | `crp/cap/analysis/specification/overlap-detection.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/specification/overlap-detection/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and distinguishes useful redundancy from wasteful duplication. |
| `semantic-conflict-detection@0.1.0` | `crp/cap/analysis/specification/semantic-conflict-detection.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/analysis/specification/semantic-conflict-detection/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |

### Architecture

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `application-integration-architecture@0.1.0` | `crp/cap/architecture/domain/application-integration-architecture.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/domain/application-integration-architecture/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `business-service-architecture@0.1.0` | `crp/cap/architecture/domain/business-service-architecture.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/domain/business-service-architecture/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `data-governance-architecture@0.1.0` | `crp/cap/architecture/domain/data-governance-architecture.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/domain/data-governance-architecture/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `segment-architecture-stewardship@0.1.0` | `crp/cap/architecture/domain/segment-architecture-stewardship.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/domain/segment-architecture-stewardship/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `technology-platform-architecture@0.1.0` | `crp/cap/architecture/domain/technology-platform-architecture.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/domain/technology-platform-architecture/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `architecture-practice-leadership@0.1.0` | `crp/cap/architecture/enterprise/architecture-practice-leadership.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/enterprise/architecture-practice-leadership/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `capability-map-governance@0.1.0` | `crp/cap/architecture/enterprise/capability-map-governance.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/enterprise/capability-map-governance/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `enterprise-architecture-integration@0.1.0` | `crp/cap/architecture/enterprise/enterprise-architecture-integration.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/enterprise/enterprise-architecture-integration/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `togaf-adm-discipline@0.1.0` | `crp/cap/architecture/enterprise/togaf-adm-discipline.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/enterprise/togaf-adm-discipline/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `architecture-compliance-review@0.1.0` | `crp/cap/architecture/governance/architecture-compliance-review.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/governance/architecture-compliance-review/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `archimate-cross-layer-consistency@0.1.0` | `crp/cap/architecture/modeling/archimate-cross-layer-consistency.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/modeling/archimate-cross-layer-consistency/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace the `TBD` neighbor boundary with a substantive distinction before admission. |
| `archimate-viewpoint-selection@0.1.0` | `crp/cap/architecture/modeling/archimate-viewpoint-selection.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/modeling/archimate-viewpoint-selection/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace the `TBD` neighbor boundary with a substantive distinction before admission. |
| `baseline-target-gap-analysis@0.1.0` | `crp/cap/architecture/solution/baseline-target-gap-analysis.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/solution/baseline-target-gap-analysis/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `solution-realization-architecture@0.1.0` | `crp/cap/architecture/solution/solution-realization-architecture.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/solution/solution-realization-architecture/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |
| `transition-architecture-planning@0.1.0` | `crp/cap/architecture/solution/transition-architecture-planning.{md,meta.yaml}` | `revise` | `mod/corpus/capabilities/architecture/solution/transition-architecture-planning/{CAPABILITY.md,capability.meta.yaml}` | Retain the core contract, but replace every `TBD` neighbor boundary with a substantive distinction before admission. |

### Engineering

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `abstraction-boundary-discipline@0.1.0` | `crp/cap/engineering/principles/abstraction-boundary-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/abstraction-boundary-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `architecture-decision-rigor@0.1.0` | `crp/cap/engineering/principles/architecture-decision-rigor.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/architecture-decision-rigor/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `change-impact-analysis@0.1.0` | `crp/cap/engineering/principles/change-impact-analysis.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/change-impact-analysis/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and directly supports deterministic curation impact analysis. |
| `composition-over-subtyping@0.1.0` | `crp/cap/engineering/principles/composition-over-subtyping.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/composition-over-subtyping/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `domain-modeling-rigor@0.1.0` | `crp/cap/engineering/principles/domain-modeling-rigor.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/domain-modeling-rigor/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `functional-error-modeling@0.1.0` | `crp/cap/engineering/principles/functional-error-modeling.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/functional-error-modeling/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `immutability-by-default@0.1.0` | `crp/cap/engineering/principles/immutability-by-default.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/immutability-by-default/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `interface-contract-first@0.1.0` | `crp/cap/engineering/principles/interface-contract-first.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/interface-contract-first/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `side-effect-boundary-discipline@0.1.0` | `crp/cap/engineering/principles/side-effect-boundary-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/engineering/principles/side-effect-boundary-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |

### Foundation

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `clarification-before-guessing@0.1.0` | `crp/cap/foundation/clarification-before-guessing.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/foundation/core/clarification-before-guessing/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `critical-peer-discipline@0.1.0` | `crp/cap/foundation/critical-peer-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/foundation/core/critical-peer-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `deterministic-reasoning@0.1.0` | `crp/cap/foundation/deterministic-reasoning.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/foundation/core/deterministic-reasoning/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent, has no prerequisite, and remains the dependency root. |
| `task-understanding-confirmation@0.1.0` | `crp/cap/foundation/task-understanding-confirmation.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/foundation/core/task-understanding-confirmation/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and has explicit negative and neighbor boundaries. |

### Strategy

| Stable identity | Current source pair | Disposition | Exact target pair | Rationale |
| --- | --- | --- | --- | --- |
| `portfolio-prioritization@0.1.0` | `crp/cap/strategy/analysis/portfolio-prioritization.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/analysis/portfolio-prioritization/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `strategy-diagnosis@0.1.0` | `crp/cap/strategy/analysis/strategy-diagnosis.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/analysis/strategy-diagnosis/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `strategy-narrative-structure@0.1.0` | `crp/cap/strategy/analysis/strategy-narrative-structure.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/analysis/strategy-narrative-structure/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `decision-structuring-discipline@0.1.0` | `crp/cap/strategy/delivery/decision-structuring-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/delivery/decision-structuring-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `strategic-fit@0.1.0` | `crp/cap/strategy/evaluation/strategic-fit.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/evaluation/strategic-fit/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `cadence-and-review-discipline@0.1.0` | `crp/cap/strategy/goal-management/cadence-and-review-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/goal-management/cadence-and-review-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `goal-cascade-and-alignment@0.1.0` | `crp/cap/strategy/goal-management/goal-cascade-and-alignment.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/goal-management/goal-cascade-and-alignment/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `goal-quality-discipline@0.1.0` | `crp/cap/strategy/goal-management/goal-quality-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/goal-management/goal-quality-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `okr-discipline@0.3.0` | `crp/cap/strategy/goal-management/okr-discipline.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/goal-management/okr-discipline/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and explicitly distinguishes OKRs from KPIs and generic goal quality. |
| `decision-gates@0.1.0` | `crp/cap/strategy/governance/decision-gates.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/governance/decision-gates/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |
| `kpi-system@0.2.0` | `crp/cap/strategy/metrics/kpi-system.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/metrics/kpi-system/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and explicitly distinguishes operational measurement from change-oriented OKRs. |
| `technical-output-validation@0.1.0` | `crp/cap/strategy/operation/technical-output-validation.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/operation/technical-output-validation/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and keeps tool-specific commands outside cognitive content. |
| `interaction-contract@0.1.0` | `crp/cap/strategy/workflow/interaction-contract.{md,meta.yaml}` | `adopt` | `mod/corpus/capabilities/strategy/workflow/interaction-contract/{CAPABILITY.md,capability.meta.yaml}` | The paired contract is coherent and no semantic admission blocker was observed. |

## Need-to-Capability trace implications

The detailed model remains normative in the target architecture. For this matrix, the required implication is that every candidate reference resolves to one exact target package identity and digest. A complete trace must record exact Need, Cognitive Job, and Capability identities and revisions or digests; required constraints; all considered candidates; deterministic match results; coverage, gaps, and overlaps; dependency closure and conflicts; selections and rejections; semantic rationale; residual uncertainty; accepting authority; and the resulting Agent Composition. Curation reads the published Cognitive Job summaries and records their exact pins; it never republishes a modified Job definition.

Deterministic processing may prove reference integrity, graph closure, declared constraint compatibility, absence of selected conflicts, and coverage according to the declared formal algebra. It must not claim semantic suitability. The semantic reviewer decides whether a formally compatible Capability actually performs the required Cognitive Job in context; the named governance authority accepts or rejects that recommendation. #83 owns the runtime `ContractSignature` model, deterministic match, compose, and impact operations, dependency and conflict semantics, coverage-gap semantics, and opaque witness contract. Issue #96 defers only implementation research, advanced type-level encoding or search, and possible `Need a` inhabitation; the preserved `Need a` example is unproved evidence rather than target authority and cannot reopen or omit the #83 runtime contract.

Consistent terminology is required in the lean root README, one dedicated Project Intent and curation concept document, `scout`, `curate`, and `spawn` command documentation, declaration/schema documentation, one complete worked example, the canonical glossary, and diagrams. Those surfaces reference the owning model; they do not redefine it.

## Adjacent product dispositions, not Capability rows

These records prevent product concepts from being misclassified as cognitive Capabilities and therefore do not change the 70-row count.

| Evidence or product concept | Classification and disposition | Target contract |
| --- | --- | --- |
| `normenmueller/ai4x-tpl` | `defer` as external migration evidence and a possible future Project Bundle source or registry; reject its monolithic layout, legacy `adm/` ownership, in-place mutation, and hidden initialization defaults as target contracts | Project Bundles are optional, versioned, host-agnostic compositions with identity, version, digest, compatibility, provenance, explicit acquisition/trust/offline/update/deprecation rules, and pinned skeleton/profile, reference-team/topology, governance/operations, and Assurance Pack references. Bundle selection and interview mode are mutually exclusive and neither is implicit. No project link may target the external template repository. |
| Transferred MPRM prompt | `adopt` as the single ai4X **Light Prompt** product contract, not as a Corpus Capability | `ai4x light prompt` emits the accepted versioned prompt with provenance and no project, Git, network, or host mutation. "Light" means low-friction entry to the same canonical Project Memory quality and architecture, never a reduced or incompatible memory edition. |
| Deterministic Assurance Packs and checks | Excluded from the cognitive Capability inventory | Versioned product/tooling artifacts bind checks to projects and gates and produce typed Receipts; an Agent may invoke them but cannot replace a required Receipt with self-asserted success. |

## Alternatives and recommendation

### Option A - one governed package per Capability

Use the selected target layout with one cognitive contract and one metadata authority per stable Capability. It preserves semantic hierarchy, permits per-Capability versioning and digests, keeps project pins small, and enables deterministic manifest generation.

The counterargument is package proliferation: 70 directories are more verbose than a flat catalogue. Derived catalogues and manifest indexes contain that navigation cost without creating a second writable authority.

### Option B - one aggregate Capability catalogue

Store instructions and metadata for all Capabilities in one large Markdown/YAML or Dhall aggregate. This is rejected because unrelated capability changes would share versions and digests, review and provenance boundaries would be coarse, project Dhall would tend to absorb Corpus facts, and partial consumption would require custom slicing.

### Rejected merge-by-similarity alternative

Merge Capabilities that share prerequisites or vocabulary during the Greenfield move. This is rejected because dependency or wording similarity does not establish identical trigger, responsibility, output contract, or negative applicability. It would erase stable identities without a semantic assessment and alias/lineage decision.

### Decision recommendation

Adopt Option A and execute the exact row dispositions only in a later authorized migration. The trade-off is a larger package tree in exchange for narrow authority, independent lifecycle, deterministic identity, and reviewable project pins.

## Assumptions, risks, and migration impact

### Assumptions

- The 70 tracked metadata files and their 70 sibling Markdown contracts are the complete current Capability source set at the bound revision.
- Current `id` plus `version` is the preserved source identity; the target manifest adds content-addressed integrity rather than replacing that identity.
- Empty `conflicts`, `do_not_use_when`, `distinguish_from`, or `sources` lists are truthful current facts, not missing YAML fields.
- A mechanical package-path change does not by itself change cognitive semantics.

### Risks and controls

| Risk | Impact | Control |
| --- | --- | --- |
| Missing current lifecycle status is silently interpreted as active | Unreviewed content becomes selectable | Do not infer historical status; require explicit target admission state and accepting authority |
| Architecture `TBD` neighbor boundaries survive the move | Curation can confuse adjacent responsibilities | Keep all 15 affected entries `revise` and non-admitted until substantive distinctions and re-review exist |
| Markdown, metadata, manifest, and Dhall repeat facts | Authorities drift | Validate the field ownership rules and generate the manifest; reject duplicated project declarations |
| IDs are changed to match new directories | Need traces and project pins break | Preserve stable IDs; treat paths as location only; require explicit alias/lineage for any separately approved rename |
| Formal matching is presented as semantic proof | Inappropriate compositions receive false confidence | Emit separate deterministic evidence, semantic review, uncertainty, and governance acceptance |
| A broad move obscures lost content | Greenfield cut loses capability meaning or provenance | Compare every source pair to its exact row target and bind source/target digests before deletion |

The eventual migration blast radius is 70 package directories and 140 authoritative source files, plus generated catalogue/manifest projections. The current ten indexes are not copied as authorities. This document performs none of those moves.

## Design co-author evidence

| Co-author | Bounded semantic scope | Write authority and owned path | Target contract | Required checks | Independently verifiable result |
| --- | --- | --- | --- | --- | --- |
| Independent #83 architecture co-author `/root/capability_matrix_83` | Project Intent implications, demand/supply distinction, Need-to-Capability composition boundary, Corpus Capability authority, and complete current-Capability disposition | Write only `doc/arc/target-architecture/capability-coverage.md`; no Haskell source, implementation, migration, deletion, facade, host, or GitHub mutation authority | AC-13, AC-14, AC-21-AC-28, AC-31, AC-32, AC-44, AC-45, AC-51, and AC-56 | Inventory cardinality and pairing; unique IDs; exact allowed disposition count; exact target uniqueness; `TBD` evidence for every `revise`; Markdown/link checks; independent read-only architecture review | This file exposes 70 source identities, 70 exact target pairs, exactly one disposition per row, and evidence-based remediation for all 15 revisions. Final acceptance remains with the orchestrator after independent review. |

This co-authoring scope references the accepted Haskell semantic boundary but does not design or approve a Haskell public API. Any Haskell API, formal signature algebra, proof/search mechanism, diagnostics, or performance design requires the additional bounded co-authors and independent review perspectives required by #83.

## Validation method and evidence commands

Validation is deterministic where possible and semantic where necessary:

1. Inventory tracked metadata and non-index Markdown independently and require `70/70`.
2. Require one sibling Markdown file for every metadata file and one sibling metadata file for every non-index Capability Markdown file.
3. Parse every `id` and `version`; require non-empty values and globally unique IDs.
4. Parse this matrix; require 70 identity rows, one allowed disposition per row, unique source pairs, and unique target pairs.
5. Require 55 `adopt`, 15 `revise`, and zero unassigned rows. The disposition distribution is evidence, not a general policy.
6. Require the 15 `revise` source metadata files to be exactly the 15 files containing `boundary: "TBD"`; a mismatch blocks acceptance.
7. Verify that every `adopt` or `revise` row has an exact `mod/corpus/capabilities/**/{CAPABILITY.md,capability.meta.yaml}` target and a rationale.
8. Run independent semantic review for false merges, missing negative applicability, inconsistent dependency meaning, and the separation of formal compatibility from semantic fitness.

Evidence commands against the bound source revision:

```sh
git rev-parse HEAD
git ls-files 'crp/cap/**' | rg '\.meta\.yaml$' | wc -l
git ls-files 'crp/cap/**' | rg '\.md$' | rg -v '/index\.md$' | wc -l
for metadata in $(git ls-files 'crp/cap/**' | rg '\.meta\.yaml$'); do test -f "${metadata%.meta.yaml}.md" || printf '%s\n' "$metadata"; done
for capability in $(git ls-files 'crp/cap/**' | rg '\.md$' | rg -v '/index\.md$'); do test -f "${capability%.md}.meta.yaml" || printf '%s\n' "$capability"; done
for metadata in $(git ls-files 'crp/cap/**' | rg '\.meta\.yaml$'); do sed -n 's/^id: //p' "$metadata"; done | sort | uniq -d
rg -l 'boundary: "TBD"' crp/cap --glob '*.meta.yaml' | sort
git diff --check -- doc/arc/target-architecture/capability-coverage.md
```

Target migration checks, to be implemented and run only under later authority, must additionally validate the metadata schema, lifecycle state, dependency/conflict reference closure, target digest calculation, manifest derivation, absence of duplicated authoritative facts in project Dhall, and byte-for-byte deterministic projections.

## Gate verdict

**pass** - The bounded Capability Coverage Matrix contains all 70 current Capabilities, exact source identities and paths, exactly one allowed disposition per Capability, exact Greenfield target pairs for all 55 `adopt` and 15 `revise` decisions, explicit remediation for every revision, authority boundaries, alternatives, risks, and reproducible checks. This is a specialist gate verdict, not self-approval or authorization to advance, implement, migrate, or delete.
