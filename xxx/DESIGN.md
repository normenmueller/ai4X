# ai4x Design Journey

## Context

Designing the target state of the `scout → curate → spawn` pipeline.
This document follows the design decisions chronologically — a user journey
through the product model.

---

## 1. The Pipeline

We established a three-stage pipeline:

```
ai4x scout   →  .ai4x/spc/     What does the project need?
ai4x curate  →  .ai4x/agn/     Who works in the team? With which capabilities?
ai4x spawn   →  .github/ | AGENTS.md   Host-specific agent artifacts
```

Each step consumes the output of the previous. Each step is idempotent.

**Decision:** `scout` is a new CLI command (not yet in contract — requires PBL entry).

---

## 2. Directory Structure

```
.ai4x/
├── config.yaml     ← project config
├── spc/            ← scout output
├── agn/            ← curate output
└── ctx/            ← project context (spawn weaves into agents)
```

**Decision:** Three subdirectories mapping 1:1 to pipeline stages.
`ctx/` is spawn-input — project-specific facts woven into agent artifacts.

---

## 3. Configuration Model

### Global Config (`~/.config/ai4x/config.yaml`)

Installed by `make install`. Defines system-wide hosts and runtimes.

**Key rename:** `clients` → `hosts` (aligns with "Agent Host" terminology).

```yaml
version: 0.1.0

hosts:
  codex:
    adapter: codex/cli
    run:
      command: ["codex"]
      options:
        - req: ["--model", "{runtime.params.model}"]
        - req: ["--ask-for-approval", "{runtime.params.approval}"]

  copilot:
    adapter: copilot/cli
    run:
      command: ["copilot"]
      options:
        - req: ["--model", "{runtime.params.model}"]

  vscode+copilot:
    adapter: copilot/vscode
    run:
      command: ["code"]
      options:
        - req: ["-n", ".", "--wait"]

runtimes:
  altman:
    host: codex
    params:
      model: "gpt-5.4"
      approval: "on-request"

  nadella:
    host: copilot
    params:
      model: "claude-opus-4.6"

  satya:
    host: vscode+copilot
```

### Project Config (`.ai4x/config.yaml`)

Overrides global per key. No deep-merge — a project runtime/host replaces
the global one entirely.

```yaml
version: 0.1.0

defaults:
  runtime: satya
```

**Decision:** Projects may define their own hosts and runtimes (e.g., a project
needs `model: gpt-4.1` instead of `gpt-5.4`).

**Merge rule:** Project keys win. No deep-merge within a host/runtime entry.

---

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

The PO asked: "What if we write it Haskell-ish?" — then pushed further:
"It should be compilable if you add the right imports and pragmas."

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

ai4x ships a prelude module `Ai4x.Spc` with base types (`Job`, `Priority`,
`Constraint`, `Need`). Projects import it and define domain types + needs.

### Auto-Generating Missing Capabilities

When `curate` finds no matching capability in the corpus for a need:

**Decision:** LLM may *draft* capabilities into a staging area (`.ai4x/drafts/`).
Never directly into `crp/cap/`. Drafts have `status: draft`, `approved_by: null`.
Human review gate for corpus admission. Rationale: capability authoring governance
requires explicit nearest-neighbor comparison and semantic owner judgment.

---

## 5. Curate Output (`agn/`)

*Design pending.*

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

**Decision:** No. Polyglot architecture.

| Component | Language | Rationale |
|-----------|----------|-----------|
| CLI (`curate`, `spawn`, `doctor`, `scout`) | TypeScript | Orchestration + file I/O |
| Spec validation | GHC (subprocess) | Type-checking `Needs.hs` |
| LLM interaction | LLM reads `.hs` directly | No extraction step |

Existing TypeScript code, tests, CI pipeline, and team expertise remain.
Haskell is used only where it provides unique value: the spec type system.

---

## Participants

- **PO**: Product decisions, naming, direction
- **Architect**: Structure, contracts, integration boundaries
- **AI Strategist**: LLM consumption, context budget, capability generation
- **Critical Reviewer**: Over-engineering check, minimum viable pushback
