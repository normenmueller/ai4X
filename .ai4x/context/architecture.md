# Architecture Context

`.ai4x/` is the canonical Project Memory. `src/` owns product implementation,
`doc/` human-readable documentation and durable evidence, and `util/` repository
tooling. `.github/`, `.codex/`, and root `AGENTS.md` are thin host facades; they
must not become independent semantic authorities.

Authority is split by fact kind:

- current explicit Product Owner instructions own current mutation authority;
- tracked `.ai4x/` and tracked architecture own durable behavior and semantics;
- GitHub Issues, the project board, and Pull Requests own mutable work and
  lifecycle state;
- the observed worktree is state to preserve, never an instruction to discard;
- `.ai4x/local/` contains working and continuity material only; it is never
  semantic or governance authority;
- external recovery material is inert continuity fallback, never work authority.

On disagreement, use the owner for that fact kind. Preserve local changes and
fail closed to the Product Owner when authority or the owning work is ambiguous.

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

The Need-to-Capability ownership flow is tracked in
[need-to-capability.md](need-to-capability.md). Its normative Curation algebra
and invariants have exactly one owner: [curation.md](curation.md). Diagrams,
vocabulary, examples, and local drafts are projections or evidence, not
competing type authorities.

`.ai4x/generated/` and `.ai4x/local/` are declared exceptions to the tracked
skeleton. They are created only on demand and remain ignored. Their intended
runtime subtrees are:

- `generated/agent-context/`, `generated/assignments/`, `generated/assurance/`, `generated/declarations/`, and `generated/hosts/`;
- `local/declaration-cache/`, `local/locks/`, `local/session-scratch/`, and `local/staging/`.
