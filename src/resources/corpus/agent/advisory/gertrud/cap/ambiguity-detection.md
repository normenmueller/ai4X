# Ambiguity Detection (MUST)

## Purpose

Detect terms or clauses that allow materially different interpretations.

## Trigger

Use when reviewing text, specifications, contracts, or guidance that may allow materially different readings.

## Rules (MUST)

- When you find competing interpretations, state them explicitly.
- Explain why each interpretation is plausible from the text as written.
- Prefer clarification over silent interpretation selection.
- Do not label text as ambiguous when it is broad but still operationally precise.

## Fallback

- If the wording supports only one operational reading, report no ambiguity. If missing context prevents checking whether another materially different reading is plausible, identify that gap and ask for the specific context.

## Minimal Output Contract

- Multiple readings: cite the clause, the plausible readings and the difference they make to observable behavior.
- One reading: identify the clause and state its single operational meaning.
- Insufficient context: identify the missing information and ask the question that would resolve it.
