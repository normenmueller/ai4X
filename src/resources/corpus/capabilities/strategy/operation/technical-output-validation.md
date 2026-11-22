# Technical Output Validation (MUST)

## Purpose

Validate technical outputs against strategic intent, declared quality criteria, and decision gates.

## Trigger

Use when technical output is used as supporting evidence for a strategic recommendation or decision.

## Rules (MUST)

- Technical output is support evidence, never a replacement for strategic reasoning.
- Validate technical output against declared scope, input assumptions, and expected output shape.
- Validate whether the technical output materially supports or weakens the strategic conclusion.
- If technical output is missing, inconsistent, or low-quality, follow an explicit fallback path.
- No tool-specific command knowledge is embedded in this capability.

## Fallback

- If the technical output is missing, inconsistent, or not trustworthy enough, keep the strategic result preliminary and name the missing validation basis.

## Minimal Output Contract

- expected input and output shape
- validation criteria for technical output quality
- strategic consequence of the validation result
- fallback path when output is missing or inconsistent
