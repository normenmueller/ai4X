# AI Engineering Capability Catalog

Open a capability to check its trigger, rules and expected result. The [AI catalog](../index.md) also lists exclusions and neighboring capabilities.

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `prompt-contract-design` | [prompt-contract-design.md](prompt-contract-design.md) | Contract-first prompt and instruction design. | `[deterministic-reasoning, interface-contract-first]` | `[]` |
| `context-engineering-discipline` | [context-engineering-discipline.md](context-engineering-discipline.md) | Select and order the context for one model call, including memory and retrieved evidence. | `[deterministic-reasoning, clarification-before-guessing]` | `[]` |
| `tool-use-and-action-boundary-design` | [tool-use-and-action-boundary-design.md](tool-use-and-action-boundary-design.md) | Safe boundaries between reasoning, tools, permissions, and side effects. | `[deterministic-reasoning, interface-contract-first, change-impact-analysis]` | `[]` |
| `agent-loop-and-state-design` | [agent-loop-and-state-design.md](agent-loop-and-state-design.md) | Deterministic loop, checkpoint, and state-transition design for agents. | `[deterministic-reasoning, abstraction-boundary-discipline, change-impact-analysis]` | `[]` |
| `evaluation-driven-iteration` | [evaluation-driven-iteration.md](evaluation-driven-iteration.md) | Improvement discipline driven by explicit evaluations and regressions. | `[deterministic-reasoning, critical-peer-discipline]` | `[]` |
| `expert-continuity-briefing` | [expert-continuity-briefing.md](expert-continuity-briefing.md) | Continuity-brief creation for expert handoff across running discussions. | `[deterministic-reasoning, statement-extraction-rigor, fact-interpretation-separation]` | `[]` |
| `failure-mode-and-guardrail-design` | [failure-mode-and-guardrail-design.md](failure-mode-and-guardrail-design.md) | Guardrail design against high-impact AI failure modes. | `[deterministic-reasoning, critical-peer-discipline, change-impact-analysis]` | `[]` |
