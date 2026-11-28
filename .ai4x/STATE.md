# ai4X Work State

Schema: ai4x-work-state-v1
Applies on branch: trunk
Owning Issue: signal:cold-start

## Return context

Read the marked Issue's checkpoint for the last result, outstanding work and next action or PO decision.

## Route

Follow the [Cold Start procedure](operation/session-continuity.md) to verify the checkout, resolve the open Issue and read its ai4X board status.

## Authority boundary

A continuation greeting authorizes read-only discovery. The work contract and PO decisions govern execution.

## Concurrency limit

Exactly one open Issue carries the trunk return signal. Other Issues can be in progress at the same time.
