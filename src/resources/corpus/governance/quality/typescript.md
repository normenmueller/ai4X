# Check TypeScript changes

Draft for review.

Apply only to work on TypeScript. Use [engineering](engineering.md) for cross-language requirements.

- Enable strict mode, including implicit-any and null checks. Resolve compiler errors. Explain any necessary diagnostic suppression or non-trivial assertion inline. Restrict explicit `any` to a justified external boundary.
- Model domain variants as discriminated unions. Dispatch exhaustively on typed discriminators and use literal types for exit codes. Define a single absence convention per boundary, with explicit optional types. Return recoverable domain failures as explicit, typed results at domain boundaries so callers can handle each case exhaustively. Preserve actionable context on recoverable failures. Handle or propagate every caught error. Optional chaining cannot express a required failure contract.
- Keep CLI parsing, exits and orchestration at entry points. Keep domain exports independent of process control and IO. Keep tests and fixtures outside production code, organized by the behavior or module they exercise. Separate pure, invalid-input and IO-boundary checks.
- Justify runtime dependencies, isolate development dependencies and prefer the Node standard library when it satisfies the boundary contract.
