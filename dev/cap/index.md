# CCP Capability Inventory

This catalog is the global portfolio inventory for all cognitive capabilities under `cap/**`.
It complements the domain-local indexes, which stay focused on composition-oriented selection views such as purpose, use conditions, negative applicability boundaries, `requires`, `conflicts`, and neighbor distinctions.

## Status Meanings

- `draft`: in progress and not yet approved as a stable capability.
- `active`: approved and intended for curation.
- `deprecated`: still present, but no longer recommended for new curation.
- `retired`: out of service and only retained for history or migration context.

## AI

#### Architecture

##### Enterprise

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-operating-model-architecture` | `ai-operating-model-architecture.md` | Design an explicit AI operating model before scaling ownership, controls, or delivery expectations. | Use when an organization or multi-team initiative needs clear AI roles, lifecycle ownership, and control points. | `[]` | `[decision-gates, togaf-adm-discipline, architecture-decision-rigor]` | `[]` | `[]` |

##### Governance

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-evaluation-and-control-architecture` | `ai-evaluation-and-control-architecture.md` | Define how AI behavior is evaluated, monitored, constrained, and interrupted across the runtime lifecycle. | Use when an AI solution needs explicit quality, safety, oversight, or escalation controls. | `[]` | `[decision-gates, architecture-decision-rigor, architecture-compliance-review]` | `[]` | `[]` |

##### Solution

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `agentic-solution-architecture` | `agentic-solution-architecture.md` | Decompose agentic solutions into bounded runtime concerns before implementation detail accumulates. | Use when designing or reviewing a system that reasons, invokes tools, persists state, or escalates actions. | `[]` | `[decision-gates, architecture-decision-rigor]` | `[]` | `[]` |
| `grounding-and-context-architecture` | `grounding-and-context-architecture.md` | Design grounding and context boundaries so generated outputs remain traceable, bounded, and reviewable. | Use when a solution depends on retrieved knowledge, source material, memory, or other contextual inputs. | `[]` | `[decision-gates, architecture-decision-rigor]` | `[]` | `[]` |
| `model-selection-and-boundary-fit` | `model-selection-and-boundary-fit.md` | Choose model boundaries that fit the actual problem, control needs, and fallback strategy. | Use when deciding whether and how AI capabilities should be introduced into a solution. | `[]` | `[decision-gates, strategic-fit]` | `[]` | `[]` |

#### Consulting

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-adoption-roadmapping` | `ai-adoption-roadmapping.md` | Stage AI adoption from pilot to scaled operation with explicit maturity and control gates. | Use when an organization needs a sequenced path from experimentation to governed scale. | `[]` | `[decision-gates, portfolio-prioritization, strategy-narrative-structure]` | `[]` | `[]` |
| `ai-center-of-excellence-design` | `ai-center-of-excellence-design.md` | Design an AI enablement model that scales standards, support, and governance without becoming a delivery bottleneck. | Use when an organization needs a reusable structure for AI enablement across teams or business units. | `[]` | `[decision-gates, ai-operating-model-architecture, ai-adoption-roadmapping]` | `[]` | `[]` |
| `ai-readiness-assessment` | `ai-readiness-assessment.md` | Assess whether an organization or initiative is ready to design, deploy, and control AI responsibly. | Use when deciding whether an AI initiative should start, scale, or pause. | `[]` | `[decision-gates, strategy-diagnosis, strategic-fit]` | `[]` | `[]` |
| `ai-use-case-framing` | `ai-use-case-framing.md` | Frame AI initiatives around concrete problems, outcomes, and constraints before solution design begins. | Use when a team proposes an AI or agentic initiative and the business value or problem boundary is still fluid. | `[]` | `[decision-gates, strategy-diagnosis]` | `[]` | `[]` |
| `ai-value-risk-prioritization` | `ai-value-risk-prioritization.md` | Prioritize AI initiatives by balancing value, feasibility, readiness, risk, and control burden. | Use when multiple AI opportunities compete for investment, attention, or implementation capacity. | `[]` | `[decision-gates, portfolio-prioritization, strategic-fit]` | `[]` | `[]` |

#### Engineering

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `agent-loop-and-state-design` | `agent-loop-and-state-design.md` | Design agent loops and state transitions so work remains resumable, bounded, and interruptible. | Use when an AI system iterates across planning, tool use, review, or multi-step execution. | `[]` | `[deterministic-reasoning, abstraction-boundary-discipline, change-impact-analysis]` | `[]` | `[]` |
| `context-engineering-discipline` | `context-engineering-discipline.md` | Shape context deliberately so the model receives the right information, in the right form, at the right boundary. | Use when model quality depends on retrieved material, memory, task state, or instruction layering. | `[]` | `[deterministic-reasoning, clarification-before-guessing]` | `[]` | `[]` |
| `evaluation-driven-iteration` | `evaluation-driven-iteration.md` | Improve AI behavior through explicit evaluation evidence rather than taste, anecdotes, or prompt folklore. | Use when changing prompts, context design, workflows, models, or guardrails to improve outcome quality. | `[]` | `[deterministic-reasoning, critical-peer-discipline]` | `[]` | `[]` |
| `expert-continuity-briefing` | `expert-continuity-briefing.md` | Transform a running discussion into a continuity brief that enables another expert or agent to continue the work without material loss of goal, reasoning state, decisions, evidence, or next actions. | Use when an ongoing discussion, advisory thread, or reasoning session must be transferred so another expert can continue without reconstructing the material context from scratch. | the task is a project or repository reboot handover rather than discussion continuity<br>simple summarization is sufficient and no receiving expert must continue the work directly | `[deterministic-reasoning, statement-extraction-rigor, fact-interpretation-separation]` | `[]` | statement-extraction-rigor: extracts relevant source statements without building a continuity-ready expert brief<br>decision-structuring-discipline: structures decision artifacts instead of preserving full discussion continuity<br>context-engineering-discipline: shapes model context boundaries instead of producing a transfer brief for a receiving expert<br>project handover protocol/report: governs reboot and repository handover rather than discussion continuity |
| `failure-mode-and-guardrail-design` | `failure-mode-and-guardrail-design.md` | Design guardrails from concrete AI failure modes instead of generic caution language. | Use when an AI system can influence decisions, actions, data exposure, or downstream automation. | `[]` | `[deterministic-reasoning, critical-peer-discipline, change-impact-analysis]` | `[]` | `[]` |
| `prompt-contract-design` | `prompt-contract-design.md` | Design prompts and instructions as bounded contracts rather than informal text craft. | Use when stable AI behavior depends on instruction structure, constraint enforcement, or output boundaries. | `[]` | `[deterministic-reasoning, interface-contract-first]` | `[]` | `[]` |
| `tool-use-and-action-boundary-design` | `tool-use-and-action-boundary-design.md` | Separate reasoning from external actions so tool invocation stays controlled, reviewable, and permission-bounded. | Use when an AI system calls tools, writes data, triggers workflows, or acts on external systems. | `[]` | `[deterministic-reasoning, interface-contract-first, change-impact-analysis]` | `[]` | `[]` |

## Analysis

#### Organization

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `function-deduplication` | `function-deduplication.md` | Remove duplicate function statements without losing meaningful distinctions. | Use when a normalized function set may contain duplicate or near-duplicate function statements. | `[]` | `[function-extraction]` | `[]` | `[]` |
| `function-extraction` | `function-extraction.md` | Extract normalized business or organizational functions from source material. | Use when source material contains business or organizational work statements that must be normalized into functions. | `[]` | `[statement-extraction-rigor]` | `[]` | `[]` |
| `function-ownership-allocation` | `function-ownership-allocation.md` | Allocate clear accountability for each materially relevant function without collapsing ownership into informal group responsibility. | Use when assigning accountability for materially relevant functions across teams, roles, or organizational units. | `[]` | `[function-extraction]` | `[]` | `[]` |
| `value-stream-organization-design` | `value-stream-organization-design.md` | Design target organizations around end-to-end value flow instead of accidental internal boundaries. | Use when designing or reviewing organizational structures against end-to-end value flow. | `[]` | `[function-extraction, function-deduplication, function-ownership-allocation]` | `[]` | `[]` |

#### Role Assessment

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `comparison-dimension-discipline` | `comparison-dimension-discipline.md` | Ensure that comparative analysis uses stable, decision-relevant dimensions instead of ad hoc framing. | Use when comparing alternatives, roles, proposals, or candidate options that need a stable evaluation frame. | `[]` | `[statement-extraction-rigor, fact-interpretation-separation]` | `[]` | `[]` |
| `evidence-typing-discipline` | `evidence-typing-discipline.md` | Keep material claims traceable by marking whether they are directly observed or inferred. | Use when materially relevant claims, findings, or recommendations depend on source evidence or observed outputs. | `[]` | `[fact-interpretation-separation]` | `[]` | `[]` |
| `fact-interpretation-separation` | `fact-interpretation-separation.md` | Separate observed statements from inference, synthesis, and judgment. | Use when deriving interpretations, conclusions, or recommendations from source statements or observed evidence. | `[]` | `[statement-extraction-rigor]` | `[]` | `[]` |
| `statement-extraction-rigor` | `statement-extraction-rigor.md` | Extract all materially relevant statements from source material without collapsing distinct claims. | Use when extracting materially relevant statements from documents, transcripts, requirements, or review artifacts. | `[]` | `[deterministic-reasoning]` | `[]` | `[]` |

#### Specification

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ambiguity-detection` | `ambiguity-detection.md` | Detect terms or clauses that allow materially different interpretations. | Use when reviewing text, specifications, contracts, or guidance that may allow materially different readings. | `[]` | `[statement-extraction-rigor]` | `[]` | `[]` |
| `contradiction-detection` | `contradiction-detection.md` | Detect when two statements cannot both be true within the same scope and time frame. | Use when reviewing statements, requirements, or contracts for claims that may not both hold in the same scope and time frame. | `[]` | `[fact-interpretation-separation]` | `[]` | `[]` |
| `overlap-detection` | `overlap-detection.md` | Detect materially relevant duplication of responsibility, output, or control intent. | Use when reviewing responsibilities, outputs, or control boundaries for possible duplication. | `[]` | `[statement-extraction-rigor]` | `[]` | `[]` |
| `semantic-conflict-detection` | `semantic-conflict-detection.md` | Detect materially incompatible intent, behavior, or governance semantics even when statements are not literally contradictory. | Use when reviewing policies, processes, models, or interfaces that may be materially incompatible without being literally contradictory. | `[]` | `[fact-interpretation-separation, contradiction-detection]` | `[]` | `[]` |

## Architecture

#### Domain

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `application-integration-architecture` | `application-integration-architecture.md` | Shape application-domain architecture through explicit service boundaries, interoperability, and application landscape evolution. | Use when a segment or domain architecture task is application-focused and must govern application responsibilities, interfaces, or integration patterns. | when the problem is primarily data governance or technology platform architecture<br>when one concrete solution change needs realization governance more than domain architecture | `[segment-architecture-stewardship, architecture-decision-rigor]` | `[]` | data-governance-architecture<br>technology-platform-architecture<br>solution-realization-architecture |
| `business-service-architecture` | `business-service-architecture.md` | Shape business-domain architecture through explicit capability, service, process, organization, and metric relationships. | Use when a segment or domain architecture task is business-focused and must govern business capabilities and services rather than only technical assets. | when data, application, or technology-domain concerns dominate the architecture problem<br>when the task is generic strategic planning without a business-architecture boundary | `[segment-architecture-stewardship, capability-map-governance]` | `[]` | capability-map-governance<br>data-governance-architecture<br>application-integration-architecture<br>technology-platform-architecture |
| `data-governance-architecture` | `data-governance-architecture.md` | Shape data-domain architecture through explicit governance, integration, migration, protection, and lifecycle control. | Use when a segment or domain architecture task is data-focused and must govern data ownership, flow, protection, integration, or migration across the landscape. | when the main concern is application-service decomposition rather than data governance and lifecycle control<br>when the task is low-level schema hygiene without data-landscape architecture implications | `[segment-architecture-stewardship]` | `[]` | application-integration-architecture<br>technology-platform-architecture<br>domain-modeling-rigor |
| `segment-architecture-stewardship` | `segment-architecture-stewardship.md` | Shape and govern one business or technical segment as a coherent architecture responsibility instead of a loose collection of systems. | Use when a business or technical segment must be translated from strategy into governed architecture change, policies, standards, and segment evolution. | when the task is enterprise-wide cross-segment integration rather than stewardship of one segment<br>when the task is detailed realization of one concrete solution rather than segment evolution | `[togaf-adm-discipline, baseline-target-gap-analysis]` | `[]` | enterprise-architecture-integration<br>solution-realization-architecture<br>capability-map-governance |
| `technology-platform-architecture` | `technology-platform-architecture.md` | Shape technology-domain architecture through explicit platform, network, device, infrastructure, and interoperability decisions. | Use when a segment or domain architecture task is technology-focused and must govern platform standards, infrastructure boundaries, or technical interoperability. | when the dominant concern is application-service architecture or data governance rather than platform and infrastructure design<br>when the task is an operational runbook without architecture-level platform decisions | `[segment-architecture-stewardship]` | `[]` | application-integration-architecture<br>data-governance-architecture<br>solution-realization-architecture |

#### Enterprise

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `architecture-practice-leadership` | `architecture-practice-leadership.md` | Create the strategic, governance, and sponsorship conditions for an effective architecture practice across the enterprise. | Use when architecture work needs executive alignment, practice leadership, or cross-domain mandate before downstream enterprise, segment, or solution work can succeed. | when the task is detailed segment or solution design rather than architecture-practice leadership<br>when a conformance verdict is needed rather than leadership, sponsorship, or mandate creation | `[togaf-adm-discipline, strategic-fit]` | `[]` | enterprise-architecture-integration<br>architecture-compliance-review<br>strategic-fit |
| `capability-map-governance` | `capability-map-governance.md` | Use capability maps as stable architecture control artifacts rather than as proxies for projects or org charts. | Use when creating, reviewing, or governing capability maps as architecture control artifacts. | when the task is detailed process, org-chart, or application mapping rather than stable capability architecture<br>when segment or solution realization questions dominate over capability-map control logic | `[togaf-adm-discipline]` | `[]` | business-service-architecture<br>enterprise-architecture-integration |
| `enterprise-architecture-integration` | `enterprise-architecture-integration.md` | Create enterprise-wide integration, interoperability, governance, and roadmap coherence across multiple architecture segments. | Use when architecture work must align principles, policies, roadmaps, or interoperability across multiple segments instead of one local domain or one solution. | when scope is only one segment or one concrete solution<br>when the main need is executive sponsorship and practice mandate rather than enterprise integration | `[togaf-adm-discipline, capability-map-governance]` | `[]` | architecture-practice-leadership<br>segment-architecture-stewardship<br>transition-architecture-planning |
| `togaf-adm-discipline` | `togaf-adm-discipline.md` | Keep architecture work phase-aware, decision-oriented, and traceable to the intent of TOGAF ADM. | Use when architecture work claims TOGAF alignment or needs phase-aware architecture discipline. | when the task is a local modeling or compliance question that does not depend on TOGAF lifecycle framing<br>when role-specific architecture leadership or realization design is needed more than phase-aware discipline | `[decision-gates]` | `[]` | enterprise-architecture-integration<br>transition-architecture-planning |

#### Governance

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `architecture-compliance-review` | `architecture-compliance-review.md` | Review target states and solution directions against architecture principles, standards, and approved decisions. | Use when reviewing target states, architectures, or solution directions against approved architecture principles and standards. | when the task is to create architecture direction rather than evaluate conformance against approved principles, standards, or decisions<br>when no architecture baseline exists to review against | `[togaf-adm-discipline, archimate-cross-layer-consistency]` | `[]` | architecture-practice-leadership<br>enterprise-architecture-integration<br>solution-realization-architecture |

#### Modeling

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `archimate-cross-layer-consistency` | `archimate-cross-layer-consistency.md` | Keep ArchiMate models consistent across business, application, data, and technology layers. | Use when reviewing ArchiMate models across multiple layers, views, or lifecycle updates. | when the main task is choosing viewpoints rather than validating cross-layer model consistency | `[archimate-viewpoint-selection]` | `[]` | archimate-viewpoint-selection |
| `archimate-viewpoint-selection` | `archimate-viewpoint-selection.md` | Select modeling viewpoints by stakeholder question and decision need, not by template habit. | Use when selecting or reviewing ArchiMate views for stakeholder communication or design decisions. | when the relevant problem is cross-layer inconsistency rather than viewpoint fit for a stakeholder question | `[togaf-adm-discipline]` | `[]` | archimate-cross-layer-consistency |

#### Solution

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `baseline-target-gap-analysis` | `baseline-target-gap-analysis.md` | Make baseline, target, and gap statements comparable before solution design proceeds. | Use when comparing current and target states before solution design or transition planning. | when no baseline or target state can be stated yet<br>when the main task is sequencing transition states rather than comparing states | `[togaf-adm-discipline]` | `[]` | transition-architecture-planning<br>solution-realization-architecture |
| `solution-realization-architecture` | `solution-realization-architecture.md` | Shape a concrete solution change into an interoperable topology and implementable transition architecture without losing architectural intent. | Use when a concrete solution must be specified, staged, and governed from requirements through target roadmap and implementation change. | when the task is enterprise or segment governance without a concrete solution scope<br>when the task is generic project planning or handover without architecture realization content | `[baseline-target-gap-analysis, transition-architecture-planning, architecture-decision-rigor]` | `[]` | segment-architecture-stewardship<br>transition-architecture-planning<br>agentic-solution-architecture |
| `transition-architecture-planning` | `transition-architecture-planning.md` | Stage architecture evolution through deliberate intermediate states instead of assuming one-step transformation. | Use when architecture evolution must be staged through deliberate intermediate states. | when baseline and target have not been compared yet<br>when the task is a single target-state compliance check rather than staged change design | `[baseline-target-gap-analysis]` | `[]` | baseline-target-gap-analysis<br>solution-realization-architecture |

## Engineering

#### Principles

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `abstraction-boundary-discipline` | `abstraction-boundary-discipline.md` | Align module and service boundaries with change, policy, and responsibility boundaries instead of file convenience. | Use when defining or reviewing module, service, or subsystem boundaries. | `[]` | `[domain-modeling-rigor]` | `[]` | `[]` |
| `architecture-decision-rigor` | `architecture-decision-rigor.md` | Keep architecture decisions explicit, comparable, and reviewable before they shape the system. | Use when making or reviewing significant architecture decisions. | `[]` | `[domain-modeling-rigor]` | `[]` | `[]` |
| `change-impact-analysis` | `change-impact-analysis.md` | Make the blast radius of non-trivial changes explicit before implementation commits the system to hidden coupling. | Use when preparing or reviewing non-trivial changes with possible cross-boundary effects. | `[]` | `[architecture-decision-rigor, abstraction-boundary-discipline]` | `[]` | `[]` |
| `composition-over-subtyping` | `composition-over-subtyping.md` | Prefer explicit composition of behavior over deep inheritance or subtype trees. | Use when designing extensible behavior or type relationships. | `[]` | `[domain-modeling-rigor]` | `[]` | `[]` |
| `domain-modeling-rigor` | `domain-modeling-rigor.md` | Domain concepts must be explicit, stable, and mapped to unambiguous model boundaries. | Use when modeling domain concepts or reviewing domain-facing contracts and APIs. | `[]` | `[deterministic-reasoning]` | `[]` | `[]` |
| `functional-error-modeling` | `functional-error-modeling.md` | Error states and optional values must be explicit in domain contracts. | Use when defining or reviewing domain contracts that carry recoverable failures or optional values. | `[]` | `[domain-modeling-rigor]` | `[]` | `[]` |
| `immutability-by-default` | `immutability-by-default.md` | Keep state transitions explicit and bounded so domain behavior remains predictable and composable. | Use when designing or reviewing stateful domain behavior and mutation boundaries. | `[]` | `[domain-modeling-rigor]` | `[]` | `[]` |
| `interface-contract-first` | `interface-contract-first.md` | Define semantic boundary contracts before implementation details accumulate around them. | Use when defining or reviewing interface boundaries before implementation details spread. | `[]` | `[domain-modeling-rigor, abstraction-boundary-discipline]` | `[]` | `[]` |
| `side-effect-boundary-discipline` | `side-effect-boundary-discipline.md` | Keep side effects explicit, bounded, and testable. | Use when designing or reviewing IO-heavy logic, process control, or external action boundaries. | `[]` | `[immutability-by-default, functional-error-modeling]` | `[]` | `[]` |

## Foundation

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `clarification-before-guessing` | `clarification-before-guessing.md` | Resolve missing or contradictory context through explicit clarification instead of fabricated certainty. | Use when mandatory decision context is missing, contradictory, or underspecified. | `[]` | `[deterministic-reasoning]` | `[]` | `[]` |
| `critical-peer-discipline` | `critical-peer-discipline.md` | Act as a rigorous peer that surfaces weak assumptions, material trade-offs, and non-compliant requests instead of passively affirming them. | Use when reviewing requests, proposals, plans, or recommendations for material weakness or non-compliance. | `[]` | `[deterministic-reasoning]` | `[]` | `[]` |
| `deterministic-reasoning` | `deterministic-reasoning.md` | Keep reasoning explicit, traceable, and stable under incomplete or conflicting context. | Use when reasoning under incomplete, conflicting, or partially evidenced context must remain explicit and stable. | `[]` | `[]` | `[]` | `[]` |
| `task-understanding-confirmation` | `task-understanding-confirmation.md` | Confirm the understood task framing before substantive execution starts so analysis, implementation, or recommendations do not proceed from a misread request. | Use when a new substantive request or a materially reframed task must be confirmed before solution content, analysis, or execution begins. | the interaction already operates inside a confirmed task frame and no material scope change occurred | `[deterministic-reasoning, clarification-before-guessing]` | `[]` | clarification-before-guessing: resolves missing or contradictory context whereas this capability confirms the task framing even when context is already sufficient<br>interaction-contract: defines deterministic collaboration behavior for strategy work rather than a general pre-execution confirmation gate<br>decision-gates: controls when strategic recommendations may become final and does not confirm task framing before execution |

## Strategy

#### Analysis

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `portfolio-prioritization` | `portfolio-prioritization.md` | Prioritize strategic options through an explicit, justified evaluation frame. | Use when multiple strategic options compete for attention, sequencing, or investment and a ranked decision is required. | `[]` | `[decision-gates, strategy-diagnosis]` | `[]` | `[]` |
| `strategy-diagnosis` | `strategy-diagnosis.md` | Determine what is true, relevant, and causally important in the current strategic context before options or actions are prioritized. | Use when a strategic situation must be understood before recommending options, interventions, or commitments. | `[]` | `[decision-gates]` | `[]` | `[]` |
| `strategy-narrative-structure` | `strategy-narrative-structure.md` | Structure strategic communication so direction, rationale, and consequences remain explicit. | Use when strategic reasoning must be communicated in a way that preserves diagnosis, logic, and consequences. | `[]` | `[decision-gates, strategy-diagnosis]` | `[]` | `[]` |

#### Delivery

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `decision-structuring-discipline` | `decision-structuring-discipline.md` | Structure strategic decision artifacts so they are decision-ready, traceable, and explicit about gaps. | Use when preparing a strategic recommendation, board paper, or decision template for formal review or approval. | `[]` | `[decision-gates]` | `[]` | `[]` |

#### Evaluation

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `strategic-fit` | `strategic-fit.md` | Evaluate whether an initiative fits strategic direction, constraints, and execution reality. | Use when deciding whether an initiative should stop, continue, pilot, or scale. | `[]` | `[decision-gates, strategy-diagnosis, portfolio-prioritization, kpi-system]` | `[]` | `[]` |

#### Goal Management

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `cadence-and-review-discipline` | `cadence-and-review-discipline.md` | Keep goals alive through explicit review cadence, evidence updates, learning, decisions, and adaptation instead of treating goals as static planning artifacts. | Use when goals, outcomes, OKRs, initiatives, or execution commitments need check-ins, progress review, scoring, adaptation, or closure. | `[]` | `[goal-quality-discipline, critical-peer-discipline]` | `[]` | `[]` |
| `goal-cascade-and-alignment` | `goal-cascade-and-alignment.md` | Align goals across levels, teams, or domains so local goals contribute to shared intent without mechanical cascading, hidden conflicts, or ownership dilution. | Use when goals are translated, cascaded, aligned, decomposed, or reviewed across teams, levels, portfolios, or organizational boundaries. | `[]` | `[goal-quality-discipline, critical-peer-discipline]` | `[]` | `[]` |
| `goal-quality-discipline` | `goal-quality-discipline.md` | Shape goals so they are material, outcome-oriented, understandable, owned, and usable for steering rather than vague aspiration or activity tracking. | Use when goals, objectives, outcomes, or target statements are proposed, reviewed, prioritized, or challenged. | `[]` | `[critical-peer-discipline]` | `[]` | `[]` |
| `okr-discipline` | `okr-discipline.md` | Apply OKRs as a disciplined goal-setting and execution system that creates focus, alignment, measurable progress, learning, and accountability around the goals that matter most. | Use when OKRs are proposed, designed, reviewed, scored, or challenged for goal management, alignment, or execution focus. | `[]` | `[goal-quality-discipline, goal-cascade-and-alignment, cadence-and-review-discipline, critical-peer-discipline]` | `[]` | `[]` |

#### Governance

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `decision-gates` | `decision-gates.md` | Ensure that strategic recommendations are finalized only when the mandatory decision context is explicit. | Use when a strategic recommendation, prioritization, or decision artifact may move from provisional to final. | `[]` | `[interaction-contract]` | `[]` | `[]` |

#### Metrics

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `kpi-system` | `kpi-system.md` | Define KPI-Domains and KPIs as stable, reviewable measurement semantics for strategic decisions, OKR targets, and operational steering. | Use when strategic choices, interventions, or reviews depend on explicit measurement semantics. | `[]` | `[deterministic-reasoning]` | `[]` | `[]` |

#### Operation

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `technical-output-validation` | `technical-output-validation.md` | Validate technical outputs against strategic intent, declared quality criteria, and decision gates. | Use when technical output is used as supporting evidence for a strategic recommendation or decision. | `[]` | `[decision-gates, strategic-fit]` | `[]` | `[]` |

#### Workflow

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `interaction-contract` | `interaction-contract.md` | Define deterministic collaboration behavior for strategy work. | Use when strategy work requires explicit clarification behavior, provisional/final signaling, and assumption handling. | `[]` | `[clarification-before-guessing]` | `[]` | `[]` |
