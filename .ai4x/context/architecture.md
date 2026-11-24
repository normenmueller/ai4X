# Architecture Context

`.ai4x/` is the canonical, host-independent Project Memory. `src/` owns product implementation, `doc/` human-readable documentation and durable evidence, and `util/` repository tooling. Agent entry files for individual hosts and any shared skill facades carry discovery metadata and route to the owning instructions in `.ai4x/`. Keep role definitions, capability composition and work authority in Project Memory.

Authority is split by fact kind:

- current explicit Product Owner instructions own current mutation authority;
- tracked `.ai4x/` and tracked architecture own durable behavior and semantics;
- GitHub Issues, the project board, and Pull Requests own mutable work and
  lifecycle state;
- the observed worktree is state to preserve, never an instruction to discard;
- `.ai4x/local/` contains working and continuity material only; it is never
  semantic or governance authority;
- historical recovery material records earlier exercises. A Cold Start uses tracked
  Project Memory and the relevant GitHub Issues.

On disagreement, use the owner for that fact kind. Preserve local changes and fail closed to the Product Owner when authority or the owning work is ambiguous.

`.ai4x/STATE.md` is tracked branch-bound return context, not mutable work state. It may identify directly assigned work or point to an owning Issue and canonical context but never owns board status, execution authorization, acceptance gates, or product facts. Those are reconstructed from their owners at Cold Start. `.ai4x/TEAM.md` owns lean collaboration routing, while `.ai4x/governance/work-authority.md` owns the project-instance risk and authority model.

The complete planned directory skeleton is intentionally tracked as a memory aid. Its `.gitkeep` markers are location commitments, not permission to invent empty contracts or speculative implementations. Materialize content through small, verified vertical slices.

The reboot preserves the original cognitive contracts, indexes and YAML metadata under `src/resources/corpus/capabilities/`. They are source material for later curation. A versioned Corpus release identifies the capabilities admitted for product use.

`src/` is organized by responsibility:

- `foundation/` owns stable, cross-cutting contracts;
- `domains/` owns ai4X product semantics;
- `interfaces/` owns thin entry points and host adapters;
- `resources/` owns declarative, versioned product resources.

Use singular names for ai4X domain directories in product resources and Project Memory. Keep `src/resources/` as the common root. The target paths for reusable agent profiles, project roles and capability definitions are `src/resources/agent/<name>/`, `.ai4x/agent/<role>/` and `src/resources/corpus/capability/`, respectively.

Dependencies point inward: `interfaces -> domains -> foundation`. All three use typed access to `resources`; `foundation` never imports `domains` or `interfaces`, and `domains` never imports `interfaces`. Product semantics do not belong in CLI or adapter code, and executable business rules do not belong in resources.

The [Cabal project](../../src/cabal.project) in `src/` lists the current workspace packages. Add packages through the implementation slices that need them. `light` and `policy` are not independent source roots: a future Light edition must be expressed as a justified bundle or skeleton, while policy belongs to Corpus Governance or Assurance packs.

The [formal boundary](need-to-capability.md#formal-boundary) specifies Dhall for authoritative project declarations and Haskell for closed product semantics. It owns the terminology for this design. Prototype and historical evidence remain outside `trunk` until a product slice deliberately adopts a proven result.

The design calls for Haskell validation boundaries such as `validateIntent` to check an authored, decoded draft only for closed types and formal invariants. The intended result is typed defects or a phase-indexed validated value. Success provides deterministic evidence; it never supplies semantic fitness, human confirmation, or approval.

The Need-to-Capability ownership flow is tracked in [need-to-capability.md](need-to-capability.md). Its normative Curation algebra and invariants have exactly one owner: [curation.md](curation.md). Diagrams, vocabulary, examples, and local drafts are projections or evidence, not competing type authorities.

`.ai4x/generated/` and `.ai4x/local/` are declared exceptions to the tracked skeleton. They are created only on demand and remain ignored. Their intended runtime subtrees are:

- `generated/agent-context/`, `generated/assignments/`, `generated/assurance/`, `generated/declarations/`, and `generated/hosts/`;
- `local/declaration-cache/`, `local/locks/`, `local/session-scratch/`, and `local/staging/`.
