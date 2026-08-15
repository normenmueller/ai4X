# GitHub Repository Metadata

## Purpose

Keep the GitHub repository About and Topics reproducible from versioned local metadata.

## Source of Truth

`utl/gh/repo-metadata.yaml` — all intended repository metadata is declared here.

## Commands

```bash
# Check local metadata contract (no network)
bash ./utl/gh/repo-metadata.sh --check-local

# Check remote drift (requires gh auth)
bash ./utl/gh/repo-metadata.sh --check

# Apply local metadata to GitHub (requires gh auth)
bash ./utl/gh/repo-metadata.sh --apply
```

## Operational Rules

1. Keep `utl/gh/repo-metadata.yaml` in sync with intended GitHub metadata.
2. Run `--check-local` before finishing metadata-related changes.
3. Run `--check` when remote drift must be validated.
4. Use `--apply` when metadata updates are intentional and the remote repository must be reconciled.
5. Do not finish metadata changes while intended local metadata and remote GitHub metadata still differ.

## When to Use

The Tech Lead triggers metadata operations when:
- Repository About or Topics need to change
- `make verify` reports a metadata drift
- A Story or chore explicitly requires metadata reconciliation

No automated sync — all metadata changes are intentional and human-triggered.

# Branch and Pull-Request Scope

## Purpose

`utl/gh/branch-scope.sh` proves that a topic branch and its pull request match
the scope approved for one work item. It is a deterministic safety preflight,
not an approval authority and not a replacement for review.

## Authority and Evidence

The authoritative approvals remain recorded on the GitHub Issue:

1. **Base Authorization** — the Tech Lead records the target repository,
   target ref, exact base OID, work item, and PO-reserved constraints before
   the branch is created.
2. **Publication Intent Revision** — after the intended commits exist, the Tech
   Lead records the same work-item identity, its Base Authorization revision,
   their complete OID set, and the complete provider-neutral file delta
   (`add`, `delete`, `modify`, or `type-change`). The Publication Intent, not
   observed branch state, authorizes publication.

The transient JSON input is only a machine-readable rendering of those
approved facts. The command emits bounded proof anchors and digests; it does
not create a second inventory or approval source.

## Intent Shape

```json
{
  "contractVersion": "1.0.0",
  "readyAuthority": {
    "granted": true,
    "approver": "normenmueller",
    "authority": "product-owner",
    "revision": "issue-comment-or-decision-id",
    "workItem": "#123"
  },
  "baseAuthorization": {
    "revision": "base-authorization-id",
    "approver": "gertrud-ai4x",
    "authority": "tech-lead",
    "workItem": "#123",
    "targetRepository": "owner/repository",
    "remote": "origin",
    "targetRef": "refs/heads/trunk",
    "baseOid": "0000000000000000000000000000000000000000",
    "poReservedConstraints": [],
    "lineage": [
      {
        "sequence": 1,
        "revision": "base-authorization-id",
        "approver": "gertrud-ai4x",
        "baseOid": "0000000000000000000000000000000000000000",
        "replacementApproval": null
      }
    ]
  },
  "publicationIntent": {
    "revision": "publication-intent-id",
    "approver": "gertrud-ai4x",
    "authority": "tech-lead",
    "workItem": "#123",
    "baseAuthorizationRevision": "base-authorization-id",
    "expectedCommitOids": [
      "1111111111111111111111111111111111111111"
    ],
    "expectedPrimitiveRecords": [
      { "operation": "modify", "path": "path/to/file" }
    ]
  }
}
```

The zero and one OIDs above are placeholders and must be replaced by full real
40- or 64-character lowercase Git object IDs. Renames are represented as deletion of the old path plus
addition of the new path; copies are additions of the destination.
Each work-item identity uses the canonical GitHub Issue form `#N`; aliases such
as `N`, URLs, or free text are invalid and cannot bypass Issue-specific rules.

The closed PO-reserved constraint vocabulary is `base-replacement`,
`preserve-original-branch`, `preserve-original-pull-request`, `no-force-push`,
`no-branch-deletion`, and `no-destructive-rewrite`. Issue #120 must carry the
complete set. `baseAuthorization.lineage` is the sole authority history: its
first entry is the exact initial revision, approver, and base OID with a null
replacement approval. This one-entry initial lineage is valid for every work
item, including #120; #120 still requires the complete reservation set above.
Every successor is contiguous and anchors the exact
predecessor revision, approver, OID, and canonical authority digest. It also
records `poApprover`, `poAuthority` as `product-owner`, a renewed PO approval
revision, both preservation flags as `true`, and
`destructiveActionsAuthorized` as `false`. A changed revision or OID without
that complete successor entry is invalid. The replacement approver remains the
same Tech Lead authority and the complete closed reservation set is mandatory.

## Commands

```bash
# Before branch creation: observe the exact current target without updating refs
./utl/gh/branch-scope.sh observe-base \
  --target-repository owner/repository \
  --target-ref refs/heads/trunk

# After commits and approval of the Publication Intent Revision
./utl/gh/branch-scope.sh verify-local --intent /tmp/branch-intent.json \
  > /tmp/branch-local-proof.json

# Immediately before each push; reuse the result for PR reconciliation
./utl/gh/branch-scope.sh verify-push \
  --intent /tmp/branch-intent.json \
  --proof /tmp/branch-local-proof.json \
  > /tmp/branch-push-proof.json

# After PR creation and whenever its base or head changes
./utl/gh/branch-scope.sh verify-github \
  --intent /tmp/branch-intent.json \
  --proof /tmp/branch-push-proof.json \
  --github-repository owner/repository \
  --pr 123 \
  --event pull-request-created \
  > /tmp/branch-github-proof.json

# At the next lifecycle boundary, consume the preceding GitHub proof and
# perform a fresh observation; do not merely reuse the prior verdict.
./utl/gh/branch-scope.sh verify-github \
  --intent /tmp/branch-intent.json \
  --proof /tmp/branch-github-proof.json \
  --github-repository owner/repository \
  --pr 123 \
  --event ready-for-review
```

## Operational Rules

1. Create the branch only from the exact, freshly observed Base Authorization
   OID.
2. Run the full local verification after the Publication Intent Revision. If
   HEAD changes, approve a new revision and verify again.
3. Before every push, refresh target and cleanliness evidence. A moved target,
   changed HEAD, changed exact github.com fetch/push binding, dirty
   index/worktree, or stale approval invalidates the proof. Lookalike hosts,
   ambiguous URLs, multiple configured URLs, and fetch/push repository
   disagreement are rejected.
4. Reconcile GitHub after PR creation, after every PR base/head change, before
   Ready for review, before moving the Issue to In review, and during final
   conformance. Use respectively `pull-request-created`,
   `base-or-head-changed`, `ready-for-review`, `issue-in-review`, and
   `final-conformance`. An unchanged later boundary consumes the prior GitHub
   proof and creates a fresh proof. A base/head or intent change invalidates
   that proof and starts from a renewed pre-push local proof. A prior verdict
   alone cannot advance lifecycle.
   `pull-request-created` and `base-or-head-changed` accept only a refreshed
   local proof. `ready-for-review` consumes `pull-request-created` or
   `base-or-head-changed`; `issue-in-review` consumes `ready-for-review`; and
   `final-conformance` consumes `issue-in-review`. Repository, PR, base/head
   repository/ref/OID, exact fetch/push binding, provider evidence, and the
   complete predecessor chain are bound and validated at every unchanged
   transition. Local target, HEAD, cleanliness, and remote binding are observed
   both before and after GitHub pagination; any movement invalidates the run.
5. Treat incomplete pagination, provider caps, unstable observations, unknown
   file operations, or local/GitHub disagreement as failures.
6. The observer may fetch objects and write `FETCH_HEAD` only. It must not
   update refs, worktree, index, repository configuration, remote
   configuration, or tags.
7. A clean status, `git show HEAD`, inspection of only the last commit, commit
   count alone, or a local proof without fresh GitHub reconciliation is
   insufficient publication or lifecycle evidence.
8. If the target moved, preserve the original branch and pull request. Create
   any replacement branch from a newly approved base and renewed Publication
   Intent. Never force-push, delete a branch or PR, or destructively rewrite
   history without explicit PO approval; this preflight provides no such
   command.
9. Successful proofs include phase, full authority provenance, exact proof
   snapshot, cleanliness, complete ordered expected and actual inventories and
   their digests. GitHub proofs additionally include provider totals, page
   counts, page sizes, and caps. Failures include phase, the available prior
   snapshot and authority provenance, a stable failure category, differences,
   and remediation guidance.
10. The control uses deterministic Git and GitHub facts only. It uses no AI,
    learned expectation, automatic repair, database, or persistent inventory
    cache.

## Verification

```bash
make branch-scope-test
```

The test suite covers authority mutation and Actual-as-Expected failures,
fetch isolation, unrelated ancestry, equal-count commit substitution,
adversarial and non-round-trippable paths, dirty states, stale proofs, moved
targets, exact fetch/push GitHub identity, multi-page pagination/cap failures,
separate base and merge-base facts, all lifecycle triggers, anchored
non-destructive recovery lineage, #120 reservations, unstable local/GitHub
snapshots, and local/remote scope disagreement.

# Planning Lifecycle Verification

## Purpose and authority boundary

`planning-verify.mjs` observes and validates the planning lifecycle owned only
by `adm/gdl/planning-workflow.md`. It is deterministic and read-only. Success
is evidence only and always contains `authorityEffect: "none"`; it grants or
proves no Ready, implementation, acceptance, Done, priority, transition,
publication, or mutation authority.

## Commands

```bash
# Hermetic validation of a normalized observation snapshot
node utl/gh/planning-verify.mjs snapshot --input /tmp/planning-observation.json

# Explicit live read-only observation using a digest-bound expected Plan entry
GH_TOKEN=... node utl/gh/planning-verify.mjs live --expected /tmp/planning-expected.json

# Deterministic tests; no token or Project access required
make planning-contract-test
```

The expected file must bind stable repository, Project, Issue, Project-item,
Status-field identities, exact expected status, `expected.kind`, Plan digest,
and approval-evidence reference. The token is read from `GH_TOKEN` only and is
never accepted on argv, read from a file, or emitted.

## Operational rules

1. Run live verification before and after every governed planning transition
   and preserve the canonical JSON result digest/result as transition evidence.
2. Exhaust every observed Project item, field, and option page. Identity,
   accessibility, uniqueness, closure limits, and start/end stability fail
   closed with distinct diagnostics.
3. Never treat a Plan digest or approval-reference string as proof of PO
   approval. The operator independently verifies the exact approval evidence.
4. Never convert validator success into a command or authority decision. The
   CLI has only `snapshot` and `live`; the observer exports queries and reads,
   never a mutation or apply function.
5. Schema or item activation remains the separate exact
   `Plan -> explicit PO approval -> Apply -> Receipt` operation in the
   canonical planning workflow. This verifier does not perform it.
