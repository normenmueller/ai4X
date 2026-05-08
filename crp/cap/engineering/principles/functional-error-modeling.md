# Functional Error Modeling (MUST)

## Purpose

Error states and optional values must be explicit in domain contracts.

## Trigger

Use when defining or reviewing domain contracts that carry recoverable failures or optional values.

## Rules (MUST)

- Prefer explicit optional/result modeling (e.g., Maybe/Either-style semantics) over implicit null signaling.
- Every recoverable failure path must be represented in the contract.
- Error channels must preserve actionable context for callers.
- Avoid ambiguous sentinel values to represent failure.

## Fallback

- If the relevant boundary, contract, or design context is incomplete, keep the judgment provisional and name the missing engineering information.

## Minimal Output Contract

- explicit failure or optional states
- caller-visible consequences
- error-context expectations
- open ambiguity or sentinel-value risks
