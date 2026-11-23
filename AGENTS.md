# ai4X Agent Entry

Read `.ai4x/BEHAVIOR.md` first, then `.ai4x/CONTEXT.md`. Load the owning
Issue when present and only the context needed for the current task.

If the Product Owner starts a fresh session with only a continuation greeting,
follow the Cold Start procedure routed by `.ai4x/CONTEXT.md`; do not request or
reconstruct a copied transition prompt.

For starts in another registered worktree, follow the registered-worktree
re-entry procedure in `.ai4x/operations/session-continuity.md`. It resolves the
preferred working checkout and its tracked return point.

This file is a discovery facade. Canonical repository behavior remains in
`.ai4x/BEHAVIOR.md`.
