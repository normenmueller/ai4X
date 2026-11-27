# Bibliographic Collection Reconciliation (MUST)

## Purpose

Reconcile catalogue records with stored documents while preserving identity, version and existing annotations.

## Trigger

Use when auditing, importing or repairing records and documents in a collection with a designated catalogue.

## Rules (MUST)

- Inventory the records, file references and documents within the requested scope. Distinguish work, edition or version, and file identity. Check identifiers and edition evidence for the first two, and content equality for a claimed identical file. A shared identifier alone cannot establish identical content.
- Classify each candidate as already consistent, missing, mislinked, a distinct item with a colliding key, or unresolved. Preserve existing keys, annotations and unrelated entries. A consistent repeat intake yields an empty change set. For a genuine key collision on a different item, check the replacement key in the catalogue and any derived target filename in storage.
- Specify the exact affected records, references and file operations. Before an authorized change, recheck the relevant inputs and target availability. Stage recoverable changes, preserve the last consistent state, and stop for reassessment if the inputs changed.
- After application, parse the resulting catalogue, check key uniqueness, resolve affected file references and verify the intended file identity. After partial failure, establish what actually changed before recovery or retry. Never overwrite a competing file or discard a user field to force a match.

## Fallback

If versions, authority, or the intended catalogue are ambiguous, report the competing matches and the smallest evidence or owner decision needed. Continue independent read-only checks. Report unavailable files or unperformed verification as such.

## Minimal Output Contract

Report the scoped matches and discrepancies, a proposed change set or an explicit no-op, and verification or recovery status for each applied change.
