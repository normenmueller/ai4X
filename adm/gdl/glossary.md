---
version: 1.2.0
last_updated: 2026-08-10
---

# Governance Glossary

Canonical term definitions for the ai4X governance layer.
Terms defined here are the single authoritative source. Operational documents may project responsibilities, artifacts, and transitions for these terms, but must reference this glossary rather than redefine them.

**Scope:** This file contains reference-safe terms only (Planning Terms, Qualifier Terms, Architecture Terms). Dispatch-critical terms (Gate Terms, Artifact Terms, Verdict Terms) remain inline at their point of use in `crp/gov/prc/workflow.md`. See `doc/arc/09_architecture_decisions.md` § ADR-001 for rationale.

## Planning Terms

1. **Work Item**
   - A GitHub Issue or native GitHub Sub-Issue used as the planning primitive after promotion. Labels and relationships give a Work Item its semantic role; creation alone grants no implementation authority.

2. **Idea**
   - A vague intent or exploration drafted by the PO in `adm/pbl/`. Temporary.

3. **Roadmap**
   - A dependency-ordered planning index represented by a GitHub Issue with label `roadmap`. It may identify coherent planned Epics but grants no implementation authority.

4. **Epic**
   - A coherent planned outcome represented by a GitHub Issue with label `epic`. It may exist as an early container before its Requirements Pack is complete, but it is not implementation-ready until the strict Ready gate passes.

5. **Story**
   - A PO-approved, PR-sized implementation unit represented by a native GitHub Sub-Issue of its Epic with label `story`.

6. **Standalone Issue**
   - A Work Item that does not require an Epic/Story hierarchy. A semantic label such as `enhancement`, `chore`, `documentation`, or `research` describes its role.

7. **Task**
   - An implementation step within a Story or standalone Issue. Represented as a checklist within that Issue.

8. **Ready Authority**
   - The PO's explicit release of a Work Item for implementation after its applicable prerequisites pass. Issue creation, labels, relationships, and planning activity do not imply Ready Authority.

## Qualifier Terms

1. **Non-trivial**
   - A change is non-trivial if it adds or modifies behavior, contracts, boundaries, acceptance criteria, or domain types. Mechanical changes (typo fixes, formatting, comment-only edits) are trivial. When in doubt, treat the change as non-trivial.

## Architecture Terms

1. **Agent Host**
   - A runtime environment that hosts and executes AI agents. Examples: VS Code with GitHub Copilot, Codex CLI, Claude Code. ai4X is agent-host-agnostic — it declares agents independently and materializes them for a specific host at activation time.

2. **Cognitive Capability Composition (CCC)** *(Design Target)*
   - A declarative specification that defines an agent by composing revision-safe references to cognitive capabilities from the ai4X corpus (`crp/cap/`). A CCC declares *what* an agent knows and *how* it reasons — not *where* it runs. CCCs are the input to materialization.

3. **Collaboration Topology** *(Design Target)*
   - A reusable, abstract collaboration pattern that defines roles and coordination structure for a team of agents — independent of which concrete agents fill those roles. Examples: leader–specialists, swarm, pipeline. Topologies are value objects: "leader + n specialists" is the same pattern regardless of the agents involved.

4. **Corpus (`crp/`)**
   - The product corpus: the authoritative, client-agnostic source tree consumed by `curate`. Contains cognitive capabilities (`crp/cap/`), the agent catalog (`crp/agn/`), and governance templates (`crp/gov/`) including quality contracts (`crp/gov/qlt/`), process protocols (`crp/gov/prc/`), and collaboration topologies (`crp/gov/top/`).

5. **Materialization** *(Design Target)*
   - The deterministic transformation of a host-agnostic agent declaration (CCC) into the format required by a specific Agent Host. Materialization is the first step of the `spawn` lifecycle — it produces the host-specific artifacts that `spawn` then activates. Same declaration and same target always produce the same output.

6. **Team Declaration** *(Design Target)*
   - The aggregate output of `ai4x curate`. Binds a collaboration topology to a concrete set of agents with explicit role assignments. A Team Declaration is the complete, reproducible specification of an agentic team — topology, agents, and their binding — ready for materialization.
