# R-15 Deliberate Hybrid Candidate

## Candidate verdict

**Blocked.** The split is precise enough to prototype, but a genuine dual normative
source does not earn its operational cost. It forces one semantic change to cross a
trusted executable Haskell boundary and an inert Dhall boundary, requires a custom
cross-language linker for diagnostics that neither language can provide alone, and
creates review ambiguity at relationships whose endpoints and policy live in different
files. This is an architectural blocker for selecting this candidate, not evidence that
the fixture itself is incoherent.

The Dhall source type-checks and normalizes with Dhall 1.42.3, and the Haskell harness
compiles. Its positive and seven invalid results are only illustrative boundary
test-double outcomes: the harness neither parses `project.dhall` nor links the two
authoritative sources. Full common-fixture validation, typed extraction through the
product's Haskell `dhall` library, and complete linked IR emission were not executed.

## Assumptions

- The common fixture contract is authoritative for candidate comparison.
- A hybrid is genuine only if both project-authored Haskell values and Dhall values are
  normative. Using Haskell merely to implement a Dhall consumer is Dhall-only authoring,
  not this candidate.
- The required architecture permits one source per fact and no precedence merge. The
  attempted prototype violates that requirement in several concrete places documented
  below; this observed failure is part of the rejection evidence.
- The fixture digest tokens are comparison constants, not computed cryptographic hashes.
- The future product may use the Haskell `dhall` library. The local evidence runner uses
  only `base` and does not stand in for that integration.
- Product-owned metamodel semantics and validators remain in separate Haskell packages:
  core protocol/IR, Collaboration, Work Management, Project Intent, Curation, and
  Assurance/check. Neither project-authored language may add a metamodel constructor.

## Attempted context and authority split

The intended common envelope would not own domain semantics. Each bounded context would
publish a versioned summary to a linker, while its validator retained its invariants.
The checked-in harness does not implement that architecture.

| Statement class | Intended project source | Reason |
| --- | --- | --- |
| IDs, versions, bundle pins, Project Entry, host pointers | `project.dhall` | Inert graph and binding data |
| Participants, roles, assignments, handoff/review/escalation topology | `project.dhall` | Project instances and edges |
| Role rights, duties, prohibitions, delegation accountability selection | `HybridPolicy.hs` | Concrete values built from closed product API constructors |
| Profiles, kinds, states, stage graph and participant assignments | `project.dhall` | Project graph instances |
| Hierarchy cardinality, dependency acyclicity, legal transitions/guards, join-all and failure selection | `HybridPolicy.hs` | Concrete values built from closed product API constructors |
| Authorities, gates, decisions, evidence, assurance, receipts, waivers | `project.dhall` | Governance instance graph |
| Gate decider and waiver authorization selection | `HybridPolicy.hs` | Concrete values built from closed product API constructors |
| Needs, constraints, anti-requirements, Cognitive Jobs | `project.dhall` | Descriptive Project Intent |
| Capability contracts, requires/conflicts, selection and trace | `project.dhall` | Curation-owned graph |

This table is the attempted split, not a demonstrated one. `ClosedApi.hs` contains
fixture-specific IDs, while `Prototype.hs` copies selected Dhall-shaped facts into one
central `GraphSlice` and validates multiple contexts in one module. They are deliberately
inadequate harness components and do not demonstrate the accepted separate product
packages or an `assurance/check` boundary over published summaries.

### Observed duplicate concrete facts

The attempted split failed its own single-authority rule:

| Concrete fact | Dhall occurrence | Haskell occurrence |
| --- | --- | --- |
| Participant, role, gate, and lifecycle identifiers | `participants`, `roles`, `gates`, and `states` | fixture-specific `actorId`, `roleId`, `gateId`, and `renderState` mappings |
| Tech Lead retains delegation accountability | `collaboration.delegation.accountabilityHolder` | `DelegationRetainsAccountability TechLead` |
| Story has exactly one Epic parent and Story dependencies are acyclic | `representativeHierarchy` and `representativeDependency` | `ExactlyOneParent` and `AcyclicDependency` |
| Acceptance requires test and review | flow edges into `accept` | `CompletesStage ... (JoinAll [test, review])` |
| Gate/actor relationships | decisions bind gate and decider | `AuthorizesDecision` binds the same gates and actors |

These are not harmless cross-language references: the concrete values can drift and no
executed linker detects that drift. The central test double copies further facts instead
of proving extraction. The prototype therefore demonstrates ambiguity, not a valid
dual-authority partition.

## Required target invariants (not demonstrated)

Except for the standalone Dhall type check and toy Haskell compilation, the harness does
not establish these invariants. The first one is observably violated.

1. Required but not achieved: no fact may exist normatively in both languages. The
   duplicates above make this invariant fail before a build/linker can be trusted.
2. Project declarations instantiate the versioned product metamodel; they cannot add a
   right, duty, state, guard, completion policy, authority semantic, or validator.
3. Every ID is a non-empty URN and every reference resolves at exactly version `1.0.0`.
   The Haskell segment records that expected reference version explicitly once as a
   segment parameter; it is not inferred by a product default.
4. The Project Entry explicitly selects all five declarations, project authority, and
   host pointers. There is no profile, lifecycle, authority, or policy default.
5. Host IDs occur only in Project Entry bindings, never inside a host-agnostic domain
   aggregate.
6. Live status, backlog order, host bodies, and operational history are absent.
7. Normal product commands consume one inert generation and never invoke GHC or Dhall.
8. A generated IR and source map are derived, content-addressed, and non-authoritative.
9. A build either publishes all five linked context summaries and the envelope or
   publishes nothing.

## Explicit update boundary

The proposed, unimplemented entry point would be:

```text
ai4x declarations update --source-set hybrid/source-set.lock --plan
ai4x declarations update --source-set hybrid/source-set.lock --apply
```

No checked-in command implements this contract. A target `--plan` would perform these
steps in a restricted, offline staging directory:

1. Verify the lock names the exact Haskell module closure, the exact project-local Dhall
   import closure, schema/API versions, compiler/library versions, and source digests.
   The checked-in prototype lock illustrates the required metadata only; no updater
   consumes it. Its zero-import Dhall policy is stricter than the target's permitted
   locked project-relative imports.
2. Compile and execute the project Haskell exporter. This is an explicit trusted-code
   boundary. Network and credentials are unavailable, but it is not described as a
   language sandbox.
3. Reject Dhall HTTP(S), environment, home-relative, and absolute imports before
   evaluation; resolve only locked project-relative imports. Type-check and normalize
   through the pinned Haskell Dhall library.
4. Decode each language segment into context-specific input ports owned by the separate
   product packages. Each context package checks local invariants; `assurance/check`
   checks versioned published cross-context references.
5. Canonically order semantic sets by ID, encode one inert IR, and emit a source map from
   every output fact to language, path, and source span. Diagnostics retain both ends of
   a cross-language relationship.
6. Write a generation manifest containing IR digest, source-set digest, tool versions,
   context versions, and provenance. Re-read and validate the staged generation.

`--apply` requires the exact reviewed plan digest. It writes a new immutable generation
directory and atomically replaces a small current-generation pointer. A failure before
the pointer exchange leaves the prior generation active. Editing the two authoritative
sources is not atomic; publishing a usable generation is.

`curate`, `spawn`, `doctor`, and ordinary validation reject a missing or stale generation
and never call this entry point implicitly.

### Exact inert output sketch

```text
HybridEnvelopeV1 {
  sourceSetDigest,
  protocolVersion = "1.0.0",
  projectEntry,
  contexts = {
    collaboration = CollaborationIR + CollaborationSourceMap,
    workManagement = WorkManagementIR + WorkManagementSourceMap,
    governanceAssurance = GovernanceIR + GovernanceSourceMap,
    projectIntent = ProjectIntentIR + ProjectIntentSourceMap,
    curationCapabilities = CapabilitiesIR + CapabilitiesSourceMap
  },
  provenance = [
    { language = Haskell, path = "hybrid/HybridPolicy.hs", digest, compiler },
    { language = Dhall, path = "hybrid/project.dhall", digest, evaluator }
  ]
}
```

The envelope provides transport and lookup only. It cannot mutate, validate on behalf
of, or merge the five context aggregates.

## Cross-language checking and diagnostics

The smallest representative split deliberately places relationship endpoints in Dhall
and their behavioral rules in Haskell. The linker therefore needs typed namespaces such
as `ParticipantId`, `RoleId`, `GateId`, and `StageId` at its internal ports even though
the Dhall source uses structurally typed `{ id, version }` references.

The target would have to resolve both the Dhall and Haskell source spans for every
cross-language relation. That linker was not implemented. `Prototype.hs` demonstrates
only that a centralized hand-built value can select the expected error-code labels. It
does not demonstrate ownership, Dhall extraction, cross-language resolution, or
authoritative-source diagnostics.

## Illustrative test-double scenarios

| Scenario | Illustrative expected label |
| --- | --- |
| Positive fixture | No diagnostics |
| Missing handoff receiver | Collaboration — `UNRESOLVED_REFERENCE` |
| `ready -> done` attempt | Work Management — `ILLEGAL_TRANSITION` |
| Delegated accountability transferred | Collaboration — `DELEGATION_ACCOUNTABILITY_CONFLICT` |
| Reviewer decides acceptance | Governance and Assurance — `UNAUTHORIZED_GATE_DECISION` |
| Accept completes before review | Work Management — `INCOMPLETE_JOIN_ALL` |
| Unsafe auto-approve selected with gate evaluation | Curation and Capabilities — `CAPABILITY_CONFLICT` |
| Required validation capability removed | Curation and Capabilities — `CAPABILITY_COVERAGE_GAP` |

The common contract has no Project Intent invalid variant. Project Intent is present in
Dhall, but it was not linked or validated as an authoritative context source.

## Options and challenge

### Option A — policy in Haskell, graph instances in Dhall (prototyped)

This is the least arbitrary hybrid split found. Haskell expresses closed policy with
nominal internal ports; Dhall keeps frequent project graph edits inert and diffable.

Counterargument: most meaningful edits combine graph and policy. Adding a stage and its
transition, a gate and its authority, or a role and its rights now crosses two syntax,
tooling, trust, and diagnostic regimes. The apparent separation by "behavior" versus
"data" cuts through each bounded context's aggregate.

### Option B — domain split by language

Put whole bounded contexts in one language, for example Collaboration and Work
Management in Haskell and Intent/Capabilities in Dhall. This makes local ownership more
coherent, but the language choice becomes an arbitrary domain property, cross-context
references still need the linker, and authors must still learn and operate both stacks.

### Rejected hybrid — Dhall base with Haskell override

A merge in which Haskell overrides or completes Dhall records is rejected. It creates
two authorities for the same fact, makes diffs incomplete, and violates the repository's
single-authoritative-source contract. No precedence rule repairs that defect.

## Assessment

| Criterion | Finding |
| --- | --- |
| Authoring ergonomics | Poor for changes that combine topology and policy; two languages and a source-set lock must be edited |
| Type safety | Toy closed Haskell enums and Dhall structural typing compile independently; cross-language nominality was not demonstrated |
| Validation reach | Not demonstrated; only a centralized test-double matrix ran |
| Trust boundary | Mixed: every update accepts Haskell arbitrary-code risk even when most data is inert Dhall |
| Offline behavior | Feasible with locked local imports and pinned toolchain; not end-to-end executed here |
| Determinism | Feasible after extraction and canonical ordering; GHC build reproducibility and source paths require explicit pinning |
| Diagnostics | Potentially precise, but only after maintaining a two-ended source map outside both languages |
| Evolution/versioning | One coordinated protocol bump can require Haskell API, Dhall schema, decoder, linker, and lock changes |
| Operational complexity | Strict superset of the two single-authoring candidates without a demonstrated compensating need |
| AI/human audit | Individual files are readable; the complete meaning of a relationship is often split across files |

Needs, Cognitive Jobs, Capabilities, and Need-to-Capability Trace fit naturally in the
Dhall graph source. Their presence does not justify making Haskell a second project
authority. Conversely, moving them to Haskell would expose descriptive curation changes
to the trusted-code build boundary without gaining a fixture-level invariant.

## Risks and migration impact

- **High — authority ambiguity:** domain concepts span two sources and the attempted
  prototype duplicates concrete facts across them.
- **High — operational weight:** the distributed updater needs both a pinned GHC build
  path and Dhall evaluation/decoding, plus a custom linker.
- **High — trust dilution:** choosing Dhall for inert facts does not remove the trusted
  Haskell execution required for every atomic generation.
- **Medium — diagnostic drift:** source-span formats and decoder schemas can change
  independently and break two-ended diagnostics.
- **Medium — evolution fan-out:** a reference-shape change touches both authoring APIs,
  context ports, canonical IR, and source maps.
- **Low — runtime performance:** ordinary commands read only inert IR, so authoring
  complexity does not affect steady-state command execution.
- No migration is authorized. These files are design evidence under `xxx/` only.

## Evidence and reproducibility

Observed locally with Dhall 1.42.3 and GHC 9.6.7:

```sh
mkdir -p /tmp/r15-hybrid-build
dhall --file ./xxx/r15-declaration-comparison/hybrid/project.dhall
dhall hash --file ./xxx/r15-declaration-comparison/hybrid/project.dhall
ghc -XNoGeneralizedNewtypeDeriving -Wall -Werror \
  -outputdir /tmp/r15-hybrid-build \
  -i./xxx/r15-declaration-comparison/hybrid \
  ./xxx/r15-declaration-comparison/hybrid/Prototype.hs \
  -o /tmp/r15-hybrid-build/r15-hybrid-prototype
/tmp/r15-hybrid-build/r15-hybrid-prototype
```

The Dhall expression normalized successfully and its computed semantic hash was
`sha256:79bc8712f8dbbf7b17fd358376c261f793a90178e57467aeefea1ce7c90fab27`.
This observed hash is evidence only; it does not replace the common fixture's explicit
source-digest token. The concise command output is recorded in `observed.txt`. Its
Haskell `PASS` lines are explicitly test-double results, not proof that the Dhall and
Haskell authoritative sources form or validate the common fixture.

## Primary technical sources

- [Haskell 2010 Language Report](https://www.haskell.org/onlinereport/haskell2010/)
  defines Haskell's static types, algebraic data types, modules, separate compilation,
  and `IO` program boundary.
- [GHC Safe Haskell documentation](https://downloads.haskell.org/ghc/latest/docs/users_guide/exts/safe_haskell.html)
  explicitly distinguishes type/module safety from compilation safety; arbitrary
  processes can still be launched during compilation. The updater therefore treats
  project Haskell as trusted code even with `{-# LANGUAGE Safe #-}`.
- [Dhall safety guarantees](https://docs.dhall-lang.org/discussions/Safety-guarantees.html)
  document Dhall's limited import effects, total normalization, lack of general
  recursion, and semantic integrity checks. This candidate still rejects network and
  environment imports rather than relying on their availability.
- [Official `dhall-haskell` repository](https://github.com/dhall-lang/dhall-haskell)
  is the intended in-process Haskell integration source; no CLI subprocess is required
  by the target design.

## Decision recommendation

Do not select genuine hybrid normative authoring for R-15. The prototype failed to
maintain single authority, bisects domain aggregates, and makes atomic evolution, trust,
and diagnostics strictly harder.
Compare Haskell-only and Dhall-only on the common fixture and select one project
authoring authority. A Haskell product consuming Dhall declarations remains a coherent
Dhall-only authoring architecture and preserves Haskell for implementation and
context-owned validators without creating dual project authority.
