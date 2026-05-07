---
version: 1.1.0
last_updated: 2026-05-08
---

# Governance Glossary

Canonical term definitions for the ai4X governance layer.
Terms defined here are the single authoritative source. Other documents reference this file rather than restating definitions.

**Scope:** This file contains reference-safe terms only (Planning Terms, Qualifier Terms, Architecture Terms). Dispatch-critical terms (Gate Terms, Artifact Terms, Verdict Terms) remain inline at their point of use in `dev/protocols/workflow.md`. See `doc/arc/09_architecture_decisions.md` § ADR-001 for rationale.

## Planning Terms

1. **Idea**
   - A vague intent or exploration drafted by the PO in `adm/pbl/`. Temporary.

2. **Epic**
   - A refined requirement scope with acceptance criteria. Promoted to a GitHub Issue with label `epic`.

3. **Story**
   - An implementable unit of work within an Epic. GitHub Issue with label `story`, linked to parent Epic.

4. **Task**
   - An implementation step within a Story. Represented as a checklist within the Story Issue.

## Qualifier Terms

1. **Non-trivial**
   - A change is non-trivial if it adds or modifies behavior, contracts, boundaries, acceptance criteria, or domain types. Mechanical changes (typo fixes, formatting, comment-only edits) are trivial. When in doubt, treat the change as non-trivial.

## Architecture Terms

1. **Agent Host**
   - A runtime environment that hosts and executes AI agents. Examples: VS Code with GitHub Copilot, Codex CLI, Claude Code. ai4X is agent-host-agnostic — it declares agents independently and materializes them for a specific host at activation time.

2. **Cognitive Capability Composition (CCC)** *(Design Target)*
   - A declarative specification that defines an agent by composing revision-safe references to cognitive capabilities from the ai4X corpus (`dev/cap/`). A CCC declares *what* an agent knows and *how* it reasons — not *where* it runs. CCCs are the input to materialization.

3. **Collaboration Topology** *(Design Target)*
   - A reusable, abstract collaboration pattern that defines roles and coordination structure for a team of agents — independent of which concrete agents fill those roles. Examples: leader–specialists, swarm, pipeline. Topologies are value objects: "leader + n specialists" is the same pattern regardless of the agents involved.

4. **Materialization** *(Design Target)*
   - The deterministic transformation of a host-agnostic agent declaration (CCC) into the format required by a specific Agent Host. Materialization is the first step of the `spawn` lifecycle — it produces the host-specific artifacts that `spawn` then activates. Same declaration and same target always produce the same output.

5. **Team Declaration** *(Design Target)*
   - The aggregate output of `ai4x curate`. Binds a collaboration topology to a concrete set of agents with explicit role assignments. A Team Declaration is the complete, reproducible specification of an agentic team — topology, agents, and their binding — ready for materialization.
