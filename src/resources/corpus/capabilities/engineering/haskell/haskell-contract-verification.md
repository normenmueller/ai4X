# Haskell Contract Verification (MUST)

## Purpose

Choose and execute evidence that can falsify a claimed property of a public Haskell API.

## Trigger

Use when a Haskell change claims a type guarantee, a behavioral law, runtime validation or a cost bound.

## Rules (MUST)

- Restate the claim from the caller’s perspective and choose the evidence accordingly. For a static exclusion, type-check a valid client through the public exports, then vary only the forbidden operation. Check that rejection is due to the intended type constraint. A missing import, unavailable dependency or hidden setup error is inconclusive.
- For behavioral laws, state the quantified inputs, preconditions and equality being tested. Use generators that reach the interesting cases, include a counterexample to a plausible faulty implementation, and check whether shrinking preserves the precondition. Sampled tests provide evidence within their coverage.
- For validation and effects, exercise a valid case and each materially distinct boundary outcome, checking diagnostics and observable effects. Include failures during the operation when callers distinguish those from absence.
- For a cost claim, identify input dimensions and the work being measured. Vary independent dimensions separately and together, force the promised result to the depth a caller needs, and distinguish measured behavior from an asymptotic argument. For a graph traversal or join that claims to avoid scanning all candidate pairs, grow both input sets while keeping matches sparse. Count candidate pairs examined as well as matches produced, including work done to build any index.

## Fallback

If the compiler, fixture or measurement is unavailable, record the exact untested claim and the smallest reproducible probe. Classify the result as unverified.

## Minimal Output Contract

For each material claim, report the probe, observed outcome and remaining limit. Include a reproducer or smallest counterexample for a failed claim.
