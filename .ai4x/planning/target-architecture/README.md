# Reboot Target Architecture Transformation Pack

## Status and authority

This is the transitional transformation pack for Issue #120. It curates the
accepted Reboot architecture and preserved evidence onto the authorized `trunk`
base without copying a historical tree or granting deletion authority.

GitHub Issues and the project board remain the authority for work state. This
workspace is not part of the permanent ai4X standard. It exists only until its
durable architecture, evidence, and follow-up obligations have been promoted to
their final owners.

The five artifacts have disjoint responsibilities:

| Artifact | Sole responsibility |
| --- | --- |
| `README.md` | Human entry point, authority boundary, and transformation contract |
| `target-structure.yaml` | Sole machine-readable destination-tree and skeleton authority |
| `capability-coverage.md` | Sole per-Capability preservation, disposition, and exact-target matrix |
| `information-disposition.md` | Complete source-variant and semantic-disposition ledger |
| `decision-trace.md` | Accepted/rejected decisions, evidence bindings, and open follow-ups |

No artifact in this pack authorizes product implementation, Capability admission,
source deletion, facade generation, branch cleanup, or a historical merge.

## Immutable inputs

| Source | Revision or digest | Use |
| --- | --- | --- |
| Preserved #112 final state | `5b9ba632b3d9af82f1eb63ca969deda40f4d9387` | Read-only provenance and source variants |
| Accepted #83 Target Architecture | `2632207f834bcddf5fd57240d5eec87574208a51` | Semantic target baseline |
| R15 comparison and evidence | `74bc0dfd9cf51f1f2263a4a3fa2bc62833f65d8d` | Concrete declarations, graphs, cases, and bounded observations |
| Authorized integration base | `b2c6ca96930def7477f91f648b8f85e6f24275b8` | Current repository authority |
| Requirements v7 | `0f77c6d29f8e22cfd0b117d7f5b0d7dd66c607d3d145d49529f3960b93e45ce2` | Accepted #120 behavior and acceptance criteria |
| Architecture v4 | `5cd08b895cc9ec2f6b672051daf946a5c6087eec73db847e955e68145710fd6a` | Current architecture boundaries and invariants |
| Stage-5 evidence | `5d5039884b3e76cfc486138ef55a29c8c0a3d3b11cc82cc2d572c8c4397b7417` | Measured resource-only AI strategy |
| Capability matrix v2 | `20104569187c1820b0d900f08993caefce862c5b8ad466b0289e1baa72d1abb5` | Stage-6 reviewed 30/40 portfolio disposition |

The four Git revisions form 330 unique paths and 347 distinct
`(path, mode, blob)` variants. The authorized base contributes a complete
256-file current baseline. `information-disposition.md` records every variant
exactly once and enumerates every contributing revision for byte-identical
tuples.

## Accepted destination

The Greenfield root vocabulary is exactly:

```text
./
|-- .ai4x/       canonical Project Memory and project declarations
|-- .github/     tracked GitHub integration facades
|-- .codex/      tracked Codex project facade
|-- AGENTS.md    tracked regular Codex discovery facade
|-- src/         complete versioned product sources and reusable assets
|-- doc/         human documentation and evidence
|-- util/        repository development and verification utilities
|-- README.md
|-- CONTRIBUTING.md
|-- LICENSE
`-- Makefile
```

There are no compatibility aliases for `mod/`, `utl/`, `adm/`, `crp/`, `acc/`,
`cli/`, or `xxx/`. Their useful semantics are assigned to durable owners before
any later deletion. Exact destination paths, semantic owners, information
classes, materialization policies, and implementing Issues are declared only in
`target-structure.yaml`.

## Authority and AI-loading boundaries

- Dhall is the sole project-authoring authority.
- Product Haskell owns closed semantics, validation, graph algorithms,
  diagnostics, and inert publication.
- `BEHAVIOR.md` owns common constitution, authority precedence, startup, and
  task-class navigation only.
- Per-Agent `composition.dhall` files own reusable cognitive composition only.
- Collaboration owns Team, Participant, role, topology, routing, delegation,
  handoff, review, consultation, notification, and escalation facts.
- Work Management owns work types, lifecycle, stages, and flow.
- Host facades are tracked, bounded discovery surfaces and never semantic
  authority. Codex is the sole measured v1 AI host.

Activation uses progressive disclosure: root discovery, canonical behavior
navigation, one accepted Participant manifest, exact shared selected Capability
snapshots, and then task-authorized context. The authoritative 70-Capability
Corpus is never traversed during ordinary activation.

Stage-5 evidence accepts `resource-only` operation. File and UTF-8 byte limits,
privacy, fail-closed publication, no silent truncation, and preservation of the
last accepted generation remain mandatory. Tokens are unavailable and monetary
cost is unknown until a compatible measurement boundary exists. Optional usage
measurement and monetary control are deferred to #124.

## Self-application and proportionality

ai4X applies the same public Project Entry, declaration, Intent/Curation,
Collaboration/Work, validation/Assurance, activation, Handoff, and governance
contracts to its own repository. The only bootstrap exception is obtaining the
initial trusted executable and immutable product assets. Bootstrap cannot author
project semantics, waive validation, issue evidence, or accept a gate.

Each implementation Story must deliver a compiling, verified vertical slice.
Package dependencies follow the acyclic target graph; no reverse dependency,
sibling aggregate access, mega-AST, or global validator is permitted. Graph work
is linear or ordered-linear in reachable nodes/edges, and activation work is
proportional to the Assignment-reachable slice rather than the whole Corpus.

Portable record size/count limits are not inferred from the AI context fixture.
They require separate retention evidence and an independently versioned policy;
until then no portable-record placeholder limit is claimed.

## Capability preservation boundary

All 70 current Markdown/metadata pairs remain protected by `crp/cap` tree OID
`ec6872d46ef1939557eac699abb24888a3a24e8f`. The reviewed successor matrix maps
each stable identity to exactly one future triplet:

```text
src/corpus/capabilities/<semantic-category...>/<capability-id>/
|-- CAPABILITY.md
|-- capability.meta.yaml
`-- contract.dhall
```

The reviewed distribution is 30 `adopt` and 40 `revise`. Preservation is not
admission. #120 creates no Capability target package and no empty
`contract.dhall`. #103 owns schema/decoder alignment, formal signatures,
validation, semantic review, admission, and catalogue derivation.

Formal compatibility, semantic fitness, and governance acceptance are distinct.
The future `Need a`/type-inhabitation research remains bounded follow-up evidence;
it is not overclaimed as an existing proof.

## Controlled skeleton

The manifest declares 30 durable `planned-skeleton` directories. A `.gitkeep`
is materialized only when such a directory otherwise lacks authoritative tracked
content. Four declared directories already contain authoritative files at the
authorized base or in this pack: `.ai4x/`, `.github/`, `.github/workflows/`, and
`doc/`. Therefore the derived Stage-7 skeleton contains 26 `.gitkeep` files, not
30. This is an explicit content-sensitive rule, not a manifest mismatch.

The skeleton conveys location only. It creates no empty Haskell package,
Capability triplet, host facade or adapter, generated/local/session tree,
external-store tree, or unsupported Copilot surface.

## Exit contract

Before the Greenfield rebuild completes:

1. durable architecture descriptions and decisions move to `doc/architecture/`;
2. required evidence moves to `doc/architecture/evidence/reboot-curation/` or its
   more specific durable owner;
3. every unfinished obligation exists as a GitHub Issue and board item;
4. recovery and final source-disposition evidence are independently verified;
5. the entire `.ai4x/planning/target-architecture/` workspace is removed.

No source or preservation branch is deleted by this pack. A later deletion
requires the exact pre-cut commit, complete manifests and digests, verified
recovery through final `trunk` ancestry, and explicit ai4X-scoped PO approval.
