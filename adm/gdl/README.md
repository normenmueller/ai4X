# adm/gdl: Governance, Development, Learning

This directory contains normative guidance documents for ai4X development, operations, and planning.

## Quick Navigation

| Section | Purpose | Key Documents |
|---------|---------|---|
| **dev/** | Development standards, code quality, workflow | `contracts/engineering-quality.md`, `contracts/typescript-quality.md`, `protocols/development-conformance.md`, `protocols/workflow.md` |
| **ops/** | Repository operations, automation, infrastructure | `github-repo-metadata.md` |
| **pln/** | Planning governance, backlog management, issue promotion | `protocols/workflow.md`, `protocols/board-policy.md`, `protocols/planning-conformance.md` |

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
│   ├── contracts/                            # Deliverable specifications (what to produce)
│   │   ├── engineering-quality.md            # Cross-cutting quality gates
│   │   ├── typescript-quality.md             # TypeScript-specific rules
│   │   ├── implementation-quality.md         # Implementation deliverables
│   │   ├── requirements-quality.md           # Requirements deliverables
│   │   ├── architecture-quality.md           # Architecture deliverables
│   │   ├── testing-quality.md               # Testing deliverables
│   │   ├── review-quality.md                # Review deliverables
│   │   └── ai-strategy-quality.md           # AI strategy deliverables
│   └── protocols/                            # Processes and enforcement (how to work)
│       ├── workflow.md                      # Trunk-based dev, CI/CD, PR gates
│       ├── development-conformance.md       # Session conformance gate
│       └── development-conformance-template.md # One-page session template
├── ops/
│   └── github-repo-metadata.md              # GitHub automation, labels, releases
├── pln/
│   └── protocols/                            # Processes and enforcement (how to plan)
│       ├── workflow.md                      # PBL → Issues → PRs → merge
│       ├── board-policy.md                  # Board transitions, labels, ownership
│       └── planning-conformance.md          # Planning conformance gate
├── index.yaml                                # Structured metadata & reading order
└── README.md                                 # This file
```

## Key Principles

- **Contracts define deliverables**: What each role must produce (quality standards, output specifications).
- **Protocols define processes**: How work is executed and enforced (workflows, conformance gates, board transitions).
- **Explicitness**: No hidden defaults in config, CLI args, or workflows.
- **Clarity**: Documents are concise, structured, and version-controlled.
- **Scalability**: New governance documents follow the same pattern.
- **AI-Friendly**: Structured metadata (YAML) alongside human-readable docs.

## Updates & Maintenance

Governance documents are updated as policies evolve. See [../CHANGELOG](../CHANGELOG) for audit trail.
