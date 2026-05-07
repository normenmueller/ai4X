# Team Portability: Separation of Team Operating System from Project Context

## Motivation

The ai4X expert team (Tech Lead, Requirements, Architecture, Implementation, Testing, AI Strategy, Critical Reviewer, Capability Governance) is one of the two core USPs of ai4X:

- **USP 1 (Team)**: A highly optimized expert team with methodology, quality gates, routing, and collaboration patterns — reusable across projects.
- **USP 2 (Product)**: The `curate` command that materializes such teams for other projects.

Currently, team methodology and project specifics are entangled: governance protocols hardcode `curate/spawn/doctor`, quality contracts reference ai4X-specific paths, and agent definitions mix team operating rules with project scope. This prevents the team from being deployed to another project without rewriting governance.

The team should be portable like a real consulting team: it brings its playbook (methodology) and receives a project brief from the client (project context).

## Vision

```
dev/
├── cap/       # Cognitive capabilities (portable knowledge assets)
├── cli/       # The ai4X CLI product (project-specific)
└── team/      # The expert team itself (portable, evolvable)
    ├── contracts/    # Quality contracts (what to deliver)
    ├── protocols/    # Operating protocols (how to work)
    └── spc/          # Agent specifications (cognitive capability compositions)
```

The team is a development product in its own right — it evolves, it has quality standards, and it can be extracted and deployed elsewhere.

### Agent Specification Layer (`spc/`)

Each agent is declaratively specified as a **cognitive capability composition** (CCC). Specifications are structured YAML files (not Markdown), e.g.:

```
spc/
├── requirements.agent.ccc.yaml
├── architecture.agent.ccc.yaml
├── implementation.agent.ccc.yaml
├── testing.agent.ccc.yaml
├── ai-strategy.agent.ccc.yaml
├── critical-reviewer.agent.ccc.yaml
└── capability-governance.agent.ccc.yaml
```

Key properties:
- **Format**: YAML — machine-readable, enabling automated `spawn` materialization.
- **Content**: Declares which cognitive capabilities (revision-safe references into `dev/cap/`) compose each agent, plus role, contracts, and completion rules.
- **Relationship to `dev/cap/`**: Each spec contains pinned references to capabilities, ensuring reproducibility and auditability.
- **Materialization**: `spawn --target <agent-host>` compiles a `.ccc.yaml` into the host-specific format (e.g., `.github/agents/*.agent.md` for VS Code + Copilot).

This makes the ai4X team a **reference implementation of its own product model**: `curate` produces `.ccc.yaml` specs; `spawn` materializes them. The team is the seed.

## Concern-Separation Model

The operating model separates three orthogonal concerns. Each concern has its own lifecycle, ownership, and artifact location:

| Layer | Concern | What it contains | Portability |
|-------|---------|-----------------|-------------|
| **Team Methodology** | How the team works | Quality contracts, operating protocols, collaboration topologies | Fully portable — travels with the team |
| **Agent Activation** | What the agents are and how they materialize | CCCs, spawn materialization, agent host bindings | Portable — same declarations, different targets |
| **Project Brief** | What the project needs | Domain vocabulary, command surface, project-specific paths, board config | Project-bound — written fresh per engagement |

This model is orthogonal to the Three-Layer Model (Topology / Binding / Team Declaration) documented in `doc/arc/08_concepts.md`. The Three-Layer Model describes how a team is *composed* from topologies and agents. The Concern-Separation Model describes how team-level artifacts are *separated from project-level artifacts* to enable portability.

Both models must be documented in `doc/arc/08_concepts.md` when this PBL is promoted to an Epic.

## Key Architectural Insight

VS Code's agent injection model provides a natural separation mechanism:

| Mechanism | Injection | Belongs to |
|-----------|-----------|-----------|
| `.github/agents/*.agent.md` | Auto-loaded (active agent) | **Team** — portable agent definitions |
| `.github/copilot-instructions.md` | Always auto-loaded | **Project** — project brief, domain vocabulary, command surface |

When the team "moves" to a new project:
- Agent definitions (.agent.md) travel with the team (identical methodology)
- `copilot-instructions.md` is written fresh for the new project (new domain, new commands)
- Quality contracts and protocols are reused as-is

## Scope of Change

### Artifacts that move to `dev/team/`

Currently in `adm/gdl/dev/`:
- `contracts/engineering-quality.md`
- `contracts/typescript-quality.md`
- `contracts/implementation-quality.md`
- `contracts/requirements-quality.md`
- `contracts/architecture-quality.md`
- `contracts/testing-quality.md`
- `contracts/review-quality.md`
- `contracts/ai-strategy-quality.md`
- `contracts/capability-authoring-governance.md`
- `protocols/workflow.md` (development workflow — team methodology)
- `protocols/development-conformance.md`
- `protocols/development-conformance-template.md`
- `protocols/capability-sweep.md`

Currently in `.github/agents/`:
- All `*.agent.md` files (team member definitions)

### Artifacts that remain project-specific

- `adm/gdl/pln/` — Planning governance (backlog management, issue promotion) is project-bound
- `adm/gdl/ops/` — Operations governance (GitHub repo metadata, CI/CD) is repo-bound
- `adm/gdl/shr/protocols/board-policy.md` — Board transitions are project-bound
- `.github/copilot-instructions.md` — Project brief (domain, commands, paths)

### Artifacts requiring decision

- `adm/gdl/glossary.md` — Terms are partially team (Gate Terms, Verdict Terms) and partially project (Planning Terms)
- `adm/gdl/index.yaml` — Needs split into Team Index + Project Index
- `.github/agents/*.agent.md` → `dev/team/` relationship — symlinks vs. generation vs. other mechanism

## Open Design Questions

### Q1: `.github/agents/` ↔ `dev/team/` relationship

VS Code requires agent files at `.github/agents/*.agent.md`. If the source of truth is `dev/team/spc/`, how do we bridge?

**Emerging answer (from S4/#47 analysis)**: `spc/*.ccc.yaml` is the canonical declaration; `.github/agents/*.agent.md` is a spawn materialization for the VS Code + Copilot Agent Host. Under Strategy (A), manual maintenance is acceptable. Under Strategy (B+), `spawn` automates the compilation.

Options:
- (a) Symlinks from `.github/agents/` → `dev/team/agents/` (simple, macOS/Linux only)
- (b) `.github/agents/` IS in `dev/team/` (restructure repo so `dev/team/.github/agents/` — breaks VS Code convention)
- (c) Build step / sync script that copies `dev/team/` → `.github/agents/`
- (d) `dev/team/` contains the canonical contract/protocol definitions; `.github/agents/` remains the agent runtime location but references `dev/team/` via Required Reading

### Q2: Planning governance — project-specific or partially portable?

The planning methodology (PBL → Epic → Story decomposition) seems team-portable in principle. But the concrete board policy (GitHub Project, column names, label schemes) is project-specific.

Options:
- (a) All of `pln/` stays project-specific
- (b) Split: `dev/team/protocols/planning-workflow.md` (methodology) vs. project-local board config
- (c) Planning is always project-specific — the team adapts to whatever the project uses

### Q3: Where does `adm/gdl/` go?

If team artifacts move to `dev/team/`, what remains in `adm/gdl/`?

Options:
- (a) `adm/gdl/` dissolves entirely — team stuff → `dev/team/`, project stuff → `adm/project/` or inline
- (b) `adm/gdl/` becomes project-only governance (planning, ops, board policy)
- (c) `adm/` retains its role as "administration" but only for project administration, not team methodology

### Q4: How do quality contracts reference project scope?

Currently: `engineering-quality.md` says "applies to curate, spawn, doctor."
Proposed: Contracts say "applies to the command surface defined in the Project Brief."

But contracts are in `dev/team/` (portable) and the Project Brief is in `copilot-instructions.md` (project-local). The agent has both auto-loaded, so dispatch works. But the contract text itself cannot validate — it trusts that the Project Brief is present.

### Q5: Team evolution governance

If the team itself is a development product in `dev/team/`, who governs changes to it?
- Does the team govern itself (reflexive)?
- Does the PO own team evolution decisions?
- Is there a meta-governance layer?

### Q6: `dev/team/` structure — flat or structured?

Proposed minimum:
```
dev/team/
├── contracts/
└── protocols/
```

But what about:
- Agent definitions (if they live here)?
- Team-level glossary (Gate Terms, Verdict Terms)?
- Team configuration / identity?
- Visual flows (Mermaid diagrams that describe team methodology)?

## Constraints

1. **VS Code injection model**: Only `copilot-instructions.md` + active `.agent.md` are guaranteed auto-loaded. Everything else is "Required Reading" (behavioral, not guaranteed).
2. **No cross-session memory**: Agents have no persistent memory beyond repository files. Project context must be in files that are reliably loaded.
3. **Single repository**: Currently ai4X is a monorepo. The team extraction question (submodule? package? copy?) is out of scope for now but influences directory design.
4. **`curate` self-reference**: ai4X is a reference implementation of itself — `curate` will eventually generate team structures like the one it operates within. This circular dependency must be accounted for.
5. **Active Epic #43**: This PBL must not disrupt in-flight work. It enters the planning workflow as a new Epic candidate after current work concludes or at PO discretion.

## Relationship to Existing Work

- **Epic #43 (Agentic Team Optimization)**: This PBL extends the vision of #43. It could become a follow-up Epic or be absorbed into remaining Stories if scope permits.
- **PBL `ai4x-curate.md`**: Directly related — `curate` materializes teams, and this PBL defines how the reference team is structured. The structures here become the template for `curate`'s output.
- **ADR-001 (Glossary Term Placement)**: Remains valid but may need revision if terms split between team glossary and project glossary.

## Success Criteria (Draft)

1. Team artifacts (`dev/team/`) contain zero project-specific references (no "curate", no "ai4X paths", no "GitHub Project #3").
2. Project brief (`copilot-instructions.md`) contains all project-specific context needed for team operation.
3. Quality contracts and protocols function identically when the Project Brief changes (different project, different commands).
4. Agent definitions dispatch correctly using only auto-loaded context (agent file + copilot-instructions.md).
5. A hypothetical "team extraction" (copy `dev/team/` + agents to new repo, write new project brief) produces a functional team without governance modification.
