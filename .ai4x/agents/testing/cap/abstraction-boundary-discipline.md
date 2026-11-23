# Abstraction Boundary Discipline (MUST)

## Purpose

Align module and service boundaries with change, policy, and responsibility boundaries instead of file convenience.

## Trigger

Use when defining or reviewing module, service, or subsystem boundaries.

## Rules (MUST)

- Boundaries must hide internal churn behind narrow semantic interfaces.
- Do not leak framework, transport, or persistence details across domain boundaries.
- Cross-boundary contracts must be intentional, minimal, and explicit.
- If a boundary is crossed for expedience, the resulting debt must be called out.

## Fallback

- If the relevant boundary, contract, or design context is incomplete, keep the judgment provisional and name the missing engineering information.

## Minimal Output Contract

- boundary map
- cross-boundary contracts
- observed leakage risks
- explicit expedience debt (if any)
