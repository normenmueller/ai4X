# Graph Data Transfer (MUST)

## Purpose

Design and verify a restartable import or export that preserves graph identity and relationships.

## Trigger

Use when moving graph data across a storage or process boundary in batches.

## Rules (MUST)

- State the source, authorized destination, transfer scope and snapshot or change boundary. Map stable node and relationship keys, endpoints, properties and missing values across formats. Define how duplicate identities and missing endpoints are handled.
- For import, define the batch transaction and durable checkpoint. Account for a crash after commit but before checkpoint. Prove that replay converges or reconcile committed keys before retry. For export, define consistent reads, a stable delivery identity and a completion signal consumers can verify. Publish that signal only when the whole declared delivery is durable. On retry, inspect existing completion evidence before publishing again.
- Exercise a representative transfer with a forced interruption and retry on a disposable fixture. For export, interrupt before the completion signal and again after publication but before checkpoint. Verify that a consumer accepts only complete deliveries and retry yields one logical delivery. Reconcile nodes and relationships by keys, endpoints and selected properties. Report rejected records and differences even when counts match. Obtain authorization before applying changes or delivering data to a destination.

## Fallback

If source consistency, identity or restart behavior cannot be established, bound the dry run and state which evidence is required before executing the transfer.

## Minimal Output Contract

Mapping, batch and restart rules, authorization boundary, reconciliation evidence and unresolved differences.
