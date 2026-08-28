# ai4X Work State

Schema: ai4x-work-state-v1
Applies on branch: feature/188-lean-agent-governance
Owning Issue: #188

## Return context

- Apply lean, repository-native agent governance to the ai4X project instance.
- Preserve #103 and its Need-to-Capability diagram/type-system work unchanged.
- Current checkpoint: tracked contract and invariant checker implemented;
  complete full verification and independent review.

## Route

- Re-read the owning Issue, project item, branch, Pull Request, and checks from
  Git and GitHub before mutation.
- Load `.ai4x/governance/work-authority.md` and `.ai4x/TEAM.md` for execution and
  collaboration routing.

## Authority boundary

- This file is a tracked return pointer, not work, approval, gate, or lifecycle
  authority.
- Live GitHub state and the current explicit Product Owner decision remain the
  owners of mutable work and execution authority.

## Concurrency limit

- This first slice supports one active tracked STATE per work branch.
- Concurrent branches may carry different STATE revisions. Preserve conflicts
  and fail closed; do not infer which branch supersedes another.
