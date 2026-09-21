# ai4X Project Work Continuity

This procedure makes the ai4X project instance recoverable using GitHub only.
It supersedes the synchronized-directory recovery path introduced by
[Issue #181](https://github.com/normenmueller/ai4X/issues/181). The reusable
Portfolio offering remains separate work in
[Issue #180](https://github.com/normenmueller/ai4X/issues/180).

## Readiness invariant

```text
RemoteCheckpoint<Verified>
  + LocalContinuity<NoneRequired>
  + FreshCloneProof<Passed>
  = WorkState<Recoverable>
```

The configured GitHub remote owns tracked work. Live Issues and the project
board own work state. Accepted semantics belong in tracked context and source;
return context belongs in the tracked STATE router and the owning Issue.
A chat, ignored file, backup archive, or local Git ref must not be the sole owner
of anything required to continue current work.

## Before workstation loss

1. Inspect every worktree, uncommitted or untracked file, stash, local branch,
   and relevant remote ref. Classify ignored files by whether current work
   actually requires them. Preserve unknown work until its owner is resolved.
2. Publish necessary work on its owning branch. Keep unfinished product work
   off `trunk`; a remote branch is sufficient to preserve it.
3. Persist decisions and the next discussion point in the owning Issue. Check
   native relationships and board state without inventing lifecycle approvals.
4. Make the return candidate discoverable from `trunk`. Its STATE remains
   dormant there; bounded read-only discovery resolves the candidate's live
   owners, including work still in `Refinement`.
5. Clone `trunk` from GitHub into an independent directory. Prove that the
   facade, STATE, Issue, project item, remote work branch, and required tracked
   files reconstruct the route without the original workspace or any archive.
6. Verify required content on a separate fresh clone of the work branch and run
   the proportionate repository gates. Record exact revisions and observations
   in the owning Issue as historical evidence.
7. Declare readiness only when no necessary fact or artifact remains local-only.

Use [RECOVERY.md](work-continuity/RECOVERY.md) after the reset. The sole target
binding is [GitHub](../bindings/work-continuity.md).

## Historical bootstrap material

Old external backups are historical archives and are not read, refreshed,
restored, or required by this procedure. Their existence does not establish
current readiness. Old receipts describe only their dated observations.

The checkpoint scripts under `util/work-continuity/` and their inclusion
allowlist are retained as tested provisional #181 tooling and #180 evidence.
They are not the active reset path and do not make the listed local drafts or
references necessary. Their retirement belongs to the owning work item; do not
reintroduce a cloud-drive dependency or create a backup repo implicitly.

Credentials, SSH keys, host configuration, unrelated projects, caches, downloaded
tools, build outputs, and historical drafts are outside current-work recovery.
This procedure proves ai4X continuity, not a backup of the entire laptop or the
preservation of every superseded local commit.
