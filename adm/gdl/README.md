# adm/gdl: Governance, Development, Learning

This directory contains planning governance, glossary, and the governance document index for ai4X.

Development contracts and protocols have moved to `crp/gov/` (quality contracts in `crp/gov/qlt/`, process protocols in `crp/gov/prc/`).

## Quick Navigation

| Document | Purpose |
|----------|---------|
| **index.yaml** | Task routing and document dependency graph (AI-optimized, repo-root-relative paths) |
| **glossary.md** | Canonical term definitions (Planning Terms, Qualifier Terms, Architecture Terms) |
| **planning-workflow.md** | Planning governance, backlog management, issue promotion |
| **planning-conformance.md** | Planning conformance checks |
| **board-policy.md** | Cross-cutting board transition governance |

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
