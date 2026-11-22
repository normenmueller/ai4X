# Runtime activation

How does a project start an Agentic Constellation in a particular agent host?

Two configuration examples from the design scenario show the proposed division of responsibility. The [global configuration](global-config.yaml) declares the available hosts, their launch commands and the named runtimes. The [project configuration](project-config.yaml) selects `satya`, the runtime associated with VS Code and Copilot. Both files preserve the historical proposal.

In this document, *host* means the environment that runs the agent, such as Codex CLI or VS Code with Copilot. The [alternative project configuration](client-config.example.yaml) calls the same environments `clients` and selects `altman` (Codex CLI) as its default. Its original keys are preserved so the two proposals can be compared.
