# Information Disposition Matrix

## Status and authority

This document is the lossless semantic-disposition evidence for Issue #83. It is
an architecture artifact, not a migration plan or implementation instruction.
It does not authorize moving, deleting, generating, or materializing any target
artifact.

The matrix separates two questions:

1. **Semantic preservation:** where each useful fact, contract, example, or
   decision belongs in the Greenfield model.
2. **Legacy path preservation:** whether the old path itself belongs in the
   Greenfield model.

The first is mandatory; the second is normally rejected. A `Revise`, `Split`, or
`Merge` disposition preserves the stated semantics without preserving legacy
names or authority. `Defer` keeps a concept in an explicit Issue or rationale;
`Reject` records why it has no target authority.

Per-Capability disposition and target paths are authoritative only in the
[Capability Coverage Matrix](capability-coverage.md). This document enumerates
all Capability source files for no-loss coverage but does not duplicate those
decisions.

## Context boundaries

| Boundary | Owns | Does not own |
| --- | --- | --- |
| Project Memory | Project identity, intent, composed agents, coordination, governance, operations, Assurance selection, and explicit storage bindings under `.ai4x/` | Product implementation, reusable Corpus content, generated host authority, or live external work state |
| Product libraries | Closed Haskell semantics, validation, declaration update, project entry, activation, and adapters under `mod/` | Project-authored facts |
| Corpus | Reusable Capability Markdown/metadata pairs and their lifecycle under `mod/corpus/` | ai4X project workflow or project-specific role bindings |
| Host facades | Host discovery and invocation projections in `.github/`, `.codex/`, and root `AGENTS.md` | Canonical behavior or project semantics |
| External work system | Promoted work contracts, status, and ordering | Project Memory content copied as backlog state |
| Architecture evidence | Reviewable design decisions and executable experiments under `doc/arc/` | Runtime or project declaration authority |

## Key invariants

- The target is Greenfield. No `xxx/`, compatibility `agn`, `ctx`, or `spc`
  structure, migration scaffold, or legacy alias is admitted.
- Root `AGENTS.md` is exactly a tracked relative symbolic link to
  `.ai4x/BEHAVIOR.md`.
- `.github/agents/*.agent.md` are tracked regular-file host stubs, never
  symbolic links.
- Dhall is the sole project-authoring authority. Product-owned Haskell owns
  closed semantics, validation, graph algorithms, and the explicit declaration
  update boundary.
- Reusable Capabilities remain Markdown/metadata pairs. Project Dhall selects
  pinned references; it does not copy their authoritative bodies or metadata.
- Generated projections are inert, deterministic, digest-bound, and
  non-authoritative.
- Project declarations contain no secret, user-specific absolute path, or live
  external repository link.
- A historical source may remain inspectable in Git without retaining its path
  in the target tree.

## Architecture options

### Option A: semantic disposition into Greenfield owners -- selected

Classify each source statement by its actual semantic owner and map it to the
exact Greenfield artifact, companion matrix, accepted Issue, or explicit
defer/reject rationale. Preserve immutable historical evidence separately from
normative target documentation.

This option prevents both information loss and accidental authority transfer.

### Option B: relocate the legacy trees structurally -- rejected

Move `xxx/`, `adm/`, `crp/`, and `.github/` into similarly shaped target
directories and clean them later.

This is rejected because path-for-path relocation would retain obsolete
authorities, the rejected `agn`/`ctx`/`spc` vocabulary, Haskell project
authoring, and the obsolete generated Copilot CLI `AGENTS.md` indirection. It
would also turn cleanup mechanics into architecture decisions.

### Recommendation

Use Option A. Apply no filesystem change until the complete target package has
passed Issue #84 independent review and Issue #85 PO acceptance. The later
Greenfield cut must consume this matrix as evidence, not reinterpret it as an
automatic move script.

## Source baseline and reproducibility

### Preserved sandbox baseline

Authority: `feat/design-sandbox@e75c2fbbac5b12c7c7c44359366d8ae4de568e0e`
and Issue #96. The following nine files are the complete preserved source set
used here:

| Source | Bytes | Lines | SHA-256 |
| --- | ---: | ---: | --- |
| `xxx/.ai4x/config.yaml` | 109 | 5 | `b6a2a0f99c814d413e76bed5c9bbc00525d742bf19647d75d167cd21d72b8911` |
| `xxx/.ai4x/spc/Ai4x/Spc.hs` | 1,988 | 68 | `48731f39b668dce1606a2b0155ea7dd366e0b3d5a415bbf0a5d1be705d7d71f1` |
| `xxx/.ai4x/spc/Needs.hs` | 4,330 | 140 | `05213e2b2d7406c6365357580d7b8745740d33540ab0fe918e0c65dfc6020684` |
| `xxx/.ai4x/spc/hie.yaml` | 36 | 3 | `07870c89d2b1bd65641df620aab4ccabc0b0db958cadef8c9e6e5dd4a032b8ee` |
| `xxx/DESIGN.md` | 53,269 | 749 | `0b4a3704378cd2a04e5446255e70b6af042bd8bb926bdedb5060f778e80e2cb6` |
| `xxx/USER.md` | 7,458 | 207 | `2c778a7e5f1eadff213df1d2989511a58e5ef4d2f864dc544410b7de8aab2fb6` |
| `xxx/global-config.yaml` | 903 | 43 | `c67371e9f64a8d21ebdc9bc698dfca741946b822df414de1ec9f6fd289beca32` |
| `xxx/README.md` | 666 | 17 | `6f88340351b3c5057987a1e5657f483aa865fa9c1022ccb658441ff95cf588ef` |
| `README.md` | 3,293 | 66 | `1b3a426cf44f5437c52ba70fd76e7b00a4d2fe533c0cfc1496eb52edb7e7188d` |

### Current tracked source baseline

| Scope | Tracked files | Git-index manifest SHA-256 |
| --- | ---: | --- |
| `adm/**` | 13 | `5e8408b43990efc6532ecc6e53052c38c16d54d2a21e1bb55f43be61fc91f088` |
| `crp/agn/**` | 1 | `075c686e7e8ec8fe4cb3ab08d493d939fa057d33ebaa2fc90eaf776bf88b3b5f` |
| `crp/cap/**` | 151 | `f6293cfc186f7655190599dc202690848910c5f5516a81f50358acd2f15c0fe4` |
| `crp/gov/**` | 14 | `6f947aed424684e1ecd64b4e2155e237cff782468f3546cf4299257c1c41bcbb` |
| `.github/**` | 10 | `d9d4211474610d6bb7da4f96d3c98058e80063f75b2f7a2030767a00bf4eca7b` |
| `.codex/**` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| root `AGENTS.md` | 1 | `fa913f9d8e5513332c7fae01bff30e7e2dcb01ce9abee8262ad0a7c25c3c659e` |
| All current scopes above | 190 | `903986ba132fef8f4b5356cf59ee9b34b18b65e175b3efe09bc6e75edf62cc5e` |

The `crp/cap/**` count consists of 70 Capability pairs, 10 index files, and one
tracked placeholder. Ignored `.DS_Store` files are environmental metadata, not
design sources; their disposition is `Reject` because they carry no project
semantics.

Reproduce the manifests without checking out the old branch:

```sh
git ls-tree -r e75c2fbbac5b12c7c7c44359366d8ae4de568e0e -- xxx README.md | shasum -a 256
git ls-files -s adm | sort | shasum -a 256
git ls-files -s crp/agn | sort | shasum -a 256
git ls-files -s crp/cap | sort | shasum -a 256
git ls-files -s crp/gov | sort | shasum -a 256
git ls-files -s .github | sort | shasum -a 256
git ls-files -s .codex | sort | shasum -a 256
git ls-files -s AGENTS.md | sort | shasum -a 256
git ls-files -s adm crp .github .codex AGENTS.md | sort | shasum -a 256
```

### Already preserved and external evidence

| Evidence source | Disposition | Exact target or rationale |
| --- | --- | --- |
| `doc/arc/evidence/project-declaration-r15/**` at `74bc0dfd9cf51f1f2263a4a3fa2bc62833f65d8d` | Adopt in place | The complete executable Dhall/Haskell comparison remains non-authoritative architecture evidence at its current durable path. `DECISION.md` is traced by `doc/arc/target-architecture/decision-trace.md`; no file is copied into `.ai4x/` or product source. |
| Issue #96 and `feat/design-sandbox@e75c2fb` | Adopt as recovery evidence and non-blocking follow-up | They remain the immutable source authority for the former sandbox and typed Need-to-Capability experiment. Issue #83 owns the accepted runtime architecture under `mod/lib/curation/`, including its verification contract at `mod/lib/curation/test/CurationContractSpec.hs`. Issue #96 defers implementation/research, optional complexity-justified advanced type-level encoding or search, and possible `Need a` inhabitation work; it does not own an alternative runtime architecture. Target documentation references the preserved evidence without duplicating its full bodies. |
| `normenmueller/ai4x-tpl@1b86eb21b63e5c0f5be731dc756cba347bcfb677` | Split and revise | Reusable skeleton semantics target `mod/skeletons/minimal-single-repo/<version>/skeleton.dhall`; reusable Bundle composition targets `mod/bundles/governed-agent-first/<version>/bundle.dhall`. The monolithic template, legacy `adm/` ownership, in-place mutation, hidden defaults, and runtime dependency are rejected. The source repository stays inspectable until accepted extraction, then may be archived read-only only through separate PO authority. |
| MPRM prompt/service evidence accepted by R-5/R-11 | Split and revise | The independent `ai4x-light` product contract targets `mod/light/ai4x-light.cabal` and `mod/light/src/AI4X/Light/API.hs`; versioned prompt authority/provenance targets `mod/light/assets/<version>/prompt.md` and `mod/light/assets/<version>/manifest.yaml`; fresh-agent evidence targets `mod/light/test/fixtures/<fresh-agent-fixture>.md`; command documentation targets `doc/commands/light.md`; notification adapter source targets `mod/lib/adapter/codex/`. MPRM dissolution remains separately gated and is not authorized by #83. |

## Preserved `xxx/**` and root README disposition

### File-level matrix

| Source | Material semantics | Disposition | Exact target or rationale |
| --- | --- | --- | --- |
| `xxx/.ai4x/config.yaml` | Explicit project schema version and runtime selection | Revise | Portable project identity and bindings become `.ai4x/project.dhall`; host selection is represented through explicit project/host binding and `.ai4x/local/` only where a local binding is enabled. No YAML compatibility file is retained. |
| `xxx/.ai4x/spc/Ai4x/Spc.hs` | `Need a` phantom-type experiment; Job, Priority, Constraint, TeamConstraint, and Domain vocabulary | Split and revise | Project-authored demand vocabulary targets `.ai4x/intent/project-intent.dhall`. Issue #83 owns the closed runtime `ContractSignature`, `FormalMatch`, `CoverageGap`, and `CompositionWitness` algebra; deterministic match/compose/impact functions; dependency closure; conflicts; coverage/gaps; and trace architecture under `mod/lib/curation/src/AI4X/Curation/`, with verification obligations at `mod/lib/curation/test/CurationContractSpec.hs`. The preserved `Need a` remains unproved phantom evidence, not an inhabitation proof. Issue #96 defers implementation/research and optional advanced type-level encoding or search only; project authoring is not moved to Haskell. |
| `xxx/.ai4x/spc/Needs.hs` | Seven typed example Needs, project domain, team constraints, and transformation signatures | Split and revise | Project Intent and multiple Needs are re-expressed in `.ai4x/intent/project-intent.dhall`; the worked semantic journey targets `doc/examples/project-intent-to-team.md`. The transformation examples inform, but do not prove, the accepted runtime contracts in `mod/lib/curation/src/AI4X/Curation/`. `Need a` remains unproved phantom notation; only implementation/research and optional advanced type-level encoding, search, or possible inhabitation work remain deferred to #96. |
| `xxx/.ai4x/spc/hie.yaml` | Editor cradle for the Haskell project-authored experiment | Reject | No target: Dhall won project authoring and the editor-only empty cradle carries no semantic contract. Haskell product packages own their normal build configuration under `mod/cabal.project`. |
| `xxx/DESIGN.md` | Prior R-1--R-10 synthesis candidate | Split and revise | Section-level disposition follows below. The source remains immutable at the preserved commit; `xxx/` is not recreated. |
| `xxx/USER.md` | `scout -> curate -> spawn` journey, need-first interview, reviewable mapping, deterministic materialization, and optional direct-expert idea | Split and revise | Section-level disposition follows below. Accepted journey semantics go to `doc/commands/scout.md`, `doc/commands/curate.md`, `doc/commands/spawn.md`, `doc/concepts/project-intent-and-curation.md`, and `doc/examples/project-intent-to-team.md`; obsolete paths are rejected. |
| `xxx/global-config.yaml` | Host adapter registry, runtime parameters, replacement merge rule, and example model names | Split and revise | Host-neutral adapter contracts go to `mod/lib/adapter/codex/`, `mod/lib/adapter/github/`, `mod/lib/adapter/copilot-vscode/`, `mod/lib/adapter/copilot-cli/`, and `doc/commands/spawn.md`; host-local effective values belong outside the repository under the explicit host plan/apply boundary. Example people/model values and home-path assumptions are rejected. |
| `xxx/README.md` | Sandbox purpose and two-host simulated scenario | Merge | The reusable scenario becomes the worked example in `doc/examples/project-intent-to-team.md`; the sandbox explanation and `xxx` path have no target. |
| preserved root `README.md` | Product purpose, Need-first/host-agnostic/self-validating USP, lifecycle, documentation audiences, and configuration overview | Revise | Product-level content remains in root `README.md`; detailed Project Intent semantics move to `doc/concepts/project-intent-and-curation.md`; command and configuration detail moves to `doc/commands/` and `doc/reference/declarations.md`. TypeScript-specific wording and obsolete YAML configuration claims are revised to the accepted Haskell/Dhall model. |

### `xxx/DESIGN.md` section matrix

| Section | Disposition | Exact target or rationale |
| --- | --- | --- |
| Status, scope, and authority preamble | Merge | Replaced by the status/authority boundaries in `doc/arc/target-architecture/README.md` and this package; the obsolete `xxx` write boundary is rejected. |
| 1 Purpose | Revise | `doc/arc/target-architecture/README.md` context and bounded-context model. The seven-context candidate is updated by accepted R-11--R-15 contexts. |
| 2 Design Principles | Revise | `doc/arc/target-architecture/README.md` invariants. One-owner, explicitness, determinism, progressive disclosure, autarky, and external-work authority are retained; "discussion remains in xxx" is rejected. |
| 3 Assumptions and Ubiquitous Language | Split | Canonical terms go to `doc/reference/glossary.md`; target architecture terms remain in `doc/arc/target-architecture/README.md`. `Need Specification`, `Team Declaration`, Runtime Adapter, and old path names are revised to R-14/R-15 semantics. |
| 4.1 Bounded contexts | Revise | `doc/arc/target-architecture/README.md` bounded contexts, including separate Intent, Curation, Collaboration, Work Management, Governance/Assurance, Activation, Product, Corpus, and host boundaries. |
| 4.2 Authority matrix | Revise | `doc/arc/target-architecture/README.md` authority matrix; Project Memory, external work, Corpus, product, generated projection, and documentation owners remain disjoint. |
| 4.3 Aggregates | Revise | `doc/arc/target-architecture/README.md` aggregate and publication boundaries; obsolete `spc`, `agn`, and mandatory runtime directory assumptions are replaced. |
| 4.4 Invariants | Revise | `doc/arc/target-architecture/README.md` invariants. The root-link invariant is corrected to `AGENTS.md -> .ai4x/BEHAVIOR.md`; `ctx`, `spc`, and `agn` names and runtime-link indirection are rejected. |
| 5 Options and recommendation | Merge | `doc/arc/target-architecture/README.md` alternatives and decision rationale. The useful monorepo boundary challenge is retained with the final `mod/` package architecture. |
| 6 Target file tree | Replace | The complete Greenfield tree in `doc/arc/target-architecture/README.md`. The old tree's `xxx`, TypeScript CLI, `spc`, `agn`, fixed `records/generated/local`, and generated Copilot CLI adapter are rejected. |
| 6.1 Specialist facade stub pattern | Revise | `.github/agents/*.agent.md` remain tracked regular-file stubs, but canonical project behavior is `.ai4x/BEHAVIOR.md` and composed host material is generated from `.ai4x/agents/` without a Copilot CLI `AGENTS.md` intermediate. |
| 7.1 Project Memory artifacts | Replace | `.ai4x/project.dhall`, Core Memory, and semantic areas in `doc/arc/target-architecture/README.md`; declaration details in `doc/reference/declarations.md`. Physical `records/generated/local` locations are explicit bindings, not universal defaults. |
| 7.2 `CONTEXT.md` versus `ctx/` | Revise | `.ai4x/CONTEXT.md` remains bounded orientation; `.ai4x/context/` owns indexed detailed subjects without becoming a competing authority. The legacy unbounded `ctx/` model is rejected. |
| 7.3 Memory loading | Adopt with refinement | Startup and progressive loading contract in `.ai4x/BEHAVIOR.md`, summarized in `doc/arc/target-architecture/README.md`; indexes are explicit and recursive scanning is prohibited. |
| 8.1 General command contract | Revise | Command-wide plan/apply, explicit input, diagnostics, conflict, and atomicity rules in `doc/commands/project.md` and relevant command documents. Exact exit/error contracts remain product-owned in `mod/cli/`. |
| 8.2 Commands | Replace | `doc/commands/project.md`, `doc/commands/light.md`, `doc/commands/scout.md`, `doc/commands/curate.md`, `doc/commands/spawn.md`, `doc/commands/doctor.md`, `doc/commands/declarations.md`, and `doc/commands/assurance.md`, aligned with accepted Project Entry, Light Prompt, declaration update, and Assurance contracts. |
| 8.3 `ask` | Defer | No accepted v1 command target. The direct-expert concept remains inspectable in the source snapshot and requires a separately refined lifecycle/cleanup contract before admission. |
| 9 Lifecycle and self-consumption | Revise | `doc/concepts/project-intent-and-curation.md`, `doc/examples/project-intent-to-team.md`, and `doc/arc/target-architecture/README.md`; replace `spc/agn/runtime` with Intent, Agent Composition, Coordination, and generated projections. |
| 10 CLI-to-Corpus integration | Revise | Product boundary and package dependency graph in `doc/arc/target-architecture/README.md`; packages under `mod/lib/curation/`, `mod/lib/declaration/`, `mod/cli/`, and `mod/corpus/`. |
| 11 Governance and `adm` disposition | Replace | The current, complete file-level matrices below are authoritative for #83; the older partial migration-oriented table is not. |
| 12 GitHub facade and generation | Revise | Host facade section in `doc/arc/target-architecture/README.md`, `.github/` target stubs, `.codex/config.toml`, and generated Codex/GitHub adapters. Root `AGENTS.md` points directly to `.ai4x/BEHAVIOR.md`. |
| 13 Visual language and publication | Revise | `doc/reference/text-and-diagrams.md` and `doc/diagrams/`; R-13's exact path-specific character, diagram detection, TikZ, and freshness contracts supersede the preliminary policy. |
| 14 Verification architecture | Revise | `doc/commands/assurance.md`, `doc/commands/doctor.md`, target `utl/verify.sh`, `mod/ass/`, and `.ai4x/assurance/`; `doctor` diagnosis remains distinct from repository verification. |
| 15 MPRM transfer and dissolution | Revise | `doc/commands/light.md`, `mod/light/ai4x-light.cabal`, `mod/light/src/AI4X/Light/API.hs`, `mod/light/assets/<version>/prompt.md`, `mod/light/assets/<version>/manifest.yaml`, and `mod/light/test/fixtures/<fresh-agent-fixture>.md`. The accepted independent ai4X Light Prompt product contract supersedes the preliminary `memory prompt` naming; repository dissolution remains separately authorized. |
| 16 Migration sequence | Reject as target authority | No target artifact: #83 authorizes synthesis only, not migration. Blast-radius knowledge is retained in this matrix's risks; any Greenfield cut requires a separately approved Issue after #84/#85. |
| 17 Decision register | Replace | `doc/arc/target-architecture/decision-trace.md`, which traces all accepted R-1--R-15 small-step decisions and explicitly marks superseded candidate decisions. |
| 18 Risks and controls | Revise | `doc/arc/target-architecture/README.md` risks plus the matrix-specific risks below. |
| 19 Validation criteria | Revise | `doc/arc/target-architecture/README.md` validation contract and #84 review scope, corrected for R-11--R-15. |
| 20 Traceability | Replace | `doc/arc/target-architecture/decision-trace.md`; the old R-1--R-10 summary is insufficient. |
| 21 Gate recommendation | Reject as current verdict | Historical evidence only. The old candidate's self-recommendation neither approves #83 nor substitutes for #84 independent review or #85 PO acceptance. |

### `xxx/USER.md` section matrix

| Section or concept | Disposition | Exact target or rationale |
| --- | --- | --- |
| Need-first `scout -> curate -> spawn` journey | Revise | `doc/concepts/project-intent-and-curation.md`, `doc/commands/scout.md`, `doc/commands/curate.md`, `doc/commands/spawn.md`, and `doc/examples/project-intent-to-team.md`; Project Entry `adopt/init` is added as the explicit entry orchestrator. |
| `scout` challenges HOW and derives WHAT | Adopt | `doc/commands/scout.md` and `.ai4x/intent/project-intent.dhall`; it must support multiple Needs and cannot prescribe roles, Capabilities, tools, or hosts. |
| Temporary interview-agent activation | Revise | `doc/commands/scout.md` and `mod/lib/activation/`; temporary host state uses an isolated explicit boundary and never silently mutates persistent facades. |
| Haskell `Needs.hs` as project output | Replace | Dhall authority is `.ai4x/intent/project-intent.dhall`; Project Intent semantics target `mod/lib/intent/`; accepted runtime satisfaction and composition semantics target `mod/lib/curation/src/AI4X/Curation/`. Issue #96 retains implementation/research and optional advanced type-level encoding, search, or possible `Need a` inhabitation only; it does not defer or redefine the #83 runtime architecture. |
| `curate` matches Needs to Capabilities | Revise | `doc/concepts/project-intent-and-curation.md`, `doc/commands/curate.md`, `.ai4x/agents/composition.dhall`, and the Need-to-Capability Trace. Deterministic evidence, semantic fitness, and governance acceptance remain separate. |
| Reviewable Need-to-Capability mapping | Adopt | `.ai4x/agents/need-to-capability-trace.dhall` and `doc/examples/project-intent-to-team.md`, with exact identities, versions/digests, considered candidates, gaps, overlaps, dependencies, conflicts, rationale, and authority. |
| Combined `collabm.yaml` team/workflow model | Split | Separate `.ai4x/coordination/collaboration.dhall` and `.ai4x/coordination/work-management.dhall`; common declaration protocol does not merge semantic ownership. |
| Agent YAML files under `agn/` | Replace | `.ai4x/agents/composition.dhall` and `.ai4x/agents/capability-selections.dhall`; each selected Capability is projected once as `.ai4x/generated/agent-context/capabilities/<capability-id>/CAPABILITY.md` plus `.ai4x/generated/agent-context/capabilities/<capability-id>/capability.meta.yaml`. |
| `spawn` is mechanical and host-specific | Adopt with refinement | `doc/commands/spawn.md`, `mod/lib/activation/`, and host adapters under `mod/lib/adapter/`; Haskell values are translated into bounded inert projections before host transport. |
| `ctx/` project-context merge | Replace | `.ai4x/CONTEXT.md` plus indexed `.ai4x/context/`; generated host context is non-authoritative and lives only in the configured generated binding. |
| VS Code/Copilot, Codex, and Copilot CLI outputs | Revise | `.github/` regular-file stubs, `.codex/config.toml`, `.ai4x/generated/hosts/codex/`, `.ai4x/generated/hosts/github/`, and root `AGENTS.md -> .ai4x/BEHAVIOR.md`; no generated Copilot CLI `AGENTS.md` exists. |
| Direct expert `ask` | Defer | No current target artifact or command. The concept needs an explicit ephemeral lifecycle, cancellation, transcript, and cleanup contract before a future Issue may admit it. |

## Current `adm/**` disposition

| Source or section | Disposition | Exact target or rationale |
| --- | --- | --- |
| `adm/gdl/README.md` | Merge | Startup/routing semantics go to `.ai4x/BEHAVIOR.md`; documentation navigation goes to `doc/reference/glossary.md`. A second governance entry point is rejected. |
| `adm/gdl/index.yaml` | Split and revise | Task routing becomes `.ai4x/operations/routing.dhall`; top-level progressive routing remains `.ai4x/BEHAVIOR.md`. Paths are rewritten to target owners; no legacy-path compatibility entries remain. |
| `adm/gdl/glossary.md` Planning/Qualifier/Architecture Terms | Split | Canonical reference terms go to `doc/reference/glossary.md`; dispatch-critical terms remain inline in the exact `.ai4x/operations/` contract that dispatches on them. No duplicate authority is created. |
| `adm/gdl/board-policy.md` | Split and revise | Project board interaction policy remains readable at `.ai4x/governance/board-policy.md`; formal authority is in `.ai4x/governance/authority.dhall`, while work-state/transition mapping is in `.ai4x/coordination/work-management.dhall`. External Issue/Project facts remain remote authority. |
| `adm/gdl/planning-workflow.md` | Split and revise | Formal authority and gate references go to `.ai4x/governance/authority.dhall` and `.ai4x/governance/gates.dhall`; agent-facing planning procedure goes to `.ai4x/operations/planning-workflow.md`; live work remains in GitHub. |
| `adm/gdl/planning-conformance.md` | Revise | `.ai4x/governance/planning-conformance.md`, with gate identities resolved from `.ai4x/governance/gates.dhall` and Assurance evidence through explicit selection/storage bindings. |
| `adm/gdl/dev/schemas/capability-meta.schema.yaml` | Split and revise | Closed Haskell semantics are owned by `mod/corpus/src/AI4X/Corpus/Capability.hs`; the generated YAML authoring adapter is `mod/corpus/schema/capability-metadata.schema.yaml`. Schema/decoder drift is guarded by #99. |
| `adm/pbl/.gitkeep` | Reject | Empty-directory scaffolding has no semantic value; GitHub Issues are authoritative after promotion and Project Memory is not a duplicate backlog. |
| `adm/pbl/ai4x-context-budget-model.md` -- `token_estimate` | Merge | Existing Story #72 remains the work contract. Target semantics are owned by `mod/corpus/src/AI4X/Corpus/Capability.hs` and projected through `mod/corpus/schema/capability-metadata.schema.yaml`. |
| `adm/pbl/ai4x-context-budget-model.md` -- budget ceiling and truncation | Defer | No accepted local target artifact. Retain as unpromoted concept until separately refined after the `curate` contract; deterministic truncation must never silently change selected semantics. |
| `adm/pbl/ai4x-curate.md` -- need-first team curation, traceability, roles/contracts, explicit plan/apply, idempotence, conflicts | Split and revise | `doc/concepts/project-intent-and-curation.md`, `doc/commands/curate.md`, `.ai4x/agents/composition.dhall`, `.ai4x/agents/team.dhall`, `.ai4x/agents/capability-selections.dhall`, `.ai4x/coordination/collaboration.dhall`, `.ai4x/coordination/work-management.dhall`, and `.ai4x/operations/routing.dhall`. Accepted #81/#83 decisions supersede path and language assumptions. |
| `adm/pbl/ai4x-curate.md` -- TypeScript paths, `ctx`, snapshot embedding, absolute inventory examples | Reject | No target: Haskell product packages, indexed context, pinned references, and portable project declarations supersede these mechanisms; absolute host paths are prohibited. |
| `adm/pbl/ai4x-curate.md` -- co-curation/type composition question | Split and revise | Issue #83 resolves the runtime architecture: `ContractSignature` targets `mod/lib/curation/src/AI4X/Curation/Contract.hs`; deterministic match/compose functions, `FormalMatch`, dependency closure, and conflicts target `mod/lib/curation/src/AI4X/Curation/Match.hs`; `CoverageGap`, coverage, and gaps target `mod/lib/curation/src/AI4X/Curation/Coverage.hs`; deterministic impact functions target `mod/lib/curation/src/AI4X/Curation/Impact.hs`; `CompositionWitness` and trace target `mod/lib/curation/src/AI4X/Curation/Trace.hs`; verification obligations target `mod/lib/curation/test/CurationContractSpec.hs`. Issue #96 defers implementation/research and optional complexity-justified advanced type-level encoding, proof search, or possible `Need a` inhabitation work only. |
| `adm/pbl/ai4x-doctor-canonical-validator.md` | Split and revise | Product behavior goes to `doc/commands/doctor.md` and `mod/lib/check/`; existing Stories #41 and #76--#79 retain their historical implementation contracts, but TypeScript `_scaffold` paths are not target architecture. |
| `adm/pbl/ai4x-lifecycle-feedback-loop.md` -- drift detection | Merge | Read-only declaration/Corpus/team drift diagnosis belongs in `doc/commands/doctor.md`; explicit impact/re-curation belongs in `doc/commands/curate.md`. |
| `adm/pbl/ai4x-lifecycle-feedback-loop.md` -- performance assessment and `evolve`/`despawn` commands | Defer | No accepted v1 target command. Host instrumentation, evidence privacy, deactivation, and mutation semantics require separate refinement. |
| `adm/pbl/ai4x-organization-design.md` -- topology/binding/team separation | Revise | Collaboration semantics go to `.ai4x/coordination/collaboration.dhall` and `mod/lib/collaboration/`; project bindings go to `.ai4x/agents/composition.dhall`. |
| `adm/pbl/ai4x-organization-design.md` -- new Capability/agent/topology catalog | Defer | Candidate Capability admission remains governed by the Corpus process and the companion Capability Coverage Matrix; no agent or catalog entry is created by #83. |

## Current `crp/agn/**` and `crp/gov/**` disposition

The legacy Agent placeholder is disposed independently from governance and
Capability content:

| Source | Disposition | Exact target or rationale |
| --- | --- | --- |
| `crp/agn/.gitkeep` | Reject | Empty legacy-directory scaffolding has no semantic value. Canonical Agent, Participant, role, and team declarations target `.ai4x/agents/`; product composition semantics target `mod/lib/activation/` and the relevant Agent/Collaboration modules. No `agn` compatibility directory is created. |

| Source | Disposition | Exact target or rationale |
| --- | --- | --- |
| `crp/gov/prc/capability-sweep.md` | Revise | `mod/corpus/governance/portfolio-review.md`; it remains Corpus lifecycle procedure, independent of project workflow. |
| `crp/gov/prc/development-conformance.md` | Revise | `.ai4x/operations/development-conformance.md`, with deterministic requirements bound through `.ai4x/governance/gates.dhall` and `.ai4x/assurance/`. |
| `crp/gov/prc/development-conformance-template.md` | Revise | `.ai4x/operations/development-conformance-template.md`; evidence locations resolve through explicit storage bindings rather than a fixed directory. |
| `crp/gov/prc/workflow.md` | Split and revise | Formal stages, transitions, assignments, gates, receipts, and handoffs go to `.ai4x/coordination/work-management.dhall`, `.ai4x/coordination/collaboration.dhall`, `.ai4x/governance/authority.dhall`, and `.ai4x/governance/gates.dhall`; agent procedure goes to `.ai4x/operations/delivery-workflow.md`. |
| `crp/gov/qlt/capability-authoring-governance.md` | Split and revise | `mod/corpus/governance/authoring.md` and `mod/corpus/governance/admission.md`; project-specific path and approval mechanics are removed from reusable Corpus lifecycle authority. |
| `crp/gov/qlt/ai-strategy-quality.md` | Revise | `.ai4x/governance/quality/ai-strategy.md`. |
| `crp/gov/qlt/architecture-quality.md` | Revise | `.ai4x/governance/quality/architecture.md`. |
| `crp/gov/qlt/engineering-quality.md` | Revise | `.ai4x/governance/quality/engineering.md`; language-neutral engineering invariants remain, while target Haskell specifics are owned by `.ai4x/governance/quality/haskell.md`. |
| `crp/gov/qlt/implementation-quality.md` | Revise | `.ai4x/governance/quality/implementation.md`, aligned with the target Haskell package boundaries and thin CLI. |
| `crp/gov/qlt/requirements-quality.md` | Revise | `.ai4x/governance/quality/requirements.md`. |
| `crp/gov/qlt/review-quality.md` | Revise | `.ai4x/governance/quality/review.md`. |
| `crp/gov/qlt/testing-quality.md` | Revise | `.ai4x/governance/quality/testing.md`. |
| `crp/gov/qlt/typescript-quality.md` | Reject as active target contract | No TypeScript product package exists in the Greenfield target. Non-language-specific boundary/testing principles are merged into `.ai4x/governance/quality/engineering.md`; historical TypeScript rules remain in Git history. |
| `crp/gov/top/.gitkeep` | Reject | Empty placeholder only. Accepted Collaboration Topology semantics are declarations/models under `.ai4x/coordination/` and `mod/lib/collaboration/`, not an empty governance directory. |

## Current `.github/**`, required `.codex/**`, and root facade disposition

| Source or required surface | Disposition | Exact target or rationale |
| --- | --- | --- |
| `.github/agents/ai4x.agent.md` | Split and revise | Canonical startup/authority/safety goes to `.ai4x/BEHAVIOR.md`; team and Tech Lead role bindings go to `.ai4x/agents/team.dhall`, `.ai4x/agents/composition.dhall`, and `.ai4x/agents/tech-lead.dhall`; workflow semantics go to `.ai4x/coordination/collaboration.dhall`, `.ai4x/coordination/work-management.dhall`, `.ai4x/governance/authority.dhall`, and `.ai4x/governance/gates.dhall`; the same source path becomes a tracked minimal stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/tech-lead.md`. |
| `.github/agents/ai4x-ai-strategy.agent.md` | Split and revise | Role/binding goes to `.ai4x/agents/composition.dhall` and `.ai4x/agents/ai-strategy.dhall`; selected Capability pins go to `.ai4x/agents/capability-selections.dhall`; quality policy goes to `.ai4x/governance/quality/ai-strategy.md`; the source path remains a tracked stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/ai-strategy.md`. |
| `.github/agents/ai4x-architecture-ddd.agent.md` | Split and revise | Role/binding goes to `.ai4x/agents/composition.dhall` and `.ai4x/agents/architecture-ddd.dhall`; Capability pins go to `.ai4x/agents/capability-selections.dhall`; quality policy goes to `.ai4x/governance/quality/architecture.md`; the source path remains a tracked stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/architecture-ddd.md`. |
| `.github/agents/ai4x-capability-governance.agent.md` | Split and revise | Role/binding goes to `.ai4x/agents/composition.dhall` and `.ai4x/agents/capability-governance.dhall`; Capability pins go to `.ai4x/agents/capability-selections.dhall`; reusable lifecycle goes to `mod/corpus/governance/authoring.md`, `mod/corpus/governance/admission.md`, and `mod/corpus/governance/portfolio-review.md`; the source path remains a tracked stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/capability-governance.md`. |
| `.github/agents/ai4x-critical-reviewer.agent.md` | Split and revise | Role/binding goes to `.ai4x/agents/composition.dhall` and `.ai4x/agents/critical-reviewer.dhall`; Capability pins go to `.ai4x/agents/capability-selections.dhall`; quality policy goes to `.ai4x/governance/quality/review.md`; the source path remains a tracked stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/critical-reviewer.md`. |
| `.github/agents/ai4x-implementation.agent.md` | Split and revise | Role/binding goes to `.ai4x/agents/composition.dhall` and `.ai4x/agents/implementation.dhall`; Capability pins go to `.ai4x/agents/capability-selections.dhall`; quality policy goes to `.ai4x/governance/quality/implementation.md`; obsolete TypeScript paths are rejected and the source path remains a tracked stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/implementation.md`. |
| `.github/agents/ai4x-requirements.agent.md` | Split and revise | Role/binding goes to `.ai4x/agents/composition.dhall` and `.ai4x/agents/requirements.dhall`; Capability pins go to `.ai4x/agents/capability-selections.dhall`; quality policy goes to `.ai4x/governance/quality/requirements.md`; the source path remains a tracked stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/requirements.md`. |
| `.github/agents/ai4x-testing-tdd.agent.md` | Split and revise | Role/binding goes to `.ai4x/agents/composition.dhall` and `.ai4x/agents/testing-tdd.dhall`; Capability pins go to `.ai4x/agents/capability-selections.dhall`; quality policy goes to `.ai4x/governance/quality/testing.md`; obsolete TypeScript paths are rejected and the source path remains a tracked stub routing to `.ai4x/BEHAVIOR.md` and `.ai4x/generated/agent-context/participants/testing-tdd.md`. |
| `.github/copilot-instructions.md` | Replace with stub | The tracked regular file remains at the same host-facade path and routes only to `.ai4x/BEHAVIOR.md` plus the generated host binding `.ai4x/generated/hosts/github/binding.json`; duplicated project semantics and generated agent Markdown are prohibited. |
| `.github/workflows/verify.yml` | Revise in place | Maintained GitHub CI facade remains at the exact path and performs only checkout/tool setup plus delegation to canonical `utl/verify.sh`; it cannot define extra policy. |
| Current `.github/**/.DS_Store` ignored files | Reject | Finder metadata has no semantic target and must never become tracked project state. |
| No current generated GitHub manifest | Add non-authoritative provenance projection | `.ai4x/generated/hosts/github/manifest.json` records generation identity, source digests, producer version, and generated/maintained facade inventory. It contains no participant semantics and never becomes a source input. |
| No current `.codex/**` file | Add target surface from accepted R-11/R-14 requirements | `.codex/config.toml` is a generated project-local Codex adapter; its source projection is `.ai4x/generated/hosts/codex/`, and adapter implementation lives at `mod/lib/adapter/codex/`. It contains no secret or absolute host path. |
| Host-neutral notification event policy | Adopt from accepted #82 decision | `.ai4x/operations/notifications.dhall`; Codex, OSC 9, ntfy, Keychain, and host paths do not enter reusable cognition. |
| Global Codex notification hook | External host materialization only | Implementation source belongs in `mod/lib/adapter/codex/`; installation uses a separate explicit host plan/apply boundary. The installed hook and Keychain topic have no repository target and are never produced by `spawn`. |
| Root `AGENTS.md` current link to `.github/agents/ai4x.agent.md` | Revise symlink target | Root `AGENTS.md` remains a tracked relative symbolic link, with exact target `.ai4x/BEHAVIOR.md`. No intermediate or generated Copilot CLI `AGENTS.md` exists. |

## `crp/cap/**` structural information

The 70 Capability pairs below are complete at the file level. For each row, the
Markdown source carries the cognitive contract and the metadata source carries
identity, version, lifecycle, dependencies, conflicts, boundaries, and
provenance. Their pair integrity is preserved. The exact disposition and target
for each pair is owned by `capability-coverage.md` under the convention:

```text
mod/corpus/capabilities/<semantic-category...>/<capability-id>/
|-- CAPABILITY.md
`-- capability.meta.yaml
```

Category depth is semantic and variable; it is not mechanically copied from
the old path.

| Capability ID | Complete current source pair | Authoritative disposition/target |
| --- | --- | --- |
| `ai-operating-model-architecture` | `crp/cap/ai/architecture/enterprise/ai-operating-model-architecture.md`; `crp/cap/ai/architecture/enterprise/ai-operating-model-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `ai-evaluation-and-control-architecture` | `crp/cap/ai/architecture/governance/ai-evaluation-and-control-architecture.md`; `crp/cap/ai/architecture/governance/ai-evaluation-and-control-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `agentic-solution-architecture` | `crp/cap/ai/architecture/solution/agentic-solution-architecture.md`; `crp/cap/ai/architecture/solution/agentic-solution-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `grounding-and-context-architecture` | `crp/cap/ai/architecture/solution/grounding-and-context-architecture.md`; `crp/cap/ai/architecture/solution/grounding-and-context-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `model-selection-and-boundary-fit` | `crp/cap/ai/architecture/solution/model-selection-and-boundary-fit.md`; `crp/cap/ai/architecture/solution/model-selection-and-boundary-fit.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `ai-adoption-roadmapping` | `crp/cap/ai/consulting/ai-adoption-roadmapping.md`; `crp/cap/ai/consulting/ai-adoption-roadmapping.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `ai-center-of-excellence-design` | `crp/cap/ai/consulting/ai-center-of-excellence-design.md`; `crp/cap/ai/consulting/ai-center-of-excellence-design.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `ai-readiness-assessment` | `crp/cap/ai/consulting/ai-readiness-assessment.md`; `crp/cap/ai/consulting/ai-readiness-assessment.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `ai-use-case-framing` | `crp/cap/ai/consulting/ai-use-case-framing.md`; `crp/cap/ai/consulting/ai-use-case-framing.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `ai-value-risk-prioritization` | `crp/cap/ai/consulting/ai-value-risk-prioritization.md`; `crp/cap/ai/consulting/ai-value-risk-prioritization.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `agent-loop-and-state-design` | `crp/cap/ai/engineering/agent-loop-and-state-design.md`; `crp/cap/ai/engineering/agent-loop-and-state-design.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `context-engineering-discipline` | `crp/cap/ai/engineering/context-engineering-discipline.md`; `crp/cap/ai/engineering/context-engineering-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `evaluation-driven-iteration` | `crp/cap/ai/engineering/evaluation-driven-iteration.md`; `crp/cap/ai/engineering/evaluation-driven-iteration.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `expert-continuity-briefing` | `crp/cap/ai/engineering/expert-continuity-briefing.md`; `crp/cap/ai/engineering/expert-continuity-briefing.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `failure-mode-and-guardrail-design` | `crp/cap/ai/engineering/failure-mode-and-guardrail-design.md`; `crp/cap/ai/engineering/failure-mode-and-guardrail-design.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `prompt-contract-design` | `crp/cap/ai/engineering/prompt-contract-design.md`; `crp/cap/ai/engineering/prompt-contract-design.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `tool-use-and-action-boundary-design` | `crp/cap/ai/engineering/tool-use-and-action-boundary-design.md`; `crp/cap/ai/engineering/tool-use-and-action-boundary-design.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `function-deduplication` | `crp/cap/analysis/organization/function-deduplication.md`; `crp/cap/analysis/organization/function-deduplication.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `function-extraction` | `crp/cap/analysis/organization/function-extraction.md`; `crp/cap/analysis/organization/function-extraction.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `function-ownership-allocation` | `crp/cap/analysis/organization/function-ownership-allocation.md`; `crp/cap/analysis/organization/function-ownership-allocation.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `value-stream-organization-design` | `crp/cap/analysis/organization/value-stream-organization-design.md`; `crp/cap/analysis/organization/value-stream-organization-design.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `comparison-dimension-discipline` | `crp/cap/analysis/role-assessment/comparison-dimension-discipline.md`; `crp/cap/analysis/role-assessment/comparison-dimension-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `evidence-typing-discipline` | `crp/cap/analysis/role-assessment/evidence-typing-discipline.md`; `crp/cap/analysis/role-assessment/evidence-typing-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `fact-interpretation-separation` | `crp/cap/analysis/role-assessment/fact-interpretation-separation.md`; `crp/cap/analysis/role-assessment/fact-interpretation-separation.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `statement-extraction-rigor` | `crp/cap/analysis/role-assessment/statement-extraction-rigor.md`; `crp/cap/analysis/role-assessment/statement-extraction-rigor.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `ambiguity-detection` | `crp/cap/analysis/specification/ambiguity-detection.md`; `crp/cap/analysis/specification/ambiguity-detection.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `contradiction-detection` | `crp/cap/analysis/specification/contradiction-detection.md`; `crp/cap/analysis/specification/contradiction-detection.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `overlap-detection` | `crp/cap/analysis/specification/overlap-detection.md`; `crp/cap/analysis/specification/overlap-detection.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `semantic-conflict-detection` | `crp/cap/analysis/specification/semantic-conflict-detection.md`; `crp/cap/analysis/specification/semantic-conflict-detection.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `application-integration-architecture` | `crp/cap/architecture/domain/application-integration-architecture.md`; `crp/cap/architecture/domain/application-integration-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `business-service-architecture` | `crp/cap/architecture/domain/business-service-architecture.md`; `crp/cap/architecture/domain/business-service-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `data-governance-architecture` | `crp/cap/architecture/domain/data-governance-architecture.md`; `crp/cap/architecture/domain/data-governance-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `segment-architecture-stewardship` | `crp/cap/architecture/domain/segment-architecture-stewardship.md`; `crp/cap/architecture/domain/segment-architecture-stewardship.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `technology-platform-architecture` | `crp/cap/architecture/domain/technology-platform-architecture.md`; `crp/cap/architecture/domain/technology-platform-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `architecture-practice-leadership` | `crp/cap/architecture/enterprise/architecture-practice-leadership.md`; `crp/cap/architecture/enterprise/architecture-practice-leadership.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `capability-map-governance` | `crp/cap/architecture/enterprise/capability-map-governance.md`; `crp/cap/architecture/enterprise/capability-map-governance.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `enterprise-architecture-integration` | `crp/cap/architecture/enterprise/enterprise-architecture-integration.md`; `crp/cap/architecture/enterprise/enterprise-architecture-integration.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `togaf-adm-discipline` | `crp/cap/architecture/enterprise/togaf-adm-discipline.md`; `crp/cap/architecture/enterprise/togaf-adm-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `architecture-compliance-review` | `crp/cap/architecture/governance/architecture-compliance-review.md`; `crp/cap/architecture/governance/architecture-compliance-review.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `archimate-cross-layer-consistency` | `crp/cap/architecture/modeling/archimate-cross-layer-consistency.md`; `crp/cap/architecture/modeling/archimate-cross-layer-consistency.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `archimate-viewpoint-selection` | `crp/cap/architecture/modeling/archimate-viewpoint-selection.md`; `crp/cap/architecture/modeling/archimate-viewpoint-selection.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `baseline-target-gap-analysis` | `crp/cap/architecture/solution/baseline-target-gap-analysis.md`; `crp/cap/architecture/solution/baseline-target-gap-analysis.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `solution-realization-architecture` | `crp/cap/architecture/solution/solution-realization-architecture.md`; `crp/cap/architecture/solution/solution-realization-architecture.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `transition-architecture-planning` | `crp/cap/architecture/solution/transition-architecture-planning.md`; `crp/cap/architecture/solution/transition-architecture-planning.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `abstraction-boundary-discipline` | `crp/cap/engineering/principles/abstraction-boundary-discipline.md`; `crp/cap/engineering/principles/abstraction-boundary-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `architecture-decision-rigor` | `crp/cap/engineering/principles/architecture-decision-rigor.md`; `crp/cap/engineering/principles/architecture-decision-rigor.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `change-impact-analysis` | `crp/cap/engineering/principles/change-impact-analysis.md`; `crp/cap/engineering/principles/change-impact-analysis.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `composition-over-subtyping` | `crp/cap/engineering/principles/composition-over-subtyping.md`; `crp/cap/engineering/principles/composition-over-subtyping.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `domain-modeling-rigor` | `crp/cap/engineering/principles/domain-modeling-rigor.md`; `crp/cap/engineering/principles/domain-modeling-rigor.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `functional-error-modeling` | `crp/cap/engineering/principles/functional-error-modeling.md`; `crp/cap/engineering/principles/functional-error-modeling.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `immutability-by-default` | `crp/cap/engineering/principles/immutability-by-default.md`; `crp/cap/engineering/principles/immutability-by-default.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `interface-contract-first` | `crp/cap/engineering/principles/interface-contract-first.md`; `crp/cap/engineering/principles/interface-contract-first.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `side-effect-boundary-discipline` | `crp/cap/engineering/principles/side-effect-boundary-discipline.md`; `crp/cap/engineering/principles/side-effect-boundary-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `clarification-before-guessing` | `crp/cap/foundation/clarification-before-guessing.md`; `crp/cap/foundation/clarification-before-guessing.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `critical-peer-discipline` | `crp/cap/foundation/critical-peer-discipline.md`; `crp/cap/foundation/critical-peer-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `deterministic-reasoning` | `crp/cap/foundation/deterministic-reasoning.md`; `crp/cap/foundation/deterministic-reasoning.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `task-understanding-confirmation` | `crp/cap/foundation/task-understanding-confirmation.md`; `crp/cap/foundation/task-understanding-confirmation.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `portfolio-prioritization` | `crp/cap/strategy/analysis/portfolio-prioritization.md`; `crp/cap/strategy/analysis/portfolio-prioritization.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `strategy-diagnosis` | `crp/cap/strategy/analysis/strategy-diagnosis.md`; `crp/cap/strategy/analysis/strategy-diagnosis.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `strategy-narrative-structure` | `crp/cap/strategy/analysis/strategy-narrative-structure.md`; `crp/cap/strategy/analysis/strategy-narrative-structure.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `decision-structuring-discipline` | `crp/cap/strategy/delivery/decision-structuring-discipline.md`; `crp/cap/strategy/delivery/decision-structuring-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `strategic-fit` | `crp/cap/strategy/evaluation/strategic-fit.md`; `crp/cap/strategy/evaluation/strategic-fit.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `cadence-and-review-discipline` | `crp/cap/strategy/goal-management/cadence-and-review-discipline.md`; `crp/cap/strategy/goal-management/cadence-and-review-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `goal-cascade-and-alignment` | `crp/cap/strategy/goal-management/goal-cascade-and-alignment.md`; `crp/cap/strategy/goal-management/goal-cascade-and-alignment.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `goal-quality-discipline` | `crp/cap/strategy/goal-management/goal-quality-discipline.md`; `crp/cap/strategy/goal-management/goal-quality-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `okr-discipline` | `crp/cap/strategy/goal-management/okr-discipline.md`; `crp/cap/strategy/goal-management/okr-discipline.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `decision-gates` | `crp/cap/strategy/governance/decision-gates.md`; `crp/cap/strategy/governance/decision-gates.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `kpi-system` | `crp/cap/strategy/metrics/kpi-system.md`; `crp/cap/strategy/metrics/kpi-system.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `technical-output-validation` | `crp/cap/strategy/operation/technical-output-validation.md`; `crp/cap/strategy/operation/technical-output-validation.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |
| `interaction-contract` | `crp/cap/strategy/workflow/interaction-contract.md`; `crp/cap/strategy/workflow/interaction-contract.meta.yaml` | [Capability Coverage Matrix](capability-coverage.md) |

### Corpus navigation and placeholder files

| Current source members | Disposition | Exact target or rationale |
| --- | --- | --- |
| `crp/cap/index.md`; `crp/cap/ai/index.md`; `crp/cap/ai/architecture/index.md`; `crp/cap/ai/consulting/index.md`; `crp/cap/ai/engineering/index.md`; `crp/cap/analysis/index.md`; `crp/cap/architecture/index.md`; `crp/cap/engineering/index.md`; `crp/cap/foundation/index.md`; `crp/cap/strategy/index.md` | Split and revise | Human Corpus orientation is consolidated in `mod/corpus/README.md`; machine inventory is derived from the authoritative Capability metadata into `mod/corpus/catalog.yaml`. Old indexes are not copied as parallel authorities. |
| `crp/cap/ai/architecture/modeling/.gitkeep` | Reject | Empty placeholder with no Capability or taxonomy semantics. The target creates a directory only when an admitted Capability requires it. |

## Cross-artifact assumptions

| Assumption | Evidence | Risk if wrong | Control |
| --- | --- | --- | --- |
| The preserved snapshot and #96 contain the complete former sandbox source set relevant to #83. | Nine-file manifest verified 9/9 in #96 | A removed idea could be absent from the matrix. | Re-run the immutable `git ls-tree` manifest and compare every path/hash before #84. |
| R-11--R-15 accepted decisions supersede contradictory candidate statements in the old design. | Closed #82, #86, #87, #88, and #89 records | A historical candidate could be mistaken for target authority. | Every conflicting old section is explicitly marked `Revise`, `Replace`, or `Reject`; `decision-trace.md` owns decision precedence. |
| The companion Capability matrix is complete and stable. | Coordinated #83 artifact contract | This matrix could prove file coverage while a Capability lacks a semantic disposition. | #83 cannot pass unless the companion matrix covers all 70 IDs and 140 pair files with exact targets. |
| Exact storage bindings are resolved in the normative architecture. | Accepted R-14 logical/physical-storage refinement | Fixed `records/generated/local` paths could accidentally become universal defaults. | This matrix names semantic classes; `README.md` must define explicit active bindings and no inferred fallback. |

The dominant Greenfield assumption is challenged directly: a clean target does
not mean that current structure is valueless. The selected approach retains
semantic decisions, examples, contracts, and unresolved ideas at their proper
owners while rejecting legacy path authority. A blank tree without this ledger
would be clean but not demonstrably lossless.

## Risks and impact notes

| Risk | Severity | Impact | Control |
| --- | --- | --- | --- |
| Cross-document target-path drift | High | A source could appear disposed while its target does not exist in the normative tree. | #84 must compare every exact target here with `README.md`; conflicting paths block. |
| Capability decision duplication | High | Two matrices could disagree on adopt/revise/merge outcomes. | `capability-coverage.md` is explicitly the sole per-Capability authority; this file owns only source-file coverage. |
| Section-level loss inside large mixed drafts | Medium | A file-level move could omit an accepted subsection. | `xxx/DESIGN.md`, `xxx/USER.md`, and each mixed PBL have section/concept rows rather than one undifferentiated move. |
| Deferred concepts disappear operationally | Medium | `ask`, lifecycle feedback, context budgets, or advanced type-level proof research could be forgotten. | Each deferred concept has a named rationale and, where accepted, an existing Issue such as #96 or #72; accepted runtime matching/composition architecture remains authoritative in #83 and no placeholder target structure is created. |
| Historical branch or GitHub evidence becomes unavailable | Medium | Source reconstruction would become harder. | Immutable commit hashes, SHA-256 manifests, and #96's verified verbatim copies provide independent lookup keys. |
| A later cut interprets `Revise` as a mechanical move | High | Legacy authority and obsolete content could enter the target. | This document explicitly grants no move/delete authority; later work must materialize reviewed target content and verify it before deleting any source. |
| Host-local data leaks into declarations | High | Secrets or non-portable state enter Git. | Global hook, credentials, Keychain topic, and absolute paths have no declarative repository target; host setup is separate explicit plan/apply. |

The eventual Greenfield cut has broad impact across agent discovery, governance
routing, package paths, Corpus tooling, CI, documentation links, project entry,
host adapters, and external consumers. This matrix does not sequence or
authorize that work. A later cut must be atomic at each owned aggregate,
preserve recoverability, and prove target completeness before source removal.

## Verification contract and current result

The following checks are required for this artifact:

```sh
# Preserved snapshot count and tree digest
git ls-tree -r --name-only e75c2fbbac5b12c7c7c44359366d8ae4de568e0e -- xxx README.md | wc -l
git ls-tree -r e75c2fbbac5b12c7c7c44359366d8ae4de568e0e -- xxx README.md | shasum -a 256

# Current tracked counts
git ls-files adm | wc -l
git ls-files crp/agn | wc -l
git ls-files crp/cap | wc -l
git ls-files crp/gov | wc -l
git ls-files .github | wc -l
git ls-files .codex | wc -l
git ls-files AGENTS.md | wc -l

# Capability pair completeness
find crp/cap -type f -name '*.meta.yaml' | wc -l

# Root facade mode and current target
git ls-files -s AGENTS.md
readlink AGENTS.md

# Documentation integrity
git diff --check
```

Current result at authoring time:

- preserved snapshot: `9` files; tree-manifest digest
  `dee29942a41a8909fbbdb22593a778b725c5b974e10fe82ad9bf71289b49b5c9`;
- current tracked scopes: `13 + 1 + 151 + 14 + 10 + 0 + 1 = 190` files;
- Capability metadata files: `70`, each paired with a Markdown source in the
  inventory above;
- current root facade is a tracked symbolic link, temporarily targeting
  `.github/agents/ai4x.agent.md`; its accepted target disposition is explicitly
  `.ai4x/BEHAVIOR.md`;
- no `.codex/**` source currently exists; all required Codex surfaces are
  explicitly dispositioned above;
- `git diff --check`: pass after authoring.

## Co-author evidence and verdict

Independent co-author scope: lossless information disposition and Greenfield
target placement. Write authority was restricted to this file. Target paths
were coordinated with the architecture lead and Capability-matrix co-author;
the current repository, accepted Issues, #96 manifest, and immutable sandbox
snapshot were inspected read-only.

**Co-author verdict: `pass` for information-disposition completeness, subject
to cross-artifact review.** This is not architecture self-approval. Issue #84
must independently verify path coherence, source coverage, and decision
precedence before Issue #85 PO acceptance.
