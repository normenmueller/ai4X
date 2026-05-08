# AI Capability Catalog

This index exposes the local capability selection surface for `ai`.

## Architecture

### Enterprise

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-operating-model-architecture` | `ai-operating-model-architecture.md` | Design an explicit AI operating model before scaling ownership, controls, or delivery expectations. | Use when an organization or multi-team initiative needs clear AI roles, lifecycle ownership, and control points. | `[]` | `[decision-gates, togaf-adm-discipline, architecture-decision-rigor]` | `[]` | `[]` |

### Governance

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-evaluation-and-control-architecture` | `ai-evaluation-and-control-architecture.md` | Define how AI behavior is evaluated, monitored, constrained, and interrupted across the runtime lifecycle. | Use when an AI solution needs explicit quality, safety, oversight, or escalation controls. | `[]` | `[decision-gates, architecture-decision-rigor, architecture-compliance-review]` | `[]` | `[]` |

### Solution

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `agentic-solution-architecture` | `agentic-solution-architecture.md` | Decompose agentic solutions into bounded runtime concerns before implementation detail accumulates. | Use when designing or reviewing a system that reasons, invokes tools, persists state, or escalates actions. | `[]` | `[decision-gates, architecture-decision-rigor]` | `[]` | `[]` |
| `grounding-and-context-architecture` | `grounding-and-context-architecture.md` | Design grounding and context boundaries so generated outputs remain traceable, bounded, and reviewable. | Use when a solution depends on retrieved knowledge, source material, memory, or other contextual inputs. | `[]` | `[decision-gates, architecture-decision-rigor]` | `[]` | `[]` |
| `model-selection-and-boundary-fit` | `model-selection-and-boundary-fit.md` | Choose model boundaries that fit the actual problem, control needs, and fallback strategy. | Use when deciding whether and how AI capabilities should be introduced into a solution. | `[]` | `[decision-gates, strategic-fit]` | `[]` | `[]` |

## Consulting

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-adoption-roadmapping` | `ai-adoption-roadmapping.md` | Stage AI adoption from pilot to scaled operation with explicit maturity and control gates. | Use when an organization needs a sequenced path from experimentation to governed scale. | `[]` | `[decision-gates, portfolio-prioritization, strategy-narrative-structure]` | `[]` | `[]` |
| `ai-center-of-excellence-design` | `ai-center-of-excellence-design.md` | Design an AI enablement model that scales standards, support, and governance without becoming a delivery bottleneck. | Use when an organization needs a reusable structure for AI enablement across teams or business units. | `[]` | `[decision-gates, ai-operating-model-architecture, ai-adoption-roadmapping]` | `[]` | `[]` |
| `ai-readiness-assessment` | `ai-readiness-assessment.md` | Assess whether an organization or initiative is ready to design, deploy, and control AI responsibly. | Use when deciding whether an AI initiative should start, scale, or pause. | `[]` | `[decision-gates, strategy-diagnosis, strategic-fit]` | `[]` | `[]` |
| `ai-use-case-framing` | `ai-use-case-framing.md` | Frame AI initiatives around concrete problems, outcomes, and constraints before solution design begins. | Use when a team proposes an AI or agentic initiative and the business value or problem boundary is still fluid. | `[]` | `[decision-gates, strategy-diagnosis]` | `[]` | `[]` |
| `ai-value-risk-prioritization` | `ai-value-risk-prioritization.md` | Prioritize AI initiatives by balancing value, feasibility, readiness, risk, and control burden. | Use when multiple AI opportunities compete for investment, attention, or implementation capacity. | `[]` | `[decision-gates, portfolio-prioritization, strategic-fit]` | `[]` | `[]` |

## Engineering

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `agent-loop-and-state-design` | `agent-loop-and-state-design.md` | Design agent loops and state transitions so work remains resumable, bounded, and interruptible. | Use when an AI system iterates across planning, tool use, review, or multi-step execution. | `[]` | `[deterministic-reasoning, abstraction-boundary-discipline, change-impact-analysis]` | `[]` | `[]` |
| `context-engineering-discipline` | `context-engineering-discipline.md` | Shape context deliberately so the model receives the right information, in the right form, at the right boundary. | Use when model quality depends on retrieved material, memory, task state, or instruction layering. | `[]` | `[deterministic-reasoning, clarification-before-guessing]` | `[]` | `[]` |
| `evaluation-driven-iteration` | `evaluation-driven-iteration.md` | Improve AI behavior through explicit evaluation evidence rather than taste, anecdotes, or prompt folklore. | Use when changing prompts, context design, workflows, models, or guardrails to improve outcome quality. | `[]` | `[deterministic-reasoning, critical-peer-discipline]` | `[]` | `[]` |
| `expert-continuity-briefing` | `expert-continuity-briefing.md` | Transform a running discussion into a continuity brief that enables another expert or agent to continue the work without material loss of goal, reasoning state, decisions, evidence, or next actions. | Use when an ongoing discussion, advisory thread, or reasoning session must be transferred so another expert can continue without reconstructing the material context from scratch. | the task is a project or repository reboot handover rather than discussion continuity<br>simple summarization is sufficient and no receiving expert must continue the work directly | `[deterministic-reasoning, statement-extraction-rigor, fact-interpretation-separation]` | `[]` | statement-extraction-rigor: extracts relevant source statements without building a continuity-ready expert brief<br>decision-structuring-discipline: structures decision artifacts instead of preserving full discussion continuity<br>context-engineering-discipline: shapes model context boundaries instead of producing a transfer brief for a receiving expert<br>project handover protocol/report: governs reboot and repository handover rather than discussion continuity |
| `failure-mode-and-guardrail-design` | `failure-mode-and-guardrail-design.md` | Design guardrails from concrete AI failure modes instead of generic caution language. | Use when an AI system can influence decisions, actions, data exposure, or downstream automation. | `[]` | `[deterministic-reasoning, critical-peer-discipline, change-impact-analysis]` | `[]` | `[]` |
| `prompt-contract-design` | `prompt-contract-design.md` | Design prompts and instructions as bounded contracts rather than informal text craft. | Use when stable AI behavior depends on instruction structure, constraint enforcement, or output boundaries. | `[]` | `[deterministic-reasoning, interface-contract-first]` | `[]` | `[]` |
| `tool-use-and-action-boundary-design` | `tool-use-and-action-boundary-design.md` | Separate reasoning from external actions so tool invocation stays controlled, reviewable, and permission-bounded. | Use when an AI system calls tools, writes data, triggers workflows, or acts on external systems. | `[]` | `[deterministic-reasoning, interface-contract-first, change-impact-analysis]` | `[]` | `[]` |
