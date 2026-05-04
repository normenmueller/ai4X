# Schema-First Capability Metadata Redesign

## Motivation

The current `.meta.yaml` schema is implicit — scattered across `capability-meta.mjs` (validation), `capability-indexes.mjs` (rendering), and test fixtures. Schema evolution (e.g., `distinguish_from` string → object) requires synchronized changes across all three, producing recurring deficits (cf. Issues #29, #31).

Before `curate` or other features build on the capability corpus, the metadata foundation must be bullet-proof: correct, logical, elegant, maintainable, and useful.

## Scope

Full redesign of capability metadata. Everything is open for challenge:

- **Purpose justification**: Why do capabilities need metadata at all? What problem does it solve that the capability text alone cannot? What is the concrete benefit for agent composition, curation, and portfolio governance?
- **Field-by-field justification**: For every field — current or proposed — answer: Why does this field exist? What decision does it enable? What breaks if it is absent? If no clear answer exists, the field must be challenged or removed.
- **Field inventory**: Are all current fields necessary? Are any missing? Is each field's semantics clear and non-overlapping?
- **Field structure**: Are the types and shapes right? (e.g., `distinguish_from` string vs. object, `sources` structure, `do_not_use_when` free text vs. structured)
- **Schema declaration**: Move from implicit code-constants to a declarative schema (JSON Schema, YAML schema, or similar) that validator, renderer, and tests derive from.
- **Validation**: Single source of truth for what is valid. No more parallel maintenance of allowed values across files.
- **Rendering**: Index generation should consume schema metadata, not re-infer structure.
- **Ergonomics**: Is the metadata pleasant to author? Can an agent produce it reliably? Can a human review it quickly?
- **Extensibility**: How does the schema evolve without breaking existing capabilities?
- **Test strategy**: Tests derived from schema constraints, not hand-written fixture duplication.

## Design Mandate

This metadata schema is the foundation for `curate`. It defines the machine-readable contract between capability authoring and capability curation. It is a core USP of ai4X.

The redesign must proceed with absolute professionalism and precision:

- Every field must earn its place through a clear purpose-benefit chain: field → decision it enables → value it creates for agent composition or portfolio governance.
- No field survives by convention alone. If it cannot be justified, it is removed.
- No field is added without a concrete consumption scenario (who reads it, when, and what they do with it).
- The schema must be self-documenting: a new author or agent must understand the metadata contract from the schema alone, without reading implementation code.

## Current Field Inventory (for reference)

Required: `id`, `version`, `status`, `approved_by`, `approved_at`, `scope`, `do_not_use_when`, `distinguish_from`, `sources`.
Optional: `review_due`, `owner`, `requires`, `conflicts`, `migration_note`.

## Constraints

- Must remain aligned with the Capability Authoring Governance contract (`adm/gdl/dev/contracts/capability-authoring-governance.md`).
- Must support `curate` consumption (the schema becomes a contract between authoring and curation).
- No implicit behavior — schema must be explicit and self-documenting.

## Origin

Recurring toolchain deficits in Issues #29 and #31. PO directive: redesign from the ground up before building features on the capability corpus.
