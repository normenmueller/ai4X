# Session Hygiene

## Purpose

Keep ai4X work resumable and resource-bounded while preserving exact project ownership, provider evidence, and human authority. This workflow governs observation and stop decisions; it grants no destructive capability.

## Authority and precedence

This file solely owns the normative session-hygiene workflow. Delegation and context-inheritance facts are owned by [`../coordination/collaboration.dhall`](../coordination/collaboration.dhall). Resource facts are owned by [`./session-hygiene.dhall`](./session-hygiene.dhall). Neither values nor exceptions may be inferred from this prose.

The JSON under `../generated/assurance/` is a mechanically derived inert projection. It is never an authority. A digest mismatch, unsupported schema, missing owner, or conflict between an owner and its projection stops evaluation until the projection is explicitly republished and reviewed.

Exact Product Owner decisions override defaults only where the owning declaration has an explicit matching decision field. Missing or ambiguous authority fails closed.

## Scope

This workflow applies to the active ai4X Codex parent session, every delegated agent, repository free-space observation, Issue completion, and AFK, process, restart, or handoff boundaries. It observes an exact provider-supplied rollout path and the exact project root. It never scans for candidate sessions or infers ownership from age, size, directory proximity, role name, or process state.

Cleanup, archive, deletion, repair, database mutation, signals, process termination, broad scanning, and empty-directory removal are outside this workflow and unavailable from its utility surface.

## Inputs and outputs

Required inputs are the accepted inert projection, exact Issue identity, exact project root, current lifecycle state, provider name and supported version, parent session identity and rollout path, hook working directory, observation time, and the Assignment effects and authority that are relevant to delegation. At SubagentStop, the exact provider-supplied child identity and transcript path are additionally required.

The read-only host adapter emits canonical observation JSON containing sizes, free-space facts, lifecycle state, and redacted binding results. The ordinary evaluation entry point loads the inert projection from its project path, enforces its closed schema and source digests, and only then invokes the pure evaluation boundary. An unvalidated policy object is not an operational input. The evaluator emits `allow` or `block` plus stable diagnostics. Receipt persistence is caller-owned and must be an atomic write into the current Issue's ignored session scratch; the adapter and evaluator have no persistence path.

## Lifecycle triggers

- **SH-W01 — Before delegation.** Load and freshness-check the inert projection. Observe the exact parent rollout and repository free space immediately before evaluating a requested Assignment. Record the not-yet-created child as such.
- **SH-W02 — While delegated work is active.** Reobserve the exact parent and disk no later than the interval owned by the resource declaration. Record the child rollout as `pending-provider-path`; do not guess or scan for it.
- **SH-W03 — At SubagentStop.** Accept only the exact child path supplied by the provider at this boundary. Validate it against the supported Codex allowlist and project binding, measure its final size, then reobserve parent and disk.
- **SH-W04 — After Issue completion.** Reobserve parent and disk and verify that every essential result is already durably integrated before recording completion evidence.
- **SH-W05 — Before AFK, process, restart, or handoff.** Verify a compact durable handoff and promote every decision-critical result from transient storage to its owning Git revision, GitHub record, or governed evidence location.
- **SH-W06 — After merged effective change.** The closed effective classes are `constitution-safety`, `agents-roles`, `delegation-collaboration`, `governance-lifecycle-authority-routing-work-management`, `host-bootstrap-configuration`, `tracked-ai-host-facade`, and `capability-context-selection`. When a merged change contains any effective class, require a safe boundary, a verified compact durable handoff, and `fresh-without-resume`. The closed inert classes are `inert-documentation`, `test-evidence-output`, `generated-projection`, and `local-scratch`; an inert-only or unmerged change does not trigger restart. A mixed effective/inert change does trigger it. Unknown or duplicated classes fail closed.

## Invariants

- **SH-W07 — Exact ownership and read-only observation.** Open only an exact allow-listed rollout file, without following a terminal symlink or reading transcript content; verify descriptor identity across path checks. Treat foreign, missing, swapped, unsupported, or ambiguous facts as a block with redacted diagnostics.
- **SH-W08 — Quality-preserving stop.** A resource, delegation, context, evidence, or binding diagnostic stops new delegation or continuation as reported. It never authorizes cleanup, destructive action, relaxed testing, reduced review, or lower engineering quality.

Assignment classification, the write-capable Assignment limit, exception authority, participation observation, and context inheritance are read from the Collaboration owner. `fullHistoryApproval = null` forbids full-history inheritance. A non-null approval is valid only when decision reference, Issue, task, and rationale all exactly match the requested Assignment; a syntactically plausible caller-supplied reference creates no authority. The directly active authorized agent and a delegated writer must never concurrently own overlapping files. Non-writing specialists remain observable even when they do not consume the write-capable Assignment allowance.

Resource thresholds and freshness limits are read from the Operations declaration. Expected growth is exempt only through a durable, exact explanation; an unexplained remainder at the configured boundary blocks. A completed child's baseline is nonexistence. During activity, absence of a provider child path is the truthful `pending-provider-path` state and is not itself an error.

## Stop and escalation conditions

Stop on every evaluator `block`, adapter failure, stale projection, unsafe path, incomplete lifecycle input, unsupported provider version/layout, foreign project root, observation outside the declared freshness bound, resource threshold crossing without durable explanation, ambiguous Assignment effects, ownership overlap, invalid exception authority, or missing durable result.

Report the stable diagnostic, exact lifecycle boundary, Issue, non-sensitive evidence locator, and minimal safe remediation. Do not include rollout paths or transcript content. Resume only after a fresh conforming observation or exact human decision resolves the same condition. A destructive remediation requires a separate Issue and exact Product Owner approval; this workflow cannot perform it.

## Evidence obligations

Observation receipts are transient operational inputs until promoted. Decision, implementation, test, review, and handoff facts must be bound to Git, GitHub, or a governed tracked evidence owner before a boundary. `/tmp`, transcript history, and `.ai4x/local/**` are never sole durable authorities. Local scratch may hold recoverable current-Issue working material and receipts because `.ai4x/.gitignore` excludes the entire local boundary.

Evidence records identify the Issue, candidate or authority digest, lifecycle, diagnostic codes, provider/version, projection source digests, observation time, and redacted binding verdicts. They never copy transcript content or expose a full rollout path.

## Next actions

On `allow`, perform only the already authorized lifecycle action and schedule the next required observation. On `block`, preserve current state, persist the bounded diagnostic at an approved evidence boundary, and escalate the exact unresolved condition. At a merged effective-change boundary, create and verify the compact durable handoff, stop the old session, and start a fresh repository-root session without `resume`.

## Provenance and trust boundary

This policy materializes the Product Owner decision `M121-01` recorded on Issue #121. Its authoritative facts are the two linked Dhall owners. `util/repository/session-hygiene/` is a Repository Engineering boundary: it may evaluate inert facts and obtain exact read-only Codex metadata, but it owns neither project semantics nor provider truth. Codex support is explicitly limited to the version and layout accepted by the adapter; other versions fail closed.

Examples and tests are non-instructive evidence. They may demonstrate fresh-agent success, pending child paths, manipulated hooks, path swaps, foreign projects, low disk, abnormal growth, context exceptions, and durable-boundary failures, but they cannot create policy, approval, or current provider state.
