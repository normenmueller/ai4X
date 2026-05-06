# Architecture Decisions

Important, expensive, large scale or risky architecture decisions including rationales. With "decisions" we mean selecting one alternative based on given criteria.

<!-- Use your judgement to decide whether an architectural decision should be documented here in this central section or whether you better document it locally (e.g. within the building block view).
     Avoid redundancy. Refer to section 4, where you already captured the most important decisions of your architecture.
     See https://docs.arc42.org/section-9/ for further information. -->

## ADR-001: Glossary Term Placement — Inline vs. Reference

**Status:** Accepted  
**Date:** 2026-05-06  
**Context:** Epic #43 (Agentic Team Optimization)

### Context

The ai4X governance layer defines terms used by AI agents in their operational instructions. These terms appear in documents that VS Code Copilot agents consume as prompt material. The placement of term definitions directly impacts agent compliance behavior.

VS Code only auto-loads two files into an agent's context window: `copilot-instructions.md` (always) and the active `.agent.md` (as modeInstructions). All other files require explicit "Required Reading" instructions — a behavioral hint the model MAY follow, not a guaranteed injection mechanism.

### Decision

Term definitions are split into two categories based on their operational criticality for agent dispatch:

| Category | Placement | Rationale |
|----------|-----------|-----------|
| **Gate Terms** (Stage Gate, Progression, Remediation) | Inline in `dev/protocols/workflow.md` | Dispatch-critical. Misinterpretation breaks the stage pipeline. |
| **Artifact Terms** (Requirements Pack, Architecture Pack, etc.) | Inline in `dev/protocols/workflow.md` | Agents verify artifact presence at gate decisions. Must be in-context. |
| **Verdict Terms** (blocked, conditional-approve, approved) | Inline in `dev/protocols/workflow.md` | These are the gate output values. Must be unambiguous at point of use. |
| **Planning Terms** (Idea, Epic, Story, Task) | Reference-only in `adm/gdl/glossary.md` | Consumed primarily by the orchestrator agent, which always loads `workflow.md` and can follow the reference. Not dispatch-critical for specialists. |
| **Qualifier Terms** (Non-trivial) | Reference-only in `adm/gdl/glossary.md` | Supplementary context. Agents use the term but do not dispatch on its exact definition. |

### Governing Principle

> DEDUPLICATE FACTS (prevent drift); KEEP INSTRUCTIONS explicit (ensure compliance).

- A term that governs agent behavior at the point where it appears is an **instruction** → inline.
- A term that provides supplementary context is a **fact** → single source in glossary, reference elsewhere.

### Consequences

- `adm/gdl/glossary.md` contains ONLY reference-safe terms (Planning Terms, Qualifier Terms).
- Gate Terms, Artifact Terms, and Verdict Terms MUST remain inline in `dev/protocols/workflow.md`.
- If a future dry-run reveals an agent failing to follow a glossary reference, the failing term must be inlined back immediately (fallback rule).
- New terms must be classified before placement. The classification criterion is: "Does an agent dispatch on this term's exact definition?" If yes → inline. If no → glossary.

### Rejected Alternative

**Full extraction of all terms into `glossary.md` with reference-only usage everywhere.**

Rejected because:
- Violates the Prompt-Context Design Rule: "Inline actionable constraints at point of use."
- Under the VS Code injection model, there is no mechanism to guarantee `glossary.md` is in the context window when a specialist agent processes a gate decision.
- Creates a compliance regression detectable only at runtime.
