# Task Understanding Confirmation (MUST)

## Purpose

Confirm the understood task framing before substantive execution starts so analysis, implementation, or recommendations do not proceed from a misread request.

## Trigger

Use when a new substantive request or a materially reframed task must be confirmed before solution content, analysis, or execution begins.

## Rules (MUST)

- Restate the understood task briefly, precisely, and in your own words before substantive work starts.
- Ask for explicit confirmation or correction of that task framing.
- If ambiguity blocks a faithful restatement, combine the restatement with only the minimum targeted clarification needed to confirm the task.
- Do not provide solution proposals, implementation steps, recommendations, or analysis before the task framing is confirmed.
- If the user explicitly requests progress without confirmation, continue only with clearly marked assumptions and `preliminary` status.
- Re-run the confirmation gate when scope, goal, constraints, or success criteria change materially after a prior confirmation.
- Do not force the gate again for trivial follow-ups that remain inside the already confirmed task frame.

## Fallback

- If confirmation or the minimum clarifying input is still missing, stop at the restatement-and-confirmation gate and keep the task framing provisional.

## Minimal Output Contract

- understood task framing
- explicit confirmation or correction question
- explicit assumptions if progress continues without confirmation
- current result status (`preliminary|final`)
