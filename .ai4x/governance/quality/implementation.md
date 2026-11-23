# Implement an accepted behavior

Start with testable criteria, the applicable design and [engineering contracts](engineering.md). Resolve ambiguous defaults and missing upstream decisions before coding. Map each intended behavior to a change and a check. Preserve module boundaries, existing callers and defined error behavior.

For a non-trivial change, record the strategy, rejected approach and reason, failure and recovery paths, performance impact (including CLI and filesystem costs where relevant), and the tests required to demonstrate the result. Use [testing](testing.md) to verify the change.
