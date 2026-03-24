![](<acc/img/ai4x_logo_variant_2_1.jpg>)

> Modular suite for reproducible agentic AI workflows.

[![verify](https://github.com/normenmueller/ai4x/actions/workflows/verify.yml/badge.svg)](https://github.com/normenmueller/ai4x/actions/workflows/verify.yml)

ai4X is a modular suite for reproducible agentic AI workflows. This repository is the integration, installation, and governance repository of that suite.

<details>
<summary>ai4X is not only a modular suite for reproducible agentic AI workflows. It is also a reference implementation of a strict <strong>agent-first development model</strong> and an <strong>agent-guided documentation model</strong> for human-facing onboarding and support.</summary>

ai4X applies a strict **agent-first development model**.

Consequences:

- Deterministic checks are handled programmatically through TypeScript tests, shell checks, and deterministic validation commands such as `verify` and `doctor`.
- Higher-order semantic review, judgment, proposal assessment, handover, and capability assessment are intentionally designed for execution with agentic AI actors.
- In this model, **developer** and **operator** roles are primarily modeled as agentic AI roles.
- Therefore:
  - `doc/usr/*` is the direct human-facing documentation surface.
  - `doc/agn/*` is the agent-facing onboarding and navigation surface.
  - `doc/arc/*` is human-readable architecture and system-reference documentation.
  - `adm/dev/*` is agent-facing central ai4X development governance for suite-context work.
  - `adm/ops/*` is agent-facing central ai4X operations governance for suite-context work.
- The modules remain domain-owning repositories, but when they are used or evolved within ai4X, the canonical governance is owned here in the root ai4X repository.
- For contribution and governance entry, use [`./CONTRIBUTING.md`](./CONTRIBUTING.md) or hand [`./doc/agn/maintainer-onboarding.md`](./doc/agn/maintainer-onboarding.md) to your agent.

ai4X is, in that sense, built by agentic AI agents for agentic AI agents.[^eyodf]

That development and documentation model is also why ai4X matters as more than a modular suite: it serves as a reference implementation for projects that want to apply the same approach in a governed and reproducible way.

In practice, that means:

- ai4X serves as a blueprint for projects that want to apply strict agent-first development in a governed and reproducible way.
- For new projects that want the same model in a minimal single-repo form, use [ai4x-tpl](https://github.com/normenmueller/ai4x-tpl), the ai4X-driven, minimal single-repo template for agent-first development and agent-guided documentation.
- ai4X separates governance, runtime orchestration, behavior curation, and capability source-of-truth layers into explicit module boundaries.
- ai4X distinguishes behavior, cognitive capabilities, and technical capabilities instead of collapsing them into one opaque prompt/tooling layer.
- ai4X supports need-driven agent curation through its **Demand-Fulfillment Assistant (DFA)** pattern; see [`./mod/kob/doc/usr/primer.md`](./mod/kob/doc/usr/primer.md).
- ai4X applies explicit contracts, semantic review protocols, and deterministic validation gates to capability and suite evolution.
- ai4X deliberately uses a small, minimally invasive tool stack.

</details>

# For Humans

Copy and paste this prompt to your LLM agent:

```text
Guide me through ai4X installation, first use, and suite orientation by following these sources in order:
1. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/doc/agn/user-onboarding.md
2. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/doc/usr/primer.md
3. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/INSTALL
4. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/utl/ai4x/README.md
Then explain the structure briefly, walk me through setup and first verification, and tell me the best next step for my goal.
```

# For Agents

Use this bootstrap prompt when entering ai4X from a local checkout or from GitHub:

```text
You are entering ai4X for governed work.
If you have a local checkout, use the local equivalents of these sources. Otherwise fetch them directly:
1. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/AGENTS.md
2. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/adm/dev/protocols/workflow.md
3. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/CONTRIBUTING.md
4. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/INSTALL
5. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/doc/agn/maintainer-onboarding.md
6. https://raw.githubusercontent.com/normenmueller/ai4x/trunk/doc/agn/source-map.md
Then summarize the suite structure, tell me which protocol applies to the current task, and do not infer workflow from repository layout alone.
```

# License

See [LICENSE](./LICENSE). © 2026 [nemron](https://github.com/normenmueller) ([#hgtt](doc/hgtt.md))

[^eyodf]: `#eyodf` = "eat your own dog food". ai4X applies its own agent-first development and operations model to itself.
