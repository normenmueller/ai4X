# ai4X Work State

Schema: ai4x-work-state-v1
Applies on branch: reboot/research-review
Owning Issue: #209

## Return context

- Read the [backup inventory](https://github.com/normenmueller/ai4X/issues/209) for the next directory, the remaining exceptions, prior decisions and the acceptance criteria for recommending retirement. The issue body owns the live checklist. [Draft PR #206](https://github.com/normenmueller/ai4X/pull/206) collects the approved integration changes.
- The [research review](https://github.com/normenmueller/ai4X/issues/104#issuecomment-7136072119) and [documentation review](https://github.com/normenmueller/ai4X/issues/104#issuecomment-7136543371) are complete. #104 owns product governance and assurance.
- The separate fresh-client path check at `436a53a` remains with [#106](https://github.com/normenmueller/ai4X/issues/106). Its synthetic preflight blocked unexpected reads and writes. The runner could not enforce a hostname allowlist for model traffic. Retry with verified endpoint restrictions and authentication inside the isolated fixture.

## Route

- Use the registered checkout for the bound branch and the [Cold Start procedure](operation/session-continuity.md). Compare [PR #206](https://github.com/normenmueller/ai4X/pull/206) with local Git when reporting publication.

## Authority boundary

- Commits accumulate locally until PO review. A continuation greeting authorizes read-only discovery. Check the work contract before acting.

## Concurrency limit

- Each working branch owns one return point. Resolve competing assignments
  with nemron before proceeding.
