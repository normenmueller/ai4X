# ai4X Project Work Continuity

This tracked procedure makes the concrete ai4X project instance recoverable
after loss or replacement of its workstation. It is a provisional, manual
#eyodf bootstrap for [Issue #181](https://github.com/normenmueller/ai4X/issues/181)
and supplies evidence for the future Portfolio offering discussed in
[Issue #180](https://github.com/normenmueller/ai4X/issues/180). It is not a
released `WorkContinuityBundle` or a stable product API.

The scripts under `util/work-continuity/` are repository tooling only. #180
must retire them after the released Portfolio implementation under `src/`
proves the equivalent project path.

## Readiness invariant

```text
RemoteCheckpoint<Verified>
  + LocalContinuity<None | Recoverable>
  + RestoreProof<Passed>
  = WorkState<Recoverable>
```

The configured Git remote is the sole authority for tracked work. An external
recovery target contains only inert fallback material for explicitly selected
local continuity state and additional local Git history. It is never an active
workspace or a competing project authority.

## Project-instance boundary

```text
.ai4x/operations/work-continuity.md
  tracked agent-facing rules and operating procedure

.ai4x/operations/work-continuity/
  INCLUDE.txt     explicit local-continuity inventory
  RECOVERY.md     cold-start recovery procedure

.ai4x/bindings/work-continuity.md
  tracked logical target requirement; no machine-local path

util/work-continuity/
  provisional checkpoint and verification tools

.ai4x/local/work-continuity/
  machine-local target binding, staging and locks

external target/
  README.md, CURRENT, baseline/, rolling/
```

## Checkpoint

1. Require a clean tracked worktree and exact equality between `HEAD` and its
   configured upstream.
2. Review `INCLUDE.txt`. Only necessary local continuity files may be listed.
3. Prepare a new slot below `.ai4x/local/work-continuity/staging/`:

   ```sh
   util/work-continuity/create-checkpoint.sh \
     . \
     .ai4x/local/work-continuity/staging/slot-a \
     slot-a
   ```

4. Copy the verified prepared slot to an unused or separately authorized
   eligible rolling slot at the bound external target.
5. Verify the copied slot with
   `util/work-continuity/verify-checkpoint.sh CHECKPOINT_DIRECTORY`.
6. Replace `CURRENT` only after the copied slot and a proportionate restore
   have passed verification.

Never replace the preserved baseline, the current rolling slot, or the last
verified recovery state. A replacement is prepared and verified before an
older eligible slot is removed.

## Inclusion policy

`INCLUDE.txt` is the complete allowlist. Every entry must be a regular,
non-symlinked file below `.ai4x/local/`. Credentials, secrets, unrelated
projects, provider-private state, unnecessary transcripts, caches, build
outputs and downloaded tools remain excluded.

Refresh the rolling recovery set after a coherent tracked checkpoint whenever
necessary local continuity state materially changes. Do not checkpoint every
edit mechanically.
