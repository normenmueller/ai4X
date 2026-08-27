# ai4X Session Continuity

This is the canonical Cold Start discovery procedure for an intact workspace.
It resumes existing work; it does not reconstruct lost work. Factory-reset and
workspace-loss recovery belong to [work-continuity.md](work-continuity.md).

## Continuation signal

A fresh-session greeting with continuation intent and no concrete task, for
example `Hi Gertrud, weiter geht's!`, authorizes only this read-only bootstrap.
It is not mutation, publication, merge, lifecycle, cleanup, recovery-rotation,
or new-scope authority.

## Discovery algorithm

1. Resolve the repository root with Git. Do not depend on a remembered absolute
   path.
2. Read the root agent facade, `.ai4x/BEHAVIOR.md`, and `.ai4x/CONTEXT.md`.
3. If present, read `.ai4x/local/session-scratch/CURRENT-HANDOFF.md`. Treat it
   only as an observed snapshot and routing hint. Reject an unknown schema or
   duplicate required fields.
4. Observe, without mutation, the current branch, `HEAD`, configured upstream,
   tracked and untracked worktree state, and relevant local refs.
5. Read live GitHub state for the handoff's owning Issue, project item,
   relationships, matching Pull Request, remote branch, and required checks.
6. Resolve every observation against its owning authority:

   ```text
   explicit current Product Owner instruction -> mutation authority
   tracked Project Memory and architecture     -> behavior and semantics
   live GitHub Issue / Project / PR             -> work and lifecycle state
   observed worktree                            -> preserve local state
   local handoff                                -> snapshot and routing only
   external recovery target                     -> inert fallback only
   ```

7. Load only the owning Issue and its task-relevant context, source, tests, and
   documentation.
8. Produce exactly one routing result:

   - `Resume`: one owning work item and next safe action are unambiguous. After
     bootstrap, mutations may continue only when the live work contract already
     grants that exact effect.
   - `Await Product Owner`: the work context is clear but the next material
     decision or authority is not.
   - `Stop on drift`: observations conflict with their owners or local work
     could be endangered. Preserve state, report the conflict, and do not
     mutate.

The bootstrap itself never switches branches, discards or cleans local state,
publishes, merges, closes, changes project status, rotates recovery, or executes
a mutation merely because the handoff suggests it.

## Fail-closed cases

Use `Await Product Owner` or `Stop on drift`, as appropriate, when any of these
conditions prevents one safe route:

- the handoff is missing, malformed, uses an unknown schema, or names multiple
  owning Issues;
- the owning Issue is closed, absent from the expected project, or conflicts
  with its recorded board state;
- branch, `HEAD`, upstream, remote branch, Pull Request, or required-check state
  disagrees with the handoff or live work contract;
- the worktree contains tracked or untracked changes whose ownership is not
  proven;
- more than one open work item plausibly owns the checkout;
- GitHub is unavailable and current mutable work state is needed to choose or
  authorize the next action;
- an accepted semantic or governance decision exists only in chat, local
  scratch, a handoff, evidence, or recovery material;
- the suggested continuation requires branch switching, cleanup, publication,
  merge, lifecycle mutation, destructive action, or new scope without exact
  authority;
- a local reference required by the route is missing;
- external `CURRENT` or a restored handoff is older than tracked or live state.

Never repair these cases by guessing. Preserve the workspace and ask one
focused question only when read-only evidence cannot resolve the ambiguity.

## Handoff contract

`CURRENT-HANDOFF.md` is optional local continuity with this exact top-level
shape:

```text
# ai4X Session Handoff
Schema: ai4x-session-handoff-v1
Observed: ISO-8601 timestamp
Repository: owner/name
Owning Issue: #number
Expected Branch: branch

## Route
## Immediate next action
## Authority boundaries
## Observed snapshot
## Necessary local-only continuity
## Open decisions
```

The handoff contains concise pointers and observations only. Snapshot values
must be re-read from Git and GitHub before mutation. Stable architecture,
terminology, type contracts, figure grammar, command design, historical reports,
and restore proofs belong to tracked owners or GitHub, never to the handoff.

## Missing handoff fallback

If no usable handoff exists, inspect the current branch, matching open Pull
Request, and live active project items. Resume only when exactly one owning
Issue and safe action are unambiguous from tracked and live authority. Otherwise
await the Product Owner.

Use external recovery only when the workspace or necessary local-only state is
actually missing. Recovered handoffs remain snapshots and are resolved against
the fresh tracked checkout and live GitHub state before use.
