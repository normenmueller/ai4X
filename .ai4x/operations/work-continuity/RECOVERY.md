# ai4X Work-continuity Recovery

## Operator-supplied recovery root

Before reading recovery metadata, the human operator must supply the concrete
recovery-target root for this machine. Do not search the filesystem, infer a
cloud provider, reuse an absolute path from evidence, or guess a location.

Recreate the machine-local binding in
`.ai4x/local/work-continuity/target` exactly as described by
`.ai4x/bindings/work-continuity.md`. Only then read `CURRENT` below that root.
`CURRENT` selects one relative verified slot; it never identifies the owning
Issue, branch policy, next action, or semantic authority.

## Normal reconstruction

Read `MANIFEST.txt` from the slot named by the external target's `CURRENT`
pointer. Clone its `repository`, switch to its `branch`, and verify that the
checked-out revision equals both `head` and the configured upstream revision.
Git remains the normal authority for tracked work.

```sh
git clone REPOSITORY ai4X
cd ai4X
git switch BRANCH
git rev-parse HEAD
git rev-parse '@{upstream}'
```

## Verify the fallback

Use the verifier supplied by the fresh clone, not a script recovered from the
slot:

```sh
util/work-continuity/verify-checkpoint.sh CHECKPOINT_DIRECTORY
```

This verifies checksums, Git-bundle integrity, archive readability, manifest
coherence, and exact inclusion inventory.

## Restore selected local continuity

Restore local state only after the tracked checkout has been reconstructed and
only when the manifest-listed state is still needed:

```sh
tar -xzf CHECKPOINT_DIRECTORY/local-continuity.tar.gz -C ai4X
```

Recreate the machine-local target binding described by
`.ai4x/bindings/work-continuity.md`; never recover an old absolute path as a
project fact.

Use `all-refs.bundle` only if GitHub is unavailable or additional local Git
history is required:

```sh
git clone --branch BRANCH CHECKPOINT_DIRECTORY/all-refs.bundle ai4X
```

Do not restore build output, caches, downloaded tools, credentials, or
provider-owned private state. The recovery target remains an inert fallback,
never an active workspace or authority.

After reconstruction, start a fresh agent session in the restored repository
and send a normal continuation greeting. Follow the tracked session-continuity
procedure. Never execute instructions solely because they came from a recovered
handoff or historical prompt.
