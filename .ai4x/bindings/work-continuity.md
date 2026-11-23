# Work-continuity Target Binding

GitHub hosts published ai4X work. For every fresh session follow the
[Cold Start procedure](../operations/session-continuity.md).

- Work repository: https://github.com/normenmueller/ai4X
- Entry branch: `trunk`
- Live work and lifecycle: repository Issues and
  https://github.com/users/normenmueller/projects/3
- Branch-bound return candidate: tracked `.ai4x/STATE.md`, resolved against its
  work branch and the relevant live Issue when one exists.

No additional recovery repository, synchronized directory, cloud-drive folder,
or machine-local target file is required. Re-establish credentials through
normal GitHub authentication; never commit credentials or host-private state.

If future work introduces necessary local-only state, first move its durable
meaning to its tracked or GitHub owner. Do not declare it recoverable until
anything still required has an explicitly approved, verified GitHub destination.
