---
version: 1.1.0
last_updated: 2026-08-19
---

# AI Strategy Quality Contract

## Purpose

This contract defines the mandatory quality bar for generative and agentic AI strategy decisions in the ai4X CLI.
It applies whenever model/tool boundaries, fallback behavior, uncertainty handling, or prompt-context policies are defined or changed.

## Scope

Apply the classification and routing sections to every planned change. Apply
the specialist assessment and output sections whenever work is classified
`ai-impacting` and routed through `ai4x-ai-strategy`.

## Authority and target transfer (MUST)

This file is the sole current authority for AI-impact classification and
AI-suitability specialist review. Planning, development, conformance, review,
and agent definitions reference this contract and must not copy its trigger or
evidence semantics.

The accepted Greenfield owner is
`.ai4x/governance/quality/ai-strategy.md`, materialized by #104. That path does
not become authoritative merely by existing. Authority transfers only after a
lossless reviewed migration rewires every consumer in one accepted change; at
that boundary this file becomes a reference-only projection or is removed. Two
simultaneously normative copies are prohibited.

## AI-impact classification (MUST)

During planning, the Tech Lead classifies every change as exactly one of:

- `ai-impacting`; or
- `not-ai-impacting`.

The record contains the classified Work Item and scope identity, value,
scoped rationale, applicable trigger IDs, and Tech Lead identity. A changed
scope invalidates the record and requires fresh classification. Labels,
repository location, use of an AI coding tool, or the ai4X product name never
determine the value. Missing, ambiguous, stale, or unowned classification
blocks progression.

The closed minimum triggers are:

- **AI-T01 — Cognitive semantics:** cognitive Capabilities, Needs, Cognitive
  Jobs, Need-to-Capability matching, or Agent Composition.
- **AI-T02 — Agent authority:** agent roles, autonomy, delegation,
  orchestration, specialist routing, or human approval boundaries.
- **AI-T03 — Context and grounding:** prompts, cognitive contracts, context
  assembly, memory, retrieval, grounding, or provenance.
- **AI-T04 — Inference and tools:** model/provider selection, inference
  behavior, structured outputs, tool use, fallback, or recovery behavior.
- **AI-T05 — AI assurance:** AI evaluation, quality thresholds, uncertainty,
  observability, safety, privacy, or cost/latency trade-offs.
- **AI-T06 — AI-consumed contracts:** architecture or data contracts consumed
  by AI agents or used to govern AI-supported decisions.

A change matching any trigger is `ai-impacting`. When material impact remains
uncertain, the change is treated as `ai-impacting` pending specialist review;
uncertainty is not a waiver.

Routine documentation correction, deterministic repository control,
licensing metadata, or unrelated infrastructure is not AI-impacting solely
because it is performed with an AI tool or lives in ai4X. Its
`not-ai-impacting` record still requires a scoped rationale and explicit
confirmation that no AI-T01--AI-T06 trigger applies.

## Specialist qualification and evidence (MUST)

Every `ai-impacting` change requires a named qualified AI-suitability
specialist. The evidence record contains exactly these information classes:

1. classification value, rationale, trigger IDs, owner, and classified scope;
2. specialist identity and qualification basis;
3. reviewed scope and immutable candidate or planning-artifact identity;
4. applicable suitability perspectives and evidence examined;
5. findings and required remediations, explicitly `none` when empty; and
6. gate result `pass` or `blocked`.

The specialist assesses, proportionately to scope: whether AI is appropriate
at all; model and interaction suitability; context, memory, grounding, and
provenance; deterministic boundaries and human authority; failure modes,
uncertainty, fallback, and recovery; evaluation, observability, safety,
privacy, cost, and latency; and compatibility with the accepted ai4X target
architecture and Capability model.

Missing identity, qualification, scope binding, perspective coverage,
findings, or verdict blocks the applicable planning/development conformance
gate. A `blocked` verdict blocks progression. Changed scope or candidate bytes
make prior evidence stale. Review evidence cannot grant PO-owned priority,
Ready, risk acceptance, merge, final acceptance, or `Done` authority.

The assessment is additive and scoped. It does not replace or weaken Tech
Lead orchestration, Product Owner decisions, independent critical review, or
applicable requirements, architecture, security, privacy, testing, Haskell,
Capability-governance, and implementation authorities.

For `not-ai-impacting`, a specialist assessment is not required and is
recorded as `n/a`; routing a specialist merely because AI tooling was used is
prohibited. Independent Review B remains required when the development
workflow requires it, regardless of classification.

Deterministic validation may check closed values, required fields, references,
and scope bindings. It must never infer semantic impact, qualification, or
suitability.

## Classification examples

- Changing delegation limits, prompt/context assembly, model fallback, or the
  review-routing rule in this contract is `ai-impacting` under AI-T02, AI-T03,
  AI-T04, or AI-T05 and requires the specialist evidence above.
- Correcting a license identifier or deterministic CI path without changing
  AI-consumed contracts is `not-ai-impacting`; record the rationale and no
  specialist assessment.

## Output Contract (MUST)

Every non-trivial AI strategy deliverable must contain the following sections:

1. **Task-model fit** — Assessment of whether the task is suitable for the proposed model/tool.
2. **Tooling boundaries** — Explicit limits of what the model/tool can and cannot do.
3. **Failure and fallback strategy** — Defined behavior when the model/tool fails or produces unreliable output.
4. **Prompt-context controls** — Policies governing prompt construction, context window management, and auditability.
5. **Risks and safeguards** — Known risks with concrete mitigation measures.
6. **Rejected alternative and rationale** — At least one rejected approach with concrete rejection reasoning.

## Prompt-Context Design Rules (MUST)

- Explicitness over token efficiency for quality-relevant rules. A direct contract reference in an agent definition is mandatory even when a parent agent already mandates it. Indirection chains degrade compliance; redundant explicit references are an acceptable cost.
- Never remove a quality-relevant instruction from an agent to save tokens without evidence that compliance is preserved through an alternative enforcement mechanism.
- Inline actionable constraints at point of use. Reserve indirection for supplementary context only.

## Quality and Challenge Rules (MUST)

- No claims without operational evidence.
- No hidden prompt behavior assumptions.
- Escalate when model limits materially impact reliability.
- Block progression when fallback or uncertainty handling is undefined.
- Challenge at least one optimistic reliability assumption with a concrete failure scenario.
