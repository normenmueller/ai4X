# Evaluate a design

Draft for review.

Use when a change affects responsibilities, domain invariants or integration contracts. Identify the affected contexts, their owners, the data crossing each boundary and the invariants at risk. Check dependencies against the consuming project’s declared dependency boundaries.

Compare at least two designs. For each, describe how to verify its invariants, coupling, affected callers and migration cost. Challenge the leading option with a concrete counterexample. State the assumptions, rejected option, recommendation, trade-offs and remaining risks. Withhold a design verdict until its invariants are verifiable and the alternatives can be distinguished.

Record each significant architecture decision and its rationale where the decision is owned, for example in the relevant issue. Use a dedicated document when the scope warrants it and link it from the decision record.
