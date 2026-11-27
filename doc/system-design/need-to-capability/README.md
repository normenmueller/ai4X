# Need to Capability

Suppose you ask for a team to review a set of pitches. What decision should that review help you make? During scouting, you might discover that you need to decide which pitches deserve a second look and explain your choices against the same criteria. Once you confirm that outcome and how you’ll judge success, ai4X records it as the project intent.

That intent guides curation. In this example, ai4X might propose one agent to coordinate the review and specialists to assess each pitch against the agreed criteria. The proposal shows which cognitive capabilities each role needs, how findings reach you and which decisions are yours. The pattern of roles and handoffs is the team’s *collaboration topology*. Different agents can fill those roles. Once you accept the proposal, its versioned declaration can be used across agent hosts.

The [architecture poster](need-to-capability.png) and its [TikZ source](need-to-capability.tex) show the current target architecture. The [user journey](user-journey.md) follows a user through scouting, curation and activation. It also explores direct access to an expert through `ask`. Commands and paths in the journey describe the proposed experience.

The [design scenario](design-scenario.md) asks how one project would use both VS Code with Copilot and Codex CLI. Follow the [need specification](need-specification/README.md) for the inputs to curation and [runtime activation](../runtime-activation/README.md) for the choice of host.

The [use cases](../../use-cases/README.md) follow the people who use these capabilities in their work.
