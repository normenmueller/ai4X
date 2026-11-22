<p align="center">
  <img src="acc/brand/ai4x-logo.jpg" alt="ai4X" width="260">
</p>

<p align="center">
  <em>From human intent to fit-for-purpose Agentic Constellations.</em>
</p>

<p align="center">
  <a href="https://github.com/normenmueller/ai4X/actions/workflows/verify.yml"><img src="https://github.com/normenmueller/ai4X/actions/workflows/verify.yml/badge.svg" alt="verify"></a>
</p>

ai4X turns human intent into fit-for-purpose Agentic Constellations—coherently
curated and explicitly activated under human authority. It is a human-led
Need-to-Capability system for agentic cognition engineering (ACE).

ai4X helps teams turn information into insights they can explain and stand behind together.
A colleague should be able to retrace how a conclusion was reached, check the evidence and
understand why the team acted on it. [Why ai4X exists](doc/purpose.md)

The project is rebuilding from a deliberately small, greenfield baseline.
Product capabilities will return as focused, verified vertical slices rather
than as a wholesale migration of the previous prototype.

## ai4X Need-to-Capability Architecture

The ai4X Need-to-Capability Architecture is the functional target state for the
first ai4X release. It follows a human concern from a guided expert interview
through need confirmation and fit-for-purpose Capability scouting, the coherent
curation of selected Capabilities, a Cognitive Agent Team, and an Operating
Model comprising Collaboration, Work Management, and Governance Models,
deterministic persistence, and explicit runtime activation.

Its formal boundary is strongly and statically typed: total, typed Dhall
declarations become closed Haskell domain values whose invariants,
deterministic evidence, and projections are controlled by explicit types.

<p align="center">
  <a href="doc/system-design/need-to-capability/need-to-capability.png">
    <img src="doc/system-design/need-to-capability/need-to-capability.png" alt="ai4X Need-to-Capability functional architecture" width="760">
  </a>
</p>

<p align="center">
  <sub>Open the diagram for the full-size architecture view. Publication source: <a href="doc/system-design/need-to-capability/need-to-capability.tex">TikZ</a>.</sub>
</p>

## Direction

- **Need-first:** describe the outcome before selecting implementation.
- **Host-independent:** keep project and agent declarations separate from host adapters.
- **Agentic-first:** make context discoverable, bounded, and executable by AI agents.
- **Human-approvable:** make intent, effects, evidence, and decisions understandable to people.
- **Self-applicable:** evolve ai4X using the same Need-to-Capability discipline it provides.

## Repository

- `.ai4x/` — canonical Project Memory and project declarations
- `src/` — semantic product source: foundation, domains, interfaces, and resources
- [Documentation](doc/README.md) — portfolio, use cases and system design
- `acc/` — accompanying material, including shared brand assets
- `util/` — repository development and verification tooling
- `.github/`, `.codex/`, and `AGENTS.md` — thin host integration facades

Start with [.ai4x/BEHAVIOR.md](.ai4x/BEHAVIOR.md) and
[.ai4x/CONTEXT.md](.ai4x/CONTEXT.md).

See [CONTRIBUTING.md](CONTRIBUTING.md), [GOVERNANCE.md](GOVERNANCE.md), and
[LICENSING.md](LICENSING.md).
