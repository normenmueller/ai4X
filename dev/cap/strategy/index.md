# Strategy Capability Catalog

This index exposes the local capability selection surface for `strategy`.

## Analysis

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `portfolio-prioritization` | `portfolio-prioritization.md` | Prioritize strategic options through an explicit, justified evaluation frame. | Use when multiple strategic options compete for attention, sequencing, or investment and a ranked decision is required. | `[]` | `[decision-gates, strategy-diagnosis]` | `[]` | `[]` |
| `strategy-diagnosis` | `strategy-diagnosis.md` | Determine what is true, relevant, and causally important in the current strategic context before options or actions are prioritized. | Use when a strategic situation must be understood before recommending options, interventions, or commitments. | `[]` | `[decision-gates]` | `[]` | `[]` |
| `strategy-narrative-structure` | `strategy-narrative-structure.md` | Structure strategic communication so direction, rationale, and consequences remain explicit. | Use when strategic reasoning must be communicated in a way that preserves diagnosis, logic, and consequences. | `[]` | `[decision-gates, strategy-diagnosis]` | `[]` | `[]` |

## Delivery

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `decision-structuring-discipline` | `decision-structuring-discipline.md` | Structure strategic decision artifacts so they are decision-ready, traceable, and explicit about gaps. | Use when preparing a strategic recommendation, board paper, or decision template for formal review or approval. | `[]` | `[decision-gates]` | `[]` | `[]` |

## Evaluation

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `strategic-fit` | `strategic-fit.md` | Evaluate whether an initiative fits strategic direction, constraints, and execution reality. | Use when deciding whether an initiative should stop, continue, pilot, or scale. | `[]` | `[decision-gates, strategy-diagnosis, portfolio-prioritization, kpi-system]` | `[]` | `[]` |

## Goal Management

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `cadence-and-review-discipline` | `cadence-and-review-discipline.md` | Keep goals alive through explicit review cadence, evidence updates, learning, decisions, and adaptation instead of treating goals as static planning artifacts. | Use when goals, outcomes, OKRs, initiatives, or execution commitments need check-ins, progress review, scoring, adaptation, or closure. | `[]` | `[goal-quality-discipline, critical-peer-discipline]` | `[]` | `[]` |
| `goal-cascade-and-alignment` | `goal-cascade-and-alignment.md` | Align goals across levels, teams, or domains so local goals contribute to shared intent without mechanical cascading, hidden conflicts, or ownership dilution. | Use when goals are translated, cascaded, aligned, decomposed, or reviewed across teams, levels, portfolios, or organizational boundaries. | `[]` | `[goal-quality-discipline, critical-peer-discipline]` | `[]` | `[]` |
| `goal-quality-discipline` | `goal-quality-discipline.md` | Shape goals so they are material, outcome-oriented, understandable, owned, and usable for steering rather than vague aspiration or activity tracking. | Use when goals, objectives, outcomes, or target statements are proposed, reviewed, prioritized, or challenged. | `[]` | `[critical-peer-discipline]` | `[]` | `[]` |
| `okr-discipline` | `okr-discipline.md` | Apply OKRs as a disciplined goal-setting and execution system that creates focus, alignment, measurable progress, learning, and accountability around the goals that matter most. | Use when OKRs are proposed, designed, reviewed, scored, or challenged for goal management, alignment, or execution focus. | `[]` | `[goal-quality-discipline, goal-cascade-and-alignment, cadence-and-review-discipline, critical-peer-discipline]` | `[]` | `[]` |

## Governance

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `decision-gates` | `decision-gates.md` | Ensure that strategic recommendations are finalized only when the mandatory decision context is explicit. | Use when a strategic recommendation, prioritization, or decision artifact may move from provisional to final. | `[]` | `[interaction-contract]` | `[]` | `[]` |

## Metrics

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `kpi-okr-coupling` | `kpi-okr-coupling.md` | Couple OKRs to KPIs according to AM2 semantics: Key Results set KPI targets, KPIs provide actual values, and their comparison reveals a performance gap. | Use when OKRs are defined, reviewed, or challenged against strategic measurement logic. | `[]` | `[kpi-system, okr-discipline]` | `[]` | `[]` |
| `kpi-system` | `kpi-system.md` | Define KPI-Domains and KPIs as stable, reviewable measurement semantics for strategic decisions, OKR targets, and operational steering. | Use when strategic choices, interventions, or reviews depend on explicit measurement semantics. | `[]` | `[deterministic-reasoning]` | `[]` | `[]` |

## Operation

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `technical-output-validation` | `technical-output-validation.md` | Validate technical outputs against strategic intent, declared quality criteria, and decision gates. | Use when technical output is used as supporting evidence for a strategic recommendation or decision. | `[]` | `[decision-gates, strategic-fit]` | `[]` | `[]` |

## Workflow

| ID | File | Purpose | Use When | Do Not Use When | Requires | Conflicts | Distinguish From |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `interaction-contract` | `interaction-contract.md` | Define deterministic collaboration behavior for strategy work. | Use when strategy work requires explicit clarification behavior, provisional/final signaling, and assumption handling. | `[]` | `[clarification-before-guessing]` | `[]` | `[]` |
