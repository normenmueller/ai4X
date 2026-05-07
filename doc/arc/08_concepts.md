# Cross-cutting Concepts

This section describes overarching, principal regulations and solution ideas that are relevant in multiple parts of the system. Such concepts are often related to multiple building blocks. They may include many different topics, such as:

- Domain models
- Architecture and design patterns
- Rules for using specific technology
- Principal, often technical decisions of an overarching nature
- Implementation rules

<!-- Concepts form the basis for conceptual integrity (consistency, homogeneity) of the architecture. Thus, they are an important contribution to achieve inner qualities of your system. -->

## Operating Model

ai4X is an operating model for agentic AI work. Its value proposition rests on three differentiating properties — need-first, host-agnostic, and self-validating — that together define how agent teams are specified, materialized, and activated. The concepts below give each property architectural substance.

## Agent-Host Agnosticism Principle

Agent declarations in ai4X are independent of any specific runtime environment (Agent Host). A Cognitive Capability Composition (CCC) declares *what* an agent knows and *how* it reasons — never *where* it runs.

This separation creates a clear boundary: everything before materialization is host-agnostic; everything after is host-specific. The same CCC can be materialized for VS Code with GitHub Copilot, Codex CLI, Claude Code, or any future Agent Host without changing the declaration.

**Architectural consequence:** The system must maintain a strict separation between declaration artifacts (`dev/cap/`, `dev/agn/`) and materialized artifacts (host-specific output of `spawn`). No declaration may contain host-specific references. No materialized artifact may be treated as a source of truth.

## Materialization Boundary

Materialization is the deterministic transformation that crosses the boundary from host-agnostic declaration to host-specific artifact. It is the first step of the `spawn` lifecycle — `spawn` materializes and then activates.

The boundary is a pure function: given the same declaration and the same target Agent Host, materialization always produces the same output. This determinism is what makes agent work reproducible across environments and over time.

**Architectural consequence:** Materialization must be implemented as a stateless transformation. No side effects during materialization; activation is a separate, subsequent step. The boundary is the single point where host-specific knowledge enters the system.

## Self-Validating Design Goal

ai4X is designed to apply its own operating model to itself. The aspiration is that the team building ai4X — its agents, their collaboration topology, their governance — is itself a valid output of `curate` and `spawn`:

```
spawn(curate(ai4X's requirements)) ≡ ai4X's own agent team
```

This formula is **aspirational** — it describes a design target, not a current capability. Today, ai4X's agent team is hand-maintained. The self-validating property will be realized incrementally as `curate` and `spawn` mature.

**Architectural consequence:** Every governance artifact, agent definition, and collaboration pattern used by ai4X must be expressible in the formats that `curate` produces. This constrains how much project-specificity is acceptable in team-layer artifacts and ensures that ai4X's own structure remains a valid test case for its tooling.

## Three-Layer Model

The Three-Layer Model defines how ai4X separates concerns in agent team specification. Each layer has distinct responsibilities and independence guarantees.

### Layer 1: Collaboration Topology *(Design Target)*

A Collaboration Topology is a reusable, abstract pattern that defines roles and coordination structure for a team of agents. Topologies are value objects — "leader + n specialists" is the same pattern regardless of which concrete agents fill the roles.

Topologies are fully independent of agents. They define *shape* (how many roles, how they coordinate) without binding *identity* (which agent fills which role).

Examples: leader–specialists, swarm, pipeline, review-loop.

### Layer 2: Agent-Host Binding

Binding is the concrete assignment of agents to topology role slots. This is where the abstract topology meets the concrete agent set: a specific CCC is assigned to each role defined by the topology.

Binding is coupled to both the topology (it must respect the role structure) and the agent set (it must reference existing CCCs). It lives inside the Team Declaration, not as a standalone artifact.

### Layer 3: Team Declaration *(Design Target)*

The Team Declaration is the aggregate output of `ai4x curate`. It binds a Collaboration Topology to a concrete set of agents with explicit role assignments. A Team Declaration is the complete, reproducible specification of an agentic team — topology, agents, and their binding — ready for materialization.

**Architectural consequence:** The three layers enforce separation of concerns. Topologies can be developed and versioned independently of agents. Agents can be composed independently of how they will collaborate. Only the Team Declaration couples them — and it does so explicitly, declaratively, and reproducibly.
