# ai4X Work State

Schema: ai4x-work-state-v1
Applies on branch: reboot/research-review
Owning Issue: none

## Return context

- nemron directly assigned the research-branch review. [#104](https://github.com/normenmueller/ai4X/issues/104) holds the research evidence and [the decision on conflicting rules](https://github.com/normenmueller/ai4X/issues/104#issuecomment-7126027843). The project adopted that rule in `c3f8f76`.
- Finish the Project Memory and Corpus quality review and record its findings and applicable host checks in #104. Then compare the historical [Self-Scoping Rule](https://github.com/normenmueller/ai4X/blob/cac1d37c294a22aef71b46e55289f88134c7043d/.github/agents/ai4x.agent.md#L181-L183) with [TEAM](TEAM.md) and the assigned role. What should an agent do when a request falls outside its mandate?
- Reserve the historical Doctor checks for the CLI comparison. After the research branch, review the documentation branch and then the backups.

## Route

- Use the registered checkout for the bound branch and the [Cold Start procedure](operations/session-continuity.md). Compare [PR #206](https://github.com/normenmueller/ai4X/pull/206) with local Git when reporting publication.

## Authority boundary

- Commits accumulate locally until PO review. A continuation greeting authorizes read-only discovery. Check the work contract before acting.

## Concurrency limit

- Each working branch owns one return point. Resolve competing assignments
  with nemron before proceeding.
