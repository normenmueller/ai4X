# Target Architecture Decision Trace

## Purpose and trace contract

This document gives stable, fine-grained references from every accepted R-1 through
R-15 decision and accepted small-step distinction to the target Architecture Pack. It
is intended as an input to Issue #92's later Decision-to-Documentation Matrix.

Target references use stable section anchors in [README.md](README.md). Inventory facts
are linked to the two matrices rather than copied. Source comments are identified by
GitHub Issue and comment database ID so later tooling can retrieve the exact accepted
record.

Disposition values are:

- `resolved`: represented by a target feature, invariant, boundary, or rationale;
- `deferred`: intentionally outside the target's initial implementation while the
  extension boundary is preserved.

## R-1 through R-10 trace

| Trace ID | Accepted decision or distinction | Target reference | Disposition and rationale |
| --- | --- | --- | --- |
| R01-01 | Lowercase `.ai4x` is canonical; simultaneous `.ai4X` is invalid | [Key invariants](README.md#key-invariants), [tree](README.md#complete-target-file-tree) | resolved; one exact root |
| R01-02 | Core Memory is `BEHAVIOR.md`, `CONTEXT.md`, `STATE.md` with disjoint authority | [tree](README.md#complete-target-file-tree), [contexts](README.md#context-boundaries) | resolved; all three are maintained root files |
| R01-03 | Progressive loading uses Core Memory then exact semantic routes | [Project source boundary](README.md#product-source-and-project-instance), [tree](README.md#complete-target-file-tree) | resolved; indexes route without recursive discovery |
| R01-04 | Structured detailed context cannot compete with `CONTEXT.md` | [tree](README.md#complete-target-file-tree), invariant 1 | resolved; `context/` is routed detail, not orientation authority |
| R02-01 | Product modules share a Haskell workspace | [Haskell package design](README.md#haskell-package-and-api-design), [tree](README.md#complete-target-file-tree) | resolved as `mod/cabal.project` |
| R02-02 | Directory names are concise; Cabal packages use `ai4x-` | [Haskell package design](README.md#haskell-package-and-api-design) | resolved |
| R03-01 | Corpus is independent of the CLI | [Corpus boundary](README.md#corpus-and-project-selection), [contexts](README.md#context-boundaries) | resolved as `ai4x-corpus` plus explicit port |
| R03-02 | CLI contains no domain semantics | [Haskell package design](README.md#haskell-package-and-api-design) | resolved; parser/orchestrator/renderer only |
| R03-03 | Corpus owns instructions, metadata, formal contract, release and admission governance | [Corpus boundary](README.md#corpus-and-project-selection) | resolved |
| R04-01 | `adm/**` is dispositioned semantically, not copied wholesale | [Information matrix](information-disposition.md), [tree](README.md#complete-target-file-tree) | resolved by exact source ledger |
| R04-02 | GitHub Issues/Project remain authoritative for promoted backlog and live status | [Work Management](README.md#work-management-contract) | resolved; Project Memory stores contracts and pointers only |
| R04-03 | Project governance, operations, context, and routing have distinct semantic homes | [tree](README.md#complete-target-file-tree) | resolved |
| R05-01 | MPRM transfers as ai4X Light Prompt | [Lifecycle commands](README.md#lifecycle-command-ownership) | resolved as `ai4x light prompt` |
| R05-02 | Light is low-friction, not lower-quality Project Memory | [Project entry](README.md#project-entry-bundles-and-lifecycle-commands) | resolved |
| R05-03 | Prompt command is non-mutating and emit-only | [Lifecycle command table](README.md#lifecycle-command-ownership) | resolved; stdout only |
| R05-04 | MPRM dissolution requires transferred authority, fixtures, fresh-agent validation, review, and exact digest | [Lifecycle commands](README.md#lifecycle-command-ownership) | resolved as later acceptance gate, no dissolution here |
| R06-01 | Text diagrams have a deterministic grammar and ASCII fallback | [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R06-02 | `.ai4x` fenced diagrams are auto-detected without custom markers | [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R06-03 | TikZ style is centralized and checked for accessibility and reproducibility | [Text policy](README.md#text-formatting-and-diagrams), [tree](README.md#complete-target-file-tree) | resolved |
| R07-01 | `.ai4x` follows CLI spelling and cross-platform identity | [Key invariants](README.md#key-invariants) | resolved |
| R08-01 | `.github` is a GitHub/Copilot facade | [tree](README.md#complete-target-file-tree) | resolved |
| R08-02 | Root `AGENTS.md` is exactly a tracked relative link to `.ai4x/BEHAVIOR.md` | [tree](README.md#complete-target-file-tree) | resolved; exact literal target stated |
| R08-03 | No generated Copilot CLI `AGENTS.md` or intermediate target | [tree](README.md#complete-target-file-tree) | resolved and prohibited |
| R08-04 | `.github/agents/*.agent.md` entries are tracked regular-file stubs, never links | [tree](README.md#complete-target-file-tree) | resolved |
| R08-05 | Issue forms and CI remain maintained thin host facade files | [tree](README.md#complete-target-file-tree), [verification surfaces](README.md#assurance-and-verification-surfaces) | resolved |
| R09-01 | `utl/verify.sh` is the canonical repository-verification facade | [verification surfaces](README.md#assurance-and-verification-surfaces) | resolved |
| R09-02 | Utilities are introduced only by domain need | [tree](README.md#complete-target-file-tree) | resolved; assurance/documentation/repository only |
| R10-01 | Sandbox concepts receive semantic disposition without preserving structure | [Information matrix](information-disposition.md) | resolved; `xxx/` is not recreated |
| R10-02 | Target contains one fully classified inspectable tree | [tree](README.md#complete-target-file-tree) | resolved |
| R10-03 | Target is Greenfield, without compatibility/migration scaffolding | [Risks and migration](README.md#risks-and-migration-impact) | resolved |

Primary R-1 through R-10 source: #81 comment `5209412992`, refined by the PO
Greenfield decision in #81 comment `5216956985`, R-14, and the current #83 contract.

## R-11 Gertrud, identity, and notifications trace

| Trace ID | Accepted small-step decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R11-01 | Generic cognitive composition, project role, display binding, GitHub actor, credentials, adapter, and PO authority are separate | [Gertrud boundary](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-02 | PO retains acceptance, risk acceptance, publication, provisioning, and referent-authority changes | [Gertrud boundary](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-03 | Referent coordinates, checks evidence, prepares decisions, and recommends progression | [Gertrud boundary](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-04 | Direct Sub-Issue administration stays inside authorized parent scope | [Gertrud boundary](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-05 | Candidate orchestration/review/action Capabilities remain generic and governance-controlled | [Corpus boundary](README.md#corpus-and-project-selection), [Capability matrix](capability-coverage.md) | resolved; no identity embedded |
| R11-06 | Decision preparation revises the existing nearest Capability rather than adding overlap | [Capability matrix](capability-coverage.md) | resolved by sole per-Capability disposition authority |
| R11-07 | Referent display and GitHub machine user are independent bindings | [Gertrud boundary](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-08 | `gertrud-ai4x` requires repository Triage plus Project Write, without push/merge | [Gertrud boundary](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-09 | Identity, credential, or permission mismatch fails with no PO-account fallback | [Gertrud boundary](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-10 | Host-neutral event policy lives in project operations; adapters only project it | [notification flow](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-11 | One global generic Codex hook, separate host plan/apply, project-local spawn, read-only doctor | [notification flow](README.md#gertrud-authority-github-identity-and-notification), [commands](README.md#lifecycle-command-ownership) | resolved |
| R11-12 | Payload is fixed and identity-neutral; local OSC 9 is default | [notification flow](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-13 | Optional `ntfy.sh` uses opaque Keychain-only topic and accepted caching | [notification flow](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-14 | No payload data, fallback service, cross-origin redirect, or unbounded wait | [notification flow](README.md#gertrud-authority-github-identity-and-notification) | resolved |
| R11-15 | Runtime channel failures are isolated/non-blocking; explicit tests fail truthfully | [notification flow](README.md#gertrud-authority-github-identity-and-notification) | resolved |

Sources: #82 comments `5209550418`, `5216112557` through `5216192940`, and final
reassessment `5216224868`.

## R-12 Project Entry and Bundle trace

| Trace ID | Accepted small-step decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R12-01 | Adopt and init are explicit separate journeys over shared planning/apply | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-02 | Command hierarchy is `project adopt plan|apply` and `project init plan|apply` | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-03 | Bundle and interview are mutually exclusive with no default | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-04 | Entry orchestrates lifecycle but scout/curate/spawn remain independent | [Lifecycle commands](README.md#lifecycle-command-ownership) | resolved |
| R12-05 | Adoption is first implementation slice without narrowing target init | [Distinct entry journeys](README.md#distinct-entry-journeys) | deferred implementation ordering only |
| R12-06 | Init initially requires non-existent path and has no force | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-07 | Plans are immutable and apply is project-local, atomic, explicit, and side-effect bounded | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-08 | Provenance owns project-relative managed paths, versions/digests, base digests, and lineage | [tree](README.md#complete-target-file-tree), [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-09 | Every successful apply writes an immutable Receipt | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-10 | Unmanaged byte-identical content needs an explicit claim operation | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-11 | Project Bundle is a separate immutable composition aggregate, not a Capability | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-12 | Built-in or vendored Bundle sources first; remote trust has named explicit policies | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved; remote acquisition deferred |
| R12-13 | `ai4x-tpl` is evidence, later archived, never runtime dependency | [Distinct entry journeys](README.md#distinct-entry-journeys), [Information matrix](information-disposition.md) | resolved |
| R12-14 | Initial IDs are `minimal-single-repo` and `governed-agent-first`; never defaults | [tree](README.md#complete-target-file-tree), [Key invariants](README.md#key-invariants) | resolved |
| R12-15 | Initial license/package manager are explicit `none`; no inference/install | [Distinct entry journeys](README.md#distinct-entry-journeys) | resolved |
| R12-16 | Project minimum binds ID, display name, purpose, artifact language, and authorities | [Project declarations](README.md#project-declarations) | resolved |

Sources: #86 and #82 handoff comments `5216299553`, `5216544039` through
`5216854064`.

## R-13 Assurance and text policy trace

| Trace ID | Accepted small-step decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R13-01 | Assurance Packs are immutable versioned content-addressed tooling products | [Assurance](README.md#assurance-and-verification-surfaces) | resolved |
| R13-02 | Checks are not cognitive Capabilities and semantic review is separate | [Assurance](README.md#assurance-and-verification-surfaces) | resolved |
| R13-03 | Project selection, governance gate binding, execution, evidence, and host integration have distinct owners | [contexts](README.md#context-boundaries), [Assurance](README.md#assurance-and-verification-surfaces) | resolved |
| R13-04 | Bundles propose exact packs but never activate them | [Assurance](README.md#assurance-and-verification-surfaces) | resolved |
| R13-05 | Runner is project-local, generated, source-bound, offline, non-mutating | [tree](README.md#complete-target-file-tree), [Assurance](README.md#assurance-and-verification-surfaces) | resolved |
| R13-06 | Command, doctor, root verification, and CI have distinct semantics | [verification surface table](README.md#assurance-and-verification-surfaces) | resolved |
| R13-07 | Missing tools/stale runner/malformed declaration/timeout/policy fail are distinguishable | [verification surface table](README.md#assurance-and-verification-surfaces) | resolved through typed outcomes/diagnostics |
| R13-08 | Evidence is immutable and subject/implementation/provenance bound | [Validation receipts](README.md#validation-and-assurance-receipts) | resolved |
| R13-09 | Waiver never rewrites failed evidence | [Validation receipts](README.md#validation-and-assurance-receipts) | resolved |
| R13-10 | Outside `.ai4x`, Markdown permits ASCII plus exact German set | [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R13-11 | `.ai4x` additionally permits versioned diagram characters; emoji/unapproved Unicode prohibited | [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R13-12 | Any fenced block with allowed diagram character is automatically grammar-checked | [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R13-13 | TikZ and generated publication artifacts use separate policies | [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R13-14 | Verification never silently skips, installs, auto-fixes, networks, or invokes LLMs | [Assurance](README.md#assurance-and-verification-surfaces) | resolved |

Sources: #87 Architecture Pack comment `5217442311`, R-14 text policy comment
`5216473288`, and PO acceptance comment `5217548252`.

## R-14 semantic Project Memory trace

| Trace ID | Accepted small-step decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R14-01 | Project Memory is lifecycle-separated and semantic, not abbreviation-preserving | [tree](README.md#complete-target-file-tree) | resolved; no `agn`, `ctx`, `spc` |
| R14-02 | `project.dhall` owns machine project identity, schema, sources, and bindings | [Project declarations](README.md#project-declarations) | resolved |
| R14-03 | `intent`, `agents`, `coordination`, `governance`, `operations`, and `assurance` have disjoint owners | [contexts](README.md#context-boundaries), [tree](README.md#complete-target-file-tree) | resolved |
| R14-04 | Collaboration and Work Management remain separate under coordination | [Collaboration and Work Management](README.md#collaboration-and-work-management) | resolved |
| R14-05 | Direct root symlink beats generated Copilot CLI adapter | [tree](README.md#complete-target-file-tree), [rejected alternative](README.md#rejected-alternative-dual-normative-dhall-and-haskell-authoring) | resolved; no intermediate adapter |
| R14-06 | Generated artifacts carry source digests and never become authority | [Authority boundary](README.md#authority-and-publication-boundaries) | resolved |
| R14-07 | Agent startup is bounded and route-driven; no recursive discovery | [Project source boundary](README.md#product-source-and-project-instance) | resolved |
| R14-08 | Detailed context is routed and disjoint from concise `CONTEXT.md` | [tree](README.md#complete-target-file-tree) | resolved |
| R14-09 | Project Capability selections are pins/mappings, not Corpus authority | [Corpus boundary](README.md#corpus-and-project-selection) | resolved |
| R14-10 | Selected Capability content is materialized once as shared derived Agent context | [Project Intent and Curation](README.md#project-intent-and-curation), [tree](README.md#complete-target-file-tree) | resolved; reconciles later accepted materialization decision |
| R14-11 | Record/generated/local logical classes use explicit storage bindings with no fallback | [Assumptions](README.md#assumptions), [contexts](README.md#context-boundaries) | resolved; tree shows dogfood binding |
| R14-12 | External records use immutable locators and required stale/unavailable evidence fails closed | [Work Management](README.md#work-management-contract) | resolved |

Sources: #88 Architecture Pack comment `5217227758`, storage refinement
`5219584277`, AI suitability review `5219605129`, capability materialization
`5221414267`, and PO acceptance `5217235320`.

## R-15 declaration, Collaboration, and Work Management trace

### Package and authority decisions

| Trace ID | Accepted decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R15-001 | Haskell is target product implementation language | [Haskell package design](README.md#haskell-package-and-api-design) | resolved |
| R15-002 | Dhall is sole project-authoring authority | [Project declarations](README.md#project-declarations) | resolved |
| R15-003 | Ordinary commands consume inert data and do not evaluate Dhall | [Project declarations](README.md#project-declarations) | resolved |
| R15-004 | Product Haskell owns closed semantics, validators, graphs, update boundary | [Haskell semantics](README.md#haskell-semantics-and-transport) | resolved |
| R15-005 | Common declaration representation does not merge domain models or create a central project mega-AST | [contexts](README.md#context-boundaries), [Haskell package design](README.md#haskell-package-and-api-design) | resolved |
| R15-006 | Published summaries carry ID, exact version, kind, owner | [contexts](README.md#context-boundaries) | resolved |
| R15-007 | Local references validated only by owning context | [contexts](README.md#context-boundaries), invariant 4 | resolved |
| R15-008 | Composition receives only explicit cross-context ports | [contexts](README.md#context-boundaries) | resolved |
| R15-009 | `ai4x-core` remains minimal | [Haskell package design](README.md#haskell-package-and-api-design) | resolved |
| R15-010 | Separate intent, curation, collaboration, work-management, assurance, declaration, activation and adapter packages | [Haskell package design](README.md#haskell-package-and-api-design), [tree](README.md#complete-target-file-tree) | resolved |
| R15-011 | CLI and spawn/doctor handlers are thin | [Haskell package design](README.md#haskell-package-and-api-design), [commands](README.md#lifecycle-command-ownership) | resolved |
| R15-012 | Host adapters cannot own composition or semantic authority | [contexts](README.md#context-boundaries) | resolved |
| R15-013 | Haskell domain values never pass directly to LLM/host | [Haskell semantics](README.md#haskell-semantics-and-transport) | resolved |
| R15-014 | Project Dhall cannot duplicate Corpus facts | [Corpus boundary](README.md#corpus-and-project-selection) | resolved |
| R15-015 | Haskell-only and dual-authority candidates rejected | [Options](README.md#options-and-trade-offs) | resolved with rationale |
| R15-016 | Import closure is pinned, offline, project-contained, and resource-bounded | [Project declarations](README.md#project-declarations) | resolved |
| R15-017 | Owner-local logical diagnostics survive normalization and decode; declaration alone maps captured origins to source spans | [Project declarations](README.md#project-declarations), [Haskell package design](README.md#haskell-package-and-api-design) | resolved as production contract |
| R15-018 | Inert publication is canonical, provenance-bound, staged, and atomic; semantic identity excludes operational metadata | [Project declarations](README.md#project-declarations) | resolved |
| R15-019 | Generated visualizations are derived and non-authoritative | [Authority boundary](README.md#authority-and-publication-boundaries) | resolved |
| R15-019A | A narrow Dhall-free declaration-protocol package owns accepted-generation transport; ordinary consumers cannot reach the updater/evaluator | [Haskell package design](README.md#haskell-package-and-api-design), [tree](README.md#complete-target-file-tree) | resolved |

Sources: #89 comments `5221689484` through `5221917206`, representation gate
`5228282851`, PO acceptance `5228555424`, and R-15 `DECISION.md`.

### Project Intent and Curation decisions

| Trace ID | Accepted decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R15-020 | Scout produces one complete Project Intent, not an isolated Need | [Project Intent aggregate](README.md#project-intent-aggregate) | resolved |
| R15-021 | Scout/curate/spawn own WHY-WHAT/WHO-HOW/WHERE-HOST | [Project Intent and Curation](README.md#project-intent-and-curation) | resolved |
| R15-022 | Project Intent solely owns revisioned Cognitive Job demand; Curation consumes digest-bound Job summaries distinct from Capability supply | [Project Intent aggregate](README.md#project-intent-aggregate), [Demand and supply](README.md#demand-and-supply) | resolved |
| R15-023 | Trace is many-to-many across complete Intent | [Demand and supply](README.md#demand-and-supply) | resolved |
| R15-024 | Trace records candidates, matches, coverage, gaps, overlaps, dependencies, conflicts, decisions, rationale, uncertainty, authority and composition | [Demand and supply](README.md#demand-and-supply) | resolved |
| R15-025 | Formal compatibility, semantic fitness, governance acceptance differ | [Demand and supply](README.md#demand-and-supply) | resolved |
| R15-026 | Change triggers deterministic impact analysis then explicit recuration | [Demand and supply](README.md#demand-and-supply) | resolved |
| R15-027 | Runtime `ContractSignature`, `FormalMatch`, `CoverageGap`, and `CompositionWitness` bind exact identities and prove declared compatibility/closure/conflict freedom/coverage only | [Demand and supply](README.md#demand-and-supply), [Haskell package design](README.md#haskell-package-and-api-design) | resolved architecturally; semantic fitness, execution success, and `Need a` inhabitation are explicitly not proved; production formalism follows #96 |

Sources: #81 comments `5219890506`, `5221364315`; #96 manifest and preserved
`Needs.hs`. Issue #96 remains a non-blocking implementation/formalization follow-up.

### Collaboration decisions

| Trace ID | Accepted small-step decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R15-C01 | Collaboration is project-owned and fully editable through explicit plan/diff | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C02 | Team Member and Project Role are separate; participation is explicit | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C03 | External participation has explicit mode, authority, and Operations boundary | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C04 | Rights, Duties, Prohibitions, Scope, and closed action catalog are first-class | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C05 | Undeclared actions prohibited; unfulfilled Duty escalates or blocks | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C06 | Handoff Contract differs from immutable Handoff Record | [Collaboration contract](README.md#collaboration-contract), [contexts](README.md#context-boundaries) | resolved |
| R15-C07 | Review, Consultation, Notification, and Delegation are distinct contracts | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C08 | Delegation preserves accountability and requires acceptance | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C09 | Topology is directed, closed-world, complete, and Referent-entered | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C10 | Edge and Interaction Contract are many-to-many and protocol-complete | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C11 | Resolved profiles and topology curation trace are explicit | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C12 | Participant index is bounded, resolved, digest/freshness-bound | [Collaboration contract](README.md#collaboration-contract) | resolved |
| R15-C13 | Collaboration and participant views are deterministic and ASCII-safe | [Collaboration contract](README.md#collaboration-contract), [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R15-C14 | Collaboration does not own Work lifecycle, governance verdicts, Capability content, or host mechanisms | [contexts](README.md#context-boundaries) | resolved |

Sources: #89 comments `5222201832` through `5223025316`.

### Work Management and runtime decisions

| Trace ID | Accepted small-step decision | Target reference | Disposition |
| --- | --- | --- | --- |
| R15-W01 | Work Management owns profiles/rules, not live Work Item instances | [Work Management](README.md#work-management-contract) | resolved |
| R15-W02 | Profile selection is explicit; Epic/Story and Issue/Sub-Issue are alternatives | [Work Management](README.md#work-management-contract) | resolved |
| R15-W03 | Hierarchy and dependency are distinct relations | [Work Management](README.md#work-management-contract) | resolved |
| R15-W04 | Lifecycle is closed; transitions have triggers, actors, structured guards | [Work Management](README.md#work-management-contract) | resolved |
| R15-W05 | State differs from Stage; Stages may be mandatory or conditional | [Work Management](README.md#work-management-contract) | resolved |
| R15-W06 | Stage Flow supports the accepted minimal graph patterns only | [Work Management](README.md#work-management-contract) | resolved |
| R15-W07 | Milestone and closed Stage Results are explicit | [Work Management](README.md#work-management-contract) | resolved |
| R15-W08 | Stage-scoped Collaboration assignments reference IDs, not copied semantics | [Work Management](README.md#work-management-contract) | resolved |
| R15-W09 | Required validation/Assurance Receipt is a vertical contract | [Validation receipts](README.md#validation-and-assurance-receipts) | resolved |
| R15-W10 | v1 is host-driven and has no dispatcher | [Host-driven Assignments](README.md#host-driven-assignments) | resolved; future dispatcher is separate scope |
| R15-W11 | Ready Assignment projection is bounded and explicit accept/decline is required | [Host-driven Assignments](README.md#host-driven-assignments) | resolved |
| R15-W12 | Fulfillment is deterministically validated; self-assertion cannot fulfill | [Host-driven Assignments](README.md#host-driven-assignments) | resolved |
| R15-W13 | Non-fulfillment outcomes remain truthful | [Host-driven Assignments](README.md#host-driven-assignments) | resolved |
| R15-W14 | Stage completion and Work Item transition are distinct | [Host-driven Assignments](README.md#host-driven-assignments) | resolved |
| R15-W15 | Operational Record Store binding is explicit with no fallback | [Work Management](README.md#work-management-contract) | resolved |
| R15-W16 | Drift is detected and reconciled explicitly | [Work Management](README.md#work-management-contract) | resolved |
| R15-W17 | Offline policy and projection freshness use authoritative observation provenance | [Host-driven Assignments](README.md#host-driven-assignments) | resolved |
| R15-W18 | Multi-responsible execution uses distinct assignments and declared completion semantics | [Host-driven Assignments](README.md#host-driven-assignments) | resolved |
| R15-W19 | `join-all` requires fulfilled or applicable N/A for every branch | [Work Management](README.md#work-management-contract) | resolved |
| R15-W20 | Waiting/expiry has no hidden timeout; silence has no meaning | [Host-driven Assignments](README.md#host-driven-assignments) | resolved |
| R15-W21 | Work Management excludes Collaboration, Governance/Assurance, runtime records, host tools, and general process-engine ownership | [contexts](README.md#context-boundaries), [Work Management](README.md#work-management-contract) | resolved |
| R15-W22 | Combined Assignment views are bounded, deterministic, and ASCII-safe | [Host-driven Assignments](README.md#host-driven-assignments), [Text policy](README.md#text-formatting-and-diagrams) | resolved |
| R15-W23 | Every transition is invoked through the validated ai4X boundary | [Work Management](README.md#work-management-contract) | resolved |
| R15-W24 | Work System and Operational Record Store consistency is checked across the boundary | [Work Management](README.md#work-management-contract) | resolved |
| R15-W25 | Guarded iteration fixture proves representation but is not a normative v1 workflow | [Work Management](README.md#work-management-contract) | resolved; no hidden iteration profile |

Sources: #89 comments `5223031280` through `5225922087`.

## Issue #83 contract refinements

| Trace ID | Accepted refinement | Target reference | Disposition |
| --- | --- | --- | --- |
| S83-01 | Complete Capability and Information matrices precede any source removal | [package authority](README.md#status-and-authority), [Capability matrix](capability-coverage.md), [Information matrix](information-disposition.md) | resolved; no removal authorized |
| S83-02 | Required Receipt is invoked through a stable tool interface and returned in Handoff | [Validation receipts](README.md#validation-and-assurance-receipts) | resolved |
| S83-03 | Receipt contract traces through Haskell API, CLI, Assurance, Work Management, Collaboration, and bindings | [Validation receipts](README.md#validation-and-assurance-receipts), [Haskell package design](README.md#haskell-package-and-api-design) | resolved |
| S83-04 | Haskell values never pass directly to an LLM or Agent Host | [Haskell semantics](README.md#haskell-semantics-and-transport) | resolved |
| S83-05 | Host-driven activation is explicit; proactive dispatch requires separately accepted product authority | [Host-driven Assignments](README.md#host-driven-assignments) | resolved; dispatcher excluded from v1 |
| S83-06 | Every accepted small-step distinction has a stable fine-grained trace | this document | resolved subject to final independent review |
| S83-07 | Haskell design uses bounded expert co-authoring and independent multi-perspective review | [Current Haskell evidence](#current-haskell-design-and-review-evidence) | resolved; durable register E83 |
| S83-08 | Receipt semantics stay owner-local: core owns typed references/header only; Assurance, domain validation, Project Entry, declaration publication, Governance, Work, and Collaboration retain distinct contracts | [Validation receipts](README.md#validation-and-assurance-receipts), [Current Haskell evidence](#current-haskell-design-and-review-evidence) | resolved; HS-F03/F14 independently closed |
| S83-09 | Assignment projection is a closed, authorized, bounded, deterministic DTO over the reachable slice; adapters receive encoded transport only | [Haskell semantics](README.md#haskell-semantics-and-transport), [Current Haskell evidence](#current-haskell-design-and-review-evidence) | resolved; HS-F04/F09/F13 independently closed |
| S83-10 | Declaration flow separates restricted capture, bounded decode, pure owner validation/composition/planning, and effectful apply | [Project declarations](README.md#project-declarations), [Current Haskell evidence](#current-haskell-design-and-review-evidence) | resolved; HS-F05/F17 independently closed |
| S83-11 | Graph and projection algorithms have proportional complexity and a versioned numeric policy release gate | [Haskell package design](README.md#haskell-package-and-api-design), [resource policy](README.md#versioned-resource-envelope-policy) | resolved architecturally; numeric feasibility is release-gated |

Sources: #83 comments `5222138211`, `5223142342`, `5225682825`, `5225758213`,
and `5225942383`.

## Non-blocking production follow-up boundaries

| Follow-up | Preserved target obligation | Target reference | #83 disposition |
| --- | --- | --- | --- |
| #96 formal Need-to-Capability satisfaction/composition | Product-owned runtime contract algebra, composition witnesses, deterministic coverage/gap evidence, separate semantic fitness; preserved `Need a` is phantom notation, not inhabitation proof | [Project Intent and Curation](README.md#project-intent-and-curation), [Haskell package design](README.md#haskell-package-and-api-design) | architecture boundary and proof limit resolved; formal implementation/research remains non-blocking follow-up |
| #97 diagnostic cardinality and source mapping | Stable owning diagnostic, exact path/span/cardinality, source map through normalization and decode | [Project declarations](README.md#project-declarations), [Risks](README.md#risks-and-migration-impact) | production hardening obligation; no implementation in #83 |
| #98 declaration update/publication hardening | Closed import policy, TOCTOU/resource controls, staging, fsync, atomic replacement, recovery | [Project declarations](README.md#project-declarations) | production hardening obligation; no implementation in #83 |
| #99 Dhall schema/Haskell decoder drift prevention | Generated schema adapter, closed decoder, release-gated fixtures and protocol versions | [Authority boundary](README.md#authority-and-publication-boundaries), [Risks](README.md#risks-and-migration-impact) | production hardening obligation; no implementation in #83 |

## Haskell design method evidence

### Superseded in-progress register (2026-08-09)

The following co-author, review, and finding tables preserve the in-session sequence at
the time findings were opened and remediated. Every `pending` value in those tables is a
historical state superseded by the current immutable evidence register below; none is a
current gate field.

### Co-author assignments

This is the superseded in-session planning register, retained only to show sequence.

| Evidence ID | Co-author | Bounded semantic scope | Write authority and owned paths | Target contract | Required checks | Result at that time | Superseded status (2026-08-09) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CA-ARCH-01 | `architecture_83` architecture lead | Cross-context synthesis, authority boundaries, commands, target tree, trace | `doc/arc/target-architecture/README.md`, `decision-trace.md` | #83 AC-02 through AC-43, AC-49 through AC-56 | anchors, tree classes, links, text policy, `git diff --check` | exact diff and checks | complete; not independent reviewer |
| CA-CAP-01 | `capability_matrix_83` independent co-author | Corpus Capability inventory, stable target mapping, dispositions | `doc/arc/target-architecture/capability-coverage.md` only | AC-44 and AC-45 | inventory/path/disposition cardinality | 70 unique rows: 55 adopt, 15 revise; matrix checks pass | complete, cross-artifact review pending |
| CA-INF-01 | `requirements_83` independent co-author | Preserved/current information inventory and exact target disposition | `doc/arc/target-architecture/information-disposition.md` only | AC-46 through AC-48 | snapshot/current-tree completeness and link checks | preserved 9-file snapshot and 190 current tracked files inventoried; matrix checks pass | complete, cross-artifact review pending |
| CA-HS-01 | `/root/r15_dhall` independent Haskell/formal design co-author | Haskell package/API/type algebra, validation, declaration publication, deterministic projection, and agent-facing boundary | read-only design contribution; no owned paths; recommendations target `README.md` and `decision-trace.md` | AC-11, AC-15 through AC-17, AC-21 through AC-27, AC-33 through AC-37, AC-51, AC-55 | package/API and reverse-dependency checks; owner counterexamples; inert closure; schema/codec, graph, Receipt, publication and projection obligations | ACCEPT core direction; REVISE HS-F01 through HS-F05; REJECT mega-AST and false `Need a` proof; exact remediations incorporated | complete contribution; independent re-review pending |
| CA-HS-02 | `/root/r15_dhall` independent Haskell/formal design co-author | Type/formal algebra: typed references, runtime contract signatures, formal matches, coverage gaps, composition witnesses, invalid-state prevention, and proof limits | read-only design contribution; no owned paths; recommendations target `README.md` and `decision-trace.md` | AC-24 through AC-27, AC-51, AC-55 | law/invariant review; wrong-owner/kind/version counterexamples; runtime-witness versus promoted-GADT comparison | REVISE narrow port and runtime witness contracts; REJECT false `Need a` inhabitation proof; promoted GADTs retained only as a future complexity-justified option; exact remediations incorporated | complete contribution; independent re-review pending |
| CA-HS-03 | `/root/r15_security_review` independent Haskell trust-boundary co-author | diagnostics/provenance, deterministic publication, performance/proportionality, trust boundaries, agent-facing transport | read-only design contribution; no owned paths; recommendations target `README.md` and `decision-trace.md` | AC-11, AC-12, AC-16 through AC-18, AC-33 through AC-37, AC-51, AC-55 | canonical/protocol and loader adversarial fixtures; diagnostic cardinality; publication fault/concurrency; Receipt flow; projection identity/redaction/bounds; package closure | ACCEPT core direction; REVISE HS-F06 through HS-F11; REJECT scan-reopen, merged validator, timestamp identity and fallback; exact remediations incorporated | complete contribution; independent re-review pending |

The completed R-15 executable evidence demonstrates feasibility and includes a bounded
external co-author/review record, but its durable files do not identify all required
experts and it predates this #83 synthesis. It supports design claims; it does not by
itself satisfy AC-51 for this package.

### Independent read-only review register

Reviewers must not review their own authored scope. Every finding needs severity,
affected contract, one clean target-state remediation, and re-review result.

| Review ID | Required perspective | Assigned reviewer | Scope | Result at that time | Superseded status (2026-08-09) |
| --- | --- | --- | --- | --- | --- |
| HR-01 | Domain fidelity | `haskell_review_a`; remediation re-review `haskell_rereview_c` | Intent, Curation, Collaboration, Work Management, Governance/Assurance semantics | HS-F12/F13 verified-remediated | pass |
| HR-02 | Type-theoretic and formal strength | `haskell_review_a`; remediation re-review `haskell_rereview_c` | IDs, versions, typed ports, formal matching/composition witnesses, invalid-state prevention | HS-F13/F14/F15 verified-remediated | pass |
| HR-03 | Idiomatic Haskell and public API design | `haskell_review_a`; remediation re-review `haskell_rereview_c` | totality, abstraction, error algebra, local understandability | HS-F13/F14/F15 verified-remediated | pass |
| HR-04 | Package modularity | `haskell_review_a`; remediation re-review `haskell_rereview_c` | dependency direction, minimal core, CLI/IO boundaries | HS-F13 verified-remediated | pass |
| HR-05 | Diagnostics and provenance | `haskell_review_b`; remediation re-reviews `haskell_rereview_c` and `haskell_review_a` | source spans, cardinality, ownership, receipts, publication provenance | HS-F13/F16 verified by C; HS-F17/HS-F05 final narrow re-review by A passed | pass |
| HR-06 | Determinism | `haskell_review_b`; remediation re-review `haskell_rereview_c` | normalization, graph ordering, canonical encoding, atomic publication | HS-F13/F16/F18 verified-remediated | pass |
| HR-07 | Performance and proportionality | `haskell_review_b`, independent read-only reviewer | Dhall bounds, graph algorithms, context/materialization sizes, small-project cost | pass; later policy must instantiate budgets | pass |
| HR-08 | Extensibility | `haskell_review_a`; remediation re-review `haskell_rereview_c` | schema/package evolution, profile additions, adapter independence | HS-F13/F15 verified-remediated | pass |
| HR-09 | Agent-facing applicability | `haskell_review_b`; remediation re-review `haskell_rereview_c` | bounded projections, invocation contracts, receipts, host-driven activation | HS-F13 verified-remediated | pass |

### Finding and remediation log

| Finding ID | Review | Severity | Affected contract | Clean target-state remediation | Re-review state at that time | Superseded status (2026-08-09) |
| --- | --- | --- | --- | --- | --- | --- |
| HS-F01 | CA-HS-01 | high | Public ports and context ownership | Define typed `Ref`/`Published`/`CrossRef`/summary/validated/diagnostic ports; Composition sees summaries and cross-references only; reject a mega-AST/global validator | HR-A/B: still open through HS-F13 | remediated again; reviewer C pending |
| HS-F02 | CA-HS-01 | high | Formal composition claim | Bound v1 to runtime signatures and witnesses proving declared compatibility/closure/conflicts/coverage only; explicitly exclude semantic fitness, execution, and `Need a` inhabitation | HR-A: still open through HS-F15; HR-B accepted proof limit | remediated again; reviewer C pending |
| HS-F03 | CA-HS-01 | high | Receipt ownership | Keep core to typed references/header; assign Assurance, validation, apply, publication, gate/waiver, Work requirement, and Handoff semantics to their owners | HR-A: still open through HS-F14; HR-B accepted owner split | remediated again; reviewer C pending |
| HS-F04 | CA-HS-01 | high | Agent projection port | Specify pure projection/encoding ports, closed allow-list, deterministic budgets, provenance/freshness, secret exclusion, and typed omission/error | HR-A/B: still open through HS-F13 | remediated again; reviewer C pending |
| HS-F05 | CA-HS-01 | medium | Declaration IO/pure boundary | Separate restricted capture, bounded evaluator/decode effects, pure validation/composition/planning, and effectful typed all-or-prior-generation apply | HR-C found HS-F17 resource-effect residual | remediated again; final re-review pending |
| HS-F06 | CA-HS-03 | high | Diagnostic/source ownership | Owner emits one logical keyed diagnostic; declaration alone maps captured origin to non-empty spans; CLI renders; stable de-duplication and order | HR-A/B: verified-remediated | closed by independent re-review |
| HS-F07 | CA-HS-03 | high | Deterministic identity | Separate semantic digest, source-closure provenance, and operational metadata; pin canonical protocol and exclude timestamps from semantic identity | HR-A accepted; HR-B still open through HS-F16 | remediated again; reviewer C pending |
| HS-F08 | CA-HS-03 | high | Inert protocol ownership | Add Dhall-free `ai4x-declaration-protocol`; updater depends inward; ordinary consumers cannot reach loader/evaluator; reject core/untyped transport | HR-A accepted; HR-B still open through HS-F13 | remediated again; reviewer C pending |
| HS-F09 | CA-HS-03 | high | Projection disclosure and authorization | Limit to authorized Assignment-reachable slice with record/byte/token bounds, exact actor/permission, provenance and explicit freshness | HR-A accepted; HR-B still open through HS-F13 | remediated again; reviewer C pending |
| HS-F10 | CA-HS-03 | medium | Performance/proportionality | Require indexed resolution, linear or ordered-linear graph passes, bounded diagnostics, reachable-slice projection, and cold/warm budgets | HR-A/B: verified-remediated; HR-07 pass | closed by independent re-review |
| HS-F11 | CA-HS-03 | high | Publication/stale semantics | Define immutable manifest-last generation state machine, marker capture, fsync capability, typed stale/incompatible failure, recovery, and no fallback | HR-A accepted; HR-B still open through HS-F16 | remediated again; reviewer C pending |
| HS-F12 | HR-01/02 | high | Cognitive Job ownership | Make Project Intent sole owner; scout validates and publishes digest-bound Job summaries; Curation consumes only; Job change triggers impact and recuration | pending reviewer C | remediated across README and Capability matrix; re-review pending |
| HS-F13 | HR-02/03/04/05/06/08/09; includes HRB-F01/F02 | high | Typed ports, protocol inhabitability, Assignment construction | Add rule-free context-protocol tags/DTOs/ports, owner mappings, Work-System/Record-Store ports, exact Bundle refs, and activation assembly from accepted observations into opaque Assignment | pending reviewer C | remediated; re-review pending |
| HS-F14 | HR-02/03; Receipt seam | high | Receipt satisfaction port | Owner alone constructs opaque verified summary; Work evaluates requirement; Governance consumes typed satisfaction only | pending reviewer C | remediated; re-review pending |
| HS-F15 | HR-02/03/08 | high | Formal witness construction | Hide constructors; expose sole total match/compose/impact builders with soundness, identity, closure, conflict, coverage, permutation and impact laws | pending reviewer C | remediated; re-review pending |
| HS-F16 | HR-05/06; HRB-F03 | high | Generation identity | Define canonical GenerationId preimage excluding clock/marker/Receipt and require idempotent reuse | pending reviewer C | remediated; re-review pending |
| HS-F17 | HR-05; HRB-F04 | medium | Declaration phase/error algebra | Define capture, resource-bounded evaluator/decode effects, validate-and-compose, plan, apply phases with separate errors and no source/Dhall access in apply | HR-C: medium residual because decode lacked timeout/memory/cancellation effects | remediated with restricted `DecodeEffects`; final re-review pending |
| HS-F18 | HR-06; HRB-F05 | medium | Runtime algebra cross-artifact ownership | #83 owns runtime algebra/closure/coverage/impact; #96 defers implementation/research and optional advanced encoding only | pending reviewer C | remediated across both matrices and normative pack; re-review pending |

No material finding may be closed by weakening an invariant, adding compatibility
scaffolding, or moving ownership into a shared monolith. A remediation is complete only
after a different qualified reviewer records a pass for the affected scope.

The rows above preserve the finding/remediation history. Final authoritative closure:
reviewer C verified HS-F01 through HS-F04, HS-F06 through HS-F16, and HS-F18 as
remediated; reviewer A's subsequent narrow independent re-review verified HS-F05 and
HS-F17 after restricted `DecodeEffects` was added. Thus HS-F01 through HS-F18 are
closed. Reviewer A noted only the non-blocking wording compression that `restricted
loader` informally covers the separately specified capture and decode phases.

## Current Haskell design and review evidence

This is the sole current evidence register. `B83` is the reviewed subject commit
`8a5065c375cc077a77629255aeb1721fc5ae04e3`: README
`486907298aefb5edd431f4019df8e79fae347e0500f3fd8d5449c8c53d27ba7f`, Capability
Matrix `fcc333f390863cc0d38279ec31778570b8d596a1b9fbb5daded993d4c34004b1`,
Information Matrix `a142a6da19c16fb87b6879c10d25b844639d19d1893a4a945eaea571b5e68c55`, and
Decision Trace `3eabf7a48212eda03c9d3fced66a1289a289f7a4de73dccae04471b6c436dd4a`.
`E83` is the durable [#83 Haskell evidence register](https://github.com/normenmueller/ai4X/issues/83#issuecomment-5230559400).
It records reviewer independence, exact scopes, write authority, the predecessor and
remediation sequence, and final results. Review A is durably recorded at
[#84 comment 5230555377](https://github.com/normenmueller/ai4X/issues/84#issuecomment-5230555377).

| Finding | Final status | Independent reviewer | Subject | Exact remediation verified | Locator |
| --- | --- | --- | --- | --- | --- |
| HS-F01 | closed | reviewer C | B83 | typed owner ports; no mega-AST | E83 |
| HS-F02 | closed | reviewer C | B83 | bounded runtime formal claim | E83 |
| HS-F03 | closed | reviewer C | B83 | non-overlapping Receipt ownership | E83 |
| HS-F04 | closed | reviewer C | B83 | bounded authorized host projection | E83 |
| HS-F05 | closed | reviewer A final narrow re-review | B83 | restricted capture/decode and pure-plan/effectful-apply split | E83 |
| HS-F06 | closed | reviewer C | B83 | diagnostic ownership and cardinality | E83 |
| HS-F07 | closed | reviewer C | B83 | semantic identity/provenance/metadata separation | E83 |
| HS-F08 | closed | reviewer C | B83 | Dhall-free inert protocol ownership | E83 |
| HS-F09 | closed | reviewer C | B83 | projection disclosure and authorization | E83 |
| HS-F10 | closed | reviewer C | B83 | proportional algorithms and policy-bound limits | E83 |
| HS-F11 | closed | reviewer C | B83 | immutable publication and stale-generation semantics | E83 |
| HS-F12 | closed | reviewer C | B83 | Project Intent sole Cognitive Job ownership | E83 |
| HS-F13 | closed | reviewer C | B83 | acyclic typed ports, protocol inhabitability, Work/Record ports, Assignment assembly | E83 |
| HS-F14 | closed | reviewer C | B83 | owner-produced Receipt satisfaction summary | E83 |
| HS-F15 | closed | reviewer C | B83 | private opaque formal witness construction | E83 |
| HS-F16 | closed | reviewer C | B83 | canonical timestamp-free GenerationId | E83 |
| HS-F17 | closed | reviewer A final narrow re-review | B83 | restricted DecodeEffects and typed DecodeFailure | E83 |
| HS-F18 | closed | reviewer C | B83 | #83 runtime-algebra ownership and bounded #96 follow-up | E83 |

| Perspective | Final status | Independent reviewer | Subject | Exact scope verified | Locator |
| --- | --- | --- | --- | --- | --- |
| HR-01 | pass | reviewers A and C | B83 | domain fidelity | E83 |
| HR-02 | pass | reviewers A and C | B83 | type-theoretic/formal strength | E83 |
| HR-03 | pass | reviewers A and C | B83 | idiomatic Haskell/public API | E83 |
| HR-04 | pass | reviewers A and C | B83 | package modularity | E83 |
| HR-05 | pass | reviewers B, C, and final A | B83 | diagnostics/provenance and final decode seam | E83 |
| HR-06 | pass | reviewers B and C | B83 | determinism | E83 |
| HR-07 | pass | reviewers B and C | B83 | architecture proportionality; numeric envelope release-gated | E83 |
| HR-08 | pass | reviewers A and C | B83 | extensibility | E83 |
| HR-09 | pass | reviewers B and C | B83 | agent-facing applicability | E83 |

## Review A remediation trace

| Finding | Disposition | Target evidence | Re-review state |
| --- | --- | --- | --- |
| RA-F01 | remediated | this sole current evidence register, B83 digests, E83 durable locator; historical tables explicitly superseded | requires original Review A reviewer re-review |
| RA-F02 | remediated | [`#eyodf` self-application contract](README.md#eyodf-self-application-contract), verification obligation and trace below | requires original Review A reviewer re-review |
| RA-F03 | remediated architecturally | [versioned resource envelope](README.md#versioned-resource-envelope-policy); numeric instantiation is an implementation-release gate | requires original Review A reviewer re-review |
| RA-F04 | remediated by Information Disposition owner | [revision-pinned pre-#83 baseline](information-disposition.md#pre-83-tracked-source-baseline): source revision `74bc0dfd9cf51f1f2263a4a3fa2bc62833f65d8d`, unchanged at reviewed B83, 190 files, aggregate Git-tree digest `dc0adaaa42affecaf965b3c640884570904a17753e72335bf0cd11bbc25f86c5` | requires original Review A reviewer re-review |

`#eyodf` traces the ai4X repository as an ordinary project through public Project Entry,
declaration, Intent/Curation, Work/Collaboration, validation/Assurance, activation,
Handoff, and governance surfaces. It forbids semantic bootstrap privileges; only the
initial executable and immutable product assets may bootstrap mechanics. The fresh-
checkout verification in README is the exact acceptance check.

Resource-envelope ownership is ai4X Release Governance at
`mod/policy/resource-envelope/<policy-version>/policy.yaml`. Architecture claims only
typed limit enforcement and asymptotic proportionality until supported-platform,
reference-environment benchmark/adversarial evidence instantiates that policy. Release
is blocked without it.

Issue-ready follow-up recommendation:

- **Title:** Instantiate and verify the v1 resource-envelope policy
- **Body:** Define numeric limits in
  `mod/policy/resource-envelope/<policy-version>/policy.yaml` for named supported
  platforms, project classes, and reference environments. Add pinned benchmark and
  adversarial fixtures for cold/warm latency, peak memory, cancellation, graph and
  projection sizes, and every boundary/over-limit case. Demonstrate typed failure with
  no partial publication. Block implementation release until Release Governance accepts
  the evidence for every supported-platform class. This follow-up instantiates values;
  it must not weaken the Architecture Pack's dimensions or failure semantics.

Specialist remediation gate: `pass`. RA-F01 through RA-F04 have explicit clean target
dispositions and reproducible evidence. This is readiness for the original independent
Review A reviewer to re-review; it is not a #84 verdict, permission for #85, or final PO
acceptance.

## Acceptance coverage summary

| Acceptance group | Primary target evidence | Status |
| --- | --- | --- |
| AC-01 through AC-10 | Complete classified tree and companion package | resolved and integrated |
| AC-11 through AC-20 | Authority/publication, contexts, Haskell/transport, product/project boundary | resolved |
| AC-21 through AC-28 | Project Intent and Curation | resolved; #96 formal implementation follow-up non-blocking |
| AC-29 through AC-38 | Entry journeys, Bundles, Light, Assurance, Receipts, text policy | resolved |
| AC-39 through AC-43 | Gertrud/PO/identity/notification boundary | resolved |
| AC-44 through AC-45 | Capability Coverage Matrix | resolved and integrated |
| AC-46 through AC-48 | Information Disposition Matrix | resolved and integrated |
| AC-49 through AC-50 | This fine-grained trace | resolved; links checked |
| AC-51 through AC-54 | Haskell co-author and independent review evidence | resolved; all material findings independently closed |
| AC-55 | Haskell package/API design and invariant contract | resolved; HR-01 through HR-09 pass |
| AC-56 | Documentation-only diff | verified |

## Gate evaluation status

`pass`

The Architecture Pack is coherent, complete, documentation-only, and independently
reviewed across HR-01 through HR-09. All material findings have clean remediations and
independent closure evidence. The architecture specialist gate is `pass`; this is not
Tech Lead or Product Owner approval of #83.
