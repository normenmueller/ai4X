---
child: Contract
title: Capability Authoring Governance
scope: ai4x
version: 0.1.0
status: released
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
