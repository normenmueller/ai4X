# TypeScript Boundary Validation (MUST)

## Purpose

Decode untrusted input into a TypeScript domain value or a typed validation failure.

## Trigger

Use when implementing or reviewing a TypeScript boundary that receives a value whose runtime shape is unverified.

## Rules (MUST)

- Accept the unverified value as `unknown`. Identify the runtime conditions that establish the promised domain type, including required properties, variant tags and value constraints.
- Narrow with runtime checks or an existing decoder that enforces those conditions. A type assertion such as `as Order` supplies no runtime evidence. Check a user-defined type predicate against every property or invariant its return type promises.
- Construct the typed success value from checked data. For an invalid payload, return a typed failure that identifies the offending field or value location and the violated condition. Keep transport failures distinguishable when the caller handles them differently.
- Exercise a valid payload for each accepted variant. Vary one condition at a time to show that missing fields, incorrect types and violated domain constraints take the intended failure path wherever those conditions apply.

## Fallback

If the input contract leaves a case ambiguous, identify the smallest payload whose outcome needs a decision. Keep that case unresolved and state which inputs the decoder can already validate.

## Minimal Output Contract

Give the decoder signature, the runtime evidence for each accepted variant, and the observed success or failure for representative payloads. Identify any promised constraint that remains unverified.
