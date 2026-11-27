# Agent Portfolio

**Design proposal · work in progress.**

Choose a role by asking “What result do I need?” Each profile has one home in the domain of its primary assignment. A second domain can link to the same profile when it serves another recurring need. For example, Lamby lives under Learning and also appears under Engineering for Haskell implementation work.

| Domain | Result to ask for |
| --- | --- |
| [Advisory](#advisory) | A reasoned recommendation on a specific decision, with the main trade-off. |
| [Strategy](#strategy) | A strategic direction and a reasoned choice of which initiatives to pursue first. |
| [Architecture](#architecture) | A design that aligns capabilities, responsibilities, systems and their dependencies across an agreed scope. |
| [Engineering](#engineering) | A technical solution that has been implemented, verified or tuned. |
| [Curation](#curation) | An agent or team assembled for a confirmed need. |
| [Information management](#information-management) | A collection whose contents are described, findable and consistently catalogued. |
| [Learning](#learning) | Understanding or a skill the learner can demonstrate independently. |

Sigrid helps decide which initiatives to pursue. Adelheid aligns the business and system changes those initiatives require across segments. Graphion can implement and verify a graph solution within that design. Architecture has its own domain because its decisions also shape business services, ownership and coordination across portfolios.

Reusable profiles live under `src/resources/corpus/agent/<use-case-domain>/<name>/`. Each profile has a `ROLE.md` and a `cap/cap.compose.yaml` that records its selected capability IDs and source revision. The adjacent contracts and metadata include their dependencies. When migrating a profile, rebuild its capabilities from the ai4X corpus. If an essential capability is missing, bring the gap and a reusable definition to the Product Owner before extending the corpus or adopting the profile.

Each profile must work when it is the only agent in a project. During migration and review, test one task within its mandate and one decision outside it with the neighboring role unfilled. The first task should proceed independently. For the second, the agent should explain the decision and its impact, recommend a course of action and refer it to an authorized person or assigned role. If the owner is unknown, the agent should ask the requester who can decide, leave that decision open and continue independent work.

## Agent profiles

A dash indicates that the profile has no documented naming mnemonic.

### Architecture

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| [Adelheid](../../../src/resources/corpus/agent/architecture/adelheid/ROLE.md) | A · architecture enterprise | Integrate enterprise architecture across segments and align their roadmaps. |
| [Alfhilde](../../../src/resources/corpus/agent/architecture/alfhilde/ROLE.md) | A · application | Define application boundaries, interfaces and integration. |
| [Brunhilde](../../../src/resources/corpus/agent/architecture/brunhilde/ROLE.md) | B · business | Model business capabilities, services and stakeholder needs. |
| [Dagmar](../../../src/resources/corpus/agent/architecture/dagmar/ROLE.md) | D · data | Establish data ownership and guide integration, migration and protection. |
| [Gerlinde](../../../src/resources/corpus/agent/architecture/gerlinde/ROLE.md) | G · governed solution delivery | Design a solution and guide its transition into delivery. |
| [Hildegard](../../../src/resources/corpus/agent/architecture/hildegard/ROLE.md) | H · holistic architecture | Lead architecture across portfolios and coordinate the other architects as [TOGAF Chief Architect](../capability/togaf-roles.md). |
| [Tilda](../../../src/resources/corpus/agent/architecture/tilda/ROLE.md) | T · technology | Guide platform standards, infrastructure and interoperability. |

### Curation

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| [Mechthild](../../../src/resources/corpus/agent/curation/mechthild/ROLE.md) | M · methods | Clarify why a change matters and what the requester needs, then curate an agent or team for the confirmed outcome. |

### Engineering

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| [Graphion](../../../src/resources/corpus/agent/engineering/graphion/ROLE.md) | — | Model property graphs, write Cypher, choose graph algorithms, tune Neo4j queries or plan a restartable graph transfer. |
| [Lamby](../../../src/resources/corpus/agent/learning/lamby/ROLE.md) | — | Design, implement and verify a Haskell API from a stated invariant. |

### Advisory

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| [Gertrud](../../../src/resources/corpus/agent/advisory/gertrud/ROLE.md) | G · general (historical) | Weigh options and specialist advice, then recommend a course of action with its decisive reason and main trade-off. |

### Information management

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| [Librarian](../../../src/resources/corpus/agent/information/librarian/ROLE.md) | — | Describe a publication or reconcile a PDF collection with its BibTeX catalogue. |

### Learning

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| [Citty](../../../src/resources/corpus/agent/learning/citty/ROLE.md) | — | Explain categorical concepts, give a proof or guide the learner through their own derivation. |
| [Lamby](../../../src/resources/corpus/agent/learning/lamby/ROLE.md) | — | Derive how a formal type or law applies to a Haskell program, and explain its limits. |

### Strategy

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| Sigrid | S · strategic | Assess strategic fit, prioritize initiatives and shape a roadmap. |

## Proposed additions

| Name | Naming mnemonic | Proposed role |
| --- | --- | --- |
| Irmgard | I · innovation | Explore ideas and creative solutions. |
| Waltraud | W · wallet/controlling | Assess budgets and costs. |
| Kunigunde | K · koding | Implement and refactor software. |
| Thusnelda | T · teacher | Teach through simple explanations in the Feynman style. |
