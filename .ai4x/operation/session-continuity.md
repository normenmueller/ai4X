# Cold Start of an agent session

A prepared Cold Start must work in a fresh clone of published `trunk`, with a new client session and no chat history or local files. Tracked Project Memory supplies the team and its rules. GitHub supplies the current assignment, checkpoint and board status.

## Prepare in the current session

On “Gertrud, bitte bereite einen Cold Start vor”, finish or safely pause the current operation.

1. Compare the checkout, local changes and latest work with the owning Issue. Preserve durable results in their authorized tracked or GitHub owners. Identify unpublished work and any local material the PO explicitly accepts losing. Preparation alone grants no authority to publish private content, delete work or merge.
2. Update the return Issue's checkpoint with the last meaningful result, what remains and the next action or PO decision. Reuse an accurate checkpoint. If there is no suitable Issue or an update needs authority, report the gap.
3. On GitHub, keep `signal:cold-start` on the intended open Issue. When changing focus, verify the destination checkpoint, mark the destination and remove the signal from the previous Issue. Read back the lookup below. If another assignment competes or an update fails, report the conflict and stop. A session change does not itself change board status.
4. Read back the published entry route, Issue and board. When the entry route changes, run `./util/repository/verify-session-continuity.sh . --enter` in a clean checkout of published `trunk`. Confirm the published sources suffice without the old checkout. Report the checkout, next step and any outstanding local work. A successful test of a proposed revision is provisional until that revision is integrated.

## Enter in a fresh session

“Hi Gertrud, wo stehen wir?” and “Hi Gertrud, weiter geht's!” both trigger the same read-only entry.

1. Resolve Gertrud and her role through [TEAM](../TEAM.md). Before checkout discovery or a remote call, run `git branch --show-current && git show HEAD:.ai4x/STATE.md` as a standalone check and wait for both values. If a non-trunk branch differs from the tracked binding, report both names and stop immediately.
2. Run `./util/repository/verify-session-continuity.sh . --enter`. On error, report the discrepancy, preserve local work and stop before looking up an Issue.
3. For the verified trunk signal route, list **open Issues** labeled `signal:cold-start` in `normenmueller/ai4X`. For example, run `gh issue list --repo normenmueller/ai4X --state open --label signal:cold-start --limit 2 --json number,title` or use the equivalent read-only connector. Exactly one match selects the Issue. On zero matches, multiple matches or an unavailable lookup, report the result and stop. Never infer the assignment from board order, priority or recency.
4. Read the selected Issue's current state, labels, checkpoint and ai4X board status. If it has closed or lost the signal since the lookup, stop and report the change. Report the last result, pending work and next action or PO decision. If the checkpoint or board information is missing, identify the gap. A greeting grants no execution or provider-write authority.

## Branch and worktree checks

- On clean `trunk`, `Owning Issue: signal:cold-start` selects the live lookup. Keep this tracked binding stable when work changes. A local worktree hint cannot override it.
- For a branch-specific assignment, `Owning Issue: #number` identifies its Issue and `Owning Issue: none` identifies directly assigned work with a return point in STATE. Use the verified branch route and its checkpoint. A topic checkout must match its tracked binding; a greeting never switches branches.
- For an explicit worktree referral on a legacy checkout, inspect `git worktree list --porcelain` after the initial branch check. Verify the target, branch, common Git directory and tracked STATE with the verifier in entry mode. The optional ignored `.ai4x/local/ACTIVE.md` hint uses `ai4x-active-worktree-pointer-v1` with a contained relative `Worktree` and exact non-trunk `Expected Branch`. An ambiguous, dirty or invalid referral grants no Issue lookup.

For changes to entry behavior, apply the [Cold Start verification rule](../governance/cold-start-verification.md).
