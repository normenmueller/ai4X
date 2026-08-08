# R-15 Dhall-only project-authoring prototype

This prototype implements the common semantic fixture in
`../fixture/contract.md`. "Dhall-only" means that project-owned declarations use Dhall;
the installed ai4X product remains Haskell and owns the closed metamodel, decoders,
domain validators, graph closure, and inert publication.

- `schema/package.dhall` is an authoring schema mirror, not product authority.
- `project.dhall` is the authoritative positive project declaration.
- `cases/positive.dhall` contains valid transition and join probes.
- `cases/invalid-*.dhall` express the seven required semantic failures plus bounded
  empty-join, wrong-kind, and wrong-version regressions.
- `consumer/` is the smallest product-owned Haskell extraction and semantic-validation
  harness. Its closed view deliberately excludes Dhall expectation fields and exposes
  typed owner-local and explicit cross-context reference ports.
- `BUILD-CONTRACT.md` defines the explicit trust/evaluation boundary.
- `expected/inert-envelope.json` is an exact bounded output sketch, not generated data.
- `ASSESSMENT.md` records evidence and the candidate verdict.

All Dhall imports are closed, relative, and protected by semantic hashes. There are no
HTTP(S), environment, home-relative, or absolute imports. No Church-encoded recursive
model is used. Graph edges are stable/versioned references; closure belongs to Haskell.
