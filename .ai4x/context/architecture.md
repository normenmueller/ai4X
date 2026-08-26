# Architecture Context

`.ai4x/` is the canonical Project Memory. `src/` owns product implementation,
`doc/` human-readable documentation and durable evidence, and `util/` repository
tooling. `.github/`, `.codex/`, and root `AGENTS.md` are thin host facades; they
must not become independent semantic authorities.

The complete planned directory skeleton is intentionally tracked as a memory aid.
Its `.gitkeep` markers are location commitments, not permission to invent empty
contracts or speculative implementations. Materialize content through small,
verified vertical slices.

`src/` is organized by responsibility:

- `foundation/` owns stable, cross-cutting contracts;
- `domains/` owns ai4X product semantics;
- `interfaces/` owns thin entry points and host adapters;
- `resources/` owns declarative, versioned product resources.

Dependencies point inward: `interfaces -> domains -> foundation`. All three use
typed access to `resources`; `foundation` never imports `domains` or
`interfaces`, and `domains` never imports `interfaces`. Product semantics do not
belong in CLI or adapter code, and executable business rules do not belong in
resources.

The future Haskell workspace is one Cabal project rooted in `src/`, composed of
multiple packages. Its workspace and package files are materialized only by the
implementation slices that need them. `light` and `policy` are not independent
source roots: a future Light edition must be expressed as a justified bundle or
skeleton, while policy belongs to Corpus Governance or Assurance packs.

Authoritative project declarations are intended to use Dhall; closed product
semantics are intended to use Haskell. Describe this formal boundary as
**strongly and statically typed**, not as a "strict type system": Dhall provides
total, typed declarative inputs, while Haskell owns closed domain types,
invariants, and deterministic transformations; Haskell evaluation itself is
non-strict. Prototype and historical evidence remain outside `trunk` until a
product slice deliberately adopts a proven result.

At deterministic validation boundaries such as `validateIntent`, Haskell
checks an authored, decoded draft only for closed types and formal invariants.
It returns typed defects or a phase-indexed validated value. Success provides
deterministic evidence; it never supplies semantic fitness, human confirmation,
or approval.

A `CurationProposal<Draft>` binds the validated Project Intent and the complete
set of identified Capability Candidates to exhaustive Candidate decisions, an
`AgenticConstellation<Draft>`, and one authoritative authored rationale. Every
Candidate is selected or not selected, and every required Cognitive Job is
covered or recorded as an explicit gap.

`verifyCuration` deterministically constructs an opaque `VerifiedCuration` that
binds the exact Draft Proposal to its `CurationTrace` and the released
Capability Corpus that was checked. The trace contains verification facts and
evidence; semantic selection and non-selection rationale remains separate and
comes from cognitive curation.

`Explain the Curation` presents that exact `VerifiedCuration` and a cognitive
`ReviewExplanation<Authored>` as a `CurationProposal<Reviewable>`. It may
clarify existing semantics but cannot silently change them. Human acceptance
then constructs `AcceptedCuration`, binding the exact Reviewable Proposal,
recorded human acceptance, and the unchanged draft Constellation phase-promoted
to `AgenticConstellation<Curated>`. Neither verification nor explanation can
supply that authority.

`.ai4x/generated/` and `.ai4x/local/` are declared exceptions to the tracked
skeleton. They are created only on demand and remain ignored. Their intended
runtime subtrees are:

- `generated/agent-context/`, `generated/assignments/`, `generated/assurance/`, `generated/declarations/`, and `generated/hosts/`;
- `local/declaration-cache/`, `local/locks/`, `local/session-scratch/`, and `local/staging/`.
