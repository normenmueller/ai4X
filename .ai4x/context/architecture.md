# Architecture Context

`.ai4x/` is the canonical Project Memory. `src/` owns product implementation,
`doc/` human-readable documentation and durable evidence, and `util/` repository
tooling. `.github/`, `.codex/`, and root `AGENTS.md` are thin host facades; they
must not become independent semantic authorities.

The complete planned directory skeleton is intentionally tracked as a memory aid.
Its `.gitkeep` markers are location commitments, not permission to invent empty
contracts or speculative implementations. Materialize content through small,
verified vertical slices.

Authoritative project declarations are intended to use Dhall; closed product
semantics are intended to use Haskell. Prototype and historical evidence remain
outside `trunk` until a product slice deliberately adopts a proven result.

`.ai4x/generated/` and `.ai4x/local/` are declared exceptions to the tracked
skeleton. They are created only on demand and remain ignored. Their intended
runtime subtrees are:

- `generated/agent-context/`, `generated/assignments/`, `generated/assurance/`, `generated/declarations/`, and `generated/hosts/`;
- `local/declaration-cache/`, `local/locks/`, `local/session-scratch/`, and `local/staging/`.
