# Organization Design: Collaboration Topology Selection Capability

## Motivation

`curate` must perform a critical step that no current team member can execute:

```
Set(EARS) → Set(Capabilities) → Separation of Concerns → (Set(Agent), CollabM)
```

The final arrow — selecting the right Collaboration Topology and binding agents to roles — requires domain knowledge that is absent from the current team:

| Required Knowledge Domain | What It Covers | Current Team Coverage |
|---------------------------|----------------|---------------------|
| Team Topologies | Conway's Law, Skelton/Pais (Stream-aligned, Platform, Enabling, Complicated-subsystem) | None |
| Communication Patterns | Synchronous vs. asynchronous coordination, hub-and-spoke, mesh, broadcast | None |
| Organization Design Principles | Span of Control, Separation of Authority, Decision Rights allocation | None |
| Process Design | Stage Gates vs. Continuous Flow vs. Kanban vs. hybrid models | Partially (workflow.md defines one model, but cannot reason about alternatives) |
| Coordination Mechanisms | Mutual adjustment, direct supervision, standardization (of skills, outputs, processes) — Mintzberg | None |

### The Gap in `curate`'s Pipeline

Step 5 of `curate` must answer: **Given this set of capabilities and agents, which collaboration topology fits best?**

This is not a software architecture question (DDD doesn't help here). It's not an AI strategy question (model constraints are irrelevant). It's an **organization design** question: How should cognitive labor be divided and coordinated?

Without this capability, `curate` would have to:
- Always default to one topology (e.g., leader-specialists) — violating need-first discovery
- Ask the user to choose — violating the principle that `curate` identifies the *how*
- Hardcode heuristics without principled reasoning — violating explicitness

## Three-Layer Model (Architectural Insight)

The collaboration concern has three distinct layers:

| Layer | What | Independence | Artifact Location |
|-------|------|-------------|-------------------|
| **Topology** (abstract pattern) | "Leader + n Specialists", "Swarm", "Pipeline" — reusable, agent-independent | Fully independent of concrete agents | `crp/gov/top/*.topology.yaml` |
| **Binding** (role → agent mapping) | Concrete assignment: which agent fills which role in a topology | Coupled to both topology and agent set | Inside Team Declaration (`.ai4x/team.yaml`) |
| **Team Declaration** (aggregate) | The `curate` output: topology reference + agent set + binding | Composite — binds topology + agents | `curate` output |

Key insight: **Topologies are Value Objects.** They have no identity beyond their structure. "Leader + n Specialists" is the same pattern whether applied to ai4X's team or a 3-person documentation team. They live in `crp/gov/top/` as reusable, abstract collaboration patterns.

## What This PBL Requests

### 1. New Capability: `crp/cap/architecture/organization/team-topology-design`

A cognitive capability covering:
- Knowledge of standard collaboration topologies and when each fits
- Ability to match requirement patterns to topology patterns
- Trade-off reasoning (coordination cost vs. specialization benefit)
- Awareness of anti-patterns (too many specialists without coordination, single-point-of-failure leaders)

### 2. New Agent: `ai4x-organization-design`

A specialist agent composed of the team-topology-design capability (and potentially others from the organization domain). This agent's role in `curate`'s pipeline:
- Receives the set of identified capabilities and proposed agents
- Selects (or proposes) the appropriate collaboration topology from `crp/gov/top/`
- Produces the binding (role → agent mapping)
- Justifies the selection with explicit trade-off reasoning

### 3. Collaboration Topology Catalog: `crp/gov/top/`

Initial catalog of abstract topologies:

| Topology | Structure | When to Use |
|----------|-----------|-------------|
| `leader-specialists` | One leader orchestrates; n specialists execute under direction; leader is sole external communicator | Complex tasks requiring coordination, clear authority, stakeholder shield |
| `swarm` | No leader; all agents equally tackle task; peer-to-peer coordination | Simple tasks, brainstorming, low-coordination work |
| `pipeline` | Sequential stages; each agent handles one stage; output flows forward | Linear workflows, clear stage boundaries |
| `review-loop` | Producer + Reviewer(s); iterative refinement until quality gate passes | Quality-critical deliverables, adversarial validation |

More topologies will emerge from practice. The catalog is extensible.

## Relationship to Self-Validation

ai4X's own team currently uses the `leader-specialists` topology:
- `ai4X` (orchestrator) = leader
- All specialists = specialists
- PO communicates only with leader

This was chosen intuitively. With the organization-design capability, ai4X could **validate its own topology choice** — another instance of the self-validating design goal.

## Open Questions

### Q1: When is this needed?

Not before `curate` is implemented. But the capability and topology catalog should be designed *before* `curate`'s pipeline is coded, because:
- `curate` needs to know what topologies exist to select from them
- The topology schema informs `curate`'s output format

### Q2: Should the agent exist before `curate`?

Possibly useful for manual consultation during Epic refinement (e.g., "Is leader-specialists the right model for this project?"). But not blocking.

### Q3: Topology schema design

What does a `.topology.yaml` look like? Minimum:
- Role slots (name, cardinality: 1, 1..n, 0..1)
- Communication rules (who talks to whom, who talks externally)
- Coordination mechanism (direct supervision, mutual adjustment, standardization)
- Gate semantics (if any)

Schema design is a `curate`-architecture concern but must be informed by organization-design knowledge.

## Constraints

1. **No premature agent creation.** Do not create `ai4x-organization-design.agent.md` until the capability portfolio supports it.
2. **Capability-first.** The capability in `crp/cap/` must exist before the agent. Agent = composition of capabilities.
3. **Catalog-first.** At least 2-3 topologies must be defined before `curate` can select among them.
4. **Not blocking USP documentation.** This PBL informs `curate` design but does not block the current Epic.

## Relationship

- **`ai4x-curate.md`**: `curate` step 5 depends on this capability for topology selection
- **`ai4x-usp-documentation.md`**: The topology catalog (`crp/gov/top/`) is part of ai4X's output model
- **`ai4x-team-portability.md`**: Governance separation enables topology parametrization
- **Capability Governance**: New capability must pass portfolio admission

## Priority

Medium-High — does not block current work but must be resolved before `curate` pipeline design is finalized.
