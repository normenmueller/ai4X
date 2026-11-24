# ai4X Work State

Schema: ai4x-work-state-v1
Applies on branch: reboot/research-review
Owning Issue: none

## Return context

- nemron directly assigned the research-branch review. [#104](https://github.com/normenmueller/ai4X/issues/104) holds the research evidence and [the decision on conflicting rules](https://github.com/normenmueller/ai4X/issues/104#issuecomment-7126027843). The project adopted that rule in `c3f8f76`.
- Finish the source-by-source comparison of the research branch’s `.github/agents/` and `adm/gdl/` first. Assess each historical responsibility or guideline against a concrete task for the current team. Record its current owner, why it was superseded, or the gap that needs a decision. Propose adoption only when the gap matters to that task. Use the evidence in [#104](https://github.com/normenmueller/ai4X/issues/104). Host verification remains open in [#106](https://github.com/normenmueller/ai4X/issues/106).
- After both groups are accounted for, continue with the research branch’s `cli/`, `crp/`, `doc/`, `utl/` and `xxx/`. Carry references to historical Doctor checks into the CLI comparison. After the research branch, review the documentation branch and then the backups.

## Route

- Use the registered checkout for the bound branch and the [Cold Start procedure](operations/session-continuity.md). Compare [PR #206](https://github.com/normenmueller/ai4X/pull/206) with local Git when reporting publication.

## Authority boundary

- Commits accumulate locally until PO review. A continuation greeting authorizes read-only discovery. Check the work contract before acting.

## Concurrency limit

- Each working branch owns one return point. Resolve competing assignments
  with nemron before proceeding.
