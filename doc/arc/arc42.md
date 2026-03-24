# ai4X Overall Architecture (arc42)

Source: arc42.org, template version 9.0-EN, as of July 2025.

Template reference: ../../utl/tpl/arc42/arc42-template-EN.md.

## 1. Introduction and Goals

ai4X is a modular operating model for reproducible agentic AI workflows.
The integration repository (`ai4x`) composes module repositories and provides operations and quality governance across module boundaries.

Primary goals:

1. deterministic lifecycle orchestration across modules
2. explicit boundaries between runtime launch, behavior composition, and capability sources
3. reproducible quality gates and operations before productive runs

## 2. Constraints

1. module coupling is configuration-driven, not path-hardcoded
2. module repositories remain independently versioned and releasable
3. system documentation must remain consistent across integration and module layers
4. operational checks are mandatory before productive usage (`doctor`/`verify` contracts)

## 3. Context and Scope

The ai4X system consists of:

1. `ai4x`: integration and lifecycle utility orchestration
2. `ask`: profile-based runtime launcher and client adapter layer
3. `kob`: behavior kit with cognitive capability composition
4. `ccp`: cognitive capability source of truth
5. `tcp`: technical capability source of truth

Conceptual system view:

![](<../../acc/img/ai4X Initial Structure - v0.2.jpeg>)

## 4. Solution Strategy

1. keep responsibilities isolated by module boundary
2. compose runtime behavior via declarative profile contracts
3. treat cognitive and technical capabilities as separate source domains
4. run deterministic gates at integration and module levels
5. keep only general reusable cognition in `ccp`; place agent-specific local cognition in `kob`

## 5. Building Block View

Top-level building blocks and responsibilities:

1. **Integration (`ai4x`)**: install, clean, doctor orchestration; release and governance docs
2. **Runtime (`ask`)**: profile resolution, runtime links, adapter startup, session state
3. **Behavior (`kob`)**: agent layout, cognitive composition blueprint (`cap.compose.yaml`), curation utility
4. **Cognitive capabilities (`ccp`)**: reusable, agent-neutral cognitive contracts and metadata for foundation, analysis, architecture, AI, strategy, and engineering
5. **Technical capabilities (`tcp`)**: reusable executable technical capability specifications and implementations

## 6. Runtime View

Typical end-to-end flow:

1. `ai4x doctor --strict`
2. `ai4x install --clean`
3. `ask <profile>`
4. client runtime executes with configured agent/skills context

Capability update flow:

1. maintain capabilities in `ccp`/`tcp`
2. curate cognitive composition in `kob`
3. start runtime through `ask` using the curated context

Development and governance flow:

1. bootstrap governed work through `AGENTS.md` and `adm/dev/protocols/workflow.md`
2. route by trigger into the binding task-specific protocol or `adm/ops/*`
3. apply deterministic checks and semantic protocols before commit, release, or productive usage
4. use [`../agn/ai4x-flow.md`](../agn/ai4x-flow.md) as the canonical full flow and trigger map

## 7. Deployment View

Deployment model:

1. ai4X integration repo with module submodules
2. module repositories can be consumed standalone
3. local developer and operator environment with installed CLIs

## 8. Cross-cutting Concepts

1. **Determinism**: reproducible command flows, explicit contracts, stable exit semantics
2. **Separation of concerns**: runtime, behavior, and capability sources are intentionally decoupled
3. **Quality gates**: module-local verify gates plus integration-level checks
4. **Documentation chain**: integration architecture references module architectures
5. **Capability discoverability**: cognitive capabilities must remain semantically sliceable, reusable, and composable for downstream behavior curation
6. **Cognitive source discipline**: not every useful agent rule belongs in `ccp`; agent-specific local rules are curated in `kob`

## 9. Architecture Decisions

1. architecture ownership is distributed to module repositories
2. this document is the suite-level architecture and references module-level arc42 documents
3. utility-level architecture documents remain valid as subsystem detail documents
4. `ccp` is reserved for general, agent-agnostic cognitive capabilities
5. `kob` may add agent-local cognitive artifacts where a rule is useful but not general enough for `ccp`

Architecture references:

1. `ask`: [`../../mod/ask/doc/arc/arc42.md`](../../mod/ask/doc/arc/arc42.md)
2. `kob` (module): [`../../mod/kob/doc/arc/arc42.md`](../../mod/kob/doc/arc/arc42.md)
3. `kob` utility detail: [`../../mod/kob/utl/kob/doc/arc/arc42.md`](../../mod/kob/utl/kob/doc/arc/arc42.md)
4. `ccp`: [`../../mod/cap/cog/doc/arc/arc42.md`](../../mod/cap/cog/doc/arc/arc42.md)
5. `tcp`: [`../../mod/cap/tec/doc/arc/arc42.md`](../../mod/cap/tec/doc/arc/arc42.md)
6. `ai4x` utility detail: [`../../utl/ai4x/doc/arc/arc42.md`](../../utl/ai4x/doc/arc/arc42.md)

## 10. Quality Requirements

1. clear module boundaries and low coupling
2. deterministic operations and startup behavior
3. auditable capability composition and runtime context
4. maintainable documentation and release readiness
5. discoverable and composable capability portfolios

## 11. Risks and Technical Debt

1. drift risk if module and integration docs diverge
2. integration stability depends on consistent submodule pointer hygiene
3. quality gates must stay aligned with evolving module contracts

## 12. Glossary

1. **profile**: runtime composition of client, agent, and skill selection
2. **cognitive capability**: behavior/cognition contract maintained in `ccp`
3. **technical capability**: skill/tool contract maintained in `tcp`
4. **curation**: materialization of capability composition into a runtime bundle in `kob`
