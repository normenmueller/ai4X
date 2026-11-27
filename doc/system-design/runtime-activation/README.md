# Runtime activation

How does a project start an Agentic Constellation in a particular agent host?

Two configuration examples from the design scenario show the proposed division of responsibility. The [global configuration](global-config.yaml) declares the available hosts, their launch commands and the named runtimes. The [project configuration](project-config.yaml) selects `satya`, the runtime associated with VS Code and Copilot.

In this document, *host* means the environment that runs the agent, such as Codex CLI or VS Code with Copilot. The [alternative project configuration](client-config.example.yaml) calls the same environments `clients` and selects `altman` (Codex CLI) as its default.

## Host facades

At session start, Codex CLI enters through [AGENTS.md](../../../AGENTS.md) and Copilot CLI through [copilot-instructions.md](../../../.github/copilot-instructions.md). Both route to the same [project behavior](../../../.ai4x/BEHAVIOR.md). The [team assignment](../../../.ai4x/TEAM.md) determines which role the agent assumes.

A project may also expose a repeatable task, such as an independent review, through a shared `.agents/skills/<task>/SKILL.md`. Both [Codex CLI](https://developers.openai.com/codex/skills/) and [Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) discover skills there. Such a stub supplies the skill name, its trigger and the path to the owning project instructions. Selecting it uses the authority of the current assignment.

For the future Haskell generator, the shared path is a candidate for task discovery in both hosts. Decide whether to generate it when a concrete project task needs that entry point. Host-specific discovery formats belong in the adapters. The project-local roles and capabilities remain the source for every facade.
