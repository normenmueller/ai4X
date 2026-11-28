# ai4X Work State

Schema: ai4x-work-state-v1
Applies on branch: trunk
Owning Issue: #212

## Return context

- The reboot is integrated. Resume the PO-authorized backlog reconciliation in [#212](https://github.com/normenmueller/ai4X/issues/212). Read its current checkpoint and board status before proposing the next disposition. The roadmap follows reconciliation.

## Route

- Use the [Cold Start procedure](operation/session-continuity.md) on a fresh checkout of the published `trunk`. The owning Issue and project board supply the assignment. Consult Todoist when examining the source tasks.

## Authority boundary

- A continuation greeting authorizes read-only discovery. Obtain the PO decision before discarding tasks or retiring the Todoist project. A candidate Issue match grants no authority to start or reprioritize that Issue.

## Concurrency limit

- Each working branch owns one return point. Resolve competing assignments with nemron before proceeding.
