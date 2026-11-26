# Portfolio structure proposal

Decision draft against review revision `fb3fa96`. The inventory covers 82 capability contracts and eight materialized agent profiles. The portfolio catalogue also lists roles awaiting migration.

## Where the portfolio lives

Use **resources** for the storage of versioned declarative product artifacts and **portfolio** for the reusable options a project can draw on. The [source architecture](../../.ai4x/context/architecture.md) defines the former. The [product architecture](../../.ai4x/context/need-to-capability.md) defines the latter. The [portfolio catalogue](README.md) already exposes the two discovery routes used by Mechthild: individual capabilities and reusable agent profiles. Her [role](../../src/resources/agent/curation/mechthild/ROLE.md) searches both after the requester confirms the need.

| Physical layout | What it buys | Cost or condition |
| --- | --- | --- |
| Keep `src/resources/` and `doc/portfolio/` (recommended) | One physical owner per artifact. The catalogue lets a curator discover capabilities and profiles through one entry point. | Looking at the source root alone does not identify the portfolio. Make the two source entry points explicit in the catalogue. |
| Add `src/resources/portfolio/` | A natural home for a future machine-readable selection manifest if the product needs to answer which revisions it offers. | Give the manifest a consumer, selection semantics and an owner first. Moving the source artifacts under this name alone would still leave admission and version selection unresolved. |
| Split `src/portfolio/` and `src/resources/` into siblings | Separates offered artifacts from supporting material if those sets acquire independent packaging or release lifecycles. | Today's corpus contains capability drafts, governance, a schema and a release location. A whole-directory move cannot draw that boundary accurately. |
| Rename `src/resources/` to `src/portfolio/` | Puts a familiar product term in every source path. | Implies that every artifact under it is a portfolio offering. Even the metadata schema and the reserved skeleton location would acquire that implication. It would change the root of 465 tracked files at the reviewed revision. |

Assurance packs are possible portfolio offerings under the product architecture. The bundle, assurance pack and skeleton locations currently contain placeholders. Classify a future populated artifact by what a project can select. A directory name alone establishes neither release admission nor project activation.

## Target tree

Paths are relative to `src/resources/`. Braces list sibling directories. The capability tree includes all existing branches at and below domain level. Agent rows with names in parentheses describe catalogue candidates awaiting migration.

```text
agent/
  architecture/{adelheid,alfhilde,brunhilde,dagmar,gerlinde,hildegard,tilda}
  curation/mechthild
  engineering/  (Graphion, Lamby)
  general/      (Gertrud)
  knowledge/    (Librarian)
  learning/     (Citty)
  strategy/     (Sigrid)
corpus/
  capability/
    ai/{architecture/{enterprise,governance,modeling,solution},consulting,engineering}
    analysis/{assessment,organization,specification}
    architecture/{domain,enterprise,governance,modeling,solution}
    curation/
    engineering/{graph,haskell,principle,typescript}
    foundation/
    strategy/{analysis,delivery,evaluation,goal-management,governance,metric,workflow}
  governance/{delivery,quality}
  release/
  schema/
assurance/pack/
bundle/
skeleton/
```

A capability has one source home based on the judgment it contributes and the result it produces. Use `ai/` when the task requires AI-specific knowledge. General architecture serves architecture assignments across technologies. Graph, Haskell and TypeScript each identify specialist engineering practice. A profile has one source home based on the primary mandate a requester assigns to it. List other useful entry points in the catalogue. For example, Lamby's primary engineering mandate and its teaching use can both lead to one future profile. Proposed additions in the catalogue receive a source path when their mandate is accepted.

## Proposed path changes

Paths below are relative to `corpus/capability/`. Each move includes the contract and its metadata. These seven contracts account for all proposed moves among the 82. All eight existing agent profiles already have a suitable primary home.

| Current | Proposed | Why a requester or curator would look there |
| --- | --- | --- |
| `analysis/organization/agent-team-curation` | `curation/agent-team-curation` | The result is a justified agent or team proposal. Other organizational analysis produces functions, ownership or a value-stream design. |
| `analysis/role-assessment/` | `analysis/assessment/` | Its four contracts cover comparing options, typing evidence, separating fact from interpretation and extracting statements. Each can be selected for material outside a role assessment. |
| `strategy/operation/technical-output-validation` | `strategy/evaluation/technical-output-validation` | The agent judges whether technical evidence supports a strategic decision. Actual query or implementation tests remain engineering work. |
| `ai/engineering/expert-continuity-briefing` | `foundation/expert-continuity-briefing` | Its contract transfers reasoning and open decisions to another expert. Its trigger also applies to a human expert handoff, and it explicitly excludes project restart. |

## Check before merging a future move

Keep capability IDs stable. Update current source indexes, relative links and path-based checks in the same change. Resolve each pinned composition against its recorded revision and original inventory path. Preserve that historical provenance. For any deliberate re-pin, materialize and verify the new snapshot separately. Test discovery from both catalogue entries and check a cross-listed role reaches exactly one profile.
