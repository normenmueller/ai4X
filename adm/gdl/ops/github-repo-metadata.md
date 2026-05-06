---
version: 1.0.0
last_updated: 2026-05-06
---

# GitHub Repository Metadata Runbook

## Purpose

Keep repository About and Topics reproducible from versioned local metadata.

## Source of Truth

- acc/repo-metadata.yaml

Required fields:

1. version
2. repo
3. about
4. topics

## Commands

Check local metadata contract:

bash ./utl/gh/repo-metadata.sh --check-local

Check remote drift (requires gh auth):

bash ./utl/gh/repo-metadata.sh --check

Apply local metadata to GitHub (requires gh auth):

bash ./utl/gh/repo-metadata.sh --apply

## Operational Rules

1. Keep acc/repo-metadata.yaml in sync with intended GitHub metadata.
2. Run --check-local before finishing metadata-related changes.
3. Run --check when remote drift must be validated.
4. Use --apply when metadata updates are intentional and the remote repository must be reconciled.
5. Do not finish metadata changes while intended local metadata and remote GitHub metadata still differ.
