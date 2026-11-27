# Contradiction Detection (MUST)

## Purpose

Detect when two statements cannot both be true within the same scope and time frame.

## Trigger

Use when reviewing statements, requirements, or contracts for claims that may not both hold in the same scope and time frame.

## Rules (MUST)

- Quote both conflicting statements precisely enough for review.
- Distinguish direct contradiction from tension, trade-off, or incompleteness.
- If contradiction depends on differing scope, time, or actor, state that condition explicitly.
- Do not resolve contradictions silently; expose them before continuing.

## Fallback

- If two statements may refer to different actors, periods or scopes, quote both and ask which contexts coincide before calling them contradictory.

## Minimal Output Contract

- statement A
- statement B
- contradiction basis
- clarification need
