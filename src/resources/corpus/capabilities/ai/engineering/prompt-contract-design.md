# Prompt Contract Design (MUST)

## Purpose

Design prompts and instructions as bounded contracts rather than informal text craft.

## Trigger

Use when stable AI behavior depends on instruction structure, constraint enforcement, or output boundaries.

## Rules (MUST)

- Define role, task scope, required inputs, forbidden behavior, and output expectations explicitly.
- Separate stable instruction contract from volatile task data and examples.
- Prefer explicit constraints and escalation clauses over stylistic prompting tricks.
- Keep prompts aligned to external interface contracts and validation logic.
- Do not treat prompt wording as a substitute for missing architecture, tooling, or control design.

## Fallback

- If the task contract or output boundary is unclear, mark the prompt as provisional and list the missing contract elements.

## Minimal Output Contract

- instruction scope
- required inputs and constraints
- expected output boundary
- escalation or refusal conditions
- unresolved contract gaps
