# Evaluation Driven Iteration (MUST)

## Purpose

Improve AI behavior through explicit evaluation evidence rather than taste, anecdotes, or prompt folklore.

## Trigger

Use when changing prompts, context design, workflows, models, or guardrails to improve outcome quality.

## Rules (MUST)

- Define representative tasks, success criteria, and failure modes before making improvement claims.
- Compare candidate changes against an explicit baseline.
- Preserve regression coverage for previously solved cases.
- Distinguish observed improvement from speculative expectation.
- Do not ship tuning changes that cannot be justified by evaluation evidence.

## Fallback

- If baseline, task set, or success criteria are missing, keep the result provisional and state what evidence is absent.

## Minimal Output Contract

- evaluation scope
- baseline and candidate comparison
- observed improvement or regression
- unresolved evidence gaps
- next iteration focus
