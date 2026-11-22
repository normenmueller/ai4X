# Tool Use and Action Boundary Design (MUST)

## Purpose

Separate reasoning from external actions so tool invocation stays controlled, reviewable, and permission-bounded.

## Trigger

Use when an AI system calls tools, writes data, triggers workflows, or acts on external systems.

## Rules (MUST)

- Define tool purpose, preconditions, postconditions, and failure semantics before runtime use.
- Separate data retrieval tools from side-effecting action tools.
- Make permission scope and approval requirements explicit for actions with material impact.
- Validate tool outputs before they become new decision inputs or follow-up actions.
- Do not let the model invent tool semantics, authority, or success conditions.

## Fallback

- If tool contracts or permission boundaries are incomplete, block autonomous action and state the missing controls.

## Minimal Output Contract

- tool classes and authority level
- preconditions and postconditions
- validation and approval points
- action stop conditions
- unresolved control gaps
