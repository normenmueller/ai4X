# Session Hygiene

## Purpose

Keep ai4X work resumable and resource-bounded while preserving exact project ownership, provider evidence, and human authority. This workflow governs observation and stop decisions; it grants no destructive capability.

## Authority and precedence

This file solely owns the normative session-hygiene workflow. Delegation and context-inheritance facts are owned by [`../coordination/collaboration.dhall`](../coordination/collaboration.dhall). Resource facts are owned by [`./session-hygiene.dhall`](./session-hygiene.dhall). Neither values nor exceptions may be inferred from this prose.

The JSON under `../generated/assurance/` is a mechanically derived inert projection. It is never an authority. A digest mismatch, unsupported schema, missing owner, or conflict between an owner and its projection stops evaluation until the projection is explicitly republished and reviewed.

Exact Product Owner decisions override defaults only where the owning declaration has an explicit matching decision field. Missing or ambiguous authority fails closed.

## Scope

This workflow applies to the active ai4X Codex parent session, every delegated agent, repository free-space observation, Issue completion, and AFK, process, restart, or handoff boundaries. Delegation uses the closed `codex-managed-delegation/v1` capability profile and the provider's normal native multi-agent boundary. Provider-local rollout observation is an optional diagnostic: an exact provider-supplied path is measured when available, while absence is recorded as `unavailable`. The workflow never scans for candidate sessions or infers ownership from age, size, directory proximity, role name, release string, or process state.

Cleanup, archive, deletion, repair, database mutation, signals, process termination, broad scanning, and empty-directory removal are outside this workflow and unavailable from its utility surface.

## Inputs and outputs

Required inputs are the accepted inert projection, exact Issue identity, exact project root and working directory, current lifecycle state, exact host-release telemetry, fresh free-space observation, profile identity/digest, and the Assignment effects, context, ownership, and authority relevant to delegation. Exact parent or child rollout identity/path pairs are optional diagnostic inputs and must be supplied together. They are never guessed or reconstructed.

The read-only measurement adapter emits canonical observation JSON containing free-space facts, exact host-release telemetry, profile binding, lifecycle state, optional rollout outcomes, and redacted binding results. `unavailable` or `failed` permits no rollout size, growth, containment, or cleanup claim and does not alone decide Assignment admission. The ordinary evaluation entry point loads the inert projection from its project path, enforces its closed schema and source digests, and only then invokes the pure provider-neutral evaluation boundary. An unvalidated policy object is not an operational input.

The repository preflight does not call or authenticate the provider. It canonicalizes the real repository and working directory, observes free space itself, binds the exact task and handoff content to their digests, rejects unsafe or overlapping writer ownership, and checks caller-owned durable nonce/reviewer evidence. Its result is only `policy-satisfied`, with `authorityEffect = none`, `detachedAuthority = none`, no provider identity, and no verdict.

After that preflight, the active parent uses the provider's normal multi-agent operation directly. Only the direct host-boundary result supplies child/task identity, lifecycle, exposed permissions, and verdict. Child prose, request fields, callbacks, detached JSON, local session state, or role names cannot establish provider identity or independence. The parent must recheck candidate/nonmutation state and durably consume the nonce. Repository code cannot recreate or authenticate those host facts.

## Lifecycle triggers

- **SH-W01 — Before delegation.** Load and freshness-check the inert projection and exact profile. Run the repository preflight against the canonical project, exact task/handoff/candidate, complete Assignment/ownership topology, and durable replay evidence. Record the parent rollout as `unavailable` unless the provider supplies its exact identity/path pair; record the not-yet-created child as such. Host release is telemetry, never an admission allowlist.
- **SH-W02 — While delegated work is active.** Reobserve disk and any exact provider-supplied rollout path no later than the interval owned by the resource declaration. Record an absent child path as `unavailable`; do not guess or scan for it.
- **SH-W03 — At SubagentStop.** Bind the stop to the same direct provider-returned child/task identity and one-use nonce. Recheck the candidate, author/prior-reviewer exclusion, and repository/remote nonmutation before durably recording nonce consumption. If the provider supplies an exact child rollout path, apply every exact-path safety check before measuring it; otherwise record `unavailable`. Independent review consumes exactly one verdict and then stops.
- **SH-W04 — After Issue completion.** Reobserve parent and disk and verify that every essential result is already durably integrated before recording completion evidence.
- **SH-W05 — Before AFK, process, restart, or handoff.** Verify a compact durable handoff and promote every decision-critical result from transient storage to its owning Git revision, GitHub record, or governed evidence location.
- **SH-W06 — After merged effective change.** The closed effective classes are `constitution-safety`, `agents-roles`, `delegation-collaboration`, `governance-lifecycle-authority-routing-work-management`, `host-bootstrap-configuration`, `tracked-ai-host-facade`, and `capability-context-selection`. When a merged change contains any effective class, require a safe boundary, a verified compact durable handoff, and `fresh-without-resume`. The closed inert classes are `inert-documentation`, `test-evidence-output`, `generated-projection`, and `local-scratch`; an inert-only or unmerged change does not trigger restart. A mixed effective/inert change does trigger it. Unknown or duplicated classes fail closed.

## Invariants

- **SH-W07 — Exact ownership and read-only observation.** When a rollout path is supplied or measurement is claimed, open only that exact provider-supplied file, without following a terminal symlink or reading transcript content; verify identity, containment, and descriptor stability across path checks. Treat unsafe, foreign, missing, swapped, or ambiguous path facts as a failed diagnostic with redacted evidence and no rollout claim. Never convert diagnostic failure into Assignment authority.
- **SH-W08 — Quality-preserving stop.** A resource, delegation, context, evidence, or binding diagnostic stops new delegation or continuation as reported. It never authorizes cleanup, destructive action, relaxed testing, reduced review, or lower engineering quality.

Assignment classification, the write-capable Assignment limit, exception authority, participation observation, and context inheritance are read from the Collaboration owner. `fullHistoryApproval = null` forbids full-history inheritance. A non-null approval is valid only when decision reference, Issue, task, and rationale all exactly match the requested Assignment; a syntactically plausible caller-supplied reference creates no authority. Owned paths must be canonical repository-relative paths. The directly active authorized agent and every delegated writer, and all delegated writers among themselves, must have non-overlapping ownership. Non-writing specialists remain observable even when they do not consume the write-capable Assignment allowance.

Resource thresholds and freshness limits are read from the Operations declaration. Expected growth is evaluated only between two exact satisfied measurements and is exempt only through a durable, exact explanation; an unexplained remainder at the configured boundary blocks. A completed child's measured baseline is nonexistence. Path absence is truthful `unavailable` and is not itself an error or a measurement.

## Stop and escalation conditions

Stop on every evaluator `block`, stale or unknown profile, noncanonical project/ownership, task/handoff/candidate digest mismatch, missing or transient replay evidence, missing/ambiguous direct native result, provider identity or lifecycle mismatch, reused reviewer identity, replayed nonce, second verdict, read-only mutation, incompatible exposed permissions, stale projection, incomplete admission input, foreign project root, observation outside the declared freshness bound, resource threshold crossing without durable explanation, ambiguous Assignment effects, ownership overlap, invalid exception authority, or missing durable result. Host release changes do not alone block. Unsafe exact paths fail the rollout diagnostic and every rollout claim; they do not alone grant or deny Assignment admission.

Report the stable diagnostic, exact lifecycle boundary, Issue, non-sensitive evidence locator, and minimal safe remediation. Do not include rollout paths or transcript content. Resume only after a fresh conforming observation or exact human decision resolves the same condition. A destructive remediation requires a separate Issue and exact Product Owner approval; this workflow cannot perform it.

## Evidence obligations

Observation receipts are transient operational inputs until promoted. Decision, implementation, test, review, and handoff facts must be bound to Git, GitHub, or a governed tracked evidence owner before a boundary. `/tmp`, transcript history, and `.ai4x/local/**` are never sole durable authorities. Local scratch may hold recoverable current-Issue working material and receipts because `.ai4x/.gitignore` excludes the entire local boundary.

Evidence records identify the Issue, candidate or authority digest, lifecycle, diagnostic codes, provider/version, projection source digests, observation time, and redacted binding verdicts. They never copy transcript content or expose a full rollout path.

## Next actions

On `allow`, perform only the already authorized lifecycle action and schedule the next required observation. On `block`, preserve current state, persist the bounded diagnostic at an approved evidence boundary, and escalate the exact unresolved condition. At a merged effective-change boundary, create and verify the compact durable handoff. The Product Owner manually replaces the active primary Codex CLI session without `resume` only after the Referent recommends that boundary; internal ai4X agents/reviewers continue to use normal provider-managed delegation and are never created by launching a separate Codex CLI process.

## Provenance and trust boundary

This policy materializes the Product Owner decisions `M121-01` and `M154-01`. Its authoritative collaboration/resource facts remain the two linked Dhall owners. `util/repository/session-hygiene/` is a Repository Engineering assurance boundary: it may canonicalize and measure local project facts, evaluate inert authority projections, implement the closed preflight profile, and obtain exact read-only Codex metadata. It never invokes provider delegation, accepts provider identity, emits a verdict, or authenticates detached provider truth. The active parent/provider tool boundary alone owns direct native identity/lifecycle provenance. Host release is preserved exactly as telemetry. Layout compatibility is claimed only for an exact provider-supplied path that passes every measurement safeguard.

Examples and tests are non-instructive evidence. They may demonstrate fresh-agent success, pending child paths, manipulated hooks, path swaps, foreign projects, low disk, abnormal growth, context exceptions, and durable-boundary failures, but they cannot create policy, approval, or current provider state.
