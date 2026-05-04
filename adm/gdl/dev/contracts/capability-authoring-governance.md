---
child: Contract
title: Capability Authoring Governance
scope: ai4x
version: 0.2.0
status: released
owner: ai4x-capability-governance
---

Status: released. Normative governance for authoring cognitive capability modules in ai4X.
ai4X treats capability quality as a move from formally correct artifacts to semantically robust reusable contracts.

# Goal

Capability modules in ai4X remain runtime-neutral, composable, and reviewable through machine-checkable metadata.

# Scope

This contract governs authored capability source files under `dev/cap/**` and their paired metadata files.
It does not define curatable runtime behavior bundles; those belong in the capability catalog itself.

# Capability Text Contract

- Capability modules are agent-agnostic.
- Capability modules are provider- and client-agnostic.
- Runtime-specific dot-paths are forbidden.
- Client-specific integration paths are forbidden.
- Direct in-content file references between capability files are forbidden in v1.
- Capability text must express reusable runtime cognition, not repository workflow.
- Capability prose defines only the capability's own reusable cognitive contract.
- Dependency and exclusion semantics between capabilities are modeled only through metadata (`requires`, `conflicts`).
- Capability discoverability and applicability are modeled through the canonical selection surface:
  - capability text: `Purpose`, `Trigger`
  - metadata: `do_not_use_when`, `requires`, `conflicts`, `distinguish_from`
- Capability prose must not contain hidden composition guidance such as "use with X", "requires Y", or file-to-file assembly instructions.
- Capability prose must not encode slash commands, client commands, UI actions, or runtime-specific invocation syntax as if they were semantic triggers.
- Capability names must express the cognitive ability, not the resulting artifact or template.
- Active capability texts use the canonical section shape:
  - `## Purpose`
  - `## Trigger`
  - `## Rules (MUST)`
  - `## Fallback`
  - `## Minimal Output Contract`
- Active capability texts are written in English.
- Active capability texts must be executable cognitive contracts for agentic composition, not principle-only prose.
- Active capability texts must be semantically robust, not merely structurally well-formed.
- `Trigger` must describe a concrete activation situation.
- `Trigger` must stay semantic and must not collapse into command syntax or client-specific invocation wording.
- `Purpose` must name the specific reusable cognitive job the capability contributes.
- `Purpose`, `Trigger`, `Fallback`, and `Minimal Output Contract` must be materially usable, not only present.
- Placeholder or generic boilerplate clause wording is a quality defect even when the canonical headings are present.
- `Fallback` must define provisional handling when mandatory context or evidence is missing.
- `Minimal Output Contract` must define the material runtime contribution of the capability.
- Active capabilities must have a portfolio-distinct trigger or an explicitly justified complementary trigger role.
- Neighboring capabilities must keep terminology and semantic boundaries consistent enough that the same semantic core is not silently renamed or ambiguously duplicated.
- New or materially changed capabilities must be admitted only after explicit nearest-neighbor comparison and primary semantic owner judgment.

# Schema-Text Boundary

Capability text and metadata serve different consumers and must not duplicate information.

- Capability text (`.md`) is the canonical source for the cognitive contract: Purpose, Trigger, Rules, Fallback, Minimal Output Contract. It serves semantic disambiguation by LLM-based agents.
- Capability metadata (`.meta.yaml`) is the canonical source for machine-checkable signals: identity, lifecycle, relationships, disambiguation constraints, and provenance. It serves deterministic pre-filtering by tooling.
- No field may exist in both text and metadata. If information appears in both, one must be designated canonical and the other removed.
- A generated selection index may combine text and metadata into a unified surface for agent consumption, but the generation is a derived artifact, not a source of truth.

# Metadata Contract

Every capability is authored as a mandatory pair:

- `<capability>.md`
- `<capability>.meta.yaml`

Required metadata fields:

- `id`
- `version`
- `status`
- `approved_by`
- `approved_at`
- `scope`
- `do_not_use_when`
- `distinguish_from`
- `sources`

Optional metadata fields:

- `review_due`
- `owner`
- `requires`
- `conflicts`
- `migration_note`

Metadata rules:

- `id` must be unique and stable.
- `version` must be valid semver.
- `scope` must match the repository domain.
- `requires` may only reference existing capability IDs.
- `do_not_use_when` captures explicit negative applicability boundaries when they matter materially.
- `do_not_use_when: []` is the correct explicit state only when no additional negative boundary is needed beyond `Purpose` and `Trigger` and wrong selection is not materially likely.
- `conflicts` may only describe real mutual exclusion and must remain symmetric.
- `conflicts: []` is the correct state when no real mutual exclusion exists; never invent exclusivity for taxonomy neatness.
- `distinguish_from` captures nearby capabilities that are plausibly confused with the current one and states the boundary.
- `distinguish_from: []` is the correct explicit state only when no meaningful confusion risk exists, plausible neighbor confusion is not materially likely, or the distinction is already clear from `Purpose` and `Trigger`.
- Do not use long `do_not_use_when` or `distinguish_from` lists to compensate for an unclear semantic split; that is a quality signal for `sharpen`, `split`, or `move`.
- `sources` is mandatory on every capability metadata file.
- `sources` records materially used external design sources with `title`, `organization`, `url`, `kind`, and `accessed_at`.
- `sources: []` is the correct explicit state when no stable external primary source was materially used.
- `active` requires non-empty approval evidence.

# Review and Release Contract

- Changes to released capabilities require explicit approval before they are committed.
- Repository gates must be green before commit or release.
- Capability wording and metadata must be updated together.

# Writing Restrictions

- Keep wording deterministic, concise, and decision-relevant.
- Use plain Markdown source without runtime- or client-specific instructions.
- ASCII-first applies, except German umlauts and `ß` where German text requires them.
- Use plain `"` quotes instead of typographic Unicode quotes.

# Admission Process

A new capability is admitted only when:

1. A demand signal exists (feature requirement, portfolio gap identified during sweep, or explicit PO request).
2. Nearest-neighbor comparison confirms no existing capability already covers the semantic job.
3. If overlap exists, the decision is: extend existing capability OR split into two with clear boundary — never silently duplicate.
4. The `ai4x-capability-governance` agent performs the nearest-neighbor analysis and proposes the admission decision.
5. PO approves admission before authoring begins.

When extending an existing capability constitutes a material semantic change, normal versioning rules apply.

# Deprecation and Retirement Process

1. A capability enters `deprecated` status when it is superseded, semantically stale, or no longer portfolio-relevant.
2. Deprecation requires a `migration_note` in metadata explaining the successor or removal rationale.
3. Deprecated capabilities remain in the portfolio for at least one release cycle to allow downstream adjustment.
4. Retirement (physical removal) requires explicit PO approval and confirmation that no active composition references the capability.
5. Status transitions: `active` → `deprecated` → `retired` (removed from repository).

# Portfolio Review Cadence

- The `ai4x-capability-governance` agent performs a portfolio health sweep when triggered by:
  1. Tech Lead or PO explicit request.
  2. Before major feature work that depends on capability composition (e.g., curate implementation).
  3. Periodic cadence as agreed with PO (recommended: before each release milestone).
- Sweep output: Capability Assessment Report with findings categorized as high/medium/low severity.
- High-severity findings (semantic overlap, stale triggers, broken differentiation) become Stories in the PBL.
- Low-severity findings are tracked as tasks within existing Stories or deferred to next sweep.

# Versioning Semantics

- **Major** (breaking): Semantic change to `Purpose`, `Trigger`, or `Minimal Output Contract` that alters the cognitive job or activation boundary.
- **Minor** (non-breaking): Addition of new rules, refinement of `Fallback`, or extension of the output contract without altering existing semantics.
- **Patch**: Metadata-only changes, wording clarification without semantic shift, typo fixes.

When a version bump is required:
- Update `version` in `.meta.yaml`.
- Update `approved_by` and `approved_at` for minor and major changes.
- Major changes require PO approval before commit.

# Scope Field Semantics

The `scope` field in capability metadata identifies the **capability domain classification** (e.g., `cognitive`), not the repository name. It enables filtering and routing within a multi-domain portfolio. The value must be consistent across all capabilities in the same portfolio.
