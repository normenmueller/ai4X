# Agentic-Optimized Validation Surface Architecture

## Context

The ai4x system has a single validation concern (corpus health checks) consumed by three architecturally different clients:

1. **Human/PO**: Interactive terminal session — needs readable diagnostics, colors, summaries.
2. **Agent** (`ai4x-capability-governance`): Programmatic consumer — needs structured, parseable responses to make portfolio decisions.
3. **CI/Make**: Batch automation — needs exit codes and machine-readable logs.

Today's design routes all three through the CLI surface (`ai4x doctor`), which produces human-formatted text output. Agents must parse unstructured text — a fragile, prompt-dependent pattern that violates agentic AI design principles.

## Problem Statement

A CLI-only validation surface forces agents into a suboptimal interaction pattern:

- **Parsing fragility**: Agents must interpret human-formatted text output. Any formatting change (colors, spacing, wording) can break agent comprehension.
- **Context loss**: CLI output is optimized for human scanning, not for agent decision-making. Structured relationships between checks, affected files, and failure reasons are flattened into prose.
- **Host coupling**: The agent must have terminal access (a tool capability). Not every Agent Host guarantees this. An agentic system should not depend on infrastructure that may not be universally available.
- **Error granularity**: Exit code 0/1 collapses all failure information into a single bit. Agents need per-check, per-file, per-rule granularity to take targeted remediation actions.
- **Round-trip overhead**: Agent must invoke CLI → read output → parse → decide → possibly re-invoke. A structured API enables single-call decision loops.

## Vision

```
┌─────────────────────────────────────────────────────┐
│  Validation Logic (TypeScript, pure functions)       │
│  cli/src/lib/doctor/checks/*.ts                     │
│                                                     │
│  validate(corpusRoot): DiagnosticResult[]           │
│  (stateless, deterministic, host-independent)       │
└───────────┬──────────────┬──────────────┬───────────┘
            │              │              │
     ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
     │ CLI Surface │ │MCP Tool │ │ CI Surface  │
     │ ai4x doctor │ │validate │ │ make test   │
     │             │ │corpus   │ │             │
     │ Human-      │ │         │ │ Exit codes  │
     │ readable    │ │Struct.  │ │ + logs      │
     │ output      │ │JSON     │ │             │
     └──────┬──────┘ └────┬────┘ └──────┬──────┘
            │              │              │
            ▼              ▼              ▼
        Human/PO        Agent          CI/Make
```

Three surfaces, ONE implementation. Each surface is optimized for its consumer:

### CLI Surface (Human)
- Colored, grouped output with severity indicators
- Summary line ("3 checks passed, 1 failed, 2 warnings")
- File paths as clickable links (terminal-aware)
- Exit code for script chaining

### MCP Tool Surface (Agent)
- Structured JSON response with typed schema
- Per-check status, per-file diagnostics, per-rule explanations
- Machine-actionable remediation hints
- No parsing required — agent receives native data structures

Example response:
```json
{
  "status": "fail",
  "summary": { "pass": 4, "fail": 1, "warn": 0 },
  "checks": [
    {
      "name": "meta",
      "status": "pass",
      "filesChecked": 47,
      "diagnostics": []
    },
    {
      "name": "shape",
      "status": "fail",
      "filesChecked": 47,
      "diagnostics": [
        {
          "file": "crp/cap/ai/consulting/foo.md",
          "severity": "error",
          "rule": "missing-heading",
          "message": "Required heading '## Fallback' not found",
          "remediation": "Add a '## Fallback' section after '## Rules (MUST)'"
        }
      ]
    }
  ]
}
```

### CI Surface (Make/GitHub Actions)
- Non-zero exit code on failure
- SARIF or TAP output format for CI integration
- Deterministic output (no timestamps, no colors)

## Design Decisions Required

1. **MCP Server architecture**: Does ai4x expose its own MCP server, or does validation become a tool in an existing server?
2. **Tool schema design**: What parameters does the `validate-corpus` tool accept? (scope filters, severity thresholds, check selection)
3. **Response contract**: Define the DiagnosticResult schema as a shared type used by all three surfaces.
4. **Hosting model**: MCP server as standalone process, or embedded in the ai4x CLI process?
5. **Discovery**: How do agents discover the validation tool? (MCP tool listing, agent instructions, or both)

## Architectural Invariants

- Validation logic is host-independent and surface-independent.
- Every check is a pure function: `(corpusRoot: string, options?: CheckOptions) => DiagnosticResult[]`.
- No surface may access validation logic except through the shared check interface.
- The MCP tool response schema is versioned and backward-compatible.
- Agents MUST NOT need to parse human-readable text for programmatic decisions.

## Rejected Alternative

**Skill-based approach**: Teach the agent via a Skill document how to invoke `ai4x doctor` in terminal and parse the output. Rejected because:
- It wraps a suboptimal interface instead of providing a proper one.
- It couples the agent to terminal availability.
- It makes the agent responsible for text parsing — a fragile, non-deterministic operation.
- It inverts the responsibility: the system should serve the agent, not the agent adapt to the system.

**Terminal-only approach** (current architect recommendation): All consumers use `ai4x doctor`. Rejected because:
- Optimized for one consumer (human) at the expense of others.
- Forces agents into parsing patterns that degrade with output format changes.
- Violates the principle that agentic systems should have native, structured interfaces.

## Impact Assessment

- **Scope**: Affects `cli/src/lib/doctor/` architecture, introduces MCP server concept, changes how agents interact with validation.
- **Dependencies**: Requires MCP protocol understanding, tool schema design, response format standardization.
- **Risk**: Over-engineering if agent interaction with doctor is rare. Mitigation: Start with CLI + structured JSON output flag (`ai4x doctor --format json`), evolve to MCP tool when agent usage patterns are proven.
- **Phasing**: Can be delivered incrementally:
  1. First: `ai4x doctor` with `--format json` flag (structured output without MCP)
  2. Then: MCP tool that calls the same logic and returns the JSON natively
  3. Finally: Remove terminal dependency from governance agent instructions

## Relationship to Existing Work

- **S4 (#41)**: Implements first doctor check (meta validation) — should already produce `DiagnosticResult[]` internally.
- **Doctor scaffold migration stories**: Port checks to TypeScript with the pure-function interface.
- **PBL ai4x-doctor-canonical-validator**: Describes doctor as canonical interface but assumes CLI-only surface.

## Open Questions

- Do we need MCP immediately, or is `--format json` a sufficient interim step for agent consumption?
- Should the MCP server be a separate package or part of the ai4x CLI binary?
- What other ai4x functionality (beyond validation) might benefit from MCP tool exposure?
