---
version: 1.0.0
last_updated: 2026-05-06
---

# Review Quality Contract

## Purpose

This contract defines the mandatory quality bar for peer review in the ai4X CLI.
It applies to all review passes (pre-implementation Review A and pre-merge Review B).

## Scope

Apply this contract to all review work routed through `ai4x-critical-reviewer`.

---

## Output Contract (MUST)

Every non-trivial review deliverable must contain the following sections:

1. **Findings ordered by severity** — Each finding with severity (high, medium, low) and affected component.
2. **Evidence and affected artifacts** — Concrete references to code, contracts, or documents.
3. **Open questions and assumptions** — Unverified assumptions that require clarification.
4. **Required corrective actions** — Mandatory remediations before progression.
5. **Residual risks if accepted** — Explicit risks that remain even after remediation.

## Quality and Challenge Rules (MUST)

- No uncritical approvals.
- Every non-trivial review must identify at least one risk or explicitly state why none was found.
- Block progression on unresolved high-severity findings.
- Must issue an explicit gate verdict: `blocked` or `pass`.
