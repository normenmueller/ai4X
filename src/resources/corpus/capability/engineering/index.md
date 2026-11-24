# Engineering Capability Catalog

This index exposes the local capability selection surface for `engineering`.

## Principles

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `abstraction-boundary-discipline` | [abstraction-boundary-discipline.md](principle/abstraction-boundary-discipline.md) | Align module and service boundaries with change, policy, and responsibility boundaries instead of file convenience. | Use when defining or reviewing module, service, or subsystem boundaries. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `architecture-decision-rigor` | [architecture-decision-rigor.md](principle/architecture-decision-rigor.md) | Keep architecture decisions explicit, comparable, and reviewable before they shape the system. | Use when making or reviewing significant architecture decisions. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `change-impact-analysis` | [change-impact-analysis.md](principle/change-impact-analysis.md) | Make the blast radius of non-trivial changes explicit before implementation commits the system to hidden coupling. | Use when preparing or reviewing non-trivial changes with possible cross-boundary effects. | `[]` | `[]` | `[architecture-decision-rigor, abstraction-boundary-discipline]` | `[]` |
| `composition-over-subtyping` | [composition-over-subtyping.md](principle/composition-over-subtyping.md) | Prefer explicit composition of behavior over deep inheritance or subtype trees. | Use when designing extensible behavior or type relationships. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `domain-modeling-rigor` | [domain-modeling-rigor.md](principle/domain-modeling-rigor.md) | Domain concepts must be explicit, stable, and mapped to unambiguous model boundaries. | Use when modeling domain concepts or reviewing domain-facing contracts and APIs. | `[]` | `[]` | `[deterministic-reasoning]` | `[]` |
| `functional-error-modeling` | [functional-error-modeling.md](principle/functional-error-modeling.md) | Error states and optional values must be explicit in domain contracts. | Use when defining or reviewing domain contracts that carry recoverable failures or optional values. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `immutability-by-default` | [immutability-by-default.md](principle/immutability-by-default.md) | Keep state transitions explicit and bounded so domain behavior remains predictable and composable. | Use when designing or reviewing stateful domain behavior and mutation boundaries. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `interface-contract-first` | [interface-contract-first.md](principle/interface-contract-first.md) | Define semantic boundary contracts before implementation details accumulate around them. | Use when defining or reviewing interface boundaries before implementation details spread. | `[]` | `[]` | `[domain-modeling-rigor, abstraction-boundary-discipline]` | `[]` |
| `side-effect-boundary-discipline` | [side-effect-boundary-discipline.md](principle/side-effect-boundary-discipline.md) | Keep side effects explicit, bounded, and testable. | Use when designing or reviewing IO-heavy logic, process control, or external action boundaries. | `[]` | `[]` | `[immutability-by-default, functional-error-modeling]` | `[]` |

## Haskell (drafts)

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `haskell-type-design` | [haskell-type-design.md](haskell/haskell-type-design.md) | Translate a domain invariant into a Haskell API and identify exactly what a well-typed client can still do. | Use when designing a Haskell type, public signature or instance that promises to enforce an invariant. | The job is limited to naming domain concepts or documenting vocabulary. | domain-modeling-rigor: Domain modeling owns meaning and vocabulary. Type design determines which Haskell terms can express or violate an established invariant. | `[]` | `[]` |
| `haskell-implementation` | [haskell-implementation.md](haskell/haskell-implementation.md) | Implement a Haskell contract with explicit failure, effects and evaluation behavior. | Use when writing or changing a Haskell function, module or adapter against an established contract. | Only a representation decision or an independent assessment of an existing implementation is requested. | functional-error-modeling: Generic error modeling defines failure meanings. Haskell implementation realizes those meanings with concrete combinators, resource handling and evaluation behavior. | `[]` | `[]` |
| `haskell-contract-verification` | [haskell-contract-verification.md](haskell/haskell-contract-verification.md) | Choose and execute evidence that can falsify a claimed property of a public Haskell API. | Use when a Haskell change claims a type guarantee, a behavioral law, runtime validation or a cost bound. | The question is purely about project sign-off or a language-independent quality gate. | technical-output-validation: Technical output validation assesses fit for a strategic decision. Haskell contract verification tests a specific compiler, runtime or evaluation claim. | `[]` | `[]` |

## TypeScript (draft)

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `typescript-boundary-validation` | [typescript-boundary-validation.md](typescript/typescript-boundary-validation.md) | Decode untrusted input into a TypeScript domain value or a typed validation failure. | Use when implementing or reviewing a TypeScript boundary that receives a value whose runtime shape is unverified. | Only the location of an IO boundary or the meaning of domain errors is being decided. | side-effect-boundary-discipline: Boundary discipline places validation at entry. This capability checks how TypeScript code establishes a domain value from runtime evidence. | `[]` | `[]` |
