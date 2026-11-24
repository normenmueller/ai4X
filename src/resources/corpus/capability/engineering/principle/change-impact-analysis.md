# Change Impact Analysis (MUST)

## Purpose

Make the blast radius of non-trivial changes explicit before implementation commits the system to hidden coupling.

## Trigger

Use when preparing or reviewing non-trivial changes with possible cross-boundary effects.

## Rules (MUST)

- Identify affected modules, contracts, data shapes, tests, and documentation before non-trivial change.
- Distinguish local change from cascading system change.
- High-blast-radius changes require containment logic before execution.
- If impact cannot be estimated with confidence, mark the change as preliminary.

## Fallback

- If a consumer or data dependency cannot be traced, name the unverified connection and its possible effect. Keep the impact estimate provisional and identify a check before implementation.

## Minimal Output Contract

- affected modules and contracts
- affected data/tests/docs
- local vs cascading impact judgment
- containment logic or open impact gaps
