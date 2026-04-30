# Grounding and Context Architecture (MUST)

## Purpose

Design grounding and context boundaries so generated outputs remain traceable, bounded, and reviewable.

## Trigger

Use when a solution depends on retrieved knowledge, source material, memory, or other contextual inputs.

## Rules (MUST)

- Separate authoritative source material from transient prompts, derived summaries, and conversational residue.
- Define retrieval scope, freshness expectations, and access boundaries before tuning answer quality.
- State how context is filtered, prioritized, and bounded when budgets or latency constraints apply.
- Require traceability from materially important claims back to their grounding basis where the task demands evidence.
- Do not widen context indiscriminately as a substitute for architecture discipline.

## Fallback

- If source authority, freshness, or access rules are unclear, mark the context architecture as provisional and list the unresolved trust boundaries.

## Minimal Output Contract

- grounding source classes
- context boundary rules
- retrieval scope and freshness rules
- traceability expectations
- unresolved trust or access gaps
