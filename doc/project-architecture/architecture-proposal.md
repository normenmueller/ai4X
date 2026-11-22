# ai4X Target Architecture

**Status:** Proposed target design for PO discussion under `#eyodf`

**Scope:** GitHub Issue #81, Architecture synthesis

**Authority:** Design only. This document does not authorize implementation, migration, GitHub mutation, repository moves, or changes outside `xxx/`.

**Basis:** Issue #81 snapshot and the PO-accepted review synthesis of 2026-08-06.

## 1. Purpose

This document defines the smallest coherent target architecture in which ai4X consumes its own host-agnostic memory and corpus, produces inspectable project artifacts, and exposes those artifacts through host-specific facades.

The design separates seven bounded contexts:

1. Project Memory
2. ACE Corpus
3. CLI
4. GitHub Facade
5. Repository Engineering
6. GitHub Issues and Project
7. Documentation and Publication

It also defines their authority, integration contracts, lifecycle, migration impact, and validation criteria.

## 2. Design Principles

1. **One owner per fact.** Derived artifacts may be committed for discovery, but never become semantic authorities.
2. **Host-agnostic core, host-specific edge.** `.ai4x/` and `mod/crp/` do not depend on GitHub, Copilot, or another agent host.
3. **Explicit behavior.** Commands, write intent, runtime selection, configuration provenance, conflicts, and errors are observable. No behavior depends on an undocumented fallback.
4. **Determinism first.** Validation, resolution, rendering, and host materialization are deterministic. LLM use is confined to semantic interviewing and curation.
5. **Progressive disclosure.** Core Memory routes agents to only the governance and operations contracts required by the current task.
6. **Fresh target state.** Legacy paths inform migration but do not constrain the target model.
7. **Corpus independence.** The CLI consumes the Corpus through a language-neutral port. The Corpus neither imports CLI code nor owns ai4X project workflow.
8. **Repository autarky.** Runtime links resolve only to project-local generated artifacts. A checkout never requires a parent workspace or foreign symlink.
9. **GitHub authority is not memory.** Issues own promoted work contracts; the Project owns workflow status and PO ordering; `STATE.md` owns only the current local handoff.
10. **Design before migration.** All target-state discussion remains in `xxx/` until separately approved and authorized.

## 3. Assumptions and Ubiquitous Language

- The product name is **ai4X**; the CLI, paths, and machine identifiers use lowercase `ai4x`.
- A **Project Memory** is the canonical `.ai4x/` agent-facing memory and product-output surface of one project.
- **Core Memory** is exactly `BEHAVIOR.md`, `CONTEXT.md`, and `STATE.md`.
- A **Need Specification** is the stable, reviewable `scout` output under `spc/`.
- A **Team Declaration** is the `curate` aggregate under `agn/`: mapping, collaboration topology, agent compositions, and pinned Corpus lineage.
- A **Runtime Adapter** is generated, host-specific output under `.ai4x/runtime/hosts/`.
- A **Facade** is a host discovery surface such as `.github/` or root `AGENTS.md`; it does not own agent behavior.
- A **Corpus Port** is the read-only, language-neutral manifest contract through which the CLI consumes an ACE Corpus.
- **Promoted work** is work admitted to a GitHub Issue. Local drafts are not backlog records.

## 4. Context Boundaries and Authority

### 4.1 Bounded contexts

| Bounded context | Responsibility | Owned aggregate or authority | Integration points |
| --- | --- | --- | --- |
| Project Memory | Durable agent behavior, durable project understanding, volatile handoff, project governance routing, and project-local ai4X outputs | One Project Memory rooted at `.ai4x/` | Read and written by CLI commands; referenced by generated host adapters |
| ACE Corpus | Provider lifecycle and reusable cognitive capabilities, reference agents, and collaboration topologies | One versioned Corpus release rooted at `mod/crp/` | Exposes the Corpus Port; never imports CLI or project workflow |
| CLI | Command parsing, configuration resolution, semantic orchestration, validation, and deterministic materialization | A command invocation and its explicit result | Reads Project Memory and Corpus Port; writes only declared project outputs |
| GitHub Facade | GitHub/Copilot discovery, Issue forms, and CI entry | `.github/` regular files | Generated stubs point inward; maintained workflow calls `utl/verify.sh` |
| Repository Engineering | Build, tests, packaging, local checks, and verification composition | Repository verification contract | `utl/verify.sh`, `Makefile`, and `mod/cli` |
| GitHub Issues and Project | Promoted change contracts, admission, dependencies, reviews, closure; workflow status and PO ordering | GitHub Issues for work contracts; GitHub Project for status/order | Project governance describes interaction but does not mirror remote state |
| Documentation and Publication | Human documentation, architecture records, accessible figures, and publication assets | Authored sources in `README.md`, `doc/`, and `acc/` | Generated media are checked against sources; no product/runtime authority |

### 4.2 Authority and ownership matrix

| Statement class | Sole authority | Allowed dependent representation |
| --- | --- | --- |
| Agent operating behavior and task routing | `.ai4x/BEHAVIOR.md` | Runtime adapters and facade stubs |
| Durable ai4X project purpose, terminology, repository map, and architecture summary | `.ai4x/CONTEXT.md` | Human documentation and runtime adapters |
| Current local objective, authorization, dirty scope, gate pointer, and next action | `.ai4x/STATE.md` | A fresh-agent briefing only |
| ai4X project planning, quality, and execution rules | `.ai4x/governance/` and `.ai4x/operations/` | Routed runtime content |
| Capability, reference-agent, and topology content | Versioned `mod/crp/` release | Team Declarations and generated adapters pinned by digest |
| Corpus admission and provider lifecycle | `mod/crp/gov/` | Corpus release evidence |
| CLI behavior and config interpretation | CLI contracts and implementation in `mod/cli/` | CLI documentation and tests |
| Promoted backlog, change contract, dependencies, review evidence, open/closed state | GitHub Issues | Links and short current pointers in `STATE.md` |
| Workflow status and PO ordering | GitHub Project | Current status pointer in `STATE.md`, marked observed-at |
| GitHub host discovery | `.github/` facade contract | Generated committed stubs |
| Verification evidence | Tests and subject-bound evidence records | Gate status pointers; never semantic ownership |
| Human product explanation | `README.md` and `doc/` by documented subject | Publication outputs |
| Diagram meaning | Authored Markdown/TikZ source | Generated PNG/PDF/SVG |

Conflict resolution occurs in the owning source. A lower-authority projection never repairs a conflict.

### 4.3 Aggregate boundaries

- **Project Memory aggregate:** Core Memory, routing contracts, `spc/`, `agn/`, drafts/evidence when justified, and generated runtime adapters. A command validates the aggregate boundary before any write.
- **Team Declaration aggregate:** `mapping.yaml`, `collabm.yaml`, all agent declarations, and one lineage record. It is accepted or rejected as a unit; partial activation is prohibited.
- **Corpus Release aggregate:** `VERSION`, `manifest.yaml`, all referenced content, and Corpus governance evidence. A manifest cannot reference content outside its release root.
- **Host Materialization aggregate:** one host directory under `.ai4x/runtime/hosts/<host-id>/` plus its facade projections. A failed generation must not leave mixed generations.

### 4.4 Key invariants

1. `.ai4x` is canonical. `.ai4X` and `.ai4x` existing together is a hard error on every filesystem.
2. `BEHAVIOR.md`, `CONTEXT.md`, and `STATE.md` have disjoint lifetimes and ownership.
3. There is no authoritative `ctx/`; project context is owned only by `CONTEXT.md` and routed contracts.
4. GitHub Issues and the Project are never reconstructed in `STATE.md`.
5. CLI dependencies point `mod/cli -> Corpus Port -> mod/crp`; no reverse dependency exists.
6. Generated runtime and facade artifacts identify their source generation and are reproducible from pinned inputs.
7. `.github/agents/*.agent.md` are regular files, never symlinks.
8. Root `AGENTS.md` resolves only to `.ai4x/runtime/hosts/copilot-cli/AGENTS.md`.
9. `spawn` is mechanical: identical normalized inputs and adapter version produce byte-identical output.
10. Runtime links never target `mod/crp/`, another repository, a home-directory cache, or an absolute external path.
11. `utl/verify.sh` is the only canonical repository-wide verification entry point.
12. Corpus governance contains no ai4X project backlog, board policy, or project delivery workflow.

## 5. Recommended Architecture and Alternatives

### Option A - Integrated Project Memory with independent in-repository modules

Keep Project Memory at `.ai4x/`, group implementation and provider under `mod/cli/` and `mod/crp/`, consume the Corpus through a manifest-based port, and generate host adapters into `.ai4x/runtime/`.

**Benefits:** one autarkic checkout, clear dependency direction, direct `#eyodf`, atomic repository verification, and no premature distribution mechanism.

**Costs:** repository moves have broad path impact; independent Corpus release discipline must be enforced inside a monorepo.

### Option B - Separate Corpus repository or package immediately

Keep `mod/cli/` here and consume an externally released Corpus by URI/package plus digest.

**Benefits:** strongest organizational independence and independent release cadence.

**Costs:** introduces acquisition, offline, trust, release, and multi-repository coordination concerns before the port has proven stable.

### Recommendation

Adopt **Option A**. It creates a real boundary without premature distribution. The Corpus Port deliberately permits Option B later without changing CLI domain behavior.

### Rejected alternatives

| Alternative | Rationale for rejection |
| --- | --- |
| Keep flat root `cli/` and `crp/` with informal coupling | Directory proximity is not the main defect; the missing port and ownership contract are. Retaining the flat model would preserve ambiguous governance. |
| Make `.ai4X` canonical | Case variants are ambiguous on macOS and distinct on Linux; lowercase aligns with the CLI and machine conventions. |
| Retain authoritative `.ai4x/ctx/` beside `CONTEXT.md` | Two project-context authorities will drift and defeat progressive loading. Routed governance/operations already provide structured detail. |
| Symlink `.github/agents/` to canonical agent files | GitHub/Copilot discovery and transport do not reliably treat symlinked definitions as regular agent files; it also leaks storage layout into the host boundary. |
| Copy all `adm/` into `.ai4x/operations/` | Artifact semantics differ. Backlog drafts, glossary terms, board rules, and development contracts require distinct owners and dispositions. |
| Keep ai4X project workflow in `mod/crp/gov/` | It makes the provider depend on one consumer's delivery process and prevents independent Corpus governance. |
| Let `memory prompt` write Core Memory directly | The initial service would mix prompt transfer with high-impact project mutation and conceal fresh-agent judgment. |
| Add all O2I utility domains | Haskell, model, and licensing utility directories are not justified merely by precedent. Utilities follow demonstrated ai4X verification needs. |

**Challenge to Option A:** A monorepo can conceal coupling despite separate directories. The design therefore treats reverse-import checks, manifest-only fixtures, and independent Corpus versioning as release gates rather than relying on directory names.

## 6. Canonical Target File Tree

Markers describe target roles, not present implementation state. Pattern entries such as `<name>` describe a closed artifact class. Optional directories are created only when their admission rule is met.

```text
ai4X/                                                     [dir]
|-- .ai4x/                                                [dir]
|   |-- config.yaml                                       [file]
|   |-- BEHAVIOR.md                                       [file]
|   |-- CONTEXT.md                                        [file]
|   |-- STATE.md                                          [file]
|   |-- governance/                                       [dir]
|   |   |-- index.yaml                                    [file]
|   |   |-- glossary.md                                   [file]
|   |   |-- board-policy.md                               [file]
|   |   |-- planning-workflow.md                          [file]
|   |   `-- planning-conformance.md                       [file]
|   |-- operations/                                       [dir]
|   |   |-- development-workflow.md                       [file]
|   |   |-- development-conformance.md                    [file]
|   |   |-- development-conformance-template.md           [file]
|   |   |-- publication.md                                [file]
|   |   `-- quality/                                      [dir]
|   |       |-- ai-strategy-quality.md                    [file]
|   |       |-- architecture-quality.md                   [file]
|   |       |-- engineering-quality.md                    [file]
|   |       |-- implementation-quality.md                 [file]
|   |       |-- requirements-quality.md                   [file]
|   |       |-- review-quality.md                         [file]
|   |       |-- testing-quality.md                        [file]
|   |       `-- typescript-quality.md                     [file]
|   |-- spc/                                              [dir]
|   |   |-- AI4X/Spc.hs                                   [file]
|   |   `-- Needs.hs                                      [file]
|   |-- agn/                                              [dir]
|   |   |-- mapping.yaml                                  [file]
|   |   |-- collabm.yaml                                  [file]
|   |   |-- lineage.yaml                                  [file]
|   |   `-- agents/                                       [dir]
|   |       `-- <agent-name>.yaml                         [file]
|   |-- drafts/                                           [dir] (optional)
|   |   `-- capabilities/                                 [dir]
|   |       `-- <draft-id>/                               [dir]
|   |           |-- capability.md                         [file]
|   |           `-- proposal.yaml                         [file]
|   |-- evidence/                                         [dir] (optional)
|   |   `-- <gate-id>--<subject-digest>.md                [file]
|   `-- runtime/                                          [dir]
|       |-- manifest.yaml                                 [generated]
|       `-- hosts/                                        [dir]
|           |-- copilot-cli/                              [dir]
|           |   `-- AGENTS.md                             [generated]
|           `-- github-copilot/                           [dir]
|               |-- copilot-instructions.md               [generated]
|               `-- agents/                               [dir]
|                   `-- <agent-name>.md                   [generated]
|-- .github/                                              [dir]
|   |-- agents/                                           [dir]
|   |   |-- ai4x.agent.md                                 [generated] [stub]
|   |   `-- ai4x-<specialist>.agent.md                    [generated] [stub]
|   |-- ISSUE_TEMPLATE/                                   [dir]
|   |   |-- config.yml                                    [file]
|   |   |-- framework-change.yml                          [file]
|   |   `-- maintenance.yml                               [file]
|   |-- workflows/                                        [dir]
|   |   `-- verify.yml                                    [file]
|   `-- copilot-instructions.md                           [generated] [stub]
|-- AGENTS.md                                             [symlink -> .ai4x/runtime/hosts/copilot-cli/AGENTS.md]
|-- acc/                                                  [dir]
|   |-- tikz/                                             [dir]
|   |   |-- ai4x-style.tex                                [file]
|   |   `-- <figure-id>.tex                               [file]
|   |-- img/                                              [dir]
|   |   `-- <figure-id>.<png|svg>                         [generated]
|   `-- publication.yaml                                  [file]
|-- doc/                                                  [dir]
|   |-- agn/                                              [dir]
|   |   `-- README.md                                     [file]
|   |-- arc/                                              [dir]
|   |   |-- README.md                                     [file]
|   |   `-- <architecture-record>.md                      [file]
|   |-- usr/                                              [dir]
|   |   `-- README.md                                     [file]
|   `-- visual-language.md                                [file]
|-- mod/                                                  [dir]
|   |-- cli/                                              [dir]
|   |   |-- README.md                                     [file]
|   |   |-- package.json                                  [file]
|   |   |-- package-lock.json                             [file]
|   |   |-- tsconfig.json                                 [file]
|   |   |-- cmp/                                          [dir]
|   |   |-- src/                                          [dir]
|   |   |   |-- app/                                      [dir]
|   |   |   `-- lib/                                      [dir]
|   |   `-- tst/                                          [dir]
|   `-- crp/                                              [dir]
|       |-- README.md                                     [file]
|       |-- VERSION                                       [file]
|       |-- manifest.yaml                                 [file]
|       |-- cap/                                          [dir]
|       |   `-- <capability-id>/                           [dir]
|       |-- agn/                                          [dir]
|       |   `-- <reference-agent-id>/                     [dir]
|       |-- top/                                          [dir]
|       |   `-- <topology-id>.yaml                        [file]
|       `-- gov/                                          [dir]
|           |-- ownership.md                              [file]
|           |-- admission.md                              [file]
|           |-- lifecycle.md                              [file]
|           |-- capability-authoring-governance.md        [file]
|           `-- capability-sweep.md                       [file]
|-- utl/                                                  [dir]
|   |-- verify.sh                                         [file]
|   |-- verification/                                     [dir]
|   |   `-- <verification-check>                          [file]
|   |-- gh/                                               [dir]
|   |   |-- RUNBOOK.md                                    [file]
|   |   `-- <github-maintenance-tool>                     [file]
|   `-- paper/                                            [dir]
|       |-- render-paper-figures.sh                       [file]
|       `-- check-paper-assets.py                         [file]
|-- xxx/                                                  [dir]
|   |-- DESIGN.md                                         [file]
|   |-- USER.md                                           [file]
|   |-- README.md                                         [file]
|   `-- .ai4x/                                            [dir]
|       `-- config.yaml                                   [file]
|-- CHANGELOG                                             [file]
|-- CODE_OF_CONDUCT.md                                    [file]
|-- CONTRIBUTING.md                                       [file]
|-- INSTALL                                               [file]
|-- LICENSE                                               [file]
|-- Makefile                                              [file]
|-- README.md                                             [file]
|-- SCRATCH.md                                            [file]
`-- SECURITY.md                                           [file]
```

`xxx/` remains the design sandbox; its simulated `.ai4x/` is not the repository's Project Memory. Generated runtime artifacts and facade stubs are committed only after a separately authorized implementation defines reproducible generation.

### 6.1 Specialist facade stub pattern

Every `.github/agents/<name>.agent.md` is a small generated regular file:

```markdown
---
name: ai4x-architecture-ddd
description: Principal software architecture and DDD specialist for ai4X.
---

Read and follow [canonical repository behavior](../../.ai4x/BEHAVIOR.md).
Then load the generated [host adapter](../../.ai4x/runtime/hosts/github-copilot/agents/ai4x-architecture-ddd.md).
```

The stub contains discovery metadata and links only. The generated adapter may compose pinned Corpus content and routed project contracts; neither facade file becomes authoritative.

## 7. Project Memory Artifact Contract

### 7.1 Exact purposes

| Artifact | Purpose and ownership | Mutation rule |
| --- | --- | --- |
| `.ai4x/config.yaml` | Project-local, versioned config: schema version, explicit runtime/host selections, Corpus source and expected version range, and command policy. Global and project entries replace by declared key; no deep merge. Resolution reports value provenance. | Human-maintained; commands do not silently rewrite it |
| `BEHAVIOR.md` | Canonical durable operating behavior, authority map, startup protocol, safety, and task-to-contract routing | Maintained through governed project change |
| `CONTEXT.md` | Sole durable project-context authority: purpose, domain language, stable architecture, repository map, constraints, and preferences | Maintained through governed project change |
| `STATE.md` | Volatile, compact local handoff: observed-at time, active objective, authorization, dirty scope, current gate pointer, risks, verification, and next action | Updated deliberately; never backlog, history, or sole gate evidence |
| `governance/index.yaml` | Registry and dependency graph for progressively routed Project Memory contracts | Human-maintained and deterministically validated |
| `governance/glossary.md` | ai4X project and planning terms not owned by the Corpus | Human-maintained |
| `governance/board-policy.md` | Rules for interacting with GitHub's board authority; does not mirror board data | Human-maintained |
| `governance/planning-*.md` | Idea refinement, promotion, and conformance policy | Human-maintained |
| `operations/development-*.md` | ai4X repository delivery workflow and conformance, not reusable Corpus governance | Human-maintained |
| `operations/quality/*.md` | ai4X project quality contracts routed by task class | Human-maintained |
| `operations/publication.md` | Authorship, accessibility, rendering, and freshness procedure | Human-maintained |
| `spc/AI4X/Spc.hs` | Version-pinned vocabulary required to type-check the Need Specification | CLI-distributed or generated from a named schema version |
| `spc/Needs.hs` | Stable `scout` output; semantic needs, not solution design | Written only by explicit `scout --apply`; human-reviewed |
| `agn/mapping.yaml` | Auditable Need -> Capability version -> Agent mapping and rejected candidates | Written only by explicit `curate --apply` |
| `agn/collabm.yaml` | Selected topology, role binding, delegation, handoff, escalation, and review rules | Written only by explicit `curate --apply` |
| `agn/lineage.yaml` | Corpus ID/version/digest, manifest schema, adapter schema, and generation inputs | Generated with the Team Declaration |
| `agn/agents/*.yaml` | Host-agnostic cognitive capability compositions with pinned references and constraints | Generated with the Team Declaration |
| `drafts/capabilities/` | Non-authoritative proposals when no admitted capability satisfies a Need | Optional; never read as admitted Corpus and never promoted automatically |
| `evidence/` | Stable, subject-bound acceptance attestations when GitHub or tests alone cannot preserve the required evidence | Optional; immutable identity includes gate and subject digest |
| `runtime/manifest.yaml` | Generation ID, normalized input digests, adapter versions, and complete generated-file inventory | Generated atomically by `spawn` |
| `runtime/hosts/` | Project-local host adapters; the only legal target of runtime links and facade projections | Generated by `spawn`; never hand-edited |

### 7.2 `CONTEXT.md` versus `ctx/`

The decision is to **remove `ctx/` entirely**. `CONTEXT.md` is the only durable project-context authority. Structured operating rules belong in routed `governance/` or `operations/`; team design belongs in `agn/`; runtime composition belongs in generated adapters.

This is smaller than retaining a derived projection and eliminates an unnecessary manifest/injection model. If a future host requires structured context, its representation is generated inside that host's runtime adapter from these authorities and is never named `ctx/`.

### 7.3 Memory loading

At startup an agent reads Core Memory in this order: `BEHAVIOR.md`, `CONTEXT.md`, `STATE.md`. `BEHAVIOR.md` then routes by task class to the minimum required governance and operations files. Corpus content is loaded only through the selected agent's pinned composition.

## 8. CLI Command Model

### 8.1 General command contract

- Every command validates that `.ai4x` and `.ai4X` do not coexist before project work.
- Project-oriented commands require `--project <path>`; mutation additionally requires `--apply`. Without `--apply`, mutating commands produce a plan only.
- Runtime-dependent commands require `--runtime <id>` or an explicit `defaults.runtime` entry in project config. Output reports whether the value came from the command or config.
- Existing outputs are never overwritten implicitly. The plan classifies create, unchanged, replace, conflict, and remove operations; replacement requires the command's explicit conflict policy.
- Machine result data goes to stdout only when requested by the command format. Diagnostics, provenance, warnings, and errors go to stderr.
- Parse errors exit `2`; validated domain/config conflicts exit `1`; success exits `0`. A command interrupted before atomic publication leaves the previous accepted aggregate intact.

### 8.2 Commands

| Command | Inputs | Behavior | Output and side effects |
| --- | --- | --- | --- |
| `ai4x memory prompt` | No project input; selects the one bundled, version-identified Core Memory bootstrap prompt | Emits the transferred MPRM prompt verbatim | Prompt only to stdout; version/provenance diagnostics only to stderr; no filesystem, Git, network, or host mutation |
| `ai4x scout --project <path> --runtime <id> [--apply]` | Project config, Core Memory, explicit runtime, interview answers | LLM-assisted need-first interview; solution suggestions are challenged and normalized into the declared Haskell schema | Plan by default; with `--apply`, atomically writes `spc/`; does not curate or spawn a persistent team |
| `ai4x curate --project <path> --runtime <id> [--apply]` | Valid `spc/`, Corpus Port, context-budget constraints, explicit runtime | LLM-assisted semantic matching and organization design; deterministic dependency, conflict, budget, schema, and lineage checks surround the judgment step | Plan by default; with `--apply`, atomically writes the complete `agn/` aggregate; missing capabilities produce drafts only |
| `ai4x spawn --project <path> --runtime <id> [--apply]` | Valid Core Memory, `agn/`, config, pinned Corpus release, named host adapter | Pure deterministic materialization; no LLM and no semantic selection | Plan by default; with `--apply`, atomically writes the host runtime aggregate and declared facade projections |
| `ai4x doctor --project <path> --scope <memory|corpus|team|runtime|all>` | Explicit project and scope | Read-only canonical diagnostic interface over schemas, invariants, dependency direction, lineage, generated drift, links, and facade drift | Human diagnostics to stdout or explicit structured format; errors to stderr; never repairs |

`scout` and `curate` may invoke an explicitly selected temporary host session, but temporary adapters use an isolated work directory and are removed after the session. They do not modify the persistent facade unless their own `--apply` contract authorizes the declared product output.

### 8.3 `ask` decision

`ask` is **deliberately deferred and is not part of the initial target command contract**. The direct-expert use case remains valid, but safe ephemeral activation, cleanup, transcript ownership, and host cancellation semantics are not yet specified. A future design may compose `spawn` primitives without changing the five commands above. No placeholder command is exposed.

## 9. End-to-End Lifecycle and Self-Consumption

```text
Bare or existing project
        |
        v
+------------------------------+
| ai4x memory prompt           |
| stdout: bootstrap prompt     |
| mutation: none               |
+---------------+--------------+
                |
                v
+------------------------------+
| Core Memory                  |
| behavior | context | state   |
+---------------+--------------+
                |
                v
+------------------------------+
| scout --apply                |
| semantic interview (LLM)     |
| output: spc/                 |
+---------------+--------------+
                |
                v
+------------------------------+
| curate --apply               |
| judgment + deterministic     |
| constraint checks            |
| output: agn/ + lineage       |
+---------------+--------------+
                |
                v
+------------------------------+
| spawn --apply                |
| deterministic materializer   |
| output: runtime + facade     |
+---------------+--------------+
                |
                v
+------------------------------+
| doctor + utl/verify.sh       |
| inspect health and drift     |
+---------------+--------------+
                |
                v
      Agent-host execution
```

ASCII-only fallback:

```text
[memory prompt] -> [Core Memory] -> [scout/spc] -> [curate/agn]
       -> [spawn/runtime+facade] -> [doctor/verify] -> [host execution]
```

For `#eyodf`, ai4X is the project:

1. Its `.ai4x/` records ai4X behavior, context, current handoff, and project workflow.
2. `scout` captures ai4X's own needs in `spc/`.
3. `curate` composes the ai4X orchestrator and specialists from a pinned `mod/crp/` release.
4. `spawn` generates Copilot CLI and GitHub Copilot adapters.
5. Root `AGENTS.md` and `.github` expose those generated adapters.
6. `doctor` and `utl/verify.sh` detect memory, Corpus, runtime, facade, and dependency drift.
7. Runtime lessons become local capability drafts or GitHub change proposals. They never mutate the Corpus or backlog automatically.

## 10. CLI to Corpus Integration Contract

### 10.1 Dependency direction

```text
mod/cli command/application layer
            |
            v
    Corpus Port interface
            |
            v
mod/crp manifest + immutable content
```

The Corpus Port is defined by data, not TypeScript imports. CLI domain logic receives a resolved immutable Corpus view. Filesystem, package, or future remote acquisition is an adapter concern.

### 10.2 Manifest contract

`mod/crp/manifest.yaml` contains:

- `schema_version`: version of the language-neutral manifest schema;
- `corpus_id`: stable provider identity;
- `corpus_version`: SemVer Corpus release;
- `content_digest`: digest of the canonical manifest plus referenced content;
- records for each capability, reference agent, and topology;
- for each record: stable ID, semantic version, relative path, content digest, status, dependencies, conflicts, and lifecycle state;
- no absolute path, CLI class name, executable hook, or project-specific workflow reference.

The port operations are conceptually `describe`, `list`, `get`, and `verify`; they return data or typed diagnostics and cannot mutate the Corpus.

### 10.3 Versioning and lifecycle

- Manifest schema uses SemVer. A breaking field or interpretation change increments major.
- Corpus releases use SemVer. Breaking removals or changed semantics increment major; additive compatible content increments minor; non-semantic corrections increment patch.
- Individual capability records retain their own semantic version and digest.
- A Team Declaration pins Corpus ID, exact release version, content digest, manifest schema, and exact content versions/digests.
- `curate` selects only admitted active content and records all selections and rejections.
- `spawn` fails on pin mismatch; it never silently re-curates.
- `doctor` reports available newer releases and impact but does not mutate. Re-curation is an explicit later action.
- Corpus draft -> review -> admitted -> active -> deprecated -> retired transitions are owned by `mod/crp/gov/`. Project drafts have no automatic transition into that lifecycle.

### 10.4 Independent Corpus governance

`mod/crp/gov/` owns provider identity, content admission, lifecycle, capability authoring, release checks, and reusable exported content only. It never owns ai4X planning, board transitions, development stage gates, or CLI implementation quality.

## 11. Current Governance and `adm/` Disposition

Disposition is semantic and non-authorizing.

### 11.1 `adm/gdl`

| Current artifact | Target disposition | Rationale |
| --- | --- | --- |
| `adm/gdl/README.md` | Absorb routing explanation into `.ai4x/BEHAVIOR.md`; delete after migration | A second governance entry point would compete with Core Memory |
| `adm/gdl/index.yaml` | Rewrite as `.ai4x/governance/index.yaml` | Project task routing belongs to Project Memory; Corpus entries are replaced by explicit external references through the pinned Corpus |
| `adm/gdl/glossary.md` | Split: ai4X/project terms to `.ai4x/governance/glossary.md`; Corpus terms to `mod/crp/README.md` or its manifest schema | Terms follow semantic ownership |
| `adm/gdl/board-policy.md` | Move and revise to `.ai4x/governance/board-policy.md` | It governs interaction with GitHub; GitHub remains the remote authority |
| `adm/gdl/planning-workflow.md` | Move and revise to `.ai4x/governance/planning-workflow.md` | It governs draft-to-Issue promotion for this project |
| `adm/gdl/planning-conformance.md` | Move and revise to `.ai4x/governance/planning-conformance.md` | It is an ai4X project admission gate |

### 11.2 `adm/pbl`

| Current artifact | Semantic category | Target disposition |
| --- | --- | --- |
| `.gitkeep` | Directory scaffolding | Delete with `adm/pbl/` |
| `ai4x-context-budget-model.md` | Product idea with partial promoted lineage | Reconcile against its referenced GitHub Issue(s); move only unpromoted residual intent to a temporary `.ai4x/drafts/` proposal, then promote or delete |
| `ai4x-curate.md` | Large mixed product draft and obsolete design assumptions | Reconcile every live requirement with GitHub Issues; promote missing accepted scope through planning, then delete the local PBL file; do not import obsolete `ctx/`, path, or command assumptions |
| `ai4x-doctor-canonical-validator.md` | Product architecture idea with referenced Stories | Treat the referenced GitHub Issues as authority; promote only genuinely untracked residual scope, then delete |
| `ai4x-lifecycle-feedback-loop.md` | Parked future product idea | Convert to a local draft proposal only if the PO still wants refinement; otherwise delete. It is not `STATE.md` content |
| `ai4x-organization-design.md` | Product/capability proposal spanning project and Corpus | Split during refinement: CLI product need to a GitHub Issue; capability/topology proposal to the Corpus admission process; then delete |

No PBL file moves into `STATE.md`. `.ai4x/drafts/` may hold unpromoted proposal material, but it is not a backlog, has no workflow status, and must be deleted after promotion or rejection. GitHub Issues remain the sole authority after promotion.

### 11.3 Current `crp/gov`

| Current artifact/category | Target disposition |
| --- | --- |
| `qlt/capability-authoring-governance.md` | Move and adapt to `mod/crp/gov/capability-authoring-governance.md` |
| `prc/capability-sweep.md` | Move and adapt to `mod/crp/gov/capability-sweep.md` |
| `top/` | Reclassify from governance to Corpus product content at `mod/crp/top/`; topologies are reusable value objects |
| `prc/workflow.md` | Move project delivery semantics to `.ai4x/operations/development-workflow.md`; extract only truly reusable, separately governed content if a concrete Corpus use case exists |
| `prc/development-conformance.md` | Move to `.ai4x/operations/development-conformance.md` |
| `prc/development-conformance-template.md` | Move to `.ai4x/operations/development-conformance-template.md` |
| `qlt/engineering-quality.md` | Move ai4X/path-specific contract to `.ai4x/operations/quality/engineering-quality.md` |
| `qlt/typescript-quality.md` | Move to `.ai4x/operations/quality/typescript-quality.md` |
| `qlt/{ai-strategy,architecture,implementation,requirements,review,testing}-quality.md` | Move to matching `.ai4x/operations/quality/` files because they govern ai4X's own specialist workflow |

There is no dual maintenance. If reusable generic quality content is later exported by the Corpus, it receives a distinct Corpus-owned ID/version and Project Memory references it through the Corpus Port rather than copying it.

## 12. GitHub Facade and Generation Flow

### 12.1 Direction

```text
.ai4x Core Memory + agn/ + pinned Corpus
                    |
                    v
            spawn host adapters
                    |
                    v
.ai4x/runtime/hosts/*                 canonical generated host output
                    |
                    v
.github generated stubs + AGENTS.md   host discovery projections
```

No arrow points from `.github` back into canonical behavior.

### 12.2 Generated and maintained files

| Facade surface | Policy |
| --- | --- |
| `.github/agents/*.agent.md` | Generated, committed regular-file stubs. Committing supports GitHub discovery in a fresh checkout where generation has not run. Symlinks are prohibited. |
| `.github/copilot-instructions.md` | Generated, committed regular-file stub pointing to canonical behavior and the generated GitHub Copilot adapter |
| `.github/ISSUE_TEMPLATE/*.yml` | Maintained GitHub-specific facade files. They encode GitHub forms, not duplicated memory content. Their fields must remain conformant with Project governance |
| `.github/workflows/verify.yml` | Maintained GitHub-specific CI facade. It performs checkout/setup and delegates repository verification to `./utl/verify.sh` |
| Root `AGENTS.md` | Relative symlink to exactly `.ai4x/runtime/hosts/copilot-cli/AGENTS.md` |

### 12.3 Drift control

`spawn` records every generated adapter and stub digest in `.ai4x/runtime/manifest.yaml`. `ai4x doctor --scope runtime` regenerates into an isolated temporary directory and byte-compares generated outputs, verifies that stubs are regular files, verifies their relative links, and verifies the exact root symlink target. `utl/verify.sh` invokes that read-only check in the appropriate verification stage. Drift fails verification; it is never auto-repaired.

## 13. Visual Language and Publication

### 13.1 Text diagrams

The canonical rich text grammar uses Unicode box drawing:

- horizontal `─`, vertical `│`;
- corners `┌ ┐ └ ┘`, junctions `├ ┤ ┬ ┴ ┼`;
- direction `▼ ▲ ▶ ◀`;
- boxes have consistent widths and labels do not depend on color.

Every normative diagram must also remain understandable in an ASCII-only rendering using `-`, `|`, `+`, and `v/^/</>`. A paired fallback is mandatory when line glyphs carry meaning or the publication target cannot guarantee Unicode.

### 13.2 TikZ

`acc/tikz/ai4x-style.tex` is the sole shared TikZ style source. It derives the O2I character, subject to ai4X accessibility adjustment:

- sans-serif Latin Modern;
- dark ink based on `#253238`;
- muted/accent tones initially based on `#647178` and `#9FA8AC`;
- soft fill initially based on `#F1F2F2`;
- Stealth arrows, 2pt rounded corners, and consistent line weights;
- minimum contrast targets of WCAG AA for text at intended size;
- no distinction by color alone: line style, label, shape, or marker also conveys state;
- grayscale legibility and common color-vision-deficiency simulation are release checks;
- reading order, alt text/caption, and textual equivalent are required.

The O2I files are design references, not runtime dependencies or copied authorities.

### 13.3 Source and generated policy

- Authored sources: Markdown, `acc/tikz/ai4x-style.tex`, figure `.tex`, `acc/publication.yaml`.
- Generated artifacts: rendered PNG/SVG/PDF. They carry no semantic authority.
- `acc/publication.yaml` maps source to outputs, renderer/tool versions, dimensions, and publication consumers.
- Generated publication media may be committed only when a consumer requires it; freshness is verified by digest/re-render.
- `utl/paper/` contains only the renderer and asset checker justified by the publication contract.

## 14. Verification Architecture and `utl/` Scope

`./utl/verify.sh` is the canonical repository verification entry point for humans, Make, and CI. `Makefile` targets and `.github/workflows/verify.yml` delegate to it rather than recreate checks.

The target stages are:

1. `repository`: tree, naming collision, symlink target, generated-file inventory, and whitespace checks;
2. `memory`: Core Memory shape, routing graph, ownership conflicts, `STATE.md` constraints;
3. `corpus`: manifest schema, digests, lifecycle, indexes, dependencies, independent governance, and reverse-dependency prohibition;
4. `cli`: install, build, tests, command contracts, and structured diagnostics;
5. `runtime`: deterministic regeneration, facade regular-file/stub rules, and drift;
6. `publication`: source/output manifest, rendering, contrast, grayscale, alt text, and freshness.

`all` executes all applicable stages. Narrow stages must be callable explicitly and fail on missing required tools with actionable diagnostics.

Only three utility domains are admitted initially:

- `utl/verification/` for repository-wide check composition;
- `utl/gh/` for existing, host-specific repository maintenance;
- `utl/paper/` for the accepted publication workflow.

No `utl/haskell`, `utl/model`, `utl/licensing`, or other O2I-inspired domain is created until an accepted requirement and owning verification stage exist. GHC invocation for `spc/` belongs to the relevant CLI/memory verification implementation, not automatically to a new utility domain.

## 15. MPRM Transfer and Dissolution Gates

The initial integration is only `ai4x memory prompt`.

### 15.1 Transfer gates

1. **Authority gate:** one exact MPRM prompt revision is selected; license/provenance and maintainer authority are recorded.
2. **Behavior gate:** stdout is byte-for-byte prompt content; all diagnostics are on stderr; invocation performs no project, Git, network, or host mutation.
3. **Fixture gate:** the transferred prompt is tested on a single repository, stale memory, a non-Git project, and an umbrella workspace.
4. **Fresh-agent gate:** agents with no source chat can identify scope and authority, create compact non-duplicative Core Memory, brief the user correctly, and take the next safe action.
5. **Independent acceptance gate:** a neutral review binds its verdict to the exact prompt digest, fixtures, outputs, and fresh-agent runs; all blocking findings are closed.
6. **Documentation/release gate:** ai4X owns usage, versioning, change control, and regression fixtures.

### 15.2 Dissolution gates

The MPRM repository is not dissolved merely because text was copied. Dissolution requires:

- all normative prompt authority and provenance transferred to ai4X;
- accepted fresh-agent evidence for the transferred exact revision;
- no unresolved MPRM-only requirement, Issue, or release obligation;
- user-facing migration notice and archive/retirement decision;
- explicit PO authorization in a separate change.

Until all gates pass, MPRM remains an external source and ai4X makes no dissolution claim.

## 16. Fresh Target-State Migration Sequence

This sequence describes blast radius and ordering only. It authorizes nothing.

1. PO approves or amends this target design and resolves deferred decisions.
2. Freeze exact source inventories and establish migration acceptance criteria in GitHub Issues.
3. Introduce `.ai4x` Core Memory and project routing in isolation; detect and reject `.ai4X` collisions.
4. Classify and transfer `adm/gdl`, `adm/pbl`, and current `crp/gov` per Section 11; remove duplicates only after target references validate.
5. Establish `mod/crp` ownership, version, manifest, governance, and conformance fixtures before moving Corpus content.
6. Establish the Corpus Port in `mod/cli`, then move CLI paths and update packaging/tests without introducing reverse imports.
7. Implement the non-mutating `memory prompt` transfer and complete MPRM gates.
8. Implement or adapt `scout`, `curate`, `spawn`, and `doctor` against the target contracts in separately scoped Stories.
9. Generate runtime adapters; verify deterministic output before creating facade projections.
10. Replace `.github/agents` and Copilot instructions with generated committed regular stubs; add maintained Issue forms and delegating workflow.
11. Create root `AGENTS.md` only after its exact generated target exists and passes link validation.
12. Introduce the visual style and need-backed publication checks.
13. Make `utl/verify.sh` canonical, then redirect Make and CI to it.
14. Run repository-wide and fresh-agent acceptance on the exact target revision.
15. Remove legacy paths and compatibility only when all consumers are migrated; simultaneous `.ai4X`/`.ai4x` remains an error throughout.

High-blast-radius areas are package/install paths, test fixtures, documentation links, agent discovery, CI, global config examples, and any external consumer of current `crp/` paths.

## 17. Decision Register

### 17.1 Accepted target decisions

| ID | Decision |
| --- | --- |
| D-01 | `.ai4x` is canonical; `.ai4X` is legacy migration input; coexistence is an error |
| D-02 | Core Memory is exactly `BEHAVIOR.md`, `CONTEXT.md`, and `STATE.md` |
| D-03 | `ctx/` is removed; `CONTEXT.md` is the sole project-context authority |
| D-04 | Project contracts live in `.ai4x`; Corpus lifecycle lives in `mod/crp/gov` |
| D-05 | `mod/cli` consumes `mod/crp` only through a language-neutral, versioned Corpus Port |
| D-06 | Initial MPRM integration is non-mutating `ai4x memory prompt` |
| D-07 | `scout` and `curate` contain bounded semantic judgment; `spawn` and validation are deterministic |
| D-08 | `.github/agents` and Copilot instructions are generated committed regular-file stubs |
| D-09 | Issue forms and the CI workflow are maintained host-specific facade files |
| D-10 | Root `AGENTS.md` links exactly to `.ai4x/runtime/hosts/copilot-cli/AGENTS.md` |
| D-11 | `utl/verify.sh` is the canonical repository verification entry |
| D-12 | Unicode box drawing has an ASCII fallback; one accessible ai4X TikZ style owns visual defaults |
| D-13 | `spc/` and `agn/` remain host-agnostic product concepts under `.ai4x/` |
| D-14 | `ask` is deferred and absent from the initial command surface |

### 17.2 Deliberately deferred decisions

| ID | Decision needed later | Why it does not block this architecture |
| --- | --- | --- |
| F-01 | CLI implementation language after the current TypeScript baseline | The Corpus Port and command contracts are language-neutral; migration cannot be justified by design preference alone |
| F-02 | External Corpus distribution mechanism | The in-repository port proves the boundary first |
| F-03 | Exact schemas for Needs, Team Declaration, topology, and config | Separate versioned schema design is required before implementation; ownership and aggregate boundaries are fixed here |
| F-04 | Direct-expert `ask` lifecycle | Ephemeral cleanup and host cancellation require their own accepted contract |
| F-05 | Drift evolution/assessment command | `doctor` can report drift without defining a mutating feedback lifecycle |
| F-06 | Exact adjusted color values after accessibility testing | Style ownership and acceptance thresholds are fixed; values require measured validation |

## 18. Risks and Controls

| Risk | Impact | Control |
| --- | --- | --- |
| Monorepo boundary becomes cosmetic | Corpus couples back to CLI/project workflow | Manifest-only integration tests and reverse-import verification |
| Generated committed stubs drift | Host runs stale behavior | Runtime manifest, isolated regeneration, byte comparison |
| Core Memory becomes a second backlog | Remote and local status conflict | STATE size/shape checks and authority rules |
| LLM outputs are treated as deterministic | Non-reproducible needs/team claims | Record judgment boundary, inputs, model/runtime provenance, and deterministic post-validation |
| Project drafts leak into admitted Corpus | Unreviewed behavior reaches agents | Separate paths, statuses, and explicit Corpus admission |
| Path migration breaks install/CI/docs | Repository unusable during transition | Ordered migration Issues, path inventory, staged verification |
| Exact root symlink is missing or stale | Copilot CLI discovery fails | Create only after generated target and verify exact relative link |
| O2I visual style has insufficient contrast | Inaccessible publication | Contrast, grayscale, non-color encoding, textual equivalents |
| MPRM is retired before equivalent behavior is proven | Loss of operational capability | Authority, fixture, fresh-agent, independent-review, and PO gates |
| Config fallback becomes implicit | Non-reviewable command behavior | Provenance reporting and required explicit project/apply/runtime contracts |

## 19. Validation Criteria

The target architecture is acceptable for later implementation planning only when:

1. A clean checkout has exactly one canonical `.ai4x` and no `.ai4X`.
2. A fresh agent can identify each authority from Core Memory without reading unrelated contracts.
3. `CONTEXT.md`, routed contracts, `agn/`, and runtime adapters contain no competing project-context authority.
4. A manifest-only Corpus fixture can be consumed without importing Corpus internals.
5. Corpus verification proves no dependency on `mod/cli`, `.ai4x`, `.github`, or GitHub workflow state.
6. Repeated `spawn` with identical normalized inputs is byte-identical.
7. Every generated facade file matches the runtime manifest; agent stubs are regular files.
8. Root `AGENTS.md` is a relative symlink with the exact target `.ai4x/runtime/hosts/copilot-cli/AGENTS.md`.
9. `memory prompt` writes only prompt bytes to stdout, diagnostics only to stderr, and changes no observed filesystem or Git state.
10. GitHub Issue/Project facts in memory are pointers with observation boundaries, not replicated backlog/history.
11. Every current `adm/` and `crp/gov/` artifact has one executed migration disposition and no duplicate remains.
12. `utl/verify.sh all` is the repository-wide check used by Make and CI.
13. Publication checks establish source freshness, contrast, grayscale legibility, non-color encoding, and textual equivalents.
14. Fresh-agent MPRM validation and independent acceptance bind to the exact transferred prompt digest before dissolution is considered.

Implementation progression is blocked if an invariant cannot be checked or an authority has two writable owners.

## 20. Traceability

| Requirement | Design response |
| --- | --- |
| R-1 `.ai4x/` Memory Architecture | Sections 4, 6, 7 |
| R-2 `mod/` wrapper | Sections 5, 6, 10, 16 |
| R-3 CLI versus ACE Corpus | Sections 4, 10, 11.3 |
| R-4 `adm/` migration | Section 11 |
| R-5 MPRM integration | Sections 8, 15 |
| R-6 visual language | Sections 6, 13, 14 |
| R-7 directory name | Sections 2, 4.4, 17 |
| R-8 GitHub/Copilot facade | Sections 6.1, 12 |
| R-9 `utl/` structure | Section 14 |
| R-10 `xxx/` integration | Sections 6, 8, 9, 16 |

## 21. Architecture Gate Recommendation

**Recommendation: pass for PO target-design discussion.**

All Issue #81 concern areas are architecturally addressable, bounded contexts and invariants are explicit, migration impact is identified, and rejected alternatives are documented. This verdict approves only the coherence of this proposal for discussion; it grants no implementation or migration authority.
