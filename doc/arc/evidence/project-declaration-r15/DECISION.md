# R-15 project declaration representation decision

## Status

Architecture gate: **pass**, pending Product Owner acceptance.

The final independent review found no remaining blocker in the bounded representation
and ownership stage.

## Decision

Use **Dhall as the sole project-authoring authority**. Product-owned Haskell packages
own the bounded-context models, semantic validators, graph algorithms, declaration
update boundary, and inert runtime representation.

This is a system-level Dhall/Haskell combination. It is not dual normative project
authoring: project facts are authored once in Dhall, while Haskell defines and enforces
the product metamodel and semantics.

## Accepted boundary

- Collaboration, Work Management, Governance and Assurance, Project Intent, and
  Curation and Capabilities remain separate bounded contexts.
- Published summaries carry stable ID, exact semantic version, entity kind, and owning
  bounded context.
- Local references are validated exclusively by their owning context.
- Composition validates only explicitly declared cross-context ports against typed
  published summaries.
- An explicit declaration-update command is the only Dhall evaluation boundary.
- Ordinary commands consume deterministic inert generated data.
- Generated graph visualizations are derived and non-authoritative.
- The guarded-iteration example demonstrates representability only; it is not an
  accepted normative workflow.

## Candidate disposition

### Dhall authoring with Haskell product semantics — selected

The candidate expresses the common five-context fixture, explicit profiles,
Collaboration and Work graphs, Governance authorities, Project Intent, Needs,
Capabilities, and Need-to-Capability Trace. The bounded Haskell consumer:

- compiles with GHC 9.6.7 and `-Wall -Werror`;
- validates the positive fixture and all required invalid variants;
- rejects empty JoinAll, wrong entity kind, and wrong version;
- preserves exact validator ownership;
- restricts the bounded import closure and evaluation timeout;
- derives a deterministic Mermaid graph.

### Haskell-only project authoring — rejected

Haskell expresses the fixture well, but project-authored source is arbitrary trusted
code. It adds GHC/toolchain and author-accessibility cost, and its bounded inert
prototype duplicated domain checks while still accepting untested semantic tampering.
These costs are unnecessary for project-owned declarative data.

### Dual normative Haskell and Dhall authoring — rejected

The attempted split duplicated concrete facts and required a cross-language linker,
two-ended source mapping, two evaluation/trust boundaries, and coordinated evolution.
No fixture-level benefit compensated for that authority and operational complexity.

## Independent gate evidence

The final correction replaced the global untyped ID union with:

- `PublishedEntity`: stable ID, semantic version, entity kind, owner;
- `PublishedSummary`: context-published entities;
- `ReferencePort`: target plus expected kind, expected owner, and diagnostic path.

The final independent review confirmed:

- missing receiver: exactly `CollaborationOwner/UnresolvedReference`;
- wrong kind: exactly `CollaborationOwner/WrongEntityKind`;
- wrong version: exactly `CollaborationOwner/InvalidReferenceVersion`;
- Composition consumes only explicit cross-context ports;
- no remaining blocker in this bounded architecture stage.

## Non-blocking production observations

- Production tests must compare diagnostic cardinality and path, not only Owner/Code
  sets.
- The import loader needs a production-grade solution for scan/evaluate TOCTOU,
  resource limits, and complete source closure.
- Atomic generation publication, complete source spans, and recovery behavior remain
  implementation-stage work.
- The Dhall schema surface and Haskell decoder contract need release-gated drift tests
  or deterministic generation.
- Existing protected evidence remains unchanged until the separately approved Issue
  #83 disposition and Greenfield cut.

## Approved next sequence

After Product Owner acceptance of this gate:

1. Move Issue #83 from Backlog to In progress.
2. Produce the complete clean target tree.
3. Produce the Capability Coverage Matrix for every `crp/cap/**` path and ID.
4. Produce the complete Information Disposition Matrix for `xxx/**`, `adm/**`,
   `crp/**`, `.github/**`, and required `.codex/**` adapters.
5. Present the synthesis without deleting legacy evidence.
6. Perform a separate, explicitly approved Greenfield cut only after acceptance.
