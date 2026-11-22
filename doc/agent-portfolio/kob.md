# Knob of Behavior (KOB)

**Historical design idea from v1. Future adoption remains open.**

KOB explored how to give an agent a role that a person could recognize and ask for by name. A capability described something an agent could do. A KOB profile brought capabilities together for a recurring kind of work. For example, someone deciding which initiatives to prioritize could turn to Sigrid for strategic assessment. Someone coordinating architecture across those initiatives could turn to Hildegard for an enterprise-wide view.

The portfolio grouped profiles by use case. Each agent had a role description, and curated bundles identified the capabilities that supported its work. Mechthild also explored the reverse direction: start with a project's need, look for suitable capabilities and use them to design a project-local agent.

## The 14 profiles in v1

| Name | Name cue recorded in v1 | What someone would ask this agent to do |
| --- | --- | --- |
| Gertrud | G · general | Clarify the task, then help reason through it in dialogue. |
| Sigrid | S · strategic | Assess strategic fit, prioritize initiatives and shape a roadmap. |
| Mechthild | M · methods | Elicit a project's need and assemble a suitable local agent. |
| Hildegard | H · holistic architecture | Lead architecture across portfolios and coordinate the other architects as TOGAF Chief Architect. |
| Adelheid | A · architecture enterprise | Integrate enterprise architecture across segments and align their roadmaps. |
| Brunhilde | B · business | Model business capabilities, services and stakeholder needs. |
| Dagmar | D · data | Establish data ownership and guide integration, migration and protection. |
| Alfhilde | A · application | Define application boundaries, interfaces and integration. |
| Tilda | T · technology | Guide platform standards, infrastructure and interoperability. |
| Gerlinde | G · governed solution delivery | Design a solution and guide its transition into delivery. |
| Graphion | Unrecorded | Model graphs and develop or optimize Cypher queries for Neo4j. |
| Librarian | Unrecorded | Keep a PDF collection and its BibTeX catalogue in sync. |
| Citty | Unrecorded | Teach category theory through definitions and guided derivations. |
| Lamby | Unrecorded | Develop and explain correctness-focused functional designs using Haskell and type theory. |

The naming table lists **Sigrid** with the mnemonic `s(ieglinde)trategic`. Her profile and the portfolio both use **Sigrid**. For **Hildegard**, the original spelling is `h(ildegard)olistic architecture`.

## Four names planned in v1

| Name | Name cue recorded in v1 | Proposed role |
| --- | --- | --- |
| Irmgard | I · innovation | Explore ideas and creative solutions. |
| Waltraud | W · wallet/controlling | Assess budgets and costs. |
| Kunigunde | K · koding | Implement and refactor software. |
| Thusnelda | T · teacher | Teach through simple explanations in the Feynman style. |

## Historical sources

In the v1 snapshot, `mod/kob/README.md` describes the behavior kit. The *Active Agents* and *Naming Line* tables in `mod/kob/agn/README.md` document the roles, mnemonics and planning status. Each of the 14 profiles has its own `mod/kob/agn/<domain>/<agent>/AGENTS.md`.
