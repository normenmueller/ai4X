# ai4X Work Authority

This is the canonical project-instance owner for change risk, execution
authority, effect bounds, identity separation, and acceptance gates. Product
semantics remain owned by their domain context; mutable lifecycle facts remain
owned by GitHub.

Schema: ai4x-work-authority-v1
Risk paths: Routine | Significant | Protected
Ready authority: Product Owner
Merge authority: Product Owner
Done authority: Product Owner
Technical permission grants authority: no
Remote actor attribution: actual actor

## Independent dimensions

Treat these as separate observations:

```text
Work status             <- live GitHub project item
Execution authorization <- current explicit PO decision + exact work contract
Acceptance gate         <- required review, Pull Request, and checks
Technical permission    <- sandbox, credentials, provider and host controls
```

A value on one line never manufactures a value on another. In particular, a
board status or green check grants no execution authority, and Product Owner
authority cannot bypass a denied technical control.

## Risk paths

- **Routine:** bounded, reversible work with no product, authority, governance,
  security, lifecycle, destructive, or protected-provider effect. A direct
  Product Owner request may authorize it without an Issue.
- **Significant:** product or architectural work that requires an exact Ready
  Issue whose scope and acceptance contract bind execution.
- **Protected:** authority, governance, security, lifecycle, destructive,
  release, merge, cleanup, or materially irreversible work. It requires exact
  Product Owner authority for the protected effect.

When uncertain between paths, use the higher-risk path or ask one focused
question if the distinction materially changes the result.

## Atomic work-unit authority

Explicit Product Owner release of one exact Ready Issue authorizes its declared
work envelope through `In review`:

```text
implementation
-> capability-matched co-authoring when triggered
-> independent review when required
-> corrections within the same scope
-> verification
-> commit and branch publication
-> focused Pull Request and CI
-> In review
```

It does not authorize scope or target expansion, Merge, Done, Issue closure,
cleanup, release/tag publication, force-push, destructive work, or another work
unit. Those effects require fresh explicit Product Owner authority. Review
rejection may return the same work unit to correction without a new approval
while its envelope remains unchanged.

## Work envelope and exact effects

Bind the smallest closed envelope needed for the actual risk:

- owning Issue or direct Routine instruction;
- repository and work branch;
- outcome, scope, acceptance criteria, and explicit exclusions;
- exact protected remote targets and revision/digest facts needed by a material
  effect.

Ordinary in-scope local edits do not require per-file approval or predeclared
digests. Missing, stale, or conflicting facts required for a material external
or protected effect fail closed.

## Identity and permission separation

Gertrud remains visible as the actual author and provider actor for
agent-originated work. Normen's Product Owner authority is recorded by the
explicit decision or merge action, not by relabelling the producer. A sandbox
or credential prompt is a technical control; satisfying it neither asks for nor
grants new Product Owner authority.

## Program boundary

This contract governs direct Routine work and one exact Issue. It does not
authorize a sequence of Issues. A future Program Execution Mandate is separate
Portfolio research in #190 and cannot be inferred from this contract.
