# adm/gdl: Governance, Development, Learning

This directory contains normative guidance documents for ai4X development, operations, and planning.

## Quick Navigation

| Section | Purpose | Key Documents |
|---------|---------|---|
| **dev/** | Development standards, code quality, workflow | `contracts/engineering-quality.md`, `contracts/typescript-quality.md`, `contracts/agent-conformance.md`, `protocols/workflow.md` |
| **ops/** | Repository operations, automation, infrastructure | `github-repo-metadata.md` |
| **pln/** | Planning governance, backlog management, issue promotion | `protocols/workflow.md` |

## Reading Guide

**All readers start here:**
1. [../.github/agents/ai4x.agent.md](../.github/agents/ai4x.agent.md) — Canonical Agent Definition (product scope, CLI model, explicitness rule).
2. [index.yaml](index.yaml) — Structured metadata and dependencies (AI-optimized).

**By role:**

See [index.yaml](index.yaml) for task-specific reading paths (feature implementation, planning, operations, onboarding).

**Full reading order** (for new contributors or agents):
See [index.yaml](index.yaml) for the canonical sequence.

## Document Status

All documents in this directory are **normative** (binding governance). Deviations require decision logged in [../CHANGELOG](../CHANGELOG).

## File Structure

```
adm/gdl/
├── dev/
│   ├── contracts/
│   │   ├── engineering-quality.md    # Quality gates, testing, review
│   │   ├── typescript-quality.md     # TypeScript strict mode, linting
│   │   ├── agent-conformance.md      # Session conformance and gate discipline
│   │   └── agent-conformance-template.md # One-page session template
│   └── protocols/
│       └── workflow.md               # Trunk-based dev, CI/CD, PR gates
├── ops/
│   └── github-repo-metadata.md       # GitHub automation, labels, releases
├── pln/
│   └── protocols/
│       └── workflow.md               # PBL → Issues → PRs → merge
├── index.yaml                        # Structured metadata & reading order (AI-optimized)
└── README.md                         # This file
```

## Key Principles

- **Explicitness**: No hidden defaults in config, CLI args, or workflows.
- **Clarity**: Documents are concise, structured, and version-controlled.
- **Scalability**: New governance documents follow the same pattern.
- **AI-Friendly**: Structured metadata (YAML) alongside human-readable docs.

## Updates & Maintenance

Governance documents are updated as policies evolve. See [../CHANGELOG](../CHANGELOG) for audit trail.
