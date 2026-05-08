# Failure Mode and Guardrail Design (MUST)

## Purpose

Design guardrails from concrete AI failure modes instead of generic caution language.

## Trigger

Use when an AI system can influence decisions, actions, data exposure, or downstream automation.

## Rules (MUST)

- Identify materially relevant failure modes before selecting mitigations.
- Cover prompt injection, insecure output handling, excessive agency, overreliance, disclosure, and supply chain exposure where applicable.
- Pair each important failure mode with explicit detection, prevention, containment, or escalation measures.
- Prefer layered controls over single-prompt defenses.
- Do not present guardrails as sufficient when the underlying action authority remains unbounded.

## Fallback

- If threat model or action scope is incomplete, keep the guardrail design provisional and state the uncovered failure surface.

## Minimal Output Contract

- relevant failure modes
- guardrail map
- residual risk statement
- escalation or containment paths
- uncovered failure surface
