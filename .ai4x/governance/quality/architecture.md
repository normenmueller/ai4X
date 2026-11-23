# Evaluate a design

Use when a change affects responsibilities, domain invariants or integration contracts. Identify the affected contexts, their owners, the data crossing each boundary and the invariants at risk. Check dependencies against the [repository architecture](../../context/architecture.md).

Compare at least two designs. For each, describe how to verify its invariants, coupling, affected callers and migration cost. Challenge the leading option with a concrete counterexample. State the assumptions, rejected option, recommendation, trade-offs and remaining risks. Withhold a design verdict until its invariants are verifiable and the alternatives can be distinguished.
