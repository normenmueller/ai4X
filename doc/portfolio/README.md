# Portfolio

The ai4X portfolio describes the reusable options a project can draw on. The corpus offers both [capabilities](capability/README.md) for individual tasks and [agent profiles](agent/README.md) that combine capabilities for a role. The [classification guide](capability/classification.md) explains how a capability can be found by the result a project needs.

## Where the sources live

| Under `src/resources/` | What a project can use |
| --- | --- |
| [corpus/capability/](../../src/resources/corpus/capability/README.md) | Individual capabilities, each with a contract and version metadata. |
| [corpus/agent/](../../src/resources/corpus/agent/) | Reusable roles composed of capabilities pinned to a source revision. |
| [corpus/governance/](../../src/resources/corpus/governance/) | Reusable rules a project can adopt. |
| [corpus/assurance/](../../src/resources/corpus/assurance/) | Reserved for explicitly selected check packs. The pack definition belongs here; execution and receipts belong to the assurance domain. |
| [corpus/schema/](../../src/resources/corpus/schema/) | Definitions of artifact formats. |
| [bundle/](../../src/resources/bundle/) | Reserved for project bundles that select versioned inputs together. |
| [skeleton/](../../src/resources/skeleton/) | Reserved for starter files for a new project. |

`src/resources/` owns declarative product artifacts. This guide gives people a portfolio overview. Agents discover candidates through project bindings and source inventories. For example, [Mechthild](../../src/resources/corpus/agent/curation/mechthild/ROLE.md) inspects both capabilities and existing profiles after the requester confirms the need. A separate machine-readable portfolio manifest would merit a home under resources if the client needs to discover a specific offered set of revisions. [Source architecture](../../.ai4x/context/architecture.md) · [Product architecture](../../.ai4x/context/need-to-capability.md)

A corpus release identifies the exact selection admitted for use. A Git revision identifies the source tree, which may contain drafts alongside admitted contracts. The first release consumer will inform the storage format for approval evidence. Project entry and named team bundles have their own design questions. [Project entry](https://github.com/normenmueller/ai4X/issues/86) · [Named teams](https://github.com/normenmueller/ai4X/issues/208)
