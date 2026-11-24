# Haskell Implementation (MUST)

## Purpose

Implement a Haskell contract with explicit failure, effects and evaluation behavior.

## Trigger

Use when writing or changing a Haskell function, module or adapter against an established contract.

## Rules (MUST)

- Implement the public cases with exhaustive patterns. Represent expected absence and failure in the result, retain the distinguishing input or location, and inspect partial functions and incomplete patterns on reachable inputs. If an internal definition violates an invariant, preserve its origin and report an internal defect through the project’s error channel. Classifying it as missing evidence or invalid caller input sends the caller to the wrong remedy.
- When callers need every independent diagnostic, choose validation with an explicitly accumulating error combination. The usual Either Applicative short-circuits. Sequence dependent steps only after their prerequisites succeed. Preserve an agreed stop-on-failure effect order even when the input values are independent.
- Keep deterministic transformations pure where practical. Isolate resource acquisition and external reads or writes at the boundary, delimit resource lifetime and preserve the distinction between a missing resource and a failed operation.
- For a hot or growing path, trace demand and retained data on a representative input. Examine repeated traversal, lazy accumulator buildup and avoidable intermediate structures. Justify strictness or an index with its effect on the observed work, memory or termination behavior.
- Keep exposed signatures and module exports small enough for a caller to understand the result, failure modes and resource obligations. Document any guarantee or precondition the type cannot express.

## Fallback

If effect or performance requirements are unknown, implement the known functional contract and identify the input or measurement needed before changing evaluation strategy.

## Minimal Output Contract

Deliver the implementation and a short account of observable behavior, including failure paths and any material effect or evaluation trade-off.
