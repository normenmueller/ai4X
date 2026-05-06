# adm/gdl: Governance, Development, Learning

This directory contains normative guidance documents for ai4X development, operations, and planning.

## Quick Navigation

| Section | Purpose | Key Documents |
|---------|---------|---|
| **dev/** | Development standards, code quality, workflow | `contracts/engineering-quality.md`, `contracts/typescript-quality.md`, `protocols/development-conformance.md`, `protocols/development-conformance-template.md`, `protocols/workflow.md` |
| **ops/** | Repository operations, automation, infrastructure | `github-repo-metadata.md` |
| **pln/** | Planning governance, backlog management, issue promotion | `protocols/workflow.md`, `protocols/planning-conformance.md` |
| **shr/** | Cross-cutting governance (planning + development) | `protocols/board-policy.md` |
| **glossary.md** | Canonical term definitions (Planning Terms, Qualifier Terms) | `glossary.md` |

## Reading Guide

**All readers start here:**
1. [../.github/agents/ai4x.agent.md](../.github/agents/ai4x.agent.md) — Canonical Agent Definition (product scope, CLI model, explicitness rule).
2. [index.yaml](index.yaml) — Task routing and document dependency graph (AI-optimized).

**By task:**

See [index.yaml](index.yaml) `tasks` section for pre-resolved reading lists per activity (feature implementation, architecture, testing, planning, etc.).

**Dependency graph** (for onboarding or tooling):
See [index.yaml](index.yaml) `library` section — each entry declares `depends_on` for topological ordering.

## Document Status

All documents in this directory are **normative** (binding governance). Deviations require decision logged in [../CHANGELOG](../CHANGELOG).

## Key Principles

- **Contracts define deliverables**: What each role must produce (quality standards, output specifications).
- **Protocols define processes**: How work is executed and enforced (workflows, conformance gates, board transitions).
- **Explicitness**: No hidden defaults in config, CLI args, or workflows.
- **Clarity**: Documents are concise, structured, and version-controlled.
- **Scalability**: New governance documents follow the same pattern.
- **AI-Friendly**: Structured metadata (YAML) alongside human-readable docs.

## Updates & Maintenance

Governance documents are updated as policies evolve. See [../CHANGELOG](../CHANGELOG) for audit trail.
