# Define and implement engineering contracts

For product changes, specify inputs, outputs, invariants, failure semantics and affected callers before implementation. Identify changed modules, persisted shapes, tests and documentation. Bound a large change and record gaps when its impact is uncertain. Prefer compatible extensions to an established interface.

Use the [current source boundaries](../../context/architecture.md). Validate external input at entry. Keep domain values and transitions explicit and domain vocabulary consistent across code, tests and documentation. Separate domain models from wire formats and CLI presentation. Keep framework, filesystem, environment, network and process effects at narrow adapters. Specify adapter inputs, results and error paths. Test domain transformations in isolation and exercise IO at its boundary.

Use explicit optional values and typed, exhaustively handled failures with actionable context. Prefer immutable values and composable behaviors. If mutation is necessary, name the owner, reason and lifetime. Avoid shared mutable state across domains. Use subtyping only where substitution is stable and testable.

Apply deterministic rules to formal checks, graph traversal and structured transformations. Isolate semantic judgment and test deterministic behavior independently of model output. Escalate an unresolved model boundary. Derive information from its authoritative source and direct consumers there. Identify ownership and refresh behavior for generated projections. Use the repository language conventions in [BEHAVIOR.md](../../BEHAVIOR.md).
