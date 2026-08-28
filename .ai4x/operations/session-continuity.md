# ai4X Session Continuity

This is the canonical Cold Start discovery procedure for an intact workspace.
It resumes existing work; it does not reconstruct lost work. Factory-reset and
workspace-loss recovery belong to [work-continuity.md](work-continuity.md).

## Continuation signal

A fresh-session greeting with continuation intent and no concrete task, for
example `Hi Gertrud, weiter geht's!`, authorizes one bounded read-only discovery
pass. It is not mutation, publication, merge, lifecycle, cleanup,
recovery-rotation, or new-scope authority.

## Discovery algorithm

1. Resolve the repository root with Git. Do not depend on a remembered absolute
   path.
2. Read the root agent facade, `.ai4x/BEHAVIOR.md`, and `.ai4x/CONTEXT.md`.
3. Observe the current branch, `HEAD`, configured upstream, tracked and
   untracked worktree state, and relevant refs without mutation.
4. Read `.ai4x/STATE.md` and evaluate its `Applies on branch` binding against
   the observed branch without switching branches. A STATE bound elsewhere is
   dormant only on clean `trunk`; on dirty `trunk` or another non-trunk branch
   it is drift.
5. If `.ai4x/local/ACTIVE.md` exists, treat it only as a possible route from a
   stable checkout to another worktree. Verify that its relative target exists,
   belongs to the same Git common directory, is on its exact expected branch,
   and has an applicable tracked STATE. A present but invalid or unsafe pointer
   is `Stop on drift`, never ignored. A valid pointer makes that target the new
   discovery root: repeat STATE, Git, worktree, GitHub, and authority discovery
   there, and do not mutate the stable source checkout.
6. Only for an applicable STATE, read live GitHub state for its owning Issue,
   project item, relationships, matching Pull Request, remote branch, and
   required checks. For absent or dormant STATE, use the bounded fallback below.
7. Resolve each fact through its sole owner:

   ```text
   explicit current Product Owner decision          -> execution authority
   .ai4x/governance/work-authority.md                -> risk and effect rules
   tracked Project Memory and architecture           -> behavior and semantics
   live GitHub Issue / Project / Pull Request         -> work and gate state
   observed worktree                                  -> local state to preserve
   tracked branch-applicable STATE                    -> return context only
   optional local ACTIVE pointer                      -> routing hint only
   external recovery target                           -> inert fallback only
   ```

8. Load only the owning Issue and its task-relevant context, source, tests, and
   documentation.
9. Produce exactly one result in the same read-only pass:

   - `Resume`: STATE applies, live owners agree, and one safe work route is
     unambiguous. Do not request a new Product Owner decision when the existing
     exact work contract already grants the next effect.
   - `Resume in <relative worktree>`: a valid ACTIVE pointer rerooted discovery
     and the target's tracked and live owners grant one unambiguous route.
   - `Dormant`: clean `trunk` carries a STATE bound to another non-trunk branch.
     Do not act on that STATE or resume mutation directly on `trunk`.
   - `Await Product Owner`: context is clear but the next material decision or
     authority is genuinely absent.
   - `Stop on drift`: observations conflict or local work could be endangered.
     Preserve state and do not mutate.

The bootstrap never switches branches, cleans local state, publishes, merges,
closes, changes project status, rotates recovery, or executes a mutation merely
because STATE or ACTIVE points at work.

## STATE contract

`.ai4x/STATE.md` has this compact shape:

```text
# ai4X Work State
Schema: ai4x-work-state-v1
Applies on branch: valid/non-trunk-branch
Owning Issue: #number

## Return context
## Route
## Authority boundary
## Concurrency limit
```

STATE may contain durable pointers and a concise return summary. It must not
copy board status, execution authorization, gate status, mutable revisions, or
product semantics. Update it at coherent return-context changes, not after
every micro-step.

One tracked STATE file supports the initial serial work model. Parallel branches
may contain different revisions and therefore conflict on integration. Preserve
such conflicts and fail closed; this slice does not claim a general parallel
STATE merge protocol.

## Optional ACTIVE pointer

`.ai4x/local/ACTIVE.md`, when useful, has only:

```text
# ai4X Active Worktree Pointer
Schema: ai4x-active-worktree-pointer-v1
Worktree: relative/path/from/repository
Expected Branch: valid/non-trunk-branch
```

It is ignored, disposable, machine-local, and non-authoritative. It contains no
Issue status, approval, gate, absolute path, or semantic content.

## Fail-closed cases

Use `Await Product Owner` or `Stop on drift` when any required observation is
missing, malformed, stale, conflicting, unavailable, or ambiguous, including:

- STATE is malformed, names more than one Issue, or does not apply on the
  current non-trunk branch;
- ACTIVE is unsafe, points outside the repository, names another Git common
  directory, or disagrees with the target worktree and STATE;
- Issue, board, branch, upstream, Pull Request, checks, or worktree observations
  disagree with their owners;
- more than one work item plausibly owns the checkout;
- GitHub is unavailable and current live state is required;
- accepted semantics or governance exists only in chat, local scratch, evidence,
  or recovery material;
- the next effect exceeds the active work envelope.

Never repair these cases by guessing. Preserve the workspace and ask one
focused question only when read-only evidence cannot resolve a material choice.

## Missing or dormant STATE fallback

If STATE is absent or dormant, inspect the current branch, matching open Pull
Request, and live active project items only to explain the situation or locate a
candidate worktree. A normal continuation greeting never resumes mutation
directly on `trunk` merely because one board item exists. Route through one
verified existing worktree or await the Product Owner.

Use external recovery only when the workspace or necessary local-only state is
actually missing. Recovery material remains inert and must be resolved against
the fresh tracked checkout and live GitHub state before use.
