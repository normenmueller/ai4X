# Reboot Target Architecture Decision Trace

## Trace contract

This document preserves the accepted and rejected architectural choices needed
to complete the Greenfield rebuild. It records immutable evidence and ownership;
it does not duplicate mutable Issue or board status.

The current decision precedence is:

1. Requirements v7, SHA-256
   `0f77c6d29f8e22cfd0b117d7f5b0d7dd66c607d3d145d49529f3960b93e45ce2`;
2. Architecture v4, SHA-256
   `5cd08b895cc9ec2f6b672051daf946a5c6087eec73db847e955e68145710fd6a`;
3. Stage-5 resource evidence, SHA-256
   `5d5039884b3e76cfc486138ef55a29c8c0a3d3b11cc82cc2d572c8c4397b7417`;
4. Capability matrix v2, SHA-256
   `20104569187c1820b0d900f08993caefce862c5b8ad466b0289e1baa72d1abb5`;
5. the accepted #83 pack at
   `2632207f834bcddf5fd57240d5eec87574208a51`, only where not revised by
   the successors above; and
6. R15 evidence at `74bc0dfd9cf51f1f2263a4a3fa2bc62833f65d8d`
   as bounded historical evidence, not current product compatibility proof.

The accepted target-manifest input had SHA-256
`cac5fd564fc98eafe76b9bbaaafe054b6fdd9280afd5af5ea3b91e1ac0e87783`
and length 58,582 bytes. It ended with two LF bytes. Repository whitespace
conformance removed exactly the final redundant LF; the promoted successor has
SHA-256 `0526fb553c7feeb2e0b5745313887b5e3abf7448491ca36da146a675c8136ac8`
and length 58,581 bytes. The successor is an exact byte prefix of the accepted
input and both safe-parse to equal YAML values. This normalization changes no
entry, order, value, lifecycle, skeleton path, or semantic authority.

## Accepted architectural decisions

| ID | Accepted decision | Durable owner or implementation boundary | Evidence |
| --- | --- | --- | --- |
| D-01 | `.ai4x` is the sole canonical Project Memory spelling. | `.ai4x/`; simultaneous `.ai4X` is invalid. | #83 R-1/R-7; Architecture v4 |
| D-02 | The Greenfield roots are exactly `src/`, `doc/`, and `util/`; legacy names are not aliases. | Root `README.md` defines their meanings. | PO-reviewed target-tree amendments; Architecture v4 |
| D-03 | Project facts are authored only in Dhall; product semantics are owned only by Haskell. | `.ai4x/**/*.dhall`; `src/packages/**` | R15 decision; Architecture v4 |
| D-04 | Ordinary commands consume accepted inert generations and never evaluate Dhall implicitly. | Declaration Publication boundary | R15 decision; #98 hardening boundary |
| D-05 | Bounded contexts remain separate and communicate through typed published summaries and ports. | Intent, Curation, Corpus, Collaboration, Work Management, Governance, Assurance, Activation, adapters | #83 Haskell review evidence; Architecture v4 |
| D-06 | No central project mega-AST, global validator, reverse package dependency, or adapter-owned semantics exists. | Per-owner packages and acyclic package DAG | #83 HR-01 through HR-09 |
| D-07 | Need-to-Capability curation separates formal compatibility, semantic fitness, and governance acceptance. | Trace plus Haskell algorithms and explicit acceptance | #81/#89/#96; Architecture v4 |
| D-08 | A Need may require several Capabilities and one Capability may support several Needs. | Complete Project Intent and Need-to-Capability Trace | R15 curation decisions |
| D-09 | Formal witnesses prove only the declared signature algebra, closure, conflicts, and coverage. | Opaque Haskell witness constructors | #83 HS-F02/HS-F15 closure |
| D-10 | `Need a` and type-inhabitation are valuable research evidence, not an implemented proof or project format. | #96 follow-up boundary | Preserved sandbox and #83 decision trace |
| D-11 | Each reusable Agent is defined by one per-Agent `composition.dhall`; Team facts are Collaboration-owned. | `.ai4x/agents/<agent-id>/composition.dhall`; `.ai4x/coordination/collaboration.dhall` | Architecture v4 |
| D-12 | `BEHAVIOR.md` owns constitution, precedence, startup, and task navigation only. | `.ai4x/BEHAVIOR.md` | Architecture v4 |
| D-13 | Collaboration solely owns Participant/work routing, delegation, handoff, review, consultation, notification, escalation, Team, roles, and topology. | `.ai4x/coordination/collaboration.dhall` | Architecture v4 |
| D-14 | Work Management solely owns work types, lifecycle, stages, and flow. | `.ai4x/coordination/work-management.dhall` | Architecture v4 |
| D-15 | Neither `team.dhall` nor `bindings/team.dhall` exists. GitHub and record-store bindings have narrow external-binding ownership only. | `.ai4x/bindings/github.dhall`; `.ai4x/bindings/operational-record-store.dhall` | Architecture v4 |
| D-16 | Root `AGENTS.md` is a tracked regular ai4x-managed Codex facade changed only by explicit check/plan/apply. | Root `AGENTS.md` | PO target-tree amendment; Architecture v4 |
| D-17 | Codex is the sole measured v1 AI-host adapter. GitHub surfaces are integration facades, not AI-host proof. | `.codex/`, `src/packages/adapter/codex/`, tracked GitHub surfaces | Stage-5 evidence; Architecture v4 |
| D-18 | Normal startup, use, and cleanup leave tracked facades byte-identical. | Host check/plan/apply contract | Architecture v4 |
| D-19 | Activation is bounded progressive disclosure and never traverses the authoritative Capability Corpus. | Generated manifests and shared selected snapshots | Stage-5 evidence |
| D-20 | Mandatory resource safety is independent from optional monetary cost control. | Resource-envelope policy; #124 for cost control | Stage-5 evidence and PO acceptance |
| D-21 | The accepted v1 mode is truthful `resource-only`: bytes/files are enforced; tokens are unavailable and cost is unknown. | Codex adapter/resource policy | Stage-5 evidence |
| D-22 | Generated data is class-allow-listed, manifest-bound, digest-bound, non-authoritative, fail-closed, and never silently truncated. | `.ai4x/generated/**` only when a vertical slice owns it | Architecture v4; Stage-5 evidence |
| D-23 | Confidential/runtime history defaults to the bound Operational Record Store; tracked evidence is a reviewed structured allow-list. | `.ai4x/records/**` only under evidence-backed policy | Architecture v4 |
| D-24 | Every Capability has Markdown cognitive authority, metadata portfolio authority, and Dhall formal-signature authority. | Exact target triplet under `src/corpus/capabilities/**` | Capability matrix v2 |
| D-25 | Product Haskell validates Capability triplets and owns deterministic matching, composition, coverage, and gap algorithms. | `src/corpus/**` and Curation package | Capability matrix v2 |
| D-26 | The current portfolio disposition is 30 `adopt` and 40 `revise`, not the earlier 55/15 estimate. | `capability-coverage.md` | Stage-6 independent re-review |
| D-27 | Capability preservation does not imply admission and #120 creates no empty formal contracts. | #103 vertical slices | Capability matrix v2 |
| D-28 | The complete target tree is visible through a controlled content-sensitive `.gitkeep` skeleton only. | `target-structure.yaml` | PO target-tree amendment |
| D-29 | `.ai4x/planning/target-architecture/` is exceptional and transitional, not a standard ai4X planning convention. | This five-file pack and exit contract | PO amendment; Requirements v7 |
| D-30 | GitHub Issues and the board remain permanent planning/work-state authority. | GitHub | Requirements v7 |
| D-31 | Semantic preservation uses a variant-aware ledger, not historical ancestry or wholesale copying. | `information-disposition.md` | Requirements v7; Architecture v4 |
| D-32 | ai4X self-application uses the same public contracts as adopted projects; bootstrap grants mechanics only. | Public Project Entry through governance surfaces | #83 `#eyodf` contract; Architecture v4 |
| D-33 | Every implementation Story is a compiling verified vertical slice; no empty package or mega-aggregate stands in for progress. | Acyclic `src/packages/**` dependency graph | Architecture v4 |
| D-34 | Portable-record limits require their own retention evidence and policy version; no AI-context number is reused or invented. | Operational Record Store policy | Requirements v7 AC-10a |
| D-35 | The target manifest differs from its accepted input only by removal of one redundant final LF; its parsed YAML value is unchanged. | `target-structure.yaml` | Repository whitespace conformance and exact predecessor/successor proof |

## Stage-5 resource decision

The accepted maximal self-hosting fixture contains 70 trap Capabilities, 16
direct roots, a 34-Capability selected closure, 6 Participants, and 7 Needs. It
generated 110 files and 66,595 bytes. The complete project-controlled model input
was 46 files and 117,134 bytes. Candidate limits use 25 percent headroom and all
22 exact-limit/over-limit pairs behaved fail-closed. Two fresh Codex measurements
were byte-identical and read no authoritative Corpus Capability.

No compatible tokenizer identity was exposed. Consequently no token or monetary
claim is made. This limitation is deliberate and does not weaken file/byte,
privacy, publication, retention, or host-safety controls. Complete optional usage
measurement, pricing, reservation, reconciliation, and cost enforcement belong to
#124.

## Stage-6 Capability correction

The immutable `crp/cap` tree OID is
`ec6872d46ef1939557eac699abb24888a3a24e8f`: 70 Markdown/metadata pairs,
10 indexes, no orphan pair, 123 resolving `requires` references, an acyclic
dependency graph, and zero conflict edges.

The reviewed matrix corrects the old 55/15 estimate to 30/40. Revision reasons
are exact and may overlap:

- all 15 Architecture Capabilities contain unresolved neighbor boundaries;
- 31 Capabilities contain category-generic fallback behavior;
- `expert-continuity-briefing` contains one invalid pseudo-ID neighbor reference.

All ten handwritten indexes lose writable-authority status. Human orientation
targets `src/corpus/README.md`; machine inventory is derived into
`src/corpus/catalog.yaml`.

The 70 metadata files expose a governance contradiction: current authoring
guidance requires `status`, `approved_by`, `approved_at`, and `scope`, while the
central schema and closed #38 contract exclude them. #120 chooses neither side.
#103 must align schema, decoder, authoring guidance, examples, and tests before
Capability admission.

## R15 evidence disposition

R15 selected Dhall as sole project authoring with Haskell product semantics and
rejected Haskell-only and dual-authority project authoring. The preserved evidence
includes concrete Dhall declarations, profiles, positive and adversarial cases,
typed Haskell consumers, deterministic graph output, and Haskell-only/hybrid
candidates.

The recorded GHC 9.6.7, Dhall 1.42.3, build, diagnostic, and visualization results
are historical bounded observations. They are not current GHC 9.10.3 or production
compatibility claims unless a later owner reproduces them. The stale `NEXT-STEPS.md`
blocked-gate statement is retained only as historical evidence and never as current
guidance. Durable evidence targets
`doc/architecture/evidence/project-declaration-r15/` through a later content-owning
vertical slice.

## Rejected alternatives

| Alternative | Decision and reason |
| --- | --- |
| Merge preserved history for ancestry | Rejected; immutable revisions, tuple manifests, and normal descendant recovery preserve evidence without reactivating stale authority. |
| Copy old trees wholesale | Rejected; it would restore obsolete paths, gates, TypeScript semantics, host claims, and duplicate authorities. |
| Keep `mod/`, `utl/`, or other aliases | Rejected; one conventional Greenfield vocabulary is easier for humans and AI agents. |
| Make root `AGENTS.md` a symlink | Rejected; a regular reviewed facade is clearer and more portable. |
| Generate/remove facades during normal use | Rejected; fresh-clone discovery and reviewability require tracked stable facades. |
| Claim Copilot support from existing `.github` files | Rejected; support requires an approved tested host contract. |
| Load all Capabilities during startup | Rejected; curated Agent composition and selected shared snapshots bound context. |
| Use Dhall as the search or proof engine | Rejected; Dhall declares facts/signatures while Haskell owns deterministic algorithms and witness construction. |
| Treat formal compatibility as semantic fitness | Rejected; meaning-based review and governance acceptance remain explicit. |
| Track raw prompts, transcripts, or complete responses | Rejected; privacy and repository-growth boundaries require external confidential records. |
| Create empty packages, contracts, adapters, generated trees, or record trees to show the destination | Rejected; only durable canonical directories receive controlled skeleton markers. |
| Keep this planning workspace permanently | Rejected; it would become duplicate planning and architecture authority. |

## Follow-up obligations

| Issue | Preserved obligation |
| --- | --- |
| #96 | Formal Need/Capability satisfaction, composition research, and possible `Need a` inhabitation without overclaiming the current runtime algebra |
| #97 | Exact diagnostic cardinality and complete source mapping |
| #98 | Restricted import, resource, atomic publication, recovery, and durability hardening |
| #99 | Dhall schema/Haskell decoder drift prevention |
| #102 | Haskell product foundation and compiling vertical package increments |
| #103 | Capability triplet schema, formal signatures, admission, semantic review, and catalogue derivation |
| #104 | Collaboration, Work Management, Governance, Assurance, and record-policy vertical slices |
| #105 | Declaration protocol and publication implementation |
| #106 | CLI, activation, supported host adapters/facades, Bundles, Light, and skeletons |
| #107 | Project Memory, governance/operations content, documentation, resource policy, and final durable promotion |
| #109 | Board automation for gate-state projections |
| #110 | Concise artifact-centric implementation evidence and code-centered review practice |
| #118 | Deterministic branch-base and PR-scope publication safeguards |
| #122 | Safe cleanup of ai4X-owned Codex subagent sessions only |
| #124 | Pluggable AI usage measurement and optional monetary cost control |

The Issue references preserve obligations, not mutable status. Current state and
ordering must always be read from GitHub.

## Source and cleanup safety

The immutable source authorities remain inspectable by exact revision. No source
file or preservation branch is removed by Stage 7. Later deletion requires a
separately reviewed pre-cut commit, complete path/mode/blob manifests and digests,
verified recovery through the final `trunk` ancestry, and exact PO-approved ai4X
cleanup scope. Foreign repositories and foreign Codex sessions are always outside
that authority.
