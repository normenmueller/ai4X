# R-15 Common Semantic Fixture Contract

## Purpose and comparison rule

This contract defines the smallest common semantic fixture for comparing Haskell-only,
Dhall-only, and deliberate hybrid project authoring. Each candidate must represent the
same positive fixture and must reject the same invalid variants. Syntax, internal data
layout, and diagnostic wording may differ. The stable IDs, relationships, validation
outcomes, and error codes below may not differ.

The fixture is architecture evidence, not a production schema. It intentionally samples
Collaboration, Work Management, Governance and Assurance, Project Intent, and
Curation/Capabilities without combining their model or validator ownership.

## Authoring and execution boundary

- Project-owned source declarations are authoritative.
- A candidate's explicit `update` or `build` operation may evaluate declarations and
  emits an inert, deterministic semantic representation.
- Ordinary curate, spawn, doctor, and validation operations consume the inert
  representation and never compile or evaluate project source implicitly.
- Generated representations are derived and non-authoritative.
- The generated representation records the source path and a deterministic source
  digest for each bounded-context contribution.
- All operations needed by this fixture work offline.
- No profile, authority, lifecycle, binding, or policy may be selected by an implicit
  default.

For Haskell-authored source, `update` crosses a trusted-code boundary: compiling or
evaluating project-authored Haskell can execute arbitrary code. Dhall evaluation is not
equivalent to that trusted-code boundary, but import restrictions and integrity still
have to be explicit in that candidate.

## Integration boundary

The inert representation may use a common envelope and stable references, but it may
not introduce a common domain aggregate or common validator. Ownership is fixed:

| Bounded context | Owns |
| --- | --- |
| Collaboration | participants, roles, rights, duties, prohibitions, delegation, accountability, handoff, review, escalation |
| Work Management | profiles, item kinds, hierarchy, dependencies, lifecycle, transitions, stages, assignments, completion and flow policies |
| Governance and Assurance | authorities, gates, decisions, waivers, evidence requirements, receipts |
| Project Intent | needs, constraints, anti-requirements, cognitive jobs |
| Curation and Capabilities | capability contracts, requirements, conflicts, and Need-to-Capability Trace |

Cross-context validation resolves stable references through published summaries. It may
not reach into or mutate another context's aggregate.

## Common scalar rules

- Every entity ID is a non-empty, globally stable URN.
- Every bounded-context declaration has semantic version `1.0.0`.
- Every reference names an ID and the expected version `1.0.0`.
- The fixture provenance digest is
  `sha256:fixture-positive-v1`.
- Source digests use the explicit fixture token
  `sha256:source-fixture-v1`; candidates must not claim that this token is a computed
  cryptographic digest.
- Collections that are semantically sets are emitted in ascending ID order.
- References are resolved by exact ID and exact version; unresolved IDs or version
  mismatches are errors.

## Positive fixture

### Manifest and project entry

- Project Bundle `urn:ai4x:bundle:comparison` version `1.0.0` pins the five context
  declarations below at version `1.0.0` and digest `sha256:fixture-positive-v1`.
- Project Entry `urn:ai4x:project:comparison` explicitly selects:
  - Collaboration model `urn:ai4x:collaboration:review-team`;
  - Work profile `urn:ai4x:work-profile:epic-story`;
  - Governance model `urn:ai4x:governance:two-gate`;
  - Project Intent `urn:ai4x:intent:r15`;
  - Capability catalogue `urn:ai4x:capabilities:r15`;
  - project authority `urn:ai4x:participant:po`;
  - GitHub project binding `urn:github:project:3` and repository binding
    `urn:github:repo:normenmueller/ai4x`.
- No host identifier is part of a host-agnostic domain aggregate.
- Live item status, backlog order, and host item bodies are absent. Project Memory may
  retain only the above contracts and current external pointers.

### Collaboration

Declaration: `urn:ai4x:collaboration:review-team`, version `1.0.0`.

Participants:

- `urn:ai4x:participant:po`
- `urn:ai4x:participant:tech-lead`
- `urn:ai4x:participant:implementer`
- `urn:ai4x:participant:reviewer`

Roles and normative relations:

- `urn:ai4x:role:po`: right `accept-work`; duty `decide-waiver`.
- `urn:ai4x:role:tech-lead`: rights `assign-work`, `decide-design-gate`; duty
  `remain-accountable-for-delegation`; prohibition `self-review-implementation`.
- `urn:ai4x:role:implementer`: right `produce-change`; duty `provide-evidence`.
- `urn:ai4x:role:reviewer`: right `review-change`; duty `escalate-blocker`.

Assignments bind the four participants to their same-named roles. The Tech Lead
delegates performance of `produce-change` to the Implementer while retaining
accountability. Handoff `urn:ai4x:handoff:implementation-review` transfers the change
and evidence from Implementer to Reviewer. Review
`urn:ai4x:review:implementation` must be performed by the Reviewer, not by the
Implementer. Unresolved blocking review findings escalate to the Tech Lead, then to the
PO if the same blocker recurs after one remediation cycle.

### Work Management

Declaration/profile: `urn:ai4x:work-profile:epic-story`, version `1.0.0`. Selection is
explicit; the separate valid profile `urn:ai4x:work-profile:issue-subissue` demonstrates
that multiple profiles exist without a hidden default.

Item kinds and allowed hierarchy:

- `Epic` is a root kind.
- `Story` requires exactly one parent of kind `Epic`.
- A Story may depend on another Story but dependency cycles are invalid.

Lifecycle states are `ready`, `in-progress`, `in-review`, `done`, and `failed`.
Allowed transitions are:

- `ready -> in-progress` by the Tech Lead;
- `in-progress -> in-review` by the Tech Lead, guarded by complete implementation
  evidence;
- `in-review -> done` by the PO, guarded by an allowed governance decision and an
  assurance receipt;
- `in-progress -> failed` by the Tech Lead;
- `in-review -> failed` by the Tech Lead.

Flow `urn:ai4x:flow:story-delivery` has stages `implement`, `test`, `review`, and
`accept`. `test` and `review` may start after `implement`; `accept` has a `join-all`
completion policy requiring successful `test` and `review`. Any required predecessor in
`failed` takes the failure path and prevents `accept` from completing.

Assignments explicitly bind Implementer to `implement`, Reviewer to both `test` and
`review`, and PO to `accept`. Completion never follows from status text alone.

### Governance and Assurance

Declaration: `urn:ai4x:governance:two-gate`, version `1.0.0`.

- Authority `urn:ai4x:authority:design` permits the Tech Lead to decide gate
  `urn:ai4x:gate:design`.
- Authority `urn:ai4x:authority:acceptance` permits the PO to decide gate
  `urn:ai4x:gate:acceptance` and to grant its waivers.
- Design decision `urn:ai4x:decision:design-pass` is `pass`, decided by the Tech Lead.
- Acceptance decision `urn:ai4x:decision:accept-pass` is `pass`, decided by the PO.
- Evidence `urn:ai4x:evidence:test` and `urn:ai4x:evidence:review` is required by the
  acceptance gate.
- Assurance Pack `urn:ai4x:assurance:acceptance` binds exactly that gate, the two
  evidence items, and both decisions.
- Receipt `urn:ai4x:receipt:acceptance` deterministically records the allowed acceptance
  decision and the two evidence digests. It does not perform or replace semantic review.
- A waiver must name its gate, authority, grantor, rationale, expiry condition, and
  waived evidence requirement. No waiver is present in the positive fixture.

### Project Intent

Declaration: `urn:ai4x:intent:r15`, version `1.0.0`.

Need `urn:ai4x:need:auditable-delivery` states: project work needs deterministic,
traceable delivery decisions across declared collaboration and work models.

Constraints:

- `urn:ai4x:constraint:offline`: declaration validation works offline.
- `urn:ai4x:constraint:explicit-authority`: authorities and profiles are explicit.

Anti-requirements:

- `urn:ai4x:anti-requirement:no-live-backlog-copy`: do not copy live backlog status or
  order into Project Memory.
- `urn:ai4x:anti-requirement:no-implicit-build`: ordinary commands do not compile or
  evaluate declarations.

Cognitive Job `urn:ai4x:cognitive-job:evaluate-gate` is: assess whether declared
evidence semantically satisfies a gate, preserving uncertainty and escalating unresolved
contradictions. It supports the Need but is not reduced to a deterministic receipt check.

### Curation and Capabilities

Declaration: `urn:ai4x:capabilities:r15`, version `1.0.0`.

- Capability `urn:ai4x:capability:validate-model` deterministically validates local
  context invariants and published cross-context references.
- Capability `urn:ai4x:capability:evaluate-gate` performs the Cognitive Job. It requires
  `urn:ai4x:capability:validate-model`.
- Capability `urn:ai4x:capability:unsafe-auto-approve` conflicts with
  `urn:ai4x:capability:evaluate-gate`.
- The selected capability set contains `validate-model` and `evaluate-gate`, and does
  not contain `unsafe-auto-approve`.
- Trace `urn:ai4x:trace:auditable-delivery` links the Need to both selected capabilities
  with rationale and covers the Need. Coverage requires at least one selected capability
  and the transitive closure of every selected capability's `requires` relation.

## Invalid variants and required outcomes

Each variant changes only the stated field(s) in the positive fixture.

| Variant | Mutation | Required error code | Owning validator |
| --- | --- | --- | --- |
| `invalid-unresolved-reference` | Handoff receiver becomes `urn:ai4x:participant:missing`. | `UNRESOLVED_REFERENCE` | Collaboration |
| `invalid-illegal-transition` | Add `ready -> done` to the selected work profile and attempt it. | `ILLEGAL_TRANSITION` | Work Management |
| `invalid-delegation-accountability` | Delegation transfers accountability from Tech Lead to Implementer. | `DELEGATION_ACCOUNTABILITY_CONFLICT` | Collaboration |
| `invalid-unauthorized-gate-decision` | Reviewer becomes decider of the acceptance decision. | `UNAUTHORIZED_GATE_DECISION` | Governance and Assurance |
| `invalid-incomplete-join-all` | Mark `accept` complete while `review` remains incomplete. | `INCOMPLETE_JOIN_ALL` | Work Management |
| `invalid-capability-conflict` | Select `unsafe-auto-approve` together with `evaluate-gate`. | `CAPABILITY_CONFLICT` | Curation and Capabilities |
| `invalid-capability-coverage-gap` | Remove `validate-model` while keeping `evaluate-gate` and the trace unchanged. | `CAPABILITY_COVERAGE_GAP` | Curation and Capabilities |

A candidate fails the fixture if an invalid variant cannot be expressed without changing
unrelated declarations, is accepted, is rejected only by arbitrary executable assertion,
or is reported by a validator owned by the wrong bounded context.

## Candidate evidence requirements

Every candidate must provide:

1. Authoritative project source for the positive fixture.
2. A named explicit build/update entry point.
3. A deterministic inert output or an exact bounded sketch of it.
4. Provenance and source mapping in that output.
5. Context-owned validators and all seven invalid outcomes.
6. Commands and observed results using locally available tooling.
7. An assessment of authoring ergonomics, type safety, validation reach, trust boundary,
   offline behavior, determinism, diagnostics, evolution/versioning, and operational
   complexity.
8. Assumptions, risks, at least one rejected alternative, and a `pass` or `blocked`
   candidate verdict.
