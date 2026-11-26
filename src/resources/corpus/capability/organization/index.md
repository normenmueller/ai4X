# Organization capability index

Assign accountability, design an operating model or curate a team.

## Operating model

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `value-stream-organization-design` | [value-stream-organization-design.md](operating-model/value-stream-organization-design.md) | Design target organizations around end-to-end value flow instead of accidental internal boundaries. | Use when designing or reviewing organizational structures against end-to-end value flow. | `[]` | `[]` | `[function-extraction, function-deduplication, function-ownership-allocation]` | `[]` |
| `function-ownership-allocation` | [function-ownership-allocation.md](operating-model/function-ownership-allocation.md) | Allocate clear accountability for each materially relevant function without collapsing ownership into informal group responsibility. | Use when assigning accountability for materially relevant functions across teams, roles, or organizational units. | `[]` | `[]` | `[function-extraction]` | `[]` |
| `ai-center-of-excellence-design` | [ai-center-of-excellence-design.md](operating-model/ai-center-of-excellence-design.md) | Design an AI enablement model that scales standards, support, and governance without becoming a delivery bottleneck. | Use when an organization needs a reusable structure for AI enablement across teams or business units. | `[]` | `[]` | `[decision-gates, ai-operating-model-architecture, ai-adoption-roadmapping]` | `[]` |
| `ai-operating-model-architecture` | [ai-operating-model-architecture.md](operating-model/ai-operating-model-architecture.md) | Design an explicit AI operating model before scaling ownership, controls, or delivery expectations. | Use when an organization or multi-team initiative needs clear AI roles, lifecycle ownership, and control points. | `[]` | `[]` | `[decision-gates, architecture-decision-rigor]` | `[]` |

## Curation

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `agent-team-curation` | [agent-team-curation.md](curation/agent-team-curation.md) (draft) | Compose an agent or a team whose capabilities and working arrangements fit a confirmed need. | Use when the requester has confirmed why a change matters and what outcome is needed, and a proposal for an agent or team is wanted. | The user is clarifying the need or has only requested candidate discovery. | portfolio-prioritization: Portfolio prioritization ranks initiatives for investment. Agent and team curation selects capabilities and role assignments for a confirmed need.<br>function-ownership-allocation: Ownership allocation assigns a function. Curation also checks capability coverage and specifies how the proposed roles work together. | `[comparison-dimension-discipline, decision-gates]` | `[]` |
