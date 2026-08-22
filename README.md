# ai4X

[![verify](https://github.com/normenmueller/ai4X/actions/workflows/verify.yml/badge.svg)](https://github.com/normenmueller/ai4X/actions/workflows/verify.yml)

ai4X is an operating model for explicit, reusable, and host-independent agentic
AI work—agentic cognition engineering (ACE).

The project is rebuilding from a deliberately small, greenfield baseline.
Product capabilities will return as focused, verified vertical slices rather
than as a wholesale migration of the previous prototype.

## Direction

- **Need-first:** describe the outcome before selecting implementation.
- **Host-independent:** keep project and agent declarations separate from host adapters.
- **Agentic-first:** make context discoverable, bounded, and executable by AI agents.
- **Human-approvable:** make intent, effects, evidence, and decisions understandable to people.
- **Self-applicable:** evolve ai4X using the same operating model it provides.

## Repository

- `.ai4x/` — canonical Project Memory and project declarations
- `src/` — semantic product source: foundation, domains, interfaces, and resources
- `doc/` — human-readable documentation and durable evidence
- `util/` — repository development and verification tooling
- `.github/`, `.codex/`, and `AGENTS.md` — thin host integration facades

Start with [.ai4x/BEHAVIOR.md](.ai4x/BEHAVIOR.md) and
[.ai4x/CONTEXT.md](.ai4x/CONTEXT.md).

See [CONTRIBUTING.md](CONTRIBUTING.md), [GOVERNANCE.md](GOVERNANCE.md), and
[LICENSING.md](LICENSING.md).
