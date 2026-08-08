# R-15 Dhall-only project-authoring assessment

## Scope and assumptions

This is architecture/prototype evidence for Issue #89, not production implementation.
It applies the shared fixture at `../fixture/contract.md` without changing the protected
pre-reboot evidence. It assumes:

- the product is implemented in Haskell and pins a Dhall implementation/language version;
- project authors may instantiate but cannot extend the product-owned metamodel;
- explicit `declarations update` is the only command allowed to evaluate Dhall source;
- ordinary commands consume inert generated documents only;
- live backlog status, order, and host bodies remain in external systems;
- the fixture digest tokens are comparison constants, not cryptographic claims.

## Context boundaries

The top-level Dhall record is an integration envelope, not a domain aggregate.
Collaboration, Work Management, Governance and Assurance, Project Intent, and Curation
and Capabilities remain distinct values joined only by stable/versioned references. The
Project Bundle pins each model; Project Entry explicitly selects profiles, authorities,
host bindings, and external pointers.

Product ownership remains in separate Haskell packages: `ai4x-core` owns envelopes and
publication, while collaboration, work-management, intent, curation, and assurance own
their types and local validators. `ai4x-check` performs graph closure against published
summaries. Dhall owns no semantic cross-context validator and cannot extend these types.

Host IDs occur only in Project Entry adapter bindings/pointers, never inside a
host-agnostic bounded-context declaration. Work profiles contain lifecycle and process
contracts, not current work-item instances. Assurance Packs bind gates, evidence, and
decisions; receipts attest deterministic binding and do not perform semantic review.

## Key invariants

1. Every published entity carries a non-empty stable URN, exact semantic version,
   closed entity kind, and owning bounded context. Every semantic reference port carries
   the expected kind, owner, and version; the Haskell boundary enforces these rules.
2. Exactly one Collaboration, Work Management, Governance, Project Intent, and
   Capability authority is pinned. Their validators do not mutate or inspect another
   aggregate directly.
3. The Epic/Story profile is selected explicitly and Issue/Sub-Issue is an explicit
   alternative. No defaulting function exists.
4. Delegation transfers performance but not accountability; self-review is prohibited.
5. Transitions, gate decisions, joins, capability dependency closure, conflicts, and
   Need coverage are graph/value invariants, not Dhall type invariants.
6. The update importer rejects network, environment, home, absolute, missing, unpinned,
   and project-escaping imports before resolution. The accepted graph is offline and
   project-local.
7. Generated data is non-authoritative. Deterministic ordering and complete source-span
   mapping are production build-contract requirements; this prototype demonstrates only
   deterministic validation/visualization and the bounded source/digest sketch.

## Options and recommendation

### Option A — flat closed Dhall records plus stable references (implemented)

Use records/unions for local shape and represent graph edges as versioned IDs. Decode
into closed Haskell types and run context-owned Haskell validators. This is readable,
total, offline under the import policy, and keeps graph ownership where diagnostics and
domain invariants can be expressed precisely.

### Option B — Church-encoded recursive graph models in Dhall (rejected)

Recursive project models could be encoded through folds, but they would make ordinary
authoring and diagnostics substantially less transparent and move graph mechanics into
the declaration language. It also conflicts with the accepted constraint that ai4X owns
graph closure. This option is rejected.

### Option C — executable Dhall assertions as semantic validators (rejected)

Dhall can express value assertions, but the language does not automatically associate a
value validator with a type. Project-supplied assertions would also let source authors
change the rules that judge their own declaration and would fracture validator
ownership. This option is rejected; Haskell validators are mandatory.

Recommendation: retain Option A as the only viable Dhall-only authoring architecture for
the three-candidate comparison. Its decisive benefit over arbitrary Haskell source is a
total, typed evaluation boundary without arbitrary project code execution. Its decisive
cost is that nominal IDs/refinements and graph semantics need a second Haskell validation
layer, so Dhall does not eliminate the product metamodel or validator implementation.

## Quality assessment

| Dimension | Evidence and consequence |
| --- | --- |
| Authoring ergonomics | Records, unions, local imports, and let-binding handle all five contexts. The fixture is verbose, and generic `Text` IDs offer weaker nominal feedback than Haskell newtypes. |
| Type safety | Dhall rejects structural/type mismatches and guarantees normalization after successful type checking. Non-empty URNs, reference resolution, cycles, authority, and coverage remain semantic checks. |
| Validation reach | The seven common invalid variants, an empty `JoinAll`, wrong-entity-kind, and wrong-version case are representable and well-typed. Owner modules return typed code/owner/path diagnostics without reading Dhall expectation fields. Local ports resolve only in their owner validator; Composition receives published summaries and resolves only declared cross-context ports against expected owner, kind, ID, and version. |
| Trust boundary | Dhall evaluation is total and does not execute arbitrary project IO. Import resolution is still an effect and therefore restricted before resolution. |
| Offline behavior | Every prototype import is relative and integrity-protected; a source scan found no HTTP(S) or environment import. Product update must additionally enforce project-root containment. |
| Determinism | Dhall normalization and semantic hashing are deterministic. ai4X still canonicalizes set-like collections before inert encoding. |
| Diagnostics | Dhall 1.42.3 reports useful parse/type/import locations. Cross-reference diagnostics require Haskell source-map preservation before normalization. |
| Evolution/versioning | Bundle pins and every reference carry explicit versions/digests. The Haskell decoder prevents a project-edited schema from extending the metamodel. Migrations must be explicit source rewrites. |
| Operational complexity | Adds a Dhall parser/evaluator and import-policy boundary to Haskell, but avoids a trusted compiler execution boundary. Ordinary commands have no Dhall dependency at runtime. |

## Executed evidence

Environment: `/opt/homebrew/bin/dhall`, version `1.42.3`. A temporary writable
`XDG_CACHE_HOME` was used because the default cache was not writable in the sandbox.

Observed results:

- format checking, frozen-import checking, and normalization passed for all 28
  non-adversarial Dhall files, including the schema, project, profiles, examples, and
  every positive/invalid consumer view;
- `dhall freeze --all --transitive` protected every relative import.
- `dhall freeze --check --all project.dhall` passed after freezing.
- `dhall hash --file project.dhall` produced the hash recorded in the inert sketch.
- authoritative and frozen fixture sources contain no network/environment import; the
  isolated adversarial directory intentionally contains rejected examples.
- the Haskell consumer built with GHC 9.6.7 and `-Wall -Werror` using cached
  `dhall-1.42.3` dependencies, with its build directory outside the repository;
- its run passed the positive fixture with no error, all seven common invalid fixtures,
  the additional empty-`JoinAll` fixture, and the wrong-kind/wrong-version regressions with
  exactly `UNRESOLVED_REFERENCE`, `ILLEGAL_TRANSITION`,
  `DELEGATION_ACCOUNTABILITY_CONFLICT`, `UNAUTHORIZED_GATE_DECISION`,
  `INCOMPLETE_JOIN_ALL`, `CAPABILITY_CONFLICT`, `CAPABILITY_COVERAGE_GAP`,
  `WRONG_ENTITY_KIND`, and `INVALID_REFERENCE_VERSION` under their owning validators.

The missing handoff receiver now emits exactly one diagnostic:
`CollaborationOwner:UnresolvedReference @ collaboration.handoffs.receiver`. Composition
does not receive that local port and therefore cannot duplicate or relabel the error.
The global untyped ID union has been removed. Each context publishes a closed
`PublishedSummary`; Composition receives only those summaries plus its explicitly typed
cross-context `ReferencePort` values, never another context's aggregate.

This evidence proves syntax, shape, total normalization, protected local imports,
expressibility, closed Haskell value extraction, and the required semantic rejections.
The harness is intentionally fixture-bounded; the production `ai4x declarations update`
entry point and full packages do not yet exist. No `dhall-to-json` executable was needed
because the intended consumer is the Haskell library boundary.

The same run exercises a transitive AST-based loader before `Dhall.inputFile`, rejecting
both a network import and an unfrozen local import, and applies an explicit ten-second
evaluation timeout. Root containment checks both lexical and canonical paths. This is
bounded loader evidence, not a claim to close the local symlink-swap-during-read race or
to provide production atomic publication.

The positive source now includes a first-class guarded review-remediation iteration with
an explicit guard, one-iteration budget, and exhaustion stage. The consumer decodes and
validates it. `examples/story-delivery.dhall` is a pinned human-readable projection. The
consumer deterministically derives `/tmp/r15-story-delivery.mmd`, labeled
non-authoritative, showing the implement fork, review/test join-all, failure prevention,
and the guarded/budgeted loop.

### Relationship to authorized legacy evidence

The authorized prior spike separately demonstrated byte-identical canonical CBOR between
native and Dhall frontends, an inert reader without Dhall, adversarial import handling,
timeouts, and atomic prior-artifact preservation. Its shared model explicitly lacked
parallel join, guarded iteration, and first-class authorization. Those results strengthen
the frontend/trust-boundary comparison but do not prove this current metamodel. Conversely,
this prototype's current fixture and iteration evidence does not reproduce the legacy
CBOR/atomic-publication suite. Neither evidence set establishes full current metamodel
coverage.

## Risks and migration impact

- Dhall record schemas are structural; without the Haskell decoder a project can edit
  the schema mirror. Production must always decode into closed product types.
- `Text` aliases are not nominal ID types. Source mapping and semantic diagnostics must
  compensate with exact field paths and stable error codes.
- Normalization can be computationally expensive for pathological but total terms;
  update needs resource limits even though termination is guaranteed.
- Import hashes create deliberate update friction. Product schema upgrades need an
  explicit migration and refreeze operation.
- A direct TypeScript-to-Dhall migration is inappropriate. Existing artifacts remain
  evidence until the reboot schema, inert format, validators, and migration plan pass
  their own gates.

## Official technical sources

- [Dhall safety guarantees](https://docs.dhall-lang.org/discussions/Safety-guarantees.html)
  documents total evaluation, finite type checking/evaluation, and the absence of direct
  recursion.
- [Dhall language tour](https://docs.dhall-lang.org/tutorials/Language-Tour.html)
  documents semantic integrity hashes and `dhall freeze`.
- [Dhall validation guide](https://docs.dhall-lang.org/howtos/How-to-validate-a-configuration-file.html)
  documents value assertions and the limitation that validation is not automatically
  associated with a type.
- [Dhall integration guide](https://docs.dhall-lang.org/howtos/How-to-integrate-Dhall.html)
  identifies native Haskell library integration as the complete integration route.
- [Dhall 1.42.3 Haskell library](https://hackage.haskell.org/package/dhall-1.42.3)
  documents parsing, type checking, evaluation, and normalization support.

## Candidate gate verdict

`pass` (candidate verdict; independent re-review required)

The Dhall-only authoring representation satisfies the common architecture fixture. The
prototype demonstrates closed project-local authoring, explicit profile and authority
selection, pinned offline imports, total normalization, closed extraction into
product-owned Haskell types, the common semantic outcomes, empty-join rejection, and a
bounded guarded-iteration projection. Observations:
the fixture-bounded consumer is not the production `declarations update` implementation;
production still needs physical package boundaries, atomic inert publication, complete
source-span mapping, authorization breadth, and migration design specified above. This
candidate verdict does not self-approve Issue #89; the approved narrow independent
re-review remains the next gate action.
