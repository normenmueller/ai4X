# Agent Portfolio

**Design proposal · work in progress.**

Use this portfolio to choose an agent by name for a recurring task. Each profile combines a role with the capabilities that support its work. Sigrid helps decide which strategic initiatives to prioritize. Hildegard coordinates architecture across those initiatives. Mechthild starts with a project's need and selects capabilities for a project-local agent.

Reusable profiles live under `src/resources/agent/<use-case-domain>/<name>/`. Each profile has a `ROLE.md` and a `cap/cap.compose.yaml` that records its selected capability IDs and source revision. The adjacent contracts and metadata include their dependencies. When migrating a profile, rebuild its capabilities from the ai4X corpus. If an essential capability is missing, bring the gap and a reusable definition to the Product Owner before extending the corpus or adopting the profile.

Each profile must work when it is the only agent in a project. During migration and review, test one task within its mandate and one decision outside it with the neighboring role unfilled. The first task should proceed independently. For the second, the agent should explain the decision and its impact, recommend a course of action and refer it to an authorized person or assigned role. If the owner is unknown, the agent should ask the requester who can decide, leave that decision open and continue independent work.

## Agent profiles

| Name | Naming mnemonic | What someone would ask this agent to do |
| --- | --- | --- |
| Gertrud | G · general | Clarify the task, then help reason through it in dialogue. |
| Sigrid | S · strategic | Assess strategic fit, prioritize initiatives and shape a roadmap. |
| Mechthild | M · methods | Elicit a project's need and assemble a suitable local agent. |
| Hildegard | H · holistic architecture | Lead architecture across portfolios and coordinate the other architects as [TOGAF Chief Architect](../capability-corpus/togaf-roles.md). |
| [Adelheid](../../../src/resources/agent/architecture/adelheid/ROLE.md) | A · architecture enterprise | Integrate enterprise architecture across segments and align their roadmaps. |
| [Brunhilde](../../../src/resources/agent/architecture/brunhilde/ROLE.md) | B · business | Model business capabilities, services and stakeholder needs. |
| [Dagmar](../../../src/resources/agent/architecture/dagmar/ROLE.md) | D · data | Establish data ownership and guide integration, migration and protection. |
| [Alfhilde](../../../src/resources/agent/architecture/alfhilde/ROLE.md) | A · application | Define application boundaries, interfaces and integration. |
| Tilda | T · technology | Guide platform standards, infrastructure and interoperability. |
| [Gerlinde](../../../src/resources/agent/architecture/gerlinde/ROLE.md) | G · governed solution delivery | Design a solution and guide its transition into delivery. |
| Graphion | — | Model graphs and develop or optimize Cypher queries for Neo4j. |
| Librarian | — | Keep a PDF collection and its BibTeX catalogue in sync. |
| Citty | — | Teach category theory through definitions and guided derivations. |
| Lamby | — | Develop and explain correctness-focused functional designs using Haskell and type theory. |

A dash indicates that the profile has no documented naming mnemonic.

## Proposed additions

| Name | Naming mnemonic | Proposed role |
| --- | --- | --- |
| Irmgard | I · innovation | Explore ideas and creative solutions. |
| Waltraud | W · wallet/controlling | Assess budgets and costs. |
| Kunigunde | K · koding | Implement and refactor software. |
| Thusnelda | T · teacher | Teach through simple explanations in the Feynman style. |
