# Haskell-only candidate assessment

## Candidate verdict

**pass**, with material trust-boundary and operational-cost observations.

The prototype demonstrates that Haskell-only project authoring can express the complete
common fixture, keep context validators separate, reject all required invalid variants,
and generate a deterministic inert artifact. This verdict establishes viability only. It
does not select Haskell over Dhall or the deliberate hybrid candidate.

## Assumptions

- Project authors who edit declarations can be granted the same trust as build/update
  code authors.
- A production update environment would pin GHC and the full dependency/source closure;
  this bounded prototype records GHC 9.6.7 but does not provide that complete lock.
- Ordinary curate, spawn, doctor, and runtime validation consume only the inert artifact.
- Host adapters resolve external state independently; declarations do not mirror live
  backlog status or order.
- The comparison's fixed digest tokens stand in for a production content-addressed source
  closure and are not represented as computed hashes.
- The prototype module split is a proxy for separately versioned product packages, not a
  reason to collapse them into one package.

## Context boundaries and integration points

Collaboration, Work Management, Project Intent, and Curation/Capabilities each define
their own records and validators. The Governance/Assurance slice is isolated for the
fixture. `R15.Validate` composes results using published stable IDs; it does not mutate or
reinterpret another context's aggregate. `R15.Common` contains only shared scalar
vocabulary. Project Bundle pins and Project Entry bindings are owned by
`R15.Integration`. The inert encoder owns transport ordering, not domain semantics.

This separation is evidence for the accepted product boundary: `ai4x-core` supplies only
IDs, versions, digests, references, provenance, and typed errors;
`ai4x-collaboration`, `ai4x-work-management`, `ai4x-intent`, and `ai4x-curation` own their
semantics; domain rules remain with those owners; and `ai4x-assurance` executes composed
checks over their published contracts. The fixture's `R15.Governance` module must not be
read as a proposal for a central governance monolith.

## Key invariants demonstrated

- Stable references resolve by exact ID and version.
- The selected collaboration model and work profile are explicit; the concrete
  Issue/Sub-Issue and Epic/Story profiles coexist without a default.
- Delegation does not transfer accountability, and producer/reviewer separation is
  explicit.
- Work hierarchy, lifecycle topology, guards, join-all completion, assignments, and the
  declared flow and failure path remain Work Management rules. Dependency cycles and
  duplicate Stage IDs are rejected.
- Stage declarations are separate from explicitly non-authoritative operational fixture
  evidence; Project Memory does not acquire runtime Stage state.
- Gate decisions require their declared authority. Assurance Packs bind evidence and
  decisions to a gate, receipts must agree with the allowed decision and exact evidence
  digests, waiver shape is explicit, and none of these replace semantic review.
- Needs, constraints, anti-requirements, and Cognitive Jobs remain Project Intent
  concepts; capability requirements, conflicts, selection, and traces remain Curation
  concepts.
- Host bindings appear only at Project Entry/adapter integration.
- The emitted artifact is sorted, duplicate-free, fact-source-mapped, explicitly derived,
  and contains no live-backlog record. Its mappings provide real file paths and logical
  anchors only; no line/column precision is claimed.
- Inert validation independently checks the acceptance authority/decision, receipt,
  join-all evidence, transitions, flow, failure path, escalation, waiver shape, source
  digests, reference versions, and fact-level source mappings.

## Options considered

### Option A: typed context modules plus explicit updater

This is the implemented option. Project source constructs typed values from
context-owned modules. The explicit updater validates those values and emits the common
inert representation.

Advantages:

- excellent expressiveness for graph-shaped collaboration, process, Need, and capability
  declarations;
- compile-time checking for constructors and field types;
- natural abstraction and composition for reusable project profiles;
- exhaustive pattern matching is available for closed domain states;
- offline execution and deterministic output are straightforward with a pinned toolchain
  and canonical emitter.

Costs:

- project declarations are fully executable trusted code;
- semantic invariants still require explicit validators and tests;
- compiler diagnostics are strong for type errors but project-facing domain diagnostics
  and source locations require additional engineering;
- declaration updates inherit Haskell build, package, and version-management complexity.

### Option B: one generic Haskell declaration tree with a central interpreter

A single open record/tree could make rendering and schema evolution initially cheaper.
It is rejected because stringly typed tags defer mistakes to runtime, weaken exhaustive
checking, encourage a common mega-schema, and transfer validator authority away from the
bounded contexts. This would erase the main advantage of choosing Haskell.

### Rejected implementation technique: Template Haskell as the primary authoring API

Template Haskell could derive source maps and reduce record boilerplate. It is rejected
for this evidence stage because it expands compile-time execution and diagnostics
complexity before the semantics are stable. It also makes the trusted-code boundary less
obvious. Limited derivation can be reconsidered after the authority architecture is
chosen.

## Challenge to the implemented option

The strongest counterargument is that Haskell's power is unnecessary and hazardous for
mostly declarative project data. Static types do not make project source inert: imports,
Template Haskell, build hooks, and escape hatches such as `unsafePerformIO` can execute or
hide effects. A sandbox or code review policy reduces but does not remove this fact. If
non-programmers must frequently edit models, the compiler and package workflow may also
be a disproportionate usability tax. Dhall or a hybrid boundary may retain most schema
safety with a smaller authority and security surface.

## Validation evidence

The prototype compiled with GHC 9.6.7, `base`, and the GHC boot package `directory` under
`-Wall -Werror`. The positive
fixture passed. The negative matrix produced exactly the required owning error in each
case:

| Invalid fixture | Required code | Result |
| --- | --- | --- |
| unresolved handoff receiver | `UNRESOLVED_REFERENCE` | pass |
| illegal `ready -> done` transition | `ILLEGAL_TRANSITION` | pass |
| transferred delegation accountability | `DELEGATION_ACCOUNTABILITY_CONFLICT` | pass |
| Reviewer deciding the acceptance gate | `UNAUTHORIZED_GATE_DECISION` | pass |
| completed acceptance with incomplete review | `INCOMPLETE_JOIN_ALL` | pass |
| conflicting selected capabilities | `CAPABILITY_CONFLICT` | pass |
| missing required capability/Need coverage | `CAPABILITY_COVERAGE_GAP` | pass |

The additional invariant matrix rejected a Work dependency cycle, duplicate Stage ID,
Governance/Assurance reference-version mismatch, incoherent receipt, unauthorized
transition actor, and incorrect transition guard. The corresponding errors use closed
`ErrorKind` constructors rather than free-form strings.

Four inert-artifact regressions independently rejected a Reviewer forged as acceptance
authority, `review=pending` with `accept=complete`, removal of the acceptance decision,
and a forged source digest. These checks parse only inert rows and do not evaluate
`R15.Fixture`.

Two staged update runs emitted byte-identical 85-line artifacts with observed SHA-256
`b632c03168ea316202e0fea82db8cbba2dc82b33701a585421b71fc76f233898`.
Each update wrote a same-directory staged file, re-read and semantically validated it,
renamed it to the target, and re-read the published artifact. Runtime artifact validation
then passed without evaluating project declaration source.

## Risks and migration impact

- **Trusted code — high:** update/build executes arbitrary project Haskell. Trust must be
  explicit in UX, policy, CI permissions, and provenance. Safe Haskell would not make
  compilation or the build chain safe, so it is not offered as remediation.
- **Reproducible source closure — high:** a real digest must include transitive local and
  package inputs, the GHC binary, package database, and boot-package versions. The
  prototype's declared token and recorded GHC version are intentionally insufficient.
- **Diagnostics and source mapping — medium/high:** the prototype uses explicit source
  anchors. Production-quality locations must be accurate and cannot rely on authors
  truthfully supplying strings.
- **Package evolution — medium:** context package version changes can cause broad source
  recompilation. Compatibility adapters and explicit schema-version migrations would be
  needed.
- **Determinism — medium:** byte-identical output and staged re-read are demonstrated, but
  arbitrary author code can still read nondeterministic inputs. The updater must either
  isolate such inputs or make reproducibility verification a gate.
- **Atomic publication portability — medium:** same-directory rename is demonstrated on
  the tested filesystem, not as a portable multi-file transaction or crash-recovery
  protocol.
- **Authoring accessibility — medium/high:** declarations demand Haskell tooling and
  literacy, especially for compiler errors and refactors.
- **Migration — low now:** this is greenfield evidence and changes no production model.
  Selecting the candidate later would introduce a GHC toolchain, context authoring APIs,
  an updater, artifact compatibility rules, and trust documentation.

## Recommendation for the comparison

Keep Haskell-only as a viable candidate because it passes the full semantic fixture and
offers the strongest programmable type surface. Do not select it until the three-way
comparison explicitly weighs that benefit against the arbitrary-code boundary,
reproducibility burden, diagnostics, and author accessibility. If project declarations
must be safely editable by less-trusted contributors, prefer the Dhall or hybrid
authority architecture unless those prototypes fail required expressiveness or source
traceability.
