# Cold Start of an agent session

A Cold Start begins a fresh session from tracked Project Memory and the relevant GitHub Issues. The same procedure applies to every supported host and checkout.

## Prepare in the current session

When nemron asks “Gertrud, bitte bereite einen Cold Start vor”, finish or safely pause the current operation. Gertrud may also recommend a Cold Start after a change to effective instructions or a natural change of work phase.

1. Compare the actual branch, local changes and latest work with [STATE](../STATE.md)
   and the owning Issue, if any. Preserve open work.
2. Put each durable decision in its tracked owner. Refresh STATE when the return
   point changes: identify the work branch, last meaningful result and next
   action or PO decision. For Issue work, point to the owning Issue for its live
   contract. For directly assigned work without an Issue, record the return
   point in STATE. Keep any pending approvals explicit.
3. Read the entry route back using only these sources. Run
   `./util/repository/verify-session-continuity.sh .` in the working checkout.
   Confirm that a fresh agent can identify its role, the work and the next step.
   If required information is missing, say exactly what is missing.
4. Report the working checkout, next step and any unpublished work. Stop at
   this boundary. The PO starts a new session there without resuming the old
   one. Keeping or deleting the old conversation is the PO's choice.

## Enter in a fresh session

On a continuation greeting such as “Hi Gertrud, weiter geht's!”:

1. Follow [BEHAVIOR](../BEHAVIOR.md), [TEAM](../TEAM.md) and the assigned role
   before replying. The primary conversation belongs to Gertrud.
2. Read only the current branch and its tracked STATE binding before any checkout discovery. With Git available, run `git branch --show-current && git show HEAD:.ai4x/STATE.md` as a standalone check. Wait for both values. A different non-trunk branch ends the turn immediately: report both names. Only after a match or on trunk, inspect Git status and follow the applicable worktree route below, including the verifier. Worktree lists, routing hints and Issue lookups belong after the comparison.
3. Read STATE's last result and next step. If `Owning Issue` names an Issue, check its live contract and current re-entry. For directly assigned work, STATE supplies the return point. Consult linked research, PR, board or check evidence where the next decision depends on it.
4. Tell nemron briefly where work stopped, what comes next and whose decision
   is needed. Report any unavailable live evidence as unknown. A greeting
   authorizes read-only discovery. Act only within an existing, unambiguous
   work contract under [work authority](../governance/work-authority.md).

## Branch and worktree checks

- STATE binds one exact branch and one Issue (`Owning Issue: #number`), or `Owning Issue: none` for directly assigned work. Before merge, keep the topic binding and record any agreed next checkout in the return context so a fresh session can recover the handoff. Establish the next binding on the receiving branch through its next authorized change.
- On clean `trunk`, a STATE bound to `trunk` allows read-only entry. A STATE
  bound elsewhere is dormant. For an explicit branch referral, inspect
  `git worktree list --porcelain`. Verify one registered target, its actual
  branch, Git common directory, and tracked STATE binding. Read its entry
  instructions. Report the exact working checkout when it differs from the
  session root. A greeting never switches branches.
- An existing ignored `.ai4x/local/ACTIVE.md` is an optional routing hint.
  Its `ai4x-active-worktree-pointer-v1` schema specifies a contained relative
  `Worktree` and exact non-trunk `Expected Branch`. The verifier checks the
  target, common repository and tracked STATE before the route may be used.
  A clean checkout and its tracked instructions must suffice without this hint.
- On dirty trunk, a dirty source referral, an invalid hint, a conflicting
  non-trunk binding or ambiguous ownership, report the observations and
  preserve all changes. If STATE is missing or dormant, existing worktrees
  and matching live Issues or PRs may identify a candidate. Ask one focused
  question if the intended route still cannot be established.

When editing entry instructions, apply the [Cold Start verification rule](../governance/cold-start-verification.md).
