# Factory-reset Restore Proof

- Issue: [#181](https://github.com/normenmueller/ai4X/issues/181)
- Observed: 2026-08-27
- Bootstrap revision: `0797d32576c7a32ab6439cca36aec0f0765107e1`

## Claim

The concrete ai4X project instance can be reconstructed from its authoritative
Git remote and its explicitly selected local continuity archive without access
to the original working copy.

## Evidence

1. A new checkout was cloned from `git@github.com:normenmueller/ai4X.git` at
   branch `chore/181-factory-reset-recovery`.
2. The fresh checkout resolved both `HEAD` and its upstream to exact revision
   `0797d32576c7a32ab6439cca36aec0f0765107e1`.
3. The verifier supplied only by that fresh checkout accepted the prepared
   `ai4x-project-work-continuity-bootstrap-v1` recovery set:
   - the checksum manifest named exactly the expected five protected files;
   - every protected digest matched;
   - the Git bundle was complete and its branch and trunk refs matched the
     checkpoint manifest;
   - the checkpoint manifest had exactly the required fields and values;
   - the local archive exactly matched the tracked inclusion policy and
     contained only regular, normalized `.ai4x/local/` members.
4. The selected local archive was extracted only after verification. The
   restored checkout contained the current handoff and the #103 Curation
   functional contract.
5. Before any local restore, the clean checkout passed the self-contained
   work-continuity mutation tests without relying on `.ai4x/local/` from the
   source workspace.
6. The restored checkout retained a clean tracked worktree and passed complete
   `make verify`: architecture checks, work-continuity mutation tests, REUSE,
   Haskell build and tests with `-Werror`, Haddock, and all Cabal checks.

The verified `SHA256SUMS` document had digest
`cb224fc8d865f88523025ff6c3e8f0156004b956983bfe88e395b2b3187efb3d`.
The machine-local provider path is deliberately redacted and is not a tracked
project fact.

## Negative evidence

Tracked mutation tests reject truncated or externally addressed checksum
manifests, bundle/manifest disagreement, path traversal, duplicate inclusion,
archive symlinks, source paths crossing parent symlinks, and repository URLs
that may contain credentials. Source validation also rejects a symlink at the
`.ai4x/local` directory boundary itself.

## Limits

- This proves project-instance reconstruction, not provider durability.
- The scripts are provisional repository tooling and not the released #180
  Portfolio implementation.
- Evidence establishes a claim; it grants no merge, acceptance, or lifecycle
  authority.
