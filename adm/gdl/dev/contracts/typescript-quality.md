# TypeScript Quality Contract

## Purpose

This contract defines the mandatory TypeScript-specific quality rules for the ai4X CLI.
It supplements the engineering quality contract with language-level and toolchain-level requirements.

## Scope

Apply this contract to all TypeScript implementation work in `dev/src` and `dev/tst`.

---

## Compiler Configuration (MUST)

- `strict: true` is mandatory. No exceptions.
- `noImplicitAny` must remain active.
- `strictNullChecks` must remain active.
- Compiler errors must be resolved before any change is considered complete.
- Do not suppress errors with `@ts-ignore` or `@ts-expect-error` without an explicit inline justification.

## Type Safety (MUST)

- `any` is prohibited except at explicit system boundaries with an inline comment stating why.
- Type assertions (`as T`) require an inline justification when the assertion is non-trivial.
- Prefer discriminated unions over loose type unions for domain variant modeling.
- Do not use optional chaining as a substitute for explicit failure modeling at domain contracts.

## Module Structure (MUST)

- `dev/src/app` is restricted to CLI entry points and command orchestration.
  - No domain logic in `app`.
  - No direct IO beyond process entry and exit.
- `dev/src/lib` contains domain logic and reusable contracts.
  - No direct CLI or process-control dependencies in `lib`.
  - Exports from `lib` define the domain contract surface.
- `dev/tst` contains all tests.
  - Test files mirror the structure of `dev/src`.
  - No test helpers or fixtures leak into `dev/src`.

## Error Handling (MUST)

- Use explicit result or error types for recoverable failures — do not rely on thrown exceptions as the primary flow-control mechanism across domain contracts.
- Errors returned from domain functions must carry actionable context for the caller.
- Process-level exits belong only in `app`-layer entry points.
- Do not swallow errors silently. Every catch must either handle or explicitly re-propagate with context.

## Null and Undefined (MUST)

- Do not use `null` and `undefined` interchangeably. Choose one semantic per boundary and stay consistent.
- Optional values in domain contracts must use explicit optional types (`T | undefined` or a domain-specific Optional wrapper), not null signaling.

## Testing (MUST)

- Tests must cover boundary behavior: valid inputs, invalid inputs, and failure paths.
- Unit tests must not require external IO, filesystem access, or process side effects.
- IO-facing components must be tested with targeted integration or runtime tests, isolated from pure domain tests.
- Test names must describe the behavior under test, not the implementation.

## Dependencies (MUST)

- Introduce new runtime dependencies only with explicit justification.
- Dev dependencies must not leak into runtime code.
- Prefer the Node.js standard library for CLI-boundary IO where it is sufficient.
