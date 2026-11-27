# Finding capabilities by the work they perform

Local review implementation for the Product Owner. Explore the [six result areas](../../../src/resources/corpus/capability/README.md) to find individual capability contracts.

## First question at the top level

Choose the primary home by the result the requester wants to receive. Read the trigger and minimum output together. If a contract mentions several disciplines, ask which result would still be missing if it were removed from the assignment.

| First entry | Expected result |
| --- | --- |
| `collaboration` | A shared understanding of the assignment, feedback on a learner’s attempt, a useful challenge to a colleague or an actionable handoff. |
| `analysis` | A clarified need, trustworthy evidence, a mathematical derivation, an inventory of functions or a requirement with distinguishable outcomes. |
| `strategy` | A direction, priority, goal or decision an owner can use to steer work. |
| `organization` | An allocation of responsibility, an operating model or a proposal for a team. |
| `architecture` | A system or landscape design, an architecture decision, or evidence that a design meets its constraints. |
| `engineering` | An implementable technical contract, implementation, algorithm, transfer procedure or verification result. |

The second level groups related work within a discipline. In engineering, a technology family is a useful entry when choosing the correct method requires knowing the technology. This design aims for a consistent first question while allowing useful local groupings underneath.

## Combining capabilities across disciplines

A capability has one canonical contract and metadata pair. An index for enterprise architecture can surface a relevant operating-model contract even when its primary home is organization. Discovering a capability is distinct from choosing it for the current need. A profile composition selects IDs and pins their source revision. The contract's `requires` describes prerequisites. Each prerequisite is declared in the contract metadata.

Adelheid's composition already selects both `enterprise-architecture-integration` and `operating-model-design`. The former yields cross-segment alignment and roadmap implications. The latter yields lifecycle responsibilities and decision rights. A role can choose either or both. The operating-model contract declares `decision-gates` and `architecture-decision-rigor` as prerequisites. It declares no dependency on enterprise architecture integration.

### SKOS for a later machine-readable index

The W3C’s Simple Knowledge Organization System (SKOS) offers words for relationships between concepts. For example, enterprise architecture is a narrower topic within architecture. AI operating model design can be relevant to both enterprise architecture and AI governance. A future index could express those relationships and point to one capability ID. Revisit this if curators need to navigate broader, narrower or related topics across several indexes. The current Markdown indexes already support the initial browsing task.

A lightweight starting point is a controlled set of topic labels and indexes resolving to capability IDs. A file-system symlink can express a path alias; it cannot explain whether the target is a broader subject, related work or a prerequisite. Evaluate representation and generation after validating discovery. SKOS distinguishes hierarchical and associative relationships and supports concept collections. Its vocabulary can guide the design. Adopting RDF, OWL or another implementation is a separate decision. [W3C SKOS Primer](https://www.w3.org/TR/skos-primer/)

## Cases that can disprove the grouping

| Request | Expected discovery and selection |
| --- | --- |
| Align incompatible roadmaps across two segments with no AI remit. | Enterprise architecture integration suffices for that job. |
| Define AI release and escalation rights across model development and operations. | Organization and the enterprise architecture cross-reference reach the same operating-model contract. Cross-segment integration is added only when the remit warrants it. |
| Decide which sources a system may retrieve, then fit permitted information into a single model call. | The system policy routes to architecture; per-call selection and truncation route to engineering. |
| Hand a discussion over to a human expert. | Collaboration routes to expert continuity briefing even without an AI topic. |
| Compose an agent team after confirming a need. | Organization routes to agent-team curation. |

A fresh agent found all six contracts for these five tasks using only the outcome inventory, its domain indexes and the source contracts. This exercise tested task-based discovery. Revisit additional discovery routes if a recurring task reveals a coverage gap.

## Review of the seven AI-prefixed capability names

Approved naming decision. Keep an AI qualifier when removing AI from the assignment changes the work the capability must perform. Mechthild selects by the confirmed need and the required result. The fact that an agent performs the work applies to every capability.

| Original ID | Adopted contract | Deciding difference and detail to preserve |
| --- | --- | --- |
| [ai-use-case-framing](../../../src/resources/corpus/capability/analysis/requirement/ai-use-case-framing.md) | Keep | Use when AI is a candidate. Compare it with a simpler baseline and record acceptable failure cost and oversight. General need elicitation can finish before any candidate is known. |
| [ai-evaluation-and-control-architecture](../../../src/resources/corpus/capability/architecture/governance/ai-evaluation-and-control-architecture.md) | Keep | Design how model behavior is evaluated before release, monitored in operation and interrupted by a responsible human. A compliance review evaluates an existing design. |
| `ai-operating-model-architecture` | [operating-model-design](../../../src/resources/corpus/capability/organization/operating-model/operating-model-design.md) | Assign decision rights and control points across a service lifecycle, including platform and product ownership. For AI services, retain evaluation, release authority and ongoing oversight. |
| `ai-readiness-assessment` | [adoption-readiness-assessment](../../../src/resources/corpus/capability/strategy/direction/adoption-readiness-assessment.md) | Recommend starting, scaling or pausing from evidence of readiness. Distinguish missing capabilities from immature ones. For AI, assess readiness against the intended autonomy and risk. |
| `ai-center-of-excellence-design` | [center-of-excellence-design](../../../src/resources/corpus/capability/organization/operating-model/center-of-excellence-design.md) | Define central services, team accountability, intake and escalation. A data competence center needs the same result. Make AI-specific prerequisites conditional. |
| `ai-adoption-roadmapping` | [adoption-roadmapping](../../../src/resources/corpus/capability/strategy/direction/adoption-roadmapping.md) | Define what evidence permits an organization to move from pilot to wider adoption. The same question arises when introducing a shared platform. Retain AI control checks where relevant. |
| `ai-value-risk-prioritization` | Merged into [portfolio-prioritization](../../../src/resources/corpus/capability/strategy/portfolio/portfolio-prioritization.md) | The existing contract already returns a justified action per option. Preserve short-term learning value, longer-term benefit, readiness and the cost of operating controls when comparing pilots. |

## Source assignments

Each ID appears once under its primary outcome.

### collaboration

| Group | Capability contracts |
| --- | --- |
| `clarification` | [clarification-before-guessing](../../../src/resources/corpus/capability/collaboration/clarification/clarification-before-guessing.md), [task-understanding-confirmation](../../../src/resources/corpus/capability/collaboration/clarification/task-understanding-confirmation.md) |
| `review` | [critical-peer-discipline](../../../src/resources/corpus/capability/collaboration/review/critical-peer-discipline.md) |
| `handoff` | [expert-continuity-briefing](../../../src/resources/corpus/capability/collaboration/handoff/expert-continuity-briefing.md) |
| `learning` | [guided-practice](../../../src/resources/corpus/capability/collaboration/learning/guided-practice.md) |

### analysis

| Group | Capability contracts |
| --- | --- |
| `bibliography` | [bibliographic-description](../../../src/resources/corpus/capability/analysis/bibliography/bibliographic-description.md) |
| `evidence` | [comparison-dimension-discipline](../../../src/resources/corpus/capability/analysis/evidence/comparison-dimension-discipline.md), [evidence-typing-discipline](../../../src/resources/corpus/capability/analysis/evidence/evidence-typing-discipline.md), [fact-interpretation-separation](../../../src/resources/corpus/capability/analysis/evidence/fact-interpretation-separation.md), [statement-extraction-rigor](../../../src/resources/corpus/capability/analysis/evidence/statement-extraction-rigor.md), [deterministic-reasoning](../../../src/resources/corpus/capability/analysis/evidence/deterministic-reasoning.md) |
| `requirement` | [need-elicitation](../../../src/resources/corpus/capability/analysis/requirement/need-elicitation.md), [requirement-formalization](../../../src/resources/corpus/capability/analysis/requirement/requirement-formalization.md), [ai-use-case-framing](../../../src/resources/corpus/capability/analysis/requirement/ai-use-case-framing.md), [ambiguity-detection](../../../src/resources/corpus/capability/analysis/requirement/ambiguity-detection.md), [semantic-conflict-detection](../../../src/resources/corpus/capability/analysis/requirement/semantic-conflict-detection.md), [contradiction-detection](../../../src/resources/corpus/capability/analysis/requirement/contradiction-detection.md), [overlap-detection](../../../src/resources/corpus/capability/analysis/requirement/overlap-detection.md) |
| `function` | [function-extraction](../../../src/resources/corpus/capability/analysis/function/function-extraction.md), [function-deduplication](../../../src/resources/corpus/capability/analysis/function/function-deduplication.md) |
| `mathematics` | [category-theoretic-reasoning](../../../src/resources/corpus/capability/analysis/mathematics/category-theoretic-reasoning.md) |

### strategy

| Group | Capability contracts |
| --- | --- |
| `portfolio` | [portfolio-prioritization](../../../src/resources/corpus/capability/strategy/portfolio/portfolio-prioritization.md), [strategic-fit](../../../src/resources/corpus/capability/strategy/portfolio/strategic-fit.md) |
| `direction` | [strategy-diagnosis](../../../src/resources/corpus/capability/strategy/direction/strategy-diagnosis.md), [adoption-readiness-assessment](../../../src/resources/corpus/capability/strategy/direction/adoption-readiness-assessment.md), [adoption-roadmapping](../../../src/resources/corpus/capability/strategy/direction/adoption-roadmapping.md), [strategy-narrative-structure](../../../src/resources/corpus/capability/strategy/direction/strategy-narrative-structure.md) |
| `decision` | [decision-gates](../../../src/resources/corpus/capability/strategy/decision/decision-gates.md), [decision-structuring-discipline](../../../src/resources/corpus/capability/strategy/decision/decision-structuring-discipline.md), [interaction-contract](../../../src/resources/corpus/capability/strategy/decision/interaction-contract.md), [technical-output-validation](../../../src/resources/corpus/capability/strategy/decision/technical-output-validation.md) |
| `goal` | [cadence-and-review-discipline](../../../src/resources/corpus/capability/strategy/goal/cadence-and-review-discipline.md), [goal-cascade-and-alignment](../../../src/resources/corpus/capability/strategy/goal/goal-cascade-and-alignment.md), [goal-quality-discipline](../../../src/resources/corpus/capability/strategy/goal/goal-quality-discipline.md), [okr-discipline](../../../src/resources/corpus/capability/strategy/goal/okr-discipline.md), [kpi-system](../../../src/resources/corpus/capability/strategy/goal/kpi-system.md) |

### organization

| Group | Capability contracts |
| --- | --- |
| `operating-model` | [value-stream-organization-design](../../../src/resources/corpus/capability/organization/operating-model/value-stream-organization-design.md), [function-ownership-allocation](../../../src/resources/corpus/capability/organization/operating-model/function-ownership-allocation.md), [center-of-excellence-design](../../../src/resources/corpus/capability/organization/operating-model/center-of-excellence-design.md), [operating-model-design](../../../src/resources/corpus/capability/organization/operating-model/operating-model-design.md) |
| `curation` | [agent-team-curation](../../../src/resources/corpus/capability/organization/curation/agent-team-curation.md) |

### architecture

| Group | Capability contracts |
| --- | --- |
| `enterprise` | [capability-map-governance](../../../src/resources/corpus/capability/architecture/enterprise/capability-map-governance.md), [enterprise-architecture-integration](../../../src/resources/corpus/capability/architecture/enterprise/enterprise-architecture-integration.md), [architecture-practice-leadership](../../../src/resources/corpus/capability/architecture/enterprise/architecture-practice-leadership.md), [togaf-adm-discipline](../../../src/resources/corpus/capability/architecture/enterprise/togaf-adm-discipline.md) |
| `domain` | [application-integration-architecture](../../../src/resources/corpus/capability/architecture/domain/application-integration-architecture.md), [business-service-architecture](../../../src/resources/corpus/capability/architecture/domain/business-service-architecture.md), [data-governance-architecture](../../../src/resources/corpus/capability/architecture/domain/data-governance-architecture.md), [segment-architecture-stewardship](../../../src/resources/corpus/capability/architecture/domain/segment-architecture-stewardship.md), [technology-platform-architecture](../../../src/resources/corpus/capability/architecture/domain/technology-platform-architecture.md) |
| `solution` | [agentic-solution-architecture](../../../src/resources/corpus/capability/architecture/solution/agentic-solution-architecture.md), [model-selection-and-boundary-fit](../../../src/resources/corpus/capability/architecture/solution/model-selection-and-boundary-fit.md), [grounding-and-context-architecture](../../../src/resources/corpus/capability/architecture/solution/grounding-and-context-architecture.md), [solution-realization-architecture](../../../src/resources/corpus/capability/architecture/solution/solution-realization-architecture.md), [baseline-target-gap-analysis](../../../src/resources/corpus/capability/architecture/solution/baseline-target-gap-analysis.md), [transition-architecture-planning](../../../src/resources/corpus/capability/architecture/solution/transition-architecture-planning.md), [architecture-decision-rigor](../../../src/resources/corpus/capability/architecture/solution/architecture-decision-rigor.md) |
| `governance` | [ai-evaluation-and-control-architecture](../../../src/resources/corpus/capability/architecture/governance/ai-evaluation-and-control-architecture.md), [architecture-compliance-review](../../../src/resources/corpus/capability/architecture/governance/architecture-compliance-review.md) |
| `modeling` | [archimate-cross-layer-consistency](../../../src/resources/corpus/capability/architecture/modeling/archimate-cross-layer-consistency.md), [archimate-viewpoint-selection](../../../src/resources/corpus/capability/architecture/modeling/archimate-viewpoint-selection.md) |

### engineering

| Group | Capability contracts |
| --- | --- |
| `bibliography` | [bibliographic-collection-reconciliation](../../../src/resources/corpus/capability/engineering/bibliography/bibliographic-collection-reconciliation.md) |
| `design` | [abstraction-boundary-discipline](../../../src/resources/corpus/capability/engineering/design/abstraction-boundary-discipline.md), [change-impact-analysis](../../../src/resources/corpus/capability/engineering/design/change-impact-analysis.md), [composition-over-subtyping](../../../src/resources/corpus/capability/engineering/design/composition-over-subtyping.md), [domain-modeling-rigor](../../../src/resources/corpus/capability/engineering/design/domain-modeling-rigor.md), [functional-error-modeling](../../../src/resources/corpus/capability/engineering/design/functional-error-modeling.md), [immutability-by-default](../../../src/resources/corpus/capability/engineering/design/immutability-by-default.md), [interface-contract-first](../../../src/resources/corpus/capability/engineering/design/interface-contract-first.md), [side-effect-boundary-discipline](../../../src/resources/corpus/capability/engineering/design/side-effect-boundary-discipline.md) |
| `ai` | [agent-loop-and-state-design](../../../src/resources/corpus/capability/engineering/ai/agent-loop-and-state-design.md), [context-engineering-discipline](../../../src/resources/corpus/capability/engineering/ai/context-engineering-discipline.md), [evaluation-driven-iteration](../../../src/resources/corpus/capability/engineering/ai/evaluation-driven-iteration.md), [failure-mode-and-guardrail-design](../../../src/resources/corpus/capability/engineering/ai/failure-mode-and-guardrail-design.md), [prompt-contract-design](../../../src/resources/corpus/capability/engineering/ai/prompt-contract-design.md), [tool-use-and-action-boundary-design](../../../src/resources/corpus/capability/engineering/ai/tool-use-and-action-boundary-design.md) |
| `graph` | [cypher-query-authoring](../../../src/resources/corpus/capability/engineering/graph/cypher-query-authoring.md), [graph-algorithm-selection](../../../src/resources/corpus/capability/engineering/graph/graph-algorithm-selection.md), [graph-data-transfer](../../../src/resources/corpus/capability/engineering/graph/graph-data-transfer.md), [neo4j-query-tuning](../../../src/resources/corpus/capability/engineering/graph/neo4j-query-tuning.md), [property-graph-modeling](../../../src/resources/corpus/capability/engineering/graph/property-graph-modeling.md) |
| `haskell` | [haskell-contract-verification](../../../src/resources/corpus/capability/engineering/haskell/haskell-contract-verification.md), [haskell-implementation](../../../src/resources/corpus/capability/engineering/haskell/haskell-implementation.md), [haskell-theory-correspondence](../../../src/resources/corpus/capability/engineering/haskell/haskell-theory-correspondence.md), [haskell-type-design](../../../src/resources/corpus/capability/engineering/haskell/haskell-type-design.md) |
| `typescript` | [typescript-boundary-validation](../../../src/resources/corpus/capability/engineering/typescript/typescript-boundary-validation.md) |
