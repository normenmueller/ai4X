# Implement an accepted behavior

Draft for review.

Start with testable criteria, the applicable design and [engineering contracts](engineering.md). Resolve ambiguous defaults and missing upstream decisions before coding. When an implementation recommendation depends on an assumption that could change the choice, state the assumption and what would go wrong if it were false. Map each intended behavior to a change and a check. Preserve module boundaries, existing callers and defined error behavior.

For a non-trivial change, record the strategy, rejected approach and reason, failure and recovery paths, performance impact (including CLI and filesystem costs where relevant), and the tests required to demonstrate the result. Use [testing](testing.md) to verify the change. Run the verification commands the project requires for the current work item and record each command and its result. If a required command is unavailable, name it and report which check remains unverified.
