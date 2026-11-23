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

The Ready Issue covers only the declared work through `In review`. A narrower PO instruction, including local-only commits, takes precedence. Correct a rejected review within the same scope. Scope expansion, releases, destructive actions and other protected effects need their own exact authority.

The PO personally performs the squash merge into `trunk`. Hand the reviewed revision to the PO once the required checks pass.

The PO’s standing instruction authorizes retirement of the matching local and remote topic branches after a verified merge. Confirm their tips match the merged PR head, the work is preserved in `trunk`, and no open PR, active worktree or local changes need the branch. Delete only the verified revisions and confirm the remaining refs. Preserve the branch if a check is inconclusive.

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

- GitHub Issues and the project board own planned work and lifecycle state.
- Use a short-lived topic branch, a focused pull request, required green checks, and squash merge.
- Require human approval for product and governance decisions; automation supplies evidence, not authority.
- Only the Product Owner decides the Project status transitions
  `Refinement -> Ready` and `In review -> Done`. Automation may execute the
  latter only as the direct consequence of a squash merge performed by the Product Owner
  whose closing keyword makes Issue closure explicit; approval does not
  otherwise delegate either decision.
- Without a closing keyword, a merged implementation remains open in
  `In review` until the Product Owner separately decides Issue closure and
  `Done`. Verify the Issue and Project effects after every merge.
- Review every implementation Story independently before merge, resolve every
  material finding, and rerun the proportionate verification gates. Keep the
  Story `In progress` during implementation, local verification, and independent
  technical review. Move it to `In review` only when its focused pull request is
  published with explicit authority, all Issue-required verification is green,
  and it is ready for Product Owner review.
- Use the [independent reviewer criteria](../TEAM.md#independent-reviewer) for findings, evidence and residual risks.
- After all Stories of an Epic are merged and `Done`, review the integrated Epic
  against its acceptance criteria and dependency boundaries before requesting
  Epic `Done`. Do not defer Story-level review until that final Epic review.
- Keep Issue titles outcome-focused. Native relationships and `level:*` labels own structural level, so do not prefix titles with `Epic:` or `Story:`.
- Do not publish, merge, close, delete, rewrite, or force-push without authority covering that exact effect.
- Repository administration bypass and force-push capability remain available to the Product Owner for emergencies. They are not normal delivery paths.

## Identity and permission separation

For agent-authored commits use Gertrud’s Git author identity. For authorized GitHub writes use `gertrud-ai4x`. On this workstation use `gh-gertrud` with its dedicated configuration in `~/.config/gh-gertrud`. Before writing, verify the login with `gh-gertrud api user --jq .login`. Stop on a mismatch or unavailable identity. The PO uses `normenmueller`.

Record PO authority through the explicit decision or merge action. A sandbox or credential prompt supplies no product authority.

## Program boundary

This contract governs direct Routine work and one exact Issue. It does not
authorize a sequence of Issues. A future Program Execution Mandate is separate
Portfolio research in #190 and cannot be inferred from this contract.
