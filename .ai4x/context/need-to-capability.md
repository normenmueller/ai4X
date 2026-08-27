# Need-to-Capability Context

This file owns the accepted functional architecture behind the ai4X
Need-to-Capability journey. It is a design target, not implementation authority.
The owning Issue and live project state govern when any slice may be built.

## Product identity

ai4X is a human-led Need-to-Capability system for **Agentic Cognition
Engineering (ACE)**. It turns human intent into fit-for-purpose Agentic
Constellations—coherently curated and explicitly activated under human
authority.

```text
ai4X Portfolio
  -> governed reusable solution space

Need-to-Capability journey
  -> AgenticConstellation<Curated>
       selected cognitive Capabilities
       + Cognitive Agent Team
       + Operating Model
          Collaboration Model
          Work Management Model
          Governance Model
  -> explicit activation under human authority
```

The Portfolio may contain cognitive Capabilities, deterministic Governance
controls, Collaboration and Work Management Models, operational tools,
Assurance Packs, integrations, and adapters. Portfolio membership does not
imply project fitness, selection, composition, or activation.

## Formal boundary

Describe the system as **strongly and statically typed**, never as a strict type
system. Dhall supplies total, typed declarative inputs. Haskell owns closed
domain values, invariants, and deterministic transformations; its evaluation is
non-strict. AI cognition authors meaning and explanations, while humans own
confirmation and approval.

```text
Dhall declarations
  -> closed Haskell values
  -> deterministic evidence and projections
```

Deterministic success proves only closed values and formal invariants. It never
manufactures semantic fitness, human confirmation, or approval.

## Command architecture

```text
ai4x project adopt|create
  -> ai4x scout
       WHY + WHAT
       ProjectIntent<Validated> + required Cognitive Jobs
       need-fit Capability candidates; no selection or composition
  -> ai4x curate
       WHO + HOW
       complete candidate decisions + authored rationale
       selected cognitive Capabilities + Cognitive Agent Team
       Collaboration + Work Management + Governance Models
       explicit human acceptance
       atomic ProjectConfiguration<Persisted> under <project>/.ai4x
  -> ai4x spawn plan|apply
       WHERE + HOST
       explicit projection; no implicit autonomous execution
```

There is no public `ai4x declarations publish` ritual. Acceptance and
persistence remain explicit typed boundaries within `ai4x curate`.

Cross-cutting surfaces remain distinct:

- `ai4x doctor` is read-only coherence diagnosis, never semantic approval or
  Assurance;
- `ai4x assurance run` executes explicitly bound Assurance Packs and emits
  typed Receipts;
- `ai4x memory prompt` emits the ai4X Light Prompt without project mutation;
- `ai4x work ...` remains reserved for live work operations only if their owner
  later proves ai4X authority.

The CLI is a thin adapter. AI hosts author cognitive judgments, humans exercise
authority, and deterministic libraries validate and project closed values.

## Ownership flow

- Human Authority confirms the Need, reviews Curation, accepts or requests
  focused revision, and authorizes activation.
- AI Host + ai4X Cognition elicits WHY and WHAT, authors Project Intent, scouts
  Candidates, curates the Draft Constellation and rationale, and explains the
  verified Proposal.
- ai4X Library / CLI validates closed Intent values, verifies Curation, persists
  accepted project configuration, and projects explicit activation plans.
- Versioned Artifacts own exact phase-indexed values and deterministic evidence.

The canonical Curation states and functions are owned only by
[curation.md](curation.md).

## Diagram projection rules

- Read and review the journey from top to bottom, one bounded point at a time.
- At each station check semantic correctness, execution ownership, canonical
  type/state, arrow direction and label, and visual calm.
- Preserve four ownership lanes: Human Authority; AI Host + ai4X Cognition;
  ai4X Library / CLI; Versioned Artifacts.
- Use cream for human decisions and one restrained Lavender family for ai4X
  surfaces and lifecycle phases.
- Distinguish activities, human decisions, semantic states, and versioned
  artifacts by restrained box shape rather than decorative complexity.
- Use `Family<Phase>` in code font for canonical values. Arrow labels carry
  either one canonical value or one short action/outcome; dashed arrows mean
  correction or revision.
- Keep box typography hierarchical and lean: optional technical header, semantic
  title, a few muted detail lines, and only an essential projected type tree.
- Prefer balanced manual line breaks and remove prose before shrinking type.
- Use horizontal `ai4X SCOUTING`, `ai4X CURATION`, and `ai4X SPAWNING` phase
  bands while the vertical lanes retain execution ownership.
- Preserve the accepted layout and spacing; render and inspect every approved
  point, but commit coherent groups rather than individual micro-edits.

The tracked diagram source, when present on the owning #103 branch, is the lean
visual projection of these owners. It must not become a second semantic type
authority.
