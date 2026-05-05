# Agentic AI Meta-Optimization: Agents + Governance Layer

## Context

AI Strategy review of `.github/agents/*.agent.md` and `adm/gdl/**/*.md` identified structural inefficiencies, DRY violations, and missing operational protocols that prevent the agent team from being optimally configured for agentic AI consumption.

The governance layer violates its own Single Authoritative Source principle in ~10 places. Agent definitions carry ~40% structural boilerplate. The collaboration model lacks a formalized handoff schema.

## Goal

Make the ai4X expert agent team and its governance layer highly optimized for agentic AI: logical, elegant, robust, correct, consistent.

## Proposed Work Packages (ordered by dependency)

### 1. Agent-Deduplizierung (High ROI, ~1.000 Token saved)

- Define shared-agent-preamble in `ai4x.agent.md` (Required Reading default, missing-input fallback, completion rule standard).
- Migrate all 7 specialists to new convention (remove boilerplate — keep engineering-quality refs per Prompt-Context Design Rules).
- Remove `(MUST)` heading markers; use only where must/should ambiguity is genuine.
- Slim orchestrator: extract Product Contract; inline Delegation Matrix as compact table.

### 2. workflow.md Decomposition (Medium, Parseability)

- Extract shared `glossary.md` (Gate Terms, Artifact Terms, Verdict Terms, Planning Terms).
- Clean separation of Routing Table (10 Stages) as focused section.
- Clean separation of Branching/Commits.
- Fix numbering error (item 10 → 12, #11 missing).

Depends on: none (enables 3 and 4).

### 3. Governance Single-Source-Enforcement (High, Consistency)

- Gate semantics: one location (workflow.md Glossary) → all others reference-only.
- Board transitions: only in `board-policy.md` → `pln/workflow.md` and `dev/workflow.md` reference.
- Conformance template: keep one file, delete duplicate.
- Sweep cadence: only in `capability-sweep.md`.
- README.md tree listing: remove (violates own Single Authoritative Source rule).

Depends on: #2 (new glossary structure resolves gate-semantik overlap).

### 4. index.yaml Structural Improvement (Medium, Parseability)

- Promote reading order from YAML comments to structured key `reading_order`.
- Promote task paths from YAML comments to structured key `task_paths`.
- Add `shape` field per document entry (base-contract vs. stage-output-contract).
- Standardize `purpose` fields to "Define [X]" pattern.

Depends on: #2 (final file paths must be stable before index reflects them).

### 5. Handoff-Schema + Authority Hierarchy (Medium, Robustness)

- Define formalized handoff schema (what does a specialist receive?).
- Document authority stack explicitly in orchestrator (Contracts > Protocol > Orchestrator > Specialist > PO Override).
- Operationalize blocked protocol (format, retry rule, PO override).
- Add self-scoping rule for specialists (misrouting handling).
- Add contract-vs-contract precedence rule.

Depends on: #1 (builds on slimmed orchestrator).

### 6. Docs Hygiene (Low, Nice-to-have)

- Add frontmatter with `version`/`last_updated` to all normative docs.
- Standardize heading depth (flat H2).
- Document or decouple soft-circular-reference `board-policy` ↔ `pln/workflow`.

Depends on: #2, #3 (apply to final document set).

### 7. Structural Assessment: `adm/gdl/ops/` (Low, Structural clarity)

- Evaluate whether `adm/gdl/ops/` is correctly placed in the governance layer. Currently contains a single runbook (`github-repo-metadata.md`) which is procedural/operational, not normative governance in the same sense as contracts and protocols.
- Assess: should runbooks live next to their scripts (`utl/`) or remain in governance? What is the boundary between a "protocol" and a "runbook"?
- Decide: keep, relocate to `utl/`, or redefine `ops/` scope with explicit admission criteria.
- If `ops/` stays, define what qualifies as ops-governance vs. utility-documentation.

Depends on: #2, #3 (structural decisions should be coherent with overall document decomposition).

## Key Constraints

- Explicitness over token efficiency for quality-relevant rules (per `ai-strategy-quality.md` § Prompt-Context Design Rules).
- engineering-quality.md references MUST remain explicit in every specialist agent.
- No regression in agent compliance — verify through dry-run after changes.

## Success Signal

- All agents structurally consistent; no redundant boilerplate.
- Zero DRY violations across governance docs (each fact lives in exactly one place).
- Formalized handoff schema and authority hierarchy documented.
- `index.yaml` fully machine-parseable (no critical data in comments).
- Token budget per specialist reduced by ~30% without compliance loss.
