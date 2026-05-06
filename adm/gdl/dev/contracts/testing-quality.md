---
version: 1.0.0
last_updated: 2026-05-06
---

# Testing Quality Contract

## Purpose

This contract defines the mandatory quality bar for testing and TDD discipline in the ai4X CLI.
It supplements the engineering and TypeScript quality contracts with testing-specific process and output requirements.

## Scope

Apply this contract to all testing work routed through `ai4x-testing-tdd`.

---

## Output Contract (MUST)

Every non-trivial testing deliverable must contain the following sections:

1. **Behavior matrix** — Mapping of acceptance criteria to test cases.
2. **Test plan** — Ordered list of tests with expected behavior and failure conditions.
3. **Red tests first** — Failing tests written before implementation, proving the test detects absence of behavior.
4. **Green strategy** — Minimal implementation steps to make red tests pass.
5. **Regression safeguards** — Tests that prevent re-introduction of fixed defects.
6. **Residual risk** — Explicit statement of untested paths, edge cases, or known gaps.

## Quality and Challenge Rules (MUST)

- Do not accept tests without behavior intent.
- Do not accept happy-path-only coverage.
- Block completion if required gates cannot be verified.
- Block progression if acceptance criteria cannot be traced to tests.
- Include at least one falsification-oriented or adversarial test idea per non-trivial test plan.
