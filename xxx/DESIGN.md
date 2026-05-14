# ai4X Design Journey

## Context

Designing the target state of the `scout → curate → spawn` pipeline. This document follows the design decisions chronologically — a user journey through the product model.

## 1. The Pipeline

We established a three-stage pipeline:

```
ai4x scout  → .ai4x/spc/                   What needs do exists?
ai4x curate → .ai4x/agn/                   Who, with which capabilities, works in the team?
                                           How works the team together?
ai4x spawn  → .github/ | AGENTS.md | ...   Host-specific agent artifacts
```

Each step consumes the output of the previous.

**Decision:** `scout` is a new CLI command (not yet in contract — requires PBL entry).

**Decision:** `scout` is NOT idempotent — it's an LLM-driven interview. But its *output* (`Needs.hs`) is a stable, validatable artifact. `curate` is LLM-assisted (matching). `spawn` is purely mechanical.

**Decision:** `scout` (and `curate`) internally use `spawn` as a primitive — they temporarily materialize ai4X-owned agents from `crp/agn/` for the chosen host, run them, then tear down the links. This can be a single agent or a team of agents.

## 2. Directory Structure

```
.ai4x/
├── config.yaml     ← project config
├── spc/            ← scout output
├── agn/            ← curate output
└── ctx/            ← project context (spawn weaves into agents)
```

**Decision:** Three subdirectories mapping 1:1 to pipeline stages.

**Decision:** `spawn` input is both `agn/` (team definitions) AND `ctx/` (project context). `agn/` defines the agents; `ctx/` provides project-specific facts that spawn weaves into the materialized artifacts.

## 3. Configuration Model
### Project Config (`.ai4x/config.yaml`)

Overrides global per key. No deep-merge — a project runtime/host replaces the global one entirely.

```yaml
version: 0.1.0

defaults:
  runtime: satya
```

**Decision:** `defaults` exists only in project config, not in global config. The global config defines what is *available* (hosts, runtimes); the project config declares what is *preferred* here.

**Decision:** Projects may define their own hosts and runtimes (e.g., a project
needs `model: gpt-4.1` instead of `gpt-5.4`).

**Merge rule:** Project keys win. No deep-merge within a host/runtime entry.

## 4. Spec Format (`spc/`)

### The Question

What format should `scout` output? We evaluated:

| Format | Verdict |
|--------|---------|
| EARS (natural language templates) | Rejected — optimized for humans, not machines |
| Pure YAML | Rejected — stringly-typed, ambiguous |
| Job Stories | Rejected — motivation slot introduces ambiguity |
| Capability References (direct IDs) | Rejected — makes curate a trivial copier |
| Typed YAML with algebraic semantics | Considered — but `input/output` fields unclear |
| **Haskell type signatures** | **Accepted** |

### Why Haskell?

The PO asked: "What if we write it Haskell-ish?" — then pushed further: "It should be compilable if you add the right imports and pragmas."

This is the key insight: **GHC is a free `doctor`**. Type errors = invalid spec.

The functional signature IS the semantics:

```haskell
designArchitecture :: Need (RequirementsPack -> DomainModel -> (ArchitecturePack, [Decision]))
```

Reads: "a need that transforms Requirements + Domain Model into Architecture + Decisions."

**Advantages:**

- Type signatures are token-efficient and unambiguous
- LLMs (Frontier models) understand Haskell natively
- `ghc -fno-code` validates structure — no custom validator needed
- Outputs of one need = inputs of another → pipeline composability at the type level

### LLM Consumption

We debated: should `curate` extract to JSON first, or give Haskell directly to the LLM?

**Decision:** Direct Haskell to LLM. No extractor. Rationale:

- Frontier models (GPT-5.4, Claude Opus 4.6) handle Haskell excellently
- Haskell is more token-efficient than JSON for the same semantics
- Extra tooling adds complexity without benefit
- GHC remains as validator in `doctor`, not as extraction step

### Architecture

```
GHC (doctor)      → validates spec
Needs.hs (curate) → LLM reads directly → matches against corpus
```

ai4x ships a prelude module `AI4X.Spc` with base types (`Job`, `Priority`, `Constraint`, `Need`). Projects import it and define domain types + needs.

**Decision:** Haskell module prefix is `AI4X` (matches project name "ai4X" in uppercase Haskell convention).

### Auto-Generating Missing Capabilities

When `curate` finds no matching capability in the corpus for a need:

**Decision:** LLM may *draft* capabilities into a staging area (`.ai4x/drafts/`). Never directly into `crp/cap/`. Drafts have `status: draft`, `approved_by: null`. Human review gate for corpus admission. Rationale: capability authoring governance requires explicit nearest-neighbor comparison and semantic owner judgment.

## 5. Curate Output (`agn/`)

*Design pending.*

---

## 5b. ai4X-Owned Agents (`crp/agn/`)

`crp/agn/` houses agents that ai4X itself uses — interview agents (scout), curators (curate), and any other "tool agents" that the CLI commands need.

These are NOT treated differently from user-facing agents. They live in the corpus, can be invoked directly (`ai4x ask Mechthild`), and are spawned temporarily when `scout` or `curate` runs.

**Decision:** `crp/agn/` is an open registry — not limited to "tool agents." Any pre-built expert agent lives there.

---

## 6. Project Context (`ctx/`)

*Design pending.*

---

## 7. Spawn Output (`.github/`, `AGENTS.md`)

*Design pending.*

---

## 8. CLI Language

### The Question

Should we rewrite the entire CLI in Haskell?

**Decision:** OPEN — requires further discussion.

Current state: Polyglot architecture (TypeScript CLI + GHC as subprocess).

Arguments to re-evaluate:
- Existing TypeScript code is minimal (~35 files, mostly empty scaffolds)
- Team expertise must be extended to Haskell anyway (spec format)
- A pure Haskell implementation could leverage the type system end-to-end
- `scout`/`curate`/`spawn` are transformation pipelines — Haskell's strength

**Action:** Discuss with Architect, AI Strategist, and Implementation Specialist — neutral, objective assessment needed.

## Participants

- **PO**: Product decisions, naming, direction
- **Architect**: Structure, contracts, integration boundaries
- **AI Strategist**: LLM consumption, context budget, capability generation
- **Critical Reviewer**: Over-engineering check, minimum viable pushback

