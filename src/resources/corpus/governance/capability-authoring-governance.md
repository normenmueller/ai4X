# Author and maintain a capability

Draft for review.

## Goal

Capability modules in the corpus remain runtime-neutral, composable, and reviewable through machine-checkable metadata.

## Scope

This contract governs authored capability source files in the selected capability collection and their paired metadata files.
It does not define curatable runtime behavior bundles; those belong in the capability catalog itself.

## Capability Text Contract

- Capability modules are agent-agnostic.
- Capability modules are provider- and client-agnostic.
- Runtime-specific dot-paths are forbidden.
- Client-specific integration paths are forbidden.
- Direct in-content file references between capability files are forbidden in authored capability text.
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

## Metadata-Text Boundary

Capability text and metadata serve different consumers and must not duplicate information.

- Capability text (`.md`) is the canonical source for the cognitive contract: Purpose, Trigger, Rules, Fallback, Minimal Output Contract. It serves semantic disambiguation by LLM-based agents.
- Capability metadata (`.meta.yaml`) is the canonical source for machine-checkable signals: source identity, relationships, disambiguation constraints, and provenance. It serves deterministic pre-filtering by tooling.
- No field may exist in both text and metadata. If information appears in both, one must be designated canonical and the other removed.
- A generated selection index may combine text and metadata into a unified surface for agent consumption, but the generation is a derived artifact, not a source of truth.

## Metadata Contract

Use the following pair for a capability source:

- `<capability>.md`
- `<capability>.meta.yaml`

When assessing a source, check the descriptive fields below. For a release candidate, validate against the schema selected for that release. An unselected schema is an open release decision. Preserve source pairs during assessment and record missing evidence separately.

- `id`
- `version`
- `do_not_use_when`
- `distinguish_from`
- `sources`

Lifecycle evidence covers status, domain scope, approver and approval time. The adopted release schema determines where these facts live, for example in a manifest with revision-bound evidence or in metadata fields named `status`, `scope`, `approved_by` and `approved_at`. An absent field on an unreleased source does not establish a defect or an approval. Never infer or fabricate an approval.

Optional metadata fields:

- `review_due`
- `owner`
- `requires`
- `conflicts`
- `migration_note`

Metadata rules:

- `id` must be unique and stable.
- `version` must be valid semver.
- Use the corpus domain vocabulary for `scope`.
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

## Review and Release Contract

- Admission authorizes preparation of a candidate. Before the first or any subsequent release, identify the release decision owner designated by the corpus publisher. Record that owner’s approval of the exact revision after the required checks pass. If the owner, revision or decision is missing, keep the candidate pending. Consumers independently decide which released revision to adopt.
- Changes to released capabilities require explicit approval before they are committed.
- Repository gates must be green before commit or release.
- Capability wording and metadata must be updated together.

## Writing Restrictions

- Keep wording deterministic, concise, and decision-relevant.
- Use plain Markdown source without runtime- or client-specific instructions.
- ASCII-first applies, except German umlauts and `ß` where German text requires them.
- Use plain `"` quotes instead of typographic Unicode quotes.

## Admission Process

A new capability is admitted only when:

1. A demand signal exists (feature requirement, portfolio gap identified during sweep, or explicit product-owner request).
2. Compare the proposed work with the closest existing capability. For an empty corpus, record the empty baseline and a concrete task the first capability would serve.
3. If overlap exists, the decision is: extend existing capability OR split into two with clear boundary — never silently duplicate.
4. The designated capability reviewer performs the nearest-neighbor analysis and proposes the admission decision.
5. The authorized product owner approves admission before authoring a release candidate. A local exploratory draft may precede that decision.

When extending an existing capability constitutes a material semantic change, normal versioning rules apply.

## Deprecation and Retirement Process

1. A capability enters `deprecated` status when it is superseded, semantically stale, or no longer portfolio-relevant.
2. Deprecation requires a `migration_note` in metadata explaining the successor or removal rationale.
3. Deprecated capabilities remain in the portfolio for at least one release cycle to allow downstream adjustment.
4. Retirement (physical removal) requires explicit product-owner approval and confirmation that no active composition references the capability.
5. Status transitions: `active` → `deprecated` → `retired` (removed from repository).

## Portfolio review

Use the [capability sweep](capability-sweep.md) for portfolio-wide review.

## Versioning Semantics

- **Major** (breaking): Semantic change to `Purpose`, `Trigger`, or `Minimal Output Contract` that alters the cognitive job or activation boundary.
- **Minor** (non-breaking): Addition of new rules, refinement of `Fallback`, or extension of the output contract without altering existing semantics.
- **Patch**: Metadata-only changes, wording clarification without semantic shift, typo fixes.

When a version bump is required:
- Update `version` in `.meta.yaml`.
- Refresh approver and approval-time evidence for minor and major changes in the location specified by the adopted release schema.
- Major changes require product-owner approval before commit.

## Scope Field Semantics

Record the capability’s domain classification (for example, `cognitive`) in the location selected by the release schema. Use the shared domain vocabulary consistently and select the domain applicable to each capability.
