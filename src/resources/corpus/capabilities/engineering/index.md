# Engineering Capability Catalog

This index exposes the local capability selection surface for `engineering`.

## Principles

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `abstraction-boundary-discipline` | `abstraction-boundary-discipline.md` | Align module and service boundaries with change, policy, and responsibility boundaries instead of file convenience. | Use when defining or reviewing module, service, or subsystem boundaries. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `architecture-decision-rigor` | `architecture-decision-rigor.md` | Keep architecture decisions explicit, comparable, and reviewable before they shape the system. | Use when making or reviewing significant architecture decisions. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `change-impact-analysis` | `change-impact-analysis.md` | Make the blast radius of non-trivial changes explicit before implementation commits the system to hidden coupling. | Use when preparing or reviewing non-trivial changes with possible cross-boundary effects. | `[]` | `[]` | `[architecture-decision-rigor, abstraction-boundary-discipline]` | `[]` |
| `composition-over-subtyping` | `composition-over-subtyping.md` | Prefer explicit composition of behavior over deep inheritance or subtype trees. | Use when designing extensible behavior or type relationships. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `domain-modeling-rigor` | `domain-modeling-rigor.md` | Domain concepts must be explicit, stable, and mapped to unambiguous model boundaries. | Use when modeling domain concepts or reviewing domain-facing contracts and APIs. | `[]` | `[]` | `[deterministic-reasoning]` | `[]` |
| `functional-error-modeling` | `functional-error-modeling.md` | Error states and optional values must be explicit in domain contracts. | Use when defining or reviewing domain contracts that carry recoverable failures or optional values. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `immutability-by-default` | `immutability-by-default.md` | Keep state transitions explicit and bounded so domain behavior remains predictable and composable. | Use when designing or reviewing stateful domain behavior and mutation boundaries. | `[]` | `[]` | `[domain-modeling-rigor]` | `[]` |
| `interface-contract-first` | `interface-contract-first.md` | Define semantic boundary contracts before implementation details accumulate around them. | Use when defining or reviewing interface boundaries before implementation details spread. | `[]` | `[]` | `[domain-modeling-rigor, abstraction-boundary-discipline]` | `[]` |
| `side-effect-boundary-discipline` | `side-effect-boundary-discipline.md` | Keep side effects explicit, bounded, and testable. | Use when designing or reviewing IO-heavy logic, process control, or external action boundaries. | `[]` | `[]` | `[immutability-by-default, functional-error-modeling]` | `[]` |
