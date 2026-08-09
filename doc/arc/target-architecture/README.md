# ai4X Greenfield Target Architecture

## Status and authority

This Architecture Pack is the normative target-state synthesis for Issue #83,
"Complete target architecture synthesis (R-10)". It resolves the accepted R-1
through R-15 design record into one Greenfield model. It authorizes no product
implementation, migration, deletion, facade generation, host installation, or
Greenfield cut.

This document owns target boundaries, invariants, command contracts, and the target
tree. The companion documents own facts that should not be duplicated here:

- [Capability Coverage Matrix](capability-coverage.md): sole per-Capability source
  disposition and exact target-path authority.
- [Information Disposition Matrix](information-disposition.md): source information
  inventory and disposition authority.
- [Decision Trace](decision-trace.md): fine-grained R-1 through R-15 and small-step
  decision trace, including co-author and review status.

The executable R-15 evidence remains separately owned by
`doc/arc/evidence/project-declaration-r15/**`. Existing repository paths and the
preserved `feat/design-sandbox@e75c2fb` snapshot are evidence, not target authority.

## Recommendation

Adopt a Haskell product with a Dhall-authored, project-owned declaration graph,
separate bounded-context packages, deterministic inert publication, and host-specific
adapters at the system edge. Keep reusable cognitive Capabilities and their governed
metadata in the product Corpus. Keep the project instance portable under `.ai4x/`,
with no link or direct dependency on repository-local product source.

The decisive trade-off is deliberate two-layer validation. Dhall provides safe,
auditable project authoring and import integrity; product-owned Haskell provides closed
domain models, semantic validation, graph algorithms, diagnostics, and publication.
This costs an explicit update step and schema/decoder drift controls, but prevents both
arbitrary project-code execution and dual project-authoring authority.

## Assumptions

1. The PO-accepted R-1 through R-15 decisions are the target-design baseline.
2. The R-15 fixture proves bounded feasibility, not production readiness.
3. A project may use built-in, vendored, or later trusted remote product assets, but an
   adopted project never needs an ai4X source checkout.
4. Live Work Item state remains in an external Work System; durable runtime records use
   an explicit Operational Record Store binding.
5. Host-driven activation is sufficient for v1; no persistent ai4X dispatcher is in
   scope.
6. Physical storage for record, generated, and local logical classes is explicit per
   project. The complete self-hosting tree below selects project-local locations; other
   projects may bind supported classes differently without changing semantic ownership.
7. Remote Bundle and Assurance Pack acquisition is architectural extension space, not
   initial implementation scope.
8. The Haskell design is not acceptable until the independent co-author and review
   evidence required in [decision-trace.md](decision-trace.md#haskell-design-method-evidence)
   is complete.

## Context boundaries

| Bounded context | Owns | Publishes and consumes |
| --- | --- | --- |
| Project Memory | Project-local authority, routing, bindings, and lifecycle-separated declarations | Publishes exact declaration and storage bindings; consumes product protocol versions only |
| Project Intent | Purpose, outcomes, Needs, required Cognitive Jobs, constraints, anti-requirements, priorities, acceptance evidence | Publishes versioned, digest-bound Intent, Need, and Cognitive Job summaries to Curation |
| Curation and Capabilities | Candidate evaluation, formal coverage, semantic fitness record, curation acceptance, Agent Composition | Consumes Intent/Need/Job summaries and Corpus Capability summaries; publishes Need-to-Capability Trace and composition |
| Corpus | Reusable Capability instructions, metadata, formal contracts, versions, digests, provenance, and admission governance | Publishes immutable Capability packages through `ai4x-corpus`; never consumes project declarations |
| Collaboration | Participants, project roles, scope, topology, rights, duties, prohibitions, delegation, handoff, review, consultation, notification, and escalation contracts | References Work and Stage IDs as scope; publishes typed participant and interaction summaries |
| Work Management | Work profiles, item types, hierarchy, dependencies, lifecycle, stages, flows, milestones, results, assignments, and exit-condition references | References Collaboration, Gate, Receipt, Work System, and record identities through typed ports |
| Governance | Authorities, precedence, gate decisions, waiver rules, acceptance and publication ownership | Resolves Gate IDs and accepting authority; does not reinterpret deterministic evidence |
| Assurance | Versioned deterministic packs, check semantics, execution, typed receipts, diagnostics, and subject-bound evidence | Consumes explicit project selection and gate bindings; publishes immutable run and gate evidence |
| Project Entry and Bundles | Separate adopt/init discovery, immutable plans, atomic apply, provenance, receipts, skeletons, and optional Bundle composition | Binds product assets to project facts without making a Bundle project authority |
| Declaration Publication | Restricted Dhall evaluation, closed decoding, context-owned validation, cross-context composition, canonical inert encoding, atomic publication | Publishes typed summaries, diagnostics, source maps, and inert envelopes |
| Activation | Host-neutral materialization and activation plan/apply | Consumes accepted inert projections; invokes concrete adapters through ports |
| Agent Host Adapters | Host inspection, facade planning/application, invocation-context rendering, and readiness | Consume bounded transport values only; never receive Haskell domain values or decide composition |
| Work System Adapter | External Work Item observation and validated mutation | Keeps live identity, state, order, and history external; fails closed on drift |
| Operational Record Store | Runtime Assignments, Handoffs, Reviews, Consultations, Notifications, Receipts, and provenance | Provides immutable locators and integrity metadata under an explicit storage policy |

No context validator reads or mutates another context aggregate. Each context validates
its local references. Cross-context composition receives only explicitly declared typed
ports and published summaries containing stable ID, exact semantic version, entity
kind, digest where applicable, and owning context.

## Authority and publication boundaries

### Project declarations

Dhall is the sole authoring authority for project-specific declarations. The project
entry point is `.ai4x/project.dhall`; semantic-area Dhall files are its closed,
project-local, integrity-pinned import graph. Project source may select and compose
pinned product entities, state project conditions, and bind project/host/storage facts.
It may not redefine product metamodels or copy Corpus-owned instructions, dependency or
conflict facts, lifecycle metadata, or provenance.

Only `ai4x declarations update` may evaluate authoritative Dhall. The update boundary:

1. parses the root without resolving imports and rejects network, environment, home-
   relative, absolute, missing, unfrozen, non-regular, symlink-escaping, and project-
   escaping imports;
2. captures the complete local closure once through a project-rooted, no-follow source
   resolver, verifies every semantic hash while reading, and builds an immutable source
   snapshot with explicit file-count, byte-size, import-depth, and closure limits;
3. type-checks and normalizes only captured bytes, offline, in a cancellable worker with
   hard wall-time and memory limits using the product-pinned Dhall version;
4. decodes into closed Haskell context types;
5. runs local context validators and then typed cross-context checks;
6. requires stable diagnostic owner, code, field path, source span, and cardinality for
   every rejected fact;
7. canonically orders set-like values and emits inert versioned envelopes, source maps,
   provenance, and semantic digests to a sibling staging location;
8. fsyncs staged content and its parent as supported, semantically re-reads it, and
   atomically switches a single generation marker; recovery selects only a complete,
   verified generation.

A failed update leaves the previous accepted generation unchanged. Ordinary commands
never evaluate Dhall and never fall back to source when an accepted generation is
missing or stale.

The IO/pure boundary is explicit. A restricted loader uses injected filesystem, clock,
and resource capabilities to return source-mapped decoded context inputs. Owner-local
validation, typed cross-context composition, canonical ordering, and publication
planning are pure. Only the final apply performs writes:

```text
captureRestricted
  :: LoaderEffects m
  -> DeclarationSource
  -> m (Either CaptureFailure CapturedClosure)

decodeCaptured
  :: DecodeEffects m
  -> CapturedClosure
  -> m (Either DecodeFailure SourceMappedInputs)

validateAndCompose
  :: SourceMappedInputs
  -> Validation (NonEmpty OwnerDiagnostic) AcceptedContextSummaries

planPublication
  :: AcceptedContextSummaries
  -> Either PlanFailure PublicationPlan

applyPublication
  :: PublicationEffects m
  -> PublicationPlan
  -> m (Either ApplyFailure PublicationReceipt)
```

Each phase has a separate closed error sum. `ApplyFailure` covers only stale plan,
digest mismatch, resource/durability capability, staged semantic re-read, fsync,
publication, and recovery failure; a re-read preserves the originating owner diagnostic
rather than re-owning it. Apply cannot load Dhall or source. `PublicationPlan` binds
the accepted source and previous-generation digests. Apply is all-or-prior-generation;
time, filesystem, process, and resource observations are explicit capability inputs.

Diagnostic ownership also crosses the boundary without relabeling. An owning validator
emits exactly one logical diagnostic identified by
`(owner, code, factPath, originId, subject)`. `ai4x-declaration` alone resolves that
`originId` against the captured closure to a `NonEmpty SourceSpan`; it cannot invent,
merge, duplicate, or re-own the domain error. The CLI only renders it. Diagnostics are
deduplicated by that complete logical key and ordered by owner, code, fact path, subject,
origin, then source span. This makes cardinality deterministic and prevents Composition
from duplicating an owner-local failure.

Publication separates three identities:

1. **Semantic payload identity** is the digest of the inert semantic payload under a
   versioned, domain-separated canonical byte protocol. It excludes wall clock,
   observation time, and host facts.
2. **Source-closure provenance** records normalized project-relative path, raw-byte
   digest, Dhall semantic hash, byte size, and schema, decoder, Dhall, and product
   versions for every captured source.
3. **Publication/observation metadata** records `generatedAt`, producer, accepted
   generation, observations, and freshness/expiry facts without affecting semantic
   payload identity.

The canonical protocol pins encoding version and digest domain separator, UTF-8/NFC
text rules, numeric representation, map-key order, set ordering, duplicate rejection,
and the exact digest preimage. The same immutable input tuple produces the same semantic
bytes and digest. A decoder rejects duplicate, non-canonical, unknown-version, and
unknown-field input rather than repairing it.

`GenerationId` is the digest of a domain-separated canonical tuple containing protocol
version, semantic payload digest, source-closure digest, and schema, decoder, and product
versions. It excludes clock time, marker bytes, publication Receipt, and other
observation metadata. Repeating an update with that identical tuple reuses the immutable
generation idempotently; any included source closure or product/protocol version change
produces a different ID.

`DecodeEffects` permits only the pinned evaluator worker plus wall-time, memory, and
cancellation controls; it provides no filesystem, network, environment, or source
re-read capability. `DecodeFailure` owns closed timeout, memory-limit, cancellation,
normalization, type-check, and closed-decoder failures. Lazy evaluation cannot escape
the bounded worker or defer failure into validation, planning, or apply.

Publication follows one state machine: create a unique sibling stage; write content;
write the immutable manifest last; fsync files and directories where the declared
filesystem capability guarantees it; rename to the immutable generation digest; fsync
the parent; then atomically replace the single marker. A reader captures the marker once
and verifies one manifest/generation before reading any payload; it never mixes files.
Missing, invalid, or incompatible markers/generations fail closed. Staleness is defined
only by explicit protocol, product, schema, subject, observation, or freshness
incompatibility, never mtime. An invalid candidate update leaves the accepted marker
untouched; readers never search for or fall back to another generation. Recovery and GC
operate only on unreferenced stages/generations and cannot touch the active generation.
Unsupported durability primitives are typed capability failures, not silent success.

### Haskell semantics and transport

Product-owned Haskell packages own closed domain values, smart constructors, total
validation functions, graph closure and impact analysis, precise diagnostics, and the
publication protocol. Domain values never cross directly into an LLM or Agent Host.
The only host boundary is a bounded, inert transport value rendered as an agent-facing
file or invocation context with source digests, generation identity, producer version,
subject identity, and applicable freshness policy.

Stage Assignment projection uses a narrow pure port:

```text
assembleAssignment
  :: ActivationPorts m
  -> AssignmentRequest
  -> m (Either AssignmentAssemblyError ValidatedAssignment)

projectAssignment
  :: ProjectionPolicy
  -> ValidatedAssignment
  -> Either ProjectionError AgentProjection

encodeProjection :: AgentProjection -> ByteString
```

`ActivationPorts` reads one accepted `GenerationId`, exact Work observation version,
immutable Operational Record/Receipt summaries, and Collaboration authorization through
the named context-protocol `WorkSystemPort` and `RecordStorePort`. Assembly validates
subject identity, cross-references, required Receipt satisfaction, actor/permission,
record integrity, and freshness into the opaque `ValidatedAssignment`; it receives no
owner aggregate. Its closed inert `AssignmentProjectionInput` is the only cross-owner
input. Concrete Work-System and Record-Store adapters implement those ports.

`AgentProjection` is a closed DTO containing only allow-listed fields in the Assignment-
reachable slice. Raw aggregates, declaration source, unrelated participants/work, host
credentials, secrets, and unrestricted evidence bodies are structurally absent. Its
ordering and encoding are deterministic. `ProjectionPolicy` pins maximum reachable
records, bytes, tokens and tokenizer identity, permitted optional fields, redaction
rules, and freshness policy. A required field never disappears; oversize content is a
typed `ProjectionError`, while an allowed omission is an explicit tagged DTO value with
reason and source reference. Every projection carries accepted generation, Assignment,
Work observation version, referenced Operational Record versions, producer/protocol,
subject, provenance, integrity, and explicit expiry or `no-expiry`.

Before projection materialization or invocation, the IO boundary validates the exact
configured actor and effective permission against the Assignment participant binding.
Failure writes nothing and has no identity fallback. Adapters receive only encoded
transport bytes and explicitly constructed argument values, never Haskell domain values.

The CLI is thin. It parses explicit inputs, calls a public package API, renders human or
structured output, and translates typed outcomes to stable exit behavior. IO remains in
declaration loading, filesystem publication, external system, process, and host adapter
boundaries.

### Corpus and project selection

Each reusable Capability is an immutable package at:

```text
mod/corpus/capabilities/<semantic-category...>/<capability-id>/CAPABILITY.md
mod/corpus/capabilities/<semantic-category...>/<capability-id>/capability.meta.yaml
```

`CAPABILITY.md` owns agent-readable cognitive instructions. `capability.meta.yaml` owns
stable identity, semantic version, dependency/conflict/lifecycle/provenance metadata,
and the formal contract. The Haskell Corpus model and validator own closed semantics;
the authoring schema is a generated adapter. Project Dhall records only exact selection,
composition, project parameters/conditions, and ID/version/digest pins.

The [Capability Coverage Matrix](capability-coverage.md) is the sole #83 authority for
the disposition and exact target of every preserved `crp/cap/**` Capability.

### Product source and project instance

`.ai4x/**` has no symbolic link to, import from, or runtime dependency on repository-
local `mod/**`. The installed product supplies or explicitly acquires versioned Corpus,
Bundle, skeleton, schema, and Assurance assets through product interfaces. ai4X dogfood
uses those same interfaces. Project declarations contain neither external-repository
links nor mutable remote references. Credentials, tokens, Keychain items, user-specific
absolute paths, and live remote state are never declarative project state.

## `#eyodf` self-application contract

`#eyodf` means bounded full public-contract self-application, not merely repository
checks or informal dogfooding. Its subject is the ai4X product repository represented as
an ordinary ai4X project instance. That instance must use the same public Project Entry,
declaration update, `scout`, `curate`, `spawn`, Work, Collaboration, validation,
Assurance, activation, host-port, Receipt, Handoff, and governance contracts available
to an adopted project.

No product-internal module call, repository-only declaration evaluator, privileged
semantic write, implicit actor, self-issued Receipt, gate shortcut, direct aggregate
access, or host-specific identity fallback may replace those interfaces. Authoritative
evidence is the subject-bound accepted declaration generation, Intent and curation
trace, composition and team identities, Work/Collaboration records, typed validation and
Assurance Receipts, activation projection manifest, Handoffs, and Gate Decisions.
Deterministic checks establish identity, version/digest closure, byte-stable projection,
Receipt validity, and gate satisfaction; semantic review and named governance acceptance
remain explicit and cannot be inferred from deterministic success.

The only bootstrap exception is building or obtaining the initial trusted ai4X
executable and immutable versioned product assets before ai4X can invoke itself. That
bootstrap may provide mechanics but cannot author project semantics, waive validation,
issue evidence, or accept a gate. From a fresh checkout, one end-to-end verification
must adopt the ai4X repository, update declarations, derive/accept curation, validate and
assure the subject, assemble one authorized activation projection, complete the required
Handoff/gate path, and reproduce the declared evidence without a privileged bypass.

## Project Intent and Curation

### Project Intent aggregate

`scout` owns WHY and WHAT and produces one coherent Project Intent containing:

- stable purpose;
- desired outcomes;
- multiple stable, revisioned Needs;
- stable, revisioned Cognitive Jobs required by those Needs;
- project and Need-specific constraints;
- anti-requirements;
- explicit priorities; and
- acceptance evidence describing how outcome achievement is recognized.

`scout` authors and validates Cognitive Jobs as demand within Project Intent. It does
not select roles, Agents, Capabilities, tools, implementation technology,
or hosts. Those are later lifecycle concerns.

### Demand and supply

A Cognitive Job is demand-side work owned by Project Intent. Curation consumes its
exact identity, revision, digest, Need links, and constraints but cannot construct or
rewrite it. A Cognitive Capability is a supply-side governed Corpus artifact. `curate` owns WHO and HOW cognitive work is
composed; it does not rewrite Project Intent or decide host placement.

The Need-to-Capability Trace is a many-to-many derivation over the complete Project
Intent. One Need may require several Capabilities and one Capability may cover several
Needs. A composition can produce deterministic evidence only through the product-owned
closed runtime contract algebra:

```text
ContractSignature { requires, provides, constraints }
FormalMatch
CoverageGap
CompositionWitness
```

Every value binds exact Need, Capability, contract, version, and digest identities. A
`FormalMatch` or `CompositionWitness` proves only compatibility within that declared
runtime algebra, dependency closure, conflict absence, and declared coverage. It does
not prove semantic fitness, runtime success, or that a Haskell function inhabits a
phantom `Need a` signature.

Witness constructors are private. The only construction boundaries are total
`matchContracts`, `composeMatches`, and `impactOfChange` functions, which return opaque
witnesses or typed gaps/conflicts. Decoded or caller-asserted witnesses are rejected or
recomputed. Their laws require exact-identity binding, dependency closure, conflict
soundness, declared-coverage soundness, permutation invariance, deterministic output,
and complete change impact; none extends the proof claim beyond the declared algebra.

Each accepted trace records:

- exact Intent, Need, Capability, and contract identities, revisions, and digests;
- required Cognitive Jobs and constraints;
- every considered candidate;
- deterministic compatibility, composition witnesses, coverage, gaps, overlaps,
  dependency closure, and conflicts;
- selections and rejections;
- semantic fitness rationale and residual uncertainty;
- accepting governance authority; and
- resulting Agent Composition and Team identities.

Formal compatibility is deterministic evidence, not proof of semantic fitness.
Semantic review evaluates domain suitability. Governance accepts or rejects the
curation decision. A Need, Cognitive Job, Capability, contract, dependency, or conflict change triggers
deterministic impact analysis and then a new explicit curation decision; no selection is
silently retained.

An LLM may conduct the bounded scout interview or assist semantic fitness review because
those steps require meaning-based judgment. Its inputs, model/host identity, uncertainty,
and proposed rationale are recorded. It cannot write an accepted aggregate directly:
closed Haskell validation, explicit plan/diff, and the configured governance authority
remain mandatory. Matching, graph closure, coverage, conflicts, impact, pin validation,
and projection are always deterministic and LLM-independent.

The preserved `Need a` experiment is notation and design evidence for #96. It contains
no corresponding Capability algebra or proof search and is not an accepted project file
format or implementation proof. The recommended v1 design decodes closed runtime
`ContractSignature` values and emits checked witnesses. Promoted kinds, GADTs,
existential decoding, and type-equality witnesses are a future alternative only when
their additional compile-time strength demonstrably justifies their complexity. Dynamic
Dhall values and phantom parameters are never interpreted as compile-time evidence that
a selected Capability implements a required function.

Selected Capability bodies are materialized once per project as derived, digest-bound
agent-context projections. Team members reference those shared projections rather than
receiving divergent copies. Project-local edits are drift, not Corpus updates.

## Collaboration and Work Management

### Collaboration contract

Collaboration is a separate project-owned Dhall aggregate. Its v1 closed kernel includes:

- Team Members and separately defined Project Roles;
- internal or external Participants with explicit participation mode and scope;
- Rights, Duties, Prohibitions, and closed-world action authorization;
- a directed, closed Collaboration Topology with explicit entry through the Referent;
- Handoff, Review, Consultation, Notification, and Delegation contracts;
- resolved topology profiles and a topology curation trace; and
- deterministic participant-facing indexes with source digests and freshness policy.

Multiple topology edges may use one interaction contract, and an edge may bind multiple
contracts. Every active Participant has a complete reachable collaboration path.
Protocol-specific edge completeness is validated. Delegation transfers performance,
never accountability; acceptance is explicit; conflicting delegation is rejected.
Every unfulfilled Duty has a reachable escalation or an explicit blocked outcome.
Self-review and undeclared action rights are prohibited.

A Collaboration Notification Contract identifies the accountable event, recipient,
delivery obligation, and failure behavior. It does not own Codex, OSC 9, ntfy, payload,
or credential mechanics; those belong to project Operations policy and host adapters.

### Work Management contract

Work Management is a separate project-owned Dhall aggregate. It defines explicit Work
Profiles rather than a hidden Epic/Story default. Its v1 kernel includes:

- Work Item types, hierarchy and dependency relations;
- a closed lifecycle with structured transitions, triggers, actors, and guards;
- distinct State and Stage concepts;
- mandatory and conditional Stages;
- directed Stage Flow using sequence, fork, join-all, guarded branch, escalation, and
  declared block/failure paths;
- Milestones, closed Stage Result types, Stage-scoped Collaboration assignments; and
- typed Exit Conditions referencing Results, Validation Contracts, Assurance Packs,
  Receipts, Handoffs, and governance gates.

A `join-all` succeeds only when every required branch is `fulfilled` or explicitly
`not-applicable` under its Applicability Condition. `blocked`, `failed`, `declined`, or
`partially-fulfilled` prevents the join and invokes declared failure behavior.
The R-15 guarded-iteration fixture proves representability only; it is not a normative
v1 Work Profile or hidden default. Adding an iteration pattern requires a separately
accepted need and profile evolution.

Concrete Work Items remain in the bound Work System. Every semantic transition uses a
stable ai4X validation/invocation boundary; direct external changes become drift.
Reconciliation is explicit plan/diff/review/apply and never silently overwrites either
store. `doctor` checks Work System and Operational Record Store consistency.

### Host-driven Assignments

ai4X v1 has no runtime dispatcher. When Activation Conditions hold, a Stage Assignment
becomes `ready` and a self-identifying bounded projection is derived. It contains Work,
Stage, Assignment, Participant, profile and observation identities; activation reason;
inputs; responsible/accountable parties; resolved rights/duties/prohibitions; expected
results; required receipts; handoff/failure paths; generation time; producer version;
integrity digests; and freshness/offline policy.

The PO, Referent, or Agent Host activates a Participant. The Agent explicitly accepts or
declines through the stable tool interface; silence and file presence have no semantic
effect. A ready Assignment remains ready until accepted, declined, invalidated by new
authoritative facts, or expired under an explicit policy. There is no hidden timeout;
`no-expiry` is explicit.

Multi-responsible execution creates distinct Participant Assignments with atomic updates
and explicit `single-responsible` or `all-responsible` completion semantics. An active
Assignment becomes fulfilled only after deterministic validation of every Result, Exit
Condition, required Receipt, and Handoff. A Stage completion and a Work Item transition
are distinct changes; neither silently implies the other.

## Validation and Assurance Receipts

`ai4x validate` is the stable agent-facing validation interface. `ai4x assurance run`
is the stable deterministic Assurance execution interface. Both support structured JSON
output and human output as explicit mutually exclusive render modes.

Receipt ownership is closed and non-overlapping:

- `ai4x-core` owns only `ReceiptRef kind` plus the common identity/provenance header;
- each owning domain validator owns its specifically tagged `ValidationReceipt` and
  diagnostic codes;
- `ai4x-assurance` owns `AssuranceReceipt` and deterministic execution outcomes;
- `ai4x-project-entry` owns `ApplyReceipt`;
- `ai4x-declaration` owns `PublicationReceipt`;
- `ai4x-governance` owns `GateDecision` and `Waiver`, never execution results;
- Work Management owns `ReceiptRequirement kind`, a typed Receipt reference, and the
  acceptable-outcome predicate, never another owner's payload; and
- Collaboration owns the Agent Duty and Handoff field carrying the typed reference,
  never Receipt semantics.

Every Receipt binds:

- contract or pack identity, version, and digest;
- exact subject, scope, and subject digest;
- producer and protocol version;
- truthful outcome;
- stable findings and diagnostics;
- evidence references and provenance; and
- generation and freshness facts.

Allowed atomic outcomes are `pass`, `fail`, `error`, `not-applicable`, and `skipped`;
aggregation may also produce `incomplete`. Exit `0` means the explicitly required
acceptable outcome, exit `1` means a completed policy failure, and exit `2` means error
or incomplete execution. Structured output is emitted on stdout; diagnostics and human
progress use stderr when structured mode is selected.

When a Stage Exit Condition requires a Receipt, Collaboration assigns the responsible
Agent the Duty to invoke the declared interface and return the Receipt reference in the
Handoff. Cross-owner verification consumes only published Receipt summaries at the
composition/orchestration boundary. Assurance or the owning validation package owns
semantics; Governance owns any gate decision. Missing,
stale, mismatched, failed, errored, skipped, incomplete, or self-asserted prose evidence
does not satisfy the condition. A waiver may authorize a transition but never rewrites
the underlying result as passed.

Only a Receipt owner can verify its payload and construct opaque
`VerifiedReceipt kind` and `ReceiptSummary kind` values. The summary binds the typed
reference, subject/version/digest, truthful outcome, integrity, provenance, and
freshness without exposing the foreign payload. Work evaluates a
`ReceiptRequirement kind` against that summary and returns a typed
`ReceiptSatisfaction`; Governance consumes only that result when deciding a gate. A
waiver changes transition authority, never the Receipt, summary, or satisfaction fact.

## Project entry, Bundles, and lifecycle commands

### Distinct entry journeys

Existing-project adoption and fresh-project creation share a desired-state planner and
atomic apply engine but remain separate explicit journeys:

- `ai4x project adopt plan|apply` inspects an existing project, preserves unrelated
  content, identifies ownership/conflicts, binds exact preconditions, and never silently
  claims unmanaged files. A byte-identical unmanaged file may be adopted only through
  an explicit reviewed `claim` operation.
- `ai4x project init plan|apply` creates from an explicit versioned skeleton/profile and
  initially accepts only a target path that does not exist. There is no `--force`, Git
  initialization, dependency installation, inferred license, inferred package manager,
  or implicit host setup.

Each plan is immutable and digest-addressed. Apply performs only listed project-local
filesystem operations, uses staging/atomic publication, updates project-relative
provenance, and writes an immutable apply Receipt. External APIs, home-directory state,
package managers, credentials, and host setup are outside this boundary.

The user chooses exactly one entry strategy: explicit Project Bundle or interview.
Bundle selection and interview are mutually exclusive and neither is default. Interview
orchestration invokes `scout` and `curate`; Bundle planning performs deterministic
binding, compatibility, fit, budget, and lineage checks and still requires project-
specific curation acceptance.

Project Bundles are optional immutable compositions, separate from Capabilities. They
pin exact skeleton/profile, project modules, Assurance Packs, Corpus release, reference
Agents, Capabilities, and topology/model candidates. They contain no project context,
state, credentials, host paths, live remote data, or effective authority binding.
Every Collaboration topology and Work Profile candidate is a typed
`BundleCandidateRef owner kind` with exact identity, version, and digest. Bundle
resolution can propose these references only; project declaration bindings and owner
validation accept or reject them, including missing, wrong-kind, wrong-version, and
wrong-digest cases.
Initial sources are product-built-in or explicitly vendored. Future remote acquisition
requires an explicit `trusted-publisher` or `pinned-digest` policy; there is no `latest`,
TOFU, floating branch, unsigned default, or external runtime link.
An acquisition request may use a product-supported resolver outside declarative project
state, but the accepted project records only product identity, exact version/digest,
trust decision, and content provenance. It never stores an external-repository link.

`ai4x-tpl` remains unchanged as inspectable migration evidence until useful semantics
are extracted with source/commit provenance into modular product assets, then is archived
read-only. It is never a runtime dependency or registry default.

### Lifecycle command ownership

| Command | Responsibility | Authoritative input | Output | Failure semantics |
| --- | --- | --- | --- | --- |
| `ai4x light prompt` | Emit the transferred MPRM bootstrap prompt without mutation | Product-owned versioned Light Prompt | Prompt bytes on stdout | Non-zero on unavailable/version mismatch; no partial write |
| `ai4x scout` | Semantic interview for WHY and WHAT | User evidence and existing bounded project context | Proposed Project Intent plan/diff | Uncertainty and missing acceptance facts remain explicit; no implicit apply |
| `ai4x curate` | Formal matching plus semantic fitness and governance-ready composition | Accepted Intent, Corpus release, explicit constraints | Trace and Agent Composition plan/diff | Gaps/conflicts/uncertainty block silent selection |
| `ai4x declarations update` | Sole Dhall evaluation and inert publication | Closed pinned Dhall graph | Atomic inert generation and diagnostics | Prior generation preserved on any failure |
| `ai4x spawn plan|apply` | WHERE and WITH WHICH HOST | Accepted inert model and explicit Host binding | Bounded project-local host projections and activation plan/result | No home/global mutation; stale/missing generation fails closed |
| `ai4x validate` | Run one stable domain validation contract | Exact subject and contract | Typed Validation Receipt | Stable typed outcome and exit mapping |
| `ai4x assurance run` | Execute selected deterministic checks | Exact subject, selection, profile/check IDs | Typed Assurance Receipt and evidence | Offline, non-mutating, truthful fail/error/incomplete |
| `ai4x assignment accept|decline|complete` | Record an explicit Participant response or completion claim | Exact Assignment generation, configured actor, claimed Results/Receipts/Handoff | Immutable Assignment event and validation result | Stale, mismatched, unauthorized, or incomplete claims fail closed; `complete` never sets fulfilled by itself |
| `ai4x work transition plan|apply` | Validate and request one semantic Work Item transition through its adapter | Exact Work observation/version, transition, actor, guards, Assignment/Stage evidence | Immutable reviewed plan and transition receipt | Direct drift, stale state, unauthorized actor, failed guard, or store inconsistency blocks apply |
| `ai4x doctor` | Read-only static integrity and readiness diagnosis | Declarations, bindings, projections, tools, stores | Typed diagnostics | Never claims policy conformance or mutates/acquires |
| `ai4x host <host> plan|apply` | Explicit global/host-local installation | Product adapter, explicit host policy, local authorization | Reviewed host plan and installation receipt | Separate from spawn; no fallback identity/channel |

Light is a low-friction entry to the same canonical Project Memory quality and
architecture, not a reduced edition. Its accepted prompt source, fixtures, fresh-agent
validation, independent review, and exact transferred digest must exist before MPRM is
dissolved.

## Assurance and verification surfaces

Assurance Packs are immutable product/tooling artifacts, not Cognitive Capabilities.
Each pack manifest owns identity, version, protocol compatibility, check contracts,
profiles, implementations, digests, provenance, applicability, dependencies, required
tools, resource limits, and stable diagnostics. Project selection under
`.ai4x/assurance/` pins exact versions/digests and parameters. Bundles may propose but
cannot activate selections. Governance owns gate bindings and evidence freshness.
Scheduling is an explicit governance binding from a check/profile to named lifecycle
events such as on-demand diagnosis, Stage Exit evaluation, root verification, or CI.
There is no background scheduler or implicit event. A host may trigger a declared event
but cannot add, remove, reorder, or reinterpret its checks.

Responsibilities remain distinct:

| Surface | Responsibility | Inputs | Outputs and failure |
| --- | --- | --- | --- |
| Command execution | Execute the explicitly named validation/check contract | Subject, contract/profile, available pinned implementation | Receipt; truthful `pass/fail/error/not-applicable/skipped/incomplete` |
| `doctor` | Diagnose declaration, selection, materialization, tool, store, facade, actor, and freshness readiness | Static project and host observations | Diagnostics only; read-only; no conformance claim |
| `utl/verify.sh` | Stable root repository-verification facade | Explicit project runner binding and exact worktree/revision subject | Preserves runner exit; never selects/adds checks |
| CI | Thin host adapter invoking `utl/verify.sh` on an immutable checkout | Commit/tree and project verification binding | Preserves exit and uploads immutable evidence; cannot weaken policy |

The generated project runner is non-authoritative, digest-bound to project selection,
and runs offline. Missing prerequisites never produce success. Verification does not
acquire, install, mutate, auto-fix, use an LLM, or follow mutable remote references.

### Text, formatting, and diagrams

The initial deterministic policy is:

- Markdown outside `.ai4x/**`: ASCII plus exactly `äöüÄÖÜß`; emoji prohibited.
- Text diagrams outside `.ai4x/**`: ASCII-only. Publication diagrams may use TikZ.
- `.ai4x/**/*.md`: the same set plus an exact versioned box-drawing/arrow allowlist;
  emoji and every other unapproved code point prohibited.
- Any ordinary fenced block containing an allowed diagram character is automatically
  validated against the versioned ai4X diagram grammar; no custom marker is used.
- Text is UTF-8, NFC-normalized, and checked with pinned Unicode data and explicit line
  ending, binary, generated-file, and path rules.
- TikZ sources allow ASCII, the German set, and approved LaTeX commands. Generated PDF
  or image artifacts use source freshness, reproducibility, contrast, grayscale,
  non-color encoding, and textual-equivalent checks rather than text scanning.

Formatting, links, governance conformance, structure, generated freshness, declaration
integrity, references, and diagram grammar are separate checks with stable path-specific
diagnostics.

## Gertrud, authority, GitHub identity, and notification

The target keeps five separate facts:

1. a generic reference Agent and its pinned cognitive Capability composition;
2. a project role for principal-referent coordination;
3. the project binding `referent_display_name = "Gertrud"`;
4. the host binding `github_actor = "gertrud-ai4x"`; and
5. the accountable Product Owner authority.

Reusable Capabilities and the generic reference Agent contain neither display name nor
GitHub account. The Referent coordinates specialists, evaluates evidence completeness,
prepares critical decisions, administers direct Sub-Issues inside an already authorized
parent contract, and recommends progression. The PO retains accountable acceptance,
risk acceptance, publication, provisioning, and changes to the Referent's own authority.

The `gertrud-ai4x` binding requires repository `Triage` and separate GitHub Project
`Write`; it has no branch push or merge authority. The PO provisions both outside the
repository. Runtime validates the exact configured actor, credentials, and effective
permissions before action. Missing, mismatched, or insufficient identity fails clearly
with no fallback to another authenticated account, especially the PO account.

Notification authority flows as follows:

```text
.ai4x/operations/notifications.dhall       host-neutral event policy
        |
        v
ai4x-adapter-codex                         canonical product adapter/source
        |
        v
.ai4x/generated/hosts/codex/**             project-local deterministic projection
.codex/config.toml                         project Codex facade
        |
        v   separate `ai4x host codex plan|apply`
<Codex user configuration>/operations/**   one global generic hook
<macOS Keychain>                           optional opaque ntfy topic only
```

`spawn` never mutates home configuration or Keychain state. `doctor` is read-only. The
global hook has fixed project-neutral, referent-neutral `ai4X` messages and needs no
repository path or identity. Local OSC 9 is default. Hosted `ntfy.sh` is optional and
explicitly enabled; its cryptographically random topic has no readable prefix and lives
only in Keychain. Payloads contain no conversation, repository, path, user, or Referent
data. Channel failures are independently non-blocking at runtime; explicit adapter tests
report failures truthfully with non-zero exit, reject cross-origin redirects, and enforce
hard total deadlines. No fallback service or channel exists.

`ai4x host codex apply` installs only the exact digest-bound adapter asset named by its
reviewed plan, refuses an unexpected existing file or broader permission, uses restrictive
local file permissions, and writes a non-secret installation Receipt. It never prints,
persists, passes on a command line, or places the Keychain topic in an environment
variable or project file. Remote requests use the one configured HTTPS origin, fixed
method/content type/payload, no redirects, bounded response bytes, and no proxy- or
response-derived command behavior.

## Complete target file tree

Classification is part of the target contract:

- `[D]` directory;
- `[T]` tracked regular file maintained as source or immutable record;
- `[G]` generated artifact, non-authoritative even when committed;
- `[H]` host-specific stub, a regular file unless explicitly outside the repository;
- `[L -> target]` tracked relative symbolic link with its exact project-local target.

Angle-bracket names are schema-defined repetitions, not omitted discretionary content.
Every Capability repetition is enumerated by the Capability Coverage Matrix. Every
source-information disposition is enumerated by the Information Disposition Matrix.

```text
[D] ./
|-- [D] .ai4x/
|   |-- [T] project.dhall
|   |-- [T] BEHAVIOR.md
|   |-- [T] CONTEXT.md
|   |-- [T] STATE.md
|   |-- [D] context/
|   |   |-- [T] index.yaml
|   |   |-- [T] domain-language.md
|   |   `-- [T] architecture.md
|   |-- [D] intent/
|   |   |-- [T] project-intent.dhall
|   |   `-- [T] acceptance-evidence.dhall
|   |-- [D] agents/
|   |   |-- [T] composition.dhall
|   |   |-- [T] team.dhall
|   |   |-- [T] capability-selections.dhall
|   |   |-- [T] need-to-capability-trace.dhall
|   |   |-- [T] reference-agent.dhall
|   |   |-- [T] principal-referent-role.dhall
|   |   |-- [T] gertrud-team-member.dhall
|   |   |-- [T] tech-lead.dhall
|   |   |-- [T] ai-strategy.dhall
|   |   |-- [T] architecture-ddd.dhall
|   |   |-- [T] capability-governance.dhall
|   |   |-- [T] critical-reviewer.dhall
|   |   |-- [T] implementation.dhall
|   |   |-- [T] requirements.dhall
|   |   `-- [T] testing-tdd.dhall
|   |-- [D] bindings/
|   |   |-- [T] project.dhall
|   |   |-- [T] team.dhall
|   |   |-- [T] github.dhall
|   |   |-- [T] hosts.dhall
|   |   |-- [T] storage.dhall
|   |   |-- [T] work-system.dhall
|   |   `-- [T] operational-record-store.dhall
|   |-- [D] coordination/
|   |   |-- [T] collaboration.dhall
|   |   `-- [T] work-management.dhall
|   |-- [D] governance/
|   |   |-- [T] authority.dhall
|   |   |-- [T] gates.dhall
|   |   |-- [T] board-policy.md
|   |   |-- [T] planning-conformance.md
|   |   `-- [D] quality/
|   |       |-- [T] engineering.md
|   |       |-- [T] architecture.md
|   |       |-- [T] requirements.md
|   |       |-- [T] implementation.md
|   |       |-- [T] testing.md
|   |       |-- [T] review.md
|   |       |-- [T] ai-strategy.md
|   |       `-- [T] haskell.md
|   |-- [D] operations/
|   |   |-- [T] delivery-workflow.md
|   |   |-- [T] development-conformance.md
|   |   |-- [T] development-conformance-template.md
|   |   |-- [T] planning-workflow.md
|   |   |-- [T] routing.dhall
|   |   `-- [T] notifications.dhall
|   |-- [D] assurance/
|   |   `-- [T] selection.dhall
|   |-- [D] records/
|   |   |-- [D] provenance/
|   |   |   `-- [T] project-entry.yaml
|   |   |-- [D] receipts/
|   |   |   `-- [T] <receipt-digest>.json
|   |   `-- [D] evidence/
|   |       |-- [D] assurance/
|   |       |   `-- [T] <evidence-digest>.json
|   |       `-- [D] reviews/
|   |           `-- [T] <review-digest>.yaml
|   |-- [D] generated/
|   |   |-- [D] declarations/
|   |   |   |-- [G] current.json
|   |   |   `-- [D] <generation-digest>/
|   |   |       |-- [G] envelope.cbor
|   |   |       |-- [G] envelope.json
|   |   |       |-- [G] source-map.json
|   |   |       `-- [G] provenance.json
|   |   |-- [D] agent-context/
|   |   |   |-- [G] capability-lock.json
|   |   |   |-- [D] capabilities/
|   |   |   |   `-- [D] <capability-id>/
|   |   |   |       |-- [G] CAPABILITY.md
|   |   |   |       `-- [G] capability.meta.yaml
|   |   |   `-- [D] participants/
|   |   |       |-- [G] tech-lead.md
|   |   |       |-- [G] ai-strategy.md
|   |   |       |-- [G] architecture-ddd.md
|   |   |       |-- [G] capability-governance.md
|   |   |       |-- [G] critical-reviewer.md
|   |   |       |-- [G] implementation.md
|   |   |       |-- [G] requirements.md
|   |   |       `-- [G] testing-tdd.md
|   |   |-- [D] assignments/
|   |   |   `-- [G] <assignment-id>.json
|   |   |-- [D] assurance/
|   |   |   |-- [G] runner
|   |   |   |-- [G] materialization.json
|   |   |   `-- [D] assets/
|   |   `-- [D] hosts/
|   |       |-- [D] codex/
|   |       |   |-- [G] invocation-context.json
|   |       |   `-- [G] notification-adapter
|   |       |-- [D] github/
|   |       |   |-- [G] binding.json
|   |       |   `-- [G] manifest.json
|   |       `-- [D] copilot-vscode/
|   |           `-- [G] manifest.json
|   `-- [D] local/
|       |-- [G] declaration-cache/
|       |-- [G] locks/
|       `-- [G] staging/
|-- [D] .github/
|   |-- [H] copilot-instructions.md
|   |-- [D] agents/
|   |   |-- [H] ai4x.agent.md
|   |   |-- [H] ai4x-ai-strategy.agent.md
|   |   |-- [H] ai4x-architecture-ddd.agent.md
|   |   |-- [H] ai4x-capability-governance.agent.md
|   |   |-- [H] ai4x-critical-reviewer.agent.md
|   |   |-- [H] ai4x-implementation.agent.md
|   |   |-- [H] ai4x-requirements.agent.md
|   |   `-- [H] ai4x-testing-tdd.agent.md
|   |-- [D] ISSUE_TEMPLATE/
|   |   |-- [H] architecture-change.yml
|   |   `-- [H] maintenance.yml
|   `-- [D] workflows/
|       `-- [H] verify.yml
|-- [D] .codex/
|   `-- [G] config.toml
|-- [L -> .ai4x/BEHAVIOR.md] AGENTS.md
|-- [T] README.md
|-- [T] CONTRIBUTING.md
|-- [T] LICENSE
|-- [T] Makefile
|-- [D] mod/
|   |-- [T] cabal.project
|   |-- [D] policy/resource-envelope/<policy-version>/
|   |   `-- [T] policy.yaml
|   |-- [D] cli/
|   |   |-- [T] ai4x-cli.cabal
|   |   |-- [D] app/
|   |   |   `-- [T] Main.hs
|   |   |-- [D] src/AI4X/Cli/
|   |   |   |-- [T] Render.hs
|   |   |   `-- [D] Command/
|   |   |       |-- [T] Project.hs
|   |   |       |-- [T] Light.hs
|   |   |       |-- [T] Scout.hs
|   |   |       |-- [T] Curate.hs
|   |   |       |-- [T] Declarations.hs
|   |   |       |-- [T] Spawn.hs
|   |   |       |-- [T] Validate.hs
|   |   |       |-- [T] Assurance.hs
|   |   |       |-- [T] Assignment.hs
|   |   |       |-- [T] Work.hs
|   |   |       |-- [T] Doctor.hs
|   |   |       `-- [T] Host.hs
|   |   `-- [D] test/
|   |       `-- [T] CliContractSpec.hs
|   |-- [D] corpus/
|   |   |-- [T] ai4x-corpus.cabal
|   |   |-- [T] README.md
|   |   |-- [G] catalog.yaml
|   |   |-- [D] src/AI4X/Corpus/
|   |   |   |-- [T] Capability.hs
|   |   |   `-- [T] Port.hs
|   |   |-- [D] schema/
|   |   |   `-- [G] capability-metadata.schema.yaml
|   |   |-- [D] releases/
|   |   |   `-- [D] <version>/
|   |   |       |-- [G] manifest.json
|   |   |       `-- [T] provenance.yaml
|   |   |-- [D] governance/
|   |   |   |-- [T] authoring.md
|   |   |   |-- [T] admission.md
|   |   |   `-- [T] portfolio-review.md
|   |   `-- [D] capabilities/
|   |       `-- [D] <semantic-category...>/
|   |           `-- [D] <capability-id>/
|   |               |-- [T] CAPABILITY.md
|   |               `-- [T] capability.meta.yaml
|   |-- [D] ass/
|   |   |-- [T] ai4x-assurance.cabal
|   |   |-- [D] src/AI4X/Assurance/
|   |   |   |-- [T] API.hs
|   |   |   `-- [T] AssuranceReceipt.hs
|   |   |-- [D] packs/
|   |   |   `-- [D] <publisher>/<pack-id>/<version>/
|   |   |       |-- [T] pack.dhall
|   |   |       |-- [T] provenance.yaml
|   |   |       `-- [D] checks/<check-id>/
|   |   |           |-- [T] check.dhall
|   |   |           `-- [T] implementation
|   |   `-- [D] test/
|   |       `-- [T] AssuranceContractSpec.hs
|   |-- [D] light/
|   |   |-- [T] ai4x-light.cabal
|   |   |-- [D] src/AI4X/Light/
|   |   |   `-- [T] API.hs
|   |   |-- [D] assets/<version>/
|   |   |   |-- [T] prompt.md
|   |   |   `-- [T] manifest.yaml
|   |   `-- [D] test/fixtures/
|   |       `-- [T] <fresh-agent-fixture>.md
|   |-- [D] lib/
|   |   |-- [D] core/
|   |   |   |-- [T] ai4x-core.cabal
|   |   |   |-- [D] src/AI4X/Core/
|   |   |   |   |-- [T] Identifier.hs
|   |   |   |   |-- [T] Version.hs
|   |   |   |   |-- [T] Digest.hs
|   |   |   |   |-- [T] Reference.hs
|   |   |   |   |-- [T] Diagnostic.hs
|   |   |   |   |-- [T] Provenance.hs
|   |   |   |   `-- [T] ReceiptRef.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] CoreContractSpec.hs
|   |   |-- [D] context-protocol/
|   |   |   |-- [T] ai4x-context-protocol.cabal
|   |   |   |-- [D] src/AI4X/ContextProtocol/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] EntityTag.hs
|   |   |   |   |-- [T] PublishedSummary.hs
|   |   |   |   |-- [T] CrossReference.hs
|   |   |   |   |-- [T] ReceiptSummary.hs
|   |   |   |   |-- [T] AssignmentProjectionInput.hs
|   |   |   |   |-- [T] WorkSystemPort.hs
|   |   |   |   |-- [T] RecordStorePort.hs
|   |   |   |   `-- [T] BundleCandidateRefs.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] ContextProtocolContractSpec.hs
|   |   |-- [D] intent/
|   |   |   |-- [T] ai4x-intent.cabal
|   |   |   |-- [D] src/AI4X/Intent/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] ProjectIntent.hs
|   |   |   |   |-- [T] Need.hs
|   |   |   |   |-- [T] CognitiveJob.hs
|   |   |   |   `-- [T] Validate.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] IntentContractSpec.hs
|   |   |-- [D] curation/
|   |   |   |-- [T] ai4x-curation.cabal
|   |   |   |-- [D] src/AI4X/Curation/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Contract.hs
|   |   |   |   |-- [T] Match.hs
|   |   |   |   |-- [T] Coverage.hs
|   |   |   |   |-- [T] Impact.hs
|   |   |   |   |-- [T] Witness.hs
|   |   |   |   `-- [T] Trace.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] CurationContractSpec.hs
|   |   |-- [D] governance/
|   |   |   |-- [T] ai4x-governance.cabal
|   |   |   |-- [D] src/AI4X/Governance/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Authority.hs
|   |   |   |   |-- [T] Gate.hs
|   |   |   |   `-- [T] Waiver.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] GovernanceContractSpec.hs
|   |   |-- [D] collaboration/
|   |   |   |-- [T] ai4x-collaboration.cabal
|   |   |   |-- [D] src/AI4X/Collaboration/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Model.hs
|   |   |   |   |-- [T] Topology.hs
|   |   |   |   |-- [T] Interaction.hs
|   |   |   |   |-- [T] Handoff.hs
|   |   |   |   |-- [T] Validate.hs
|   |   |   |   |-- [T] Projection.hs
|   |   |   |   `-- [T] ValidationReceipt.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] CollaborationContractSpec.hs
|   |   |-- [D] work-management/
|   |   |   |-- [T] ai4x-work-management.cabal
|   |   |   |-- [D] src/AI4X/WorkManagement/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Model.hs
|   |   |   |   |-- [T] Lifecycle.hs
|   |   |   |   |-- [T] Flow.hs
|   |   |   |   |-- [T] Assignment.hs
|   |   |   |   |-- [T] ReceiptRequirement.hs
|   |   |   |   |-- [T] Validate.hs
|   |   |   |   `-- [T] ValidationReceipt.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] WorkManagementContractSpec.hs
|   |   |-- [D] activation/
|   |   |   |-- [T] ai4x-activation.cabal
|   |   |   |-- [D] src/AI4X/Activation/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Plan.hs
|   |   |   |   |-- [T] Assemble.hs
|   |   |   |   |-- [T] Projection.hs
|   |   |   |   |-- [T] Transport.hs
|   |   |   |   `-- [T] HostPort.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] ActivationContractSpec.hs
|   |   |-- [D] check/
|   |   |   |-- [T] ai4x-check.cabal
|   |   |   |-- [D] src/AI4X/Check/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Contract.hs
|   |   |   |   `-- [T] Doctor.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] CheckContractSpec.hs
|   |   |-- [D] declaration-protocol/
|   |   |   |-- [T] ai4x-declaration-protocol.cabal
|   |   |   |-- [D] src/AI4X/DeclarationProtocol/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Envelope.hs
|   |   |   |   |-- [T] Manifest.hs
|   |   |   |   |-- [T] Generation.hs
|   |   |   |   |-- [T] EntityTag.hs
|   |   |   |   |-- [T] SourceMap.hs
|   |   |   |   |-- [T] Provenance.hs
|   |   |   |   `-- [T] Canonical.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] DeclarationProtocolContractSpec.hs
|   |   |-- [D] declaration/
|   |   |   |-- [T] ai4x-declaration.cabal
|   |   |   |-- [D] src/AI4X/Declaration/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] ImportPolicy.hs
|   |   |   |   |-- [T] Decode.hs
|   |   |   |   |-- [T] Compose.hs
|   |   |   |   |-- [T] PublicationPlan.hs
|   |   |   |   |-- [T] PublicationReceipt.hs
|   |   |   |   `-- [T] Publish.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] DeclarationContractSpec.hs
|   |   |-- [D] project-entry/
|   |   |   |-- [T] ai4x-project-entry.cabal
|   |   |   |-- [D] src/AI4X/ProjectEntry/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Model.hs
|   |   |   |   |-- [T] Plan.hs
|   |   |   |   |-- [T] Adopt.hs
|   |   |   |   |-- [T] Init.hs
|   |   |   |   |-- [T] Apply.hs
|   |   |   |   |-- [T] Provenance.hs
|   |   |   |   `-- [T] ApplyReceipt.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] ProjectEntryContractSpec.hs
|   |   |-- [D] bundle/
|   |   |   |-- [T] ai4x-bundle.cabal
|   |   |   |-- [D] src/AI4X/Bundle/
|   |   |   |   |-- [T] API.hs
|   |   |   |   |-- [T] Model.hs
|   |   |   |   |-- [T] Resolve.hs
|   |   |   |   `-- [T] Trust.hs
|   |   |   `-- [D] test/
|   |   |       `-- [T] BundleContractSpec.hs
|   |   `-- [D] adapter/
|   |       |-- [D] codex/
|   |       |   |-- [T] ai4x-adapter-codex.cabal
|   |       |   |-- [D] src/AI4X/Adapter/Codex/
|   |       |   |   |-- [T] API.hs
|   |       |   |   `-- [T] Notification.hs
|   |       |   `-- [D] assets/
|   |       |       `-- [T] notification-hook
|   |       |-- [D] github/
|   |       |   |-- [T] ai4x-adapter-github.cabal
|   |       |   `-- [D] src/AI4X/Adapter/GitHub/
|   |       |       |-- [T] API.hs
|   |       |       `-- [T] WorkSystem.hs
|   |       |-- [D] copilot-vscode/
|   |       |   |-- [T] ai4x-adapter-copilot-vscode.cabal
|   |       |   `-- [D] src/AI4X/Adapter/CopilotVSCode/
|   |       |       `-- [T] API.hs
|   |       `-- [D] copilot-cli/
|   |           |-- [T] ai4x-adapter-copilot-cli.cabal
|   |           `-- [D] src/AI4X/Adapter/CopilotCLI/
|   |               `-- [T] API.hs
|   |-- [D] bundles/
|   |   |-- [T] catalog.dhall
|   |   `-- [D] governed-agent-first/<version>/
|   |       `-- [T] bundle.dhall
|   `-- [D] skeletons/
|       `-- [D] minimal-single-repo/<version>/
|           |-- [T] skeleton.dhall
|           `-- [D] files/
|               `-- [T] <seed-artifact>
|-- [D] doc/
|   |-- [D] concepts/
|   |   `-- [T] project-intent-and-curation.md
|   |-- [D] commands/
|   |   |-- [T] project.md
|   |   |-- [T] light.md
|   |   |-- [T] scout.md
|   |   |-- [T] curate.md
|   |   |-- [T] spawn.md
|   |   |-- [T] doctor.md
|   |   |-- [T] declarations.md
|   |   |-- [T] assurance.md
|   |   |-- [T] validate.md
|   |   |-- [T] assignment.md
|   |   |-- [T] work.md
|   |   |-- [T] host.md
|   |   `-- [T] verify.md
|   |-- [D] reference/
|   |   |-- [T] declarations.md
|   |   |-- [T] glossary.md
|   |   `-- [T] text-and-diagrams.md
|   |-- [D] examples/
|   |   `-- [T] project-intent-to-team.md
|   |-- [D] diagrams/
|   |   |-- [T] style.tex
|   |   |-- [T] accessibility-policy.md
|   |   `-- [T] project-intent-to-team.tikz
|   `-- [D] arc/
|       |-- [D] target-architecture/
|       |   |-- [T] README.md
|       |   |-- [T] capability-coverage.md
|       |   |-- [T] information-disposition.md
|       |   `-- [T] decision-trace.md
|       `-- [D] evidence/project-declaration-r15/
|           `-- [T] <preserved-evidence-entry>
`-- [D] utl/
    |-- [T] verify.sh
    |-- [D] assurance/vendor/
    |   `-- [T] <vendored-pack-payload>
    |-- [D] documentation/
    |   `-- [T] render-publication-assets.sh
    `-- [D] repository/
        `-- [T] metadata.sh

[D] <Codex user configuration>/                 outside repository and Project Memory
|-- [G] config.toml                             global generic hook binding
`-- [D] operations/
    `-- [G] ai4x-notification-hook              installed product projection

[D] <macOS Keychain>/                           outside repository and Project Memory
`-- [G] ai4x-notification-topic                 optional secret, never projected to files
```

The only symbolic link in the target is root `AGENTS.md`, whose literal link text is
exactly `.ai4x/BEHAVIOR.md`. There is no generated Copilot CLI `AGENTS.md`, no
intermediate link target, and no external-repository link. Every
`.github/agents/*.agent.md` is a tracked regular-file host stub and never a symlink.
Each Agent stub routes only to `.ai4x/BEHAVIOR.md` and its one common generated
`.ai4x/generated/agent-context/participants/<participant-id>.md` projection. The tracked
`.github/copilot-instructions.md` stub routes only to `.ai4x/BEHAVIOR.md` and
`.ai4x/generated/hosts/github/binding.json`; no generated GitHub Agent Markdown copy
exists.

## Haskell package and API design

All packages share `mod/cabal.project`, use the `ai4x-` Cabal prefix, and expose small,
total, locally understandable APIs:

- `ai4x-core`: stable IDs, versions, digests, typed reference/published containers,
  Receipt references, provenance headers, and diagnostic containers only. Entity tags,
  domain diagnostics, validation rules, and Receipt payloads remain owner-local.
- `ai4x-context-protocol`: closed versioned owner/entity tags, inert published summaries,
  typed cross-references, Receipt summaries/satisfaction results, Bundle candidate refs,
  Assignment projection input, and host-neutral Work-System/Operational-Record-Store
  ports. It contains no aggregate constructors, validators, or business rules.
- `ai4x-intent`: Project Intent, Need, and Cognitive Job aggregate semantics and local validation.
- `ai4x-curation`: closed runtime contract-signature algebra, deterministic candidate
  matching, dependency/conflict graphs, formal coverage, runtime composition witnesses,
  impact analysis, and trace. It claims no `Need a` inhabitation proof.
- `ai4x-governance`: authorities, gate decisions, waiver rules, and typed gate
  evaluation without Assurance execution semantics.
- `ai4x-collaboration`: Collaboration types, smart constructors, local validation,
  participant projections, and typed validation receipts.
- `ai4x-work-management`: Work Profile, lifecycle/flow validation, Assignment semantics,
  and typed validation receipts.
- `ai4x-assurance`: Pack/check execution, result algebra, diagnostics, evidence, and
  Assurance Receipts; it is not a governance or domain monolith.
- `ai4x-light`: transferred versioned Light Prompt asset, manifest, provenance, and
  fresh-agent contract; it does not own Project Memory semantics.
- `ai4x-declaration-protocol`: accepted-generation reader, inert envelope, manifest,
  source-map and provenance DTOs, and canonical codec. It has no Dhall loader or
  evaluator dependency.
- `ai4x-declaration`: restricted Dhall loading, closed decode orchestration, typed
  cross-context ports, publication planning, and atomic publication. It depends on the
  protocol and owner APIs, but ordinary consumers do not depend on this updater.
- `ai4x-check`: a small composable check contract used by `doctor`; owning domain
  packages retain their invariants.
- `ai4x-project-entry`: journey-specific discovery plus shared plan/apply/provenance.
- `ai4x-bundle`: immutable Bundle model, resolution, compatibility, and trust policy;
  it does not own project bindings or Capability semantics.
- `ai4x-activation`: application service that assembles an authorized, accepted-generation
  Assignment slice through context-protocol ports, validates it into an opaque
  `ValidatedAssignment`, and produces host-neutral projection/materialization plans; it
  does not depend on concrete adapters or receive owner aggregates.
- `ai4x-adapter-*`: IO and host transport only.
- `ai4x-cli`: parsing, orchestration, rendering, and exit translation only.

The conceptual public port algebra is narrow and typed by owner and entity kind:

```text
Ref owner kind
Published owner kind
SomePublished                 closed protocol owner/kind tag for serialization only
CrossRef from to kind
PublishedSummary owner
Validated owner aggregate
Diagnostic owner code
ReceiptRef kind
```

Core owns common containers and canonical identities. `ai4x-context-protocol` owns the
closed inert owner/entity tag algebra and transport DTOs; bounded contexts map opaque
validated values into those DTOs but retain semantic constructors, `DiagnosticCode`,
raw decoded input, aggregate, and local rules. `ai4x-declaration-protocol` owns the
closed generation envelope/codec and imports context-protocol tags; neither protocol
exports a semantic validator or aggregate constructor. A context validation boundary has
this shape:

```text
validateLocal
  :: Raw owner
  -> Validation (NonEmpty (Diagnostic owner (DiagnosticCode owner)))
                (Validated owner aggregate)

publish
  :: Validated owner aggregate
  -> PublishedSummary owner
```

Composition receives only `PublishedSummary owner` values and explicitly declared
`CrossRef from to kind` ports. It never receives a sibling aggregate. `SomePublished`
exists only to serialize a heterogeneous closed envelope with an explicit owner/kind
witness; it does not create an untyped global lookup authority. `ai4x-declaration`
orchestrates owner APIs but never constructs a central `ProjectModel`, mega-AST, or
global semantic validator. Likewise, `ai4x-curation -> intent + corpus` means dependency
on public summaries and ports, never aggregate access.

The dependency graph is acyclic and enforced at package level:

```text
ai4x-core
  ^
  `-- ai4x-context-protocol

owner packages       -> core + context-protocol

ai4x-curation       -> core + context-protocol + intent/corpus public ports
ai4x-assurance      -> core + context-protocol
ai4x-bundle         -> core + context-protocol + corpus protocol
ai4x-declaration-protocol -> core + context-protocol
ai4x-declaration    -> declaration-protocol + bounded-context public APIs
ai4x-project-entry  -> core + context-protocol + bundle + declaration-protocol
ai4x-check          -> core + context-protocol + declaration-protocol + owner check ports
ai4x-activation     -> core + context-protocol + declaration-protocol
ai4x-adapter-*      -> core + context-protocol + activation ports
ai4x-light          -> core only
ai4x-cli            -> public orchestration APIs + concrete adapter assembly
```

The arrows mean "may depend on". Reverse imports, sibling aggregate access, and domain
imports from adapters into host-neutral activation are prohibited. CLI assembly may
select a concrete adapter, but `ai4x-activation` cannot import it. Cross-context types
exposed through ports contain published summaries and opaque validated references, not
another context's aggregate.

The declaration protocol is deliberately not part of `ai4x-core`: generic untyped JSON,
core-owned domain envelopes, and direct domain-value transport would either erase owner
and kind evidence or expand the shared kernel. Package checks prove that updater code and
its Dhall dependency are unreachable from activation, checks, adapters, and other
ordinary consumer executables.

Public constructors enforce non-empty and versioned identities. Validation returns all
deterministically discoverable diagnostics in stable order where safe; operations that
require an accepted aggregate take a validated opaque value. Exhaustive closed sums
represent domain states and errors. Advanced type features are admitted only when they
prevent an invalid state, express a law, or protect a boundary more clearly than runtime
validation. Filesystem, process, network, time, environment, and host observations are
explicit capabilities supplied at IO boundaries, never hidden in domain functions.

Reference resolution is indexed by exact identity. Closure, impact, cycle, reachability,
and topological passes are `O(V+E)`, or `O((V+E) log V)` where deterministic ordered maps
are used; no Cartesian cross-context scan is permitted. Diagnostic accumulation is
policy-bounded. Projection work is proportional to the Assignment-reachable slice, plus
`O(n log n)` canonical ordering. Product policy binds source file count/bytes/depth,
normalization wall time and memory, graph nodes/edges, diagnostic count, projection
records/bytes/tokens, and small-project cold/warm budgets. Exceeding a bound is a typed
failure, never partial output.

### Versioned resource envelope policy

The authoritative numeric envelope is the product-owned tracked policy at
`mod/policy/resource-envelope/<policy-version>/policy.yaml`, owned by ai4X Release
Governance and consumed as inert input by declaration, curation, activation, Assurance,
and their adapters. Architecture fixes the dimensions and typed failure semantics but
does not invent unmeasured values. Each policy version must name supported operating
systems/filesystems, CPU architecture, runtime/compiler versions, and a reproducible
reference environment; supported project classes; source count/bytes/depth;
normalization latency and peak memory; graph nodes/edges and diagnostic limits;
projection records/bytes/tokens; cancellation deadlines; and cold/warm budgets.

Publication of an implementation release is blocked until its selected policy version
has benchmark and adversarial evidence from every supported-platform class, including
boundary and over-limit fixtures, cancellation, small-project cold/warm runs, peak
memory, and proof that limit failure is typed and produces no partial publication. Until
that evidence exists, this Architecture Pack claims deterministic enforcement and
asymptotic proportionality only, not production feasibility or numeric performance.

## Key invariants

1. Every authoritative fact has one writable owner; generated data is never semantic
   input.
2. Dhall is the sole project-authoring language; Haskell is product semantic authority,
   not a second project fact source.
3. Ordinary consumers read only accepted deterministic inert generations.
4. Every local reference is validated by its owning context; only declared typed ports
   cross contexts.
5. `.ai4x` is the sole canonical spelling; coexistence with `.ai4X` is invalid.
6. Root `AGENTS.md` links directly and relatively to `.ai4x/BEHAVIOR.md`.
7. Host stubs and projections cannot grant authority, alter composition, or weaken a
   validation/gate outcome.
8. Project declarations are portable and contain no secret, absolute user path, live
   remote state, external-repository link, or mutable remote reference.
9. `scout`, `curate`, and `spawn` preserve the WHY/WHAT, WHO/HOW, WHERE/HOST boundary.
10. Formal matching, semantic fitness, and governance acceptance remain distinct.
11. Collaboration, Work Management, Governance, Assurance, and runtime records remain
    separate owners.
12. Every required Receipt is subject-, version-, digest-, provenance-, and freshness-
    bound; self-assertion never substitutes for it.
13. v1 activation is host-driven; no hidden dispatcher, timeout, default profile, actor,
    Bundle, skeleton, host, runtime, license, package manager, or overwrite behavior
    exists.
14. Verification is deterministic, offline-capable, non-mutating, LLM-independent, and
    truthful about incomplete execution.
15. Project Entry, declaration publication, projection generation, and store updates are
    planned and atomically published or leave the prior accepted state unchanged.
16. Semantic identity excludes operational timestamps; the same immutable input tuple
    yields the same canonical bytes and digest.
17. Owner validators own logical diagnostics; declaration maps captured origins to
    source spans, and the CLI only renders them.
18. No central project mega-AST or global validator exists; Composition receives only
    published summaries and explicit typed cross-references.
19. Ordinary-consumer dependency closure excludes Dhall loading and evaluation.
20. Agent projections disclose only an authorized Assignment-reachable allow-list under
    explicit record, byte, token, provenance, and freshness bounds.
21. A `#eyodf` claim requires end-to-end self-application through public contracts; the
    mechanical bootstrap grants no semantic, evidence, or governance privilege.
22. Numeric feasibility is claimed only for a versioned resource-envelope policy with
    accepted supported-platform benchmark and adversarial evidence.

## Options and trade-offs

### Option A: Dhall project authority with bounded Haskell semantics

This is the recommendation described above.

Benefits:

- inert, total, diff-friendly project authoring without arbitrary project code execution;
- one project fact source and one product semantic owner;
- closed domain APIs, exhaustive errors, strong graph validation, and deterministic
  inert publication;
- ordinary operation without Dhall evaluation or ambient GHC/Cabal; and
- clean host transport and package boundaries.

Costs:

- an explicit declaration-update lifecycle;
- structural Dhall types require exact source mapping and Haskell-side nominal checks;
- decoder/schema compatibility and resource-bounded import evaluation require release
  gates; and
- two validation layers can drift unless generated adapters and contract tests bind them.

### Option B: native Haskell project declarations

Project-owned Haskell modules could construct closed product values and provide stronger
nominal authoring feedback and programmable abstraction. Ordinary commands could still
consume inert compiled output.

This option is rejected for project authoring because update executes arbitrary trusted
project code, requires a pinned compiler/package closure, raises authoring and diagnostic
cost, and still needs semantic validators. Safe Haskell is not a sandbox. Its additional
power does not justify the trust and operational surface for project data.

### Rejected alternative: dual normative Dhall and Haskell authoring

A split source model was prototyped and rejected. It duplicates concrete facts, creates
a cross-language linker, two-ended source maps, two trust/evaluation boundaries, and
coordinated evolution without a demonstrated semantic benefit. It violates one-owner-
per-fact and makes drift a normal state.

### Rejected internal alternatives

A central `ProjectModel` mega-AST or global semantic validator is rejected because it
erases bounded-context ownership, enables sibling reach-through, and makes extension a
high-blast-radius change. Dynamic Dhall and the preserved phantom `Need a` notation are
also rejected as compile-time proof that a Capability implements a required function;
the accepted v1 evidence is a checked runtime witness whose formal claim is deliberately
bounded. Finally, core-owned generic transport, untyped JSON envelopes, and direct
domain-value delivery are rejected because they weaken owner/kind evidence and the
domain-to-host boundary.

### Challenge to the dominant option

The strongest challenge to Option A is that a Dhall evaluator, closed Haskell decoder,
canonicalizer, source map, inert format, and atomic publisher may be disproportionate
for small projects. A simpler strict data format plus Haskell validation would reduce
runtime and authoring-tool complexity.

That challenge is material. Option A remains preferred because project declarations
must express composable, pinned Collaboration, Work Management, Intent, Curation,
Governance, Assurance, and binding graphs without hidden defaults, while preventing
arbitrary code and unsafe imports. The R-15 fixture demonstrates that flat typed
references remain authorable and gives Dhall integrity hashes and total normalization.
The architecture contains cost through one explicit update boundary, a minimal schema,
ordinary inert consumers, and no Church-encoded graphs or project-authored validators.
If production benchmarks or author studies show this boundary is disproportionate, the
replacement must preserve sole project authority, inert evaluation, exact provenance,
closed decoding, and deterministic publication; syntax convenience alone is insufficient.

## Risks and migration impact

| Risk | Impact | Target control |
| --- | --- | --- |
| Dhall/Haskell schema drift | Valid source decodes differently across releases | Generated schema adapter, release-gated decoder fixtures, exact protocol versions, explicit source migration |
| Import scan/evaluate race or pathological normalization | Trust or availability failure | AST policy, canonical containment, pinned closure, resource limits, staged publication, production hardening follow-up |
| Incomplete source maps | Unactionable project diagnostics | Preserve exact source spans through decode/validation; diagnostic path/cardinality tests |
| Over-central Haskell core | Bounded contexts lose ownership | Minimal `ai4x-core`, package dependency checks, local validators, explicit ports |
| Formal matching overclaims fitness | False confidence in team composition | Separate deterministic witness, semantic review, residual uncertainty, governance acceptance |
| Generated host drift | Host runs stale policy or Agent context | Source digests, generation manifest, `doctor`, byte comparison, fail closed |
| External Work System divergence | Invalid transition or stale Assignment | observation versions, cross-store checks, explicit reconciliation, freshness/offline policy |
| Assurance complexity for small projects | Adoption burden | Assurance optional for minimal projects; narrow stable facade and built-in/vendored packs |
| Identity or permission fallback | Impersonation or excess authority | exact configured actor and permissions, credential isolation, no fallback |
| Notification privacy or delivery ambiguity | Data leakage or false delivery claim | fixed payload, local default, opaque Keychain topic, explicit tests, isolated failures |
| Text policy rejects historic content | Broad documentation remediation | disposition inventory, path-specific checks, explicit Greenfield cut only after approval |
| Co-author/review coverage incomplete | Haskell design accepted without required expertise | #83 gate remains blocked until the decision-trace evidence is complete |

This Greenfield model deliberately contains no compatibility directories, aliases,
migration scaffolding, legacy runtime links, or temporary workarounds. A later migration
must be derived from the accepted Information Disposition Matrix and its own authorized
plan. It must preserve unrelated data, stage high-blast-radius changes, and verify exact
facades, package boundaries, declarations, fresh-agent behavior, and deterministic
evidence before any source deletion. The preserved sandbox and R-15 evidence are not
recreated or relocated by this package.

## Documentation consistency contract

Project Intent, Needs, Cognitive Jobs, Cognitive Capabilities, Need-to-Capability Trace,
Agent Composition, Team, and the scout/curate/spawn boundaries must use the same meanings
in all of these target surfaces:

- the lean root `README.md` at Purpose/USP level;
- `doc/concepts/project-intent-and-curation.md`;
- `doc/commands/scout.md`, `curate.md`, and `spawn.md`;
- `doc/reference/declarations.md`;
- the complete `doc/examples/project-intent-to-team.md` example;
- `doc/reference/glossary.md`; and
- maintained diagrams and their textual equivalents.

Deterministic checks compare canonical terms, links, diagram sources, and example
identity/revision references. Documentation may explain authoritative models but never
becomes an alternative declaration authority.

## Architecture verification obligations

The architecture gate requires independently inspectable target checks for:

1. package DAG, reverse imports, and golden public-module exports;
2. owner-local validation plus wrong-owner, kind, version, and digest counterexamples;
3. ordinary-consumer dependency closure with no reachable Dhall loader/evaluator;
4. schema/decoder protocol fixtures for supported and rejected versions and fields;
   golden phase API/exports; decode dependency closure excluding filesystem/network;
   injected timeout, memory, cancellation, and lazy-evaluation failures producing one
   typed `DecodeFailure` and no later phase; apply closure excluding Dhall/source;
5. canonical bytes/digests across permutations, duplicate rejection, and exact
   diagnostic owner/code/path/span/cardinality;
6. graph laws, stated complexity bounds, and source/normalization/graph/projection
   resource limits;
7. Receipt tamper, stale, missing, self-asserted, and outcome tests from owner API through
   CLI structured output/exit behavior to Work, Collaboration, and Handoff references;
8. publication fault, crash, and concurrency injection proving readers observe the prior
   generation or one complete new generation, never a mixture;
9. projection allow-list, secret/redaction, size/token, freshness, actor/permission,
   provenance, and byte-stability tests; and
10. adversarial loader tests for remote/environment/absolute/unfrozen/symlink/escape,
    swap-during-read, resource, timeout, memory, and cancellation behavior over captured
    bytes; and
11. a fresh-checkout `#eyodf` journey proving the ai4X repository uses every required
    public self-application surface, produces subject-bound declaration, curation,
    validation, Assurance, activation, Handoff, and gate evidence, and uses no privileged
    semantic bypass beyond the documented mechanical bootstrap.

## Architecture gate condition

The target is coherent and all acceptance criteria are architecturally addressed. The
four companion artifacts are integrated, cross-artifact checks pass, HR-01 through HR-09
pass, and every material Haskell finding has an independently verified clean
remediation. The architecture specialist gate is `pass`. This document does not
self-approve Issue #83; final acceptance remains with the Tech Lead and Product Owner.
