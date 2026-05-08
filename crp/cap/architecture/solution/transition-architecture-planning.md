# Transition Architecture Planning (MUST)

## Purpose

Stage architecture evolution through deliberate intermediate states instead of assuming one-step transformation.

## Trigger

Use when architecture evolution must be staged through deliberate intermediate states.

## Rules (MUST)

- Use transition architectures when relevant gaps cannot be closed in one safe move.
- Define entry criteria, exit criteria, and major risks for each transition state.
- Separate dependency logic from calendar preference.
- Irreversible transition steps require rollback or containment reasoning.

## Fallback

- If scope, stakeholders, or model boundaries are unclear, keep the output provisional and name the unresolved architecture decisions.

## Minimal Output Contract

- transition state
- entry criteria
- exit criteria
- key risks
