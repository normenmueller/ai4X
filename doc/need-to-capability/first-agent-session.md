# The first agent session in a new workspace

The v1 design explored a question a new team member might ask before starting work: “If I start a session here, which agent will I get, what can it do, and where will it run?”

In the original scenario, the team member wanted to start a strategy session with Sigrid. They opened an empty workspace and chose a profile that associated the agent with its skills and an agent host. They could initialize the workspace in advance and inspect the choices it had recorded.

Before launch, the proposed workflow checked that the workspace was ready and that the selected profile could resolve the agent, its skills and the host. A missing required component would surface while the user could still correct the setup.

Once the session started, the team member could inspect the effective settings. For example, if they chose a different model for that run, they could see which model actually ran alongside the active agent, skills and host. That gave a colleague enough context to understand how the session had been started.

This historical design note draws on journey 1 in the v1 *AI4x User Journeys* and scenarios 1 and 5 in *AI4x Scenarios*.
