# Collaboration capability index

Agree on the assignment, challenge a proposal or hand work to another expert.

## Clarification

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `clarification-before-guessing` | [clarification-before-guessing.md](clarification/clarification-before-guessing.md) | Resolve missing or contradictory context through explicit clarification instead of fabricated certainty. | Use when mandatory decision context is missing, contradictory, or underspecified. | `[]` | `[]` | `[deterministic-reasoning]` | `[]` |
| `task-understanding-confirmation` | [task-understanding-confirmation.md](clarification/task-understanding-confirmation.md) | Confirm the understood task framing before substantive execution starts so analysis, implementation, or recommendations do not proceed from a misread request. | Use when a new substantive request or a materially reframed task must be confirmed before solution content, analysis, or execution begins. | the interaction already operates inside a confirmed task frame and no material scope change occurred | clarification-before-guessing: resolves missing or contradictory context whereas this capability confirms the task framing even when context is already sufficient<br>interaction-contract: defines deterministic collaboration behavior for strategy work rather than a general pre-execution confirmation gate<br>decision-gates: controls when strategic recommendations may become final and does not confirm task framing before execution | `[deterministic-reasoning, clarification-before-guessing]` | `[]` |

## Review

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `critical-peer-discipline` | [critical-peer-discipline.md](review/critical-peer-discipline.md) | Act as a rigorous peer that surfaces weak assumptions, material trade-offs, and non-compliant requests instead of passively affirming them. | Use when reviewing requests, proposals, plans, or recommendations for material weakness or non-compliance. | `[]` | `[]` | `[deterministic-reasoning]` | `[]` |

## Handoff

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `expert-continuity-briefing` | [expert-continuity-briefing.md](handoff/expert-continuity-briefing.md) | Transform a running discussion into a continuity brief that enables another expert or agent to continue the work without material loss of goal, reasoning state, decisions, evidence, or next actions. | Use when an ongoing discussion, advisory thread, or reasoning session must be transferred so another expert can continue without reconstructing the material context from scratch. | the task is a project or repository reboot handover rather than discussion continuity<br>simple summarization is sufficient and no receiving expert must continue the work directly | statement-extraction-rigor: extracts relevant source statements without building a continuity-ready expert brief<br>decision-structuring-discipline: structures decision artifacts instead of preserving full discussion continuity<br>context-engineering-discipline: shapes model context boundaries instead of producing a transfer brief for a receiving expert | `[deterministic-reasoning, statement-extraction-rigor, fact-interpretation-separation]` | `[]` |
