# AI Engineering Capability Catalog

This index helps compose AI-engineering-focused agent bundles in `kob`.

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `prompt-contract-design` | `prompt-contract-design.md` | Contract-first prompt and instruction design. | `[deterministic-reasoning, interface-contract-first]` | `[]` |
| `context-engineering-discipline` | `context-engineering-discipline.md` | Systematic shaping of context, memory, and retrieval scope. | `[deterministic-reasoning, clarification-before-guessing]` | `[]` |
| `tool-use-and-action-boundary-design` | `tool-use-and-action-boundary-design.md` | Safe boundaries between reasoning, tools, permissions, and side effects. | `[deterministic-reasoning, interface-contract-first, change-impact-analysis]` | `[]` |
| `agent-loop-and-state-design` | `agent-loop-and-state-design.md` | Deterministic loop, checkpoint, and state-transition design for agents. | `[deterministic-reasoning, abstraction-boundary-discipline, change-impact-analysis]` | `[]` |
| `evaluation-driven-iteration` | `evaluation-driven-iteration.md` | Improvement discipline driven by explicit evaluations and regressions. | `[deterministic-reasoning, critical-peer-discipline]` | `[]` |
| `expert-continuity-briefing` | `expert-continuity-briefing.md` | Continuity-brief creation for expert handoff across running discussions. | `[deterministic-reasoning, statement-extraction-rigor, fact-interpretation-separation]` | `[]` |
| `failure-mode-and-guardrail-design` | `failure-mode-and-guardrail-design.md` | Guardrail design against high-impact AI failure modes. | `[deterministic-reasoning, critical-peer-discipline, change-impact-analysis]` | `[]` |
