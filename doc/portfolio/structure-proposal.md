# Portfolio structure proposal

Decision draft against review revision `fb3fa96`. The inventory covers 82 capability contracts and eight materialized agent profiles. The portfolio catalogue also lists roles awaiting migration.

## Where the portfolio lives

Use **resources** for the storage of versioned declarative product artifacts and **portfolio** for the reusable options a project can draw on. The [source architecture](../../.ai4x/context/architecture.md) defines the former. The [product architecture](../../.ai4x/context/need-to-capability.md) defines the latter. The [portfolio catalogue](README.md) explains those options to human readers. Agents use project bindings and source inventories. In this checkout, [Mechthild](../../src/resources/agent/curation/mechthild/ROLE.md) searches the capability inventory and materialized role profiles after the requester confirms the need.

| Physical layout | What it buys | Cost or condition |
| --- | --- | --- |
| Keep `src/resources/` and `doc/portfolio/` (recommended) | One physical owner per artifact. The documentation gives people an overview; agents discover candidates from the source artifacts. | Looking at the source root alone does not identify the portfolio. Make the two source entry points explicit in the catalogue. |
| Add `src/resources/portfolio/` | A natural home for a future machine-readable selection manifest if the product needs to answer which revisions it offers. | Give the manifest a consumer, selection semantics and an owner first. Moving the source artifacts under this name alone would still leave admission and version selection unresolved. |
| Split `src/portfolio/` and `src/resources/` into siblings | Separates offered artifacts from supporting material if those sets acquire independent packaging or release lifecycles. | Today's corpus contains capability drafts, governance, a schema and a release location. A whole-directory move cannot draw that boundary accurately. |
| Rename `src/resources/` to `src/portfolio/` | Puts a familiar product term in every source path. | Implies that every artifact under it is a portfolio offering. Even the metadata schema and the reserved skeleton location would acquire that implication. It would change the root of 465 tracked files at the reviewed revision. |

Assurance packs are possible portfolio offerings under the product architecture. The bundle, assurance pack and skeleton locations currently contain placeholders. Classify a future populated artifact by what a project can select. A directory name alone establishes neither release admission nor project activation.

## Where a PO should find reusable profiles

The recommended revision to the layout below is to group `agent/` with `capability/` under `corpus/`. Both contain reusable material for assembling a project team. Governance supplies reusable rules and schema describes artifact formats. A profile may change on its own. Co-location would confer neither release admission nor team membership. The current alternative keeps profiles beside the corpus and emphasizes their independent lifecycle; it requires readers to know that the two source collections belong together.

The PO approved `src/resources/corpus/assurance/<pack>/` as the target for reusable deterministic check packs. Each pack sits directly under `assurance/`. The current checkout still reserves `src/resources/assurance/pack/`; moving that placeholder is a separate implementation step. Haskell execution and receipt generation belong to `src/domains/assurance/`.

For project entry, the recommendation is to keep `skeleton/` and `bundle/` beside the corpus. A skeleton supplies the starting files for a new project. A project bundle composes versioned inputs and can reference a skeleton, team and governance selections. [Project entry](https://github.com/normenmueller/ai4X/issues/86) describes this distinction. A reusable named team is a separate use case under [evaluation](https://github.com/normenmueller/ai4X/issues/208); its packaging and source location remain open. A resource index can route agents to the available kinds if enumeration ceases to suffice. Project Memory identifies the team actually in use. The seven proposed capability moves are a separate decision.

## Does corpus need a release directory?

A Corpus release identifies the capability revisions admitted for product use. For example, two capabilities at the same repository commit can have different admission decisions. A Git tag alone identifies the commit; the approved selection must also be recoverable. Today `corpus/release/` contains only `.gitkeep`. We recommend dropping that placeholder from the proposed tree and keeping the release concept in the architecture. Choose the storage and format when a consumer needs the first approved selection. This leaves profile admission and CLI distribution as separate decisions.

## Target tree

Paths are relative to `src/resources/`. Braces list sibling directories. The capability tree includes all existing branches at and below domain level. Agent rows with names in parentheses describe catalogue candidates awaiting migration.

```text
corpus/
  agent/
    architecture/{adelheid,alfhilde,brunhilde,dagmar,gerlinde,hildegard,tilda}
    curation/mechthild
    engineering/  (Graphion, Lamby)
    general/      (Gertrud)
    knowledge/    (Librarian)
    learning/     (Citty)
    strategy/     (Sigrid)
  capability/
    ai/{architecture/{enterprise,governance,modeling,solution},consulting,engineering}
    analysis/{assessment,organization,specification}
    architecture/{domain,enterprise,governance,modeling,solution}
    curation/
    engineering/{graph,haskell,principle,typescript}
    foundation/
    strategy/{analysis,delivery,evaluation,goal-management,governance,metric,workflow}
  assurance/<pack>/
  governance/{delivery,quality}
  schema/
bundle/
skeleton/
```

A capability has one source home based on the judgment it contributes and the result it produces. Use `ai/` when the task requires AI-specific knowledge. General architecture serves architecture assignments across technologies. Graph, Haskell and TypeScript each identify specialist engineering practice. A profile has one source home based on the primary mandate a requester assigns to it. List other useful entry points in the catalogue. For example, Lamby's primary engineering mandate and its teaching use can both lead to one future profile. Proposed additions in the catalogue receive a source path when their mandate is accepted.

## Proposed path changes

Paths below are relative to `corpus/capability/`. Each move includes the contract and its metadata. These seven contracts account for all proposed moves among the 82. All eight existing agent profiles retain their domain and name in the proposed move from `agent/` to `corpus/agent/`.

| Current | Proposed | Why a requester or curator would look there |
| --- | --- | --- |
| `analysis/organization/agent-team-curation` | `curation/agent-team-curation` | The result is a justified agent or team proposal. Other organizational analysis produces functions, ownership or a value-stream design. |
| `analysis/role-assessment/` | `analysis/assessment/` | Its four contracts cover comparing options, typing evidence, separating fact from interpretation and extracting statements. Each can be selected for material outside a role assessment. |
| `strategy/operation/technical-output-validation` | `strategy/evaluation/technical-output-validation` | The agent judges whether technical evidence supports a strategic decision. Actual query or implementation tests remain engineering work. |
| `ai/engineering/expert-continuity-briefing` | `foundation/expert-continuity-briefing` | Its contract transfers reasoning and open decisions to another expert. Its trigger also applies to a human expert handoff, and it explicitly excludes project restart. |

## Check before merging a future move

Keep capability IDs stable. Update current source indexes, relative links and path-based checks in the same change. Resolve each pinned composition against its recorded revision and original inventory path. Preserve that historical provenance. For any deliberate re-pin, materialize and verify the new snapshot separately. Test agent discovery from the source inventories without loading human documentation. Check that the human catalogue links and cross-listed roles resolve to their intended source profiles.
