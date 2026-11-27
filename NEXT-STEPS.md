# R-15 approved continuation

Approved by the Product Owner on 2026-08-08.

## Current stage: finish Issue #89 only

The gate remains `blocked` until the remaining ownership defect is corrected and
independently re-reviewed.

1. Replace the untyped global ID union with typed published summaries carrying stable
   ID, exact semantic version, entity kind, and owning bounded context.
2. Validate local references exclusively in their owning bounded-context validator.
3. Let Composition validate only references explicitly declared as cross-context
   references, against the expected summary type.
4. Make the missing handoff receiver fixture emit exactly
   `CollaborationOwner/UNRESOLVED_REFERENCE`.
5. Add wrong-entity-kind and wrong-version regression cases.
6. Run one narrow independent re-review.
7. Present the consolidated language recommendation and gate result to the Product
   Owner.

The provisional recommendation is Dhall as the sole project-authoring authority, with
product-owned Haskell context models and validators. This is not dual normative
Haskell/Dhall authoring.

The guarded-iteration path in the visualization is an illustrative prototype example,
not an accepted normative workflow and not a blocker for the language decision.

## Explicit non-goals for this correction

- No Issue #83 target-tree synthesis.
- No migration or compatibility scaffolding.
- No deletion or relocation of `xxx/`, `adm/`, `crp/`, or protected evidence.
- No implementation-stage work.
- No GitHub or Codex adapter restructuring.

## Sequence after a Product Owner-approved Issue #89 pass

1. Move Issue #83 from Backlog to In progress.
2. Produce the complete clean target tree.
3. Produce the Capability Coverage Matrix for every `crp/cap/**` path and ID.
4. Produce the complete Information Disposition Matrix for `xxx/**`, `adm/**`,
   `crp/**`, `.github/**`, and required `.codex/**` adapters.
5. Present the synthesis without deleting legacy evidence.
6. Perform a separate, explicitly approved Greenfield cut only after matrix and
   target-tree acceptance.
