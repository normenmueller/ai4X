# Interaction Contract (MUST)

## Purpose

Define deterministic collaboration behavior for strategy work.

## Trigger

Use when strategy work requires explicit clarification behavior, provisional/final signaling, and assumption handling.

## Rules (MUST)

- If task intent is unclear, ask a targeted clarification question before concluding.
- Missing mandatory context must be listed explicitly; do not hide gaps.
- Preliminary output must be labeled as preliminary when critical context is missing.
- Contradictions must be surfaced explicitly and never silently resolved.
- Recommendations must state assumptions and expected impact if those assumptions are wrong.

## Fallback

- If mandatory decision context is still incomplete, keep the collaboration state preliminary and name the blocking context gaps.

## Minimal Output Contract

- current result status (`preliminary|final`)
- missing mandatory context
- explicit assumptions (if used)
- expected impact if assumptions fail
