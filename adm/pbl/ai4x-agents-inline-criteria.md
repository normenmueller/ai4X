# Observation: Inline Success Criteria vs. Contract Reference

## Context

Self-assessment against current LLM prompting best practices (GPT-5/5.5 guides) identified that success criteria for specialist agents live in separate Quality Contracts, not inline in agent definitions. This creates a two-hop resolution: Agent → Contract → Quality Criteria.

## Current State

This is a **conscious architecture decision**: Contracts are standalone, reusable, and authoritative. Agent definitions reference them via `## Mandatory Quality Contracts (MUST)` sections.

## Observation

For strong LLMs this indirection is fine — they read the contracts. For weaker models or faster context windows, a compact inline success-criteria hint per agent could improve adherence without duplicating full contract content.

## Action

Monitor in real-world usage whether agents correctly apply their referenced contracts. If compliance drops, consider adding a brief inline `## Success Criteria` summary block to each specialist agent that distills the contract's key acceptance bar into 2–3 bullet points.

No action required now. Re-evaluate after the first Epic completes the full 9-stage workflow.
