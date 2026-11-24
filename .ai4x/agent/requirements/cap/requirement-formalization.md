# Requirement Formalization (MUST)

## Purpose

Turn competing readings of a requirement into a case whose outcome a reviewer can check.

## Trigger

Use as soon as two plausible readings predict different observable behavior. A reviewer can supply the readings directly.

## Rules (MUST)

- Identify the disputed clause. Hold the starting state, inputs and assumptions constant across readings.
- Choose the smallest example, property, transition or type signature that distinguishes the readings. Show what each reading returns, rejects, permits or changes for that case.
- Check that the distinction actually holds. A signature that permits both outcomes leaves the question open. For example, “handle duplicate IDs” can mean returning a single ID or rejecting the request. For input `[A, A]`, record the alternatives `Success [A]` and `Duplicate A`.
- Select an outcome only when an applicable requirement or an authorized decision supports it. Cite that basis. Once the case distinguishes the readings, stop refining the notation.

## Fallback

If no case distinguishes the readings within scope, report that and identify any missing precondition. If the intended outcome is unknown, ask which outcome is required for that exact case. If applicable sources disagree, cite both and keep the choice open until their precedence is established.

## Minimal Output Contract

- Disputed clause and common starting case.
- Predicted observation for each reading.
- Required outcome with its basis, or the precise open question.
