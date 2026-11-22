# Context Engineering Discipline (MUST)

## Purpose

Shape context deliberately so the model receives the right information, in the right form, at the right boundary.

## Trigger

Use when model quality depends on retrieved material, memory, task state, or instruction layering.

## Rules (MUST)

- Distinguish stable instructions, task-specific inputs, retrieved evidence, and prior state.
- Include only context classes that materially improve the task outcome or control posture.
- Order context by priority and authority instead of by accidental collection order.
- Make truncation, omission, and stale-context handling explicit.
- Do not increase context volume blindly as a substitute for better selection discipline.

## Fallback

- If context classes, source trust, or budget limits are unclear, keep the setup provisional and state the missing context decisions.

## Minimal Output Contract

- context classes and priority
- source trust or authority rules
- inclusion and truncation rules
- stale-context handling
- unresolved context gaps
