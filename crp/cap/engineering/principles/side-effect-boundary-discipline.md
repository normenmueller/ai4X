# Side-Effect Boundary Discipline (MUST)

## Purpose

Keep side effects explicit, bounded, and testable.

## Trigger

Use when designing or reviewing IO-heavy logic, process control, or external action boundaries.

## Rules (MUST)

- Place side effects at explicit system boundaries such as filesystem, process, network, environment, time, or external services.
- Keep domain logic as pure transformation where practical instead of mixing it with IO or process control.
- Side-effecting functions must have explicit inputs, outputs, and error paths.
- Global process state changes belong only at clear entry boundaries.
- External writes must be reproducible and must propagate failures explicitly.
- Runtime validation of untrusted input must stay at explicit boundaries rather than leaking across the domain core.
- IO-facing components require targeted runtime/setup tests; domain logic should remain unit-testable without external IO.

## Fallback

- If the relevant boundary, contract, or design context is incomplete, keep the judgment provisional and name the missing engineering information.

## Minimal Output Contract

- side-effect boundaries
- pure-core assumption
- error propagation path
- runtime/setup test boundary
