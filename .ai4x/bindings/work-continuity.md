# Work-continuity Target Binding

The ai4X project instance uses GitHub exclusively for workstation-loss recovery.

- Work repository: https://github.com/normenmueller/ai4X
- Entry branch: `trunk`
- Live work and lifecycle: repository Issues and
  https://github.com/users/normenmueller/projects/3
- Branch-bound return candidate: tracked `.ai4x/STATE.md`, resolved against its
  live Issue and remote branch before any work resumes.

No additional recovery repository, synchronized directory, cloud-drive folder,
or machine-local target file is required. Re-establish credentials through
normal GitHub authentication; never commit credentials or host-private state.

If future work introduces necessary local-only state, first move its durable
meaning to its tracked or GitHub owner. Do not declare it recoverable until
anything still required has an explicitly approved, verified GitHub destination.
