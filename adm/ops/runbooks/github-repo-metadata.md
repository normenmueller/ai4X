# GitHub Repository Metadata Contract

This document defines how GitHub repository metadata is persisted and maintained.

## Purpose

- prevent metadata loss by storing `About` and `Topics` in versioned files
- keep GitHub UI configuration reproducible
- provide deterministic drift checks

## Source of Truth

- Canonical source: `adm/ops/runbooks/github-repo-metadata.yaml`
- Scope: `ai4x`, `ask`, `kob`, `ccp`, `tcp`

## Mirror Rule

- Every repository keeps a lightweight mirror at `acc/repo-metadata.yaml`.
- Mirror fields are limited to:
  - `version`
  - `repo`
  - `about`
  - `topics`
- Mirror values must match the canonical source for the same repo.

## Operations

- Local consistency check (canonical + mirrors):
  - `bash ./utl/gh/repo-metadata.sh --check`
- Apply canonical metadata to GitHub:
  - `bash ./utl/gh/repo-metadata.sh --apply`

## Ownership

- Changes to repo metadata are committed in `ai4x`.
- Module mirror updates are part of the same change slice.
