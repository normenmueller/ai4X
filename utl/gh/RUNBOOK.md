# GitHub Repository Metadata

## Purpose

Keep the GitHub repository About and Topics reproducible from versioned local metadata.

## Source of Truth

`utl/gh/repo-metadata.yaml` — all intended repository metadata is declared here.

## Commands

```bash
# Check local metadata contract (no network)
bash ./utl/gh/repo-metadata.sh --check-local

# Check remote drift (requires gh auth)
bash ./utl/gh/repo-metadata.sh --check

# Apply local metadata to GitHub (requires gh auth)
bash ./utl/gh/repo-metadata.sh --apply
```

## Operational Rules

1. Keep `utl/gh/repo-metadata.yaml` in sync with intended GitHub metadata.
2. Run `--check-local` before finishing metadata-related changes.
3. Run `--check` when remote drift must be validated.
4. Use `--apply` when metadata updates are intentional and the remote repository must be reconciled.
5. Do not finish metadata changes while intended local metadata and remote GitHub metadata still differ.

## When to Use

The Tech Lead triggers metadata operations when:
- Repository About or Topics need to change
- `make verify` reports a metadata drift
- A Story or chore explicitly requires metadata reconciliation

No automated sync — all metadata changes are intentional and human-triggered.
