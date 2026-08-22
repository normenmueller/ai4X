# Governance

ai4X uses lean, risk-based repository governance.

## Standard path

1. Capture meaningful work in a GitHub Issue with a clear outcome and acceptance criteria.
2. Refine only until the work is understandable and safely executable.
3. Obtain Product Owner approval before implementation when scope or product intent changes.
4. Deliver one focused change on a short-lived topic branch.
5. Require proportionate tests, green repository checks, and human review.
6. Squash-merge to `trunk`, then remove the merged topic branch.

Small, low-risk maintenance may use a correspondingly small Issue and review.
High-risk security, authority, migration, or destructive changes require stronger
evidence and an explicit decision. Process weight follows risk; it is not a fixed
ceremony.

## Authority and safeguards

- The Product Owner decides product intent, priority, readiness, acceptance, and exceptional administration actions.
- Automation validates facts and policy but cannot manufacture approval.
- `trunk` protection is the ordinary merge guard.
- Administrative bypass and force push remain available to the Product Owner for emergencies and recovery, but are never the default workflow.
- Secrets, destructive actions, repository settings, and external publication require explicit scope and authority.

## Board

The board uses: `Backlog`, `Refinement`, `Ready`, `In progress`, `Paused`,
`In review`, and `Done`. Status describes reality; it does not itself grant
implementation authority.
