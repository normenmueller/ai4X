# AI Architecture Capability Catalog

Open a capability to check its trigger, rules and expected result. The [AI catalog](../index.md) also lists exclusions and neighboring capabilities.

## Enterprise

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `ai-operating-model-architecture` | [ai-operating-model-architecture.md](enterprise/ai-operating-model-architecture.md) | AI operating-model architecture across roles, controls, and lifecycle. | `[decision-gates, togaf-adm-discipline, architecture-decision-rigor]` | `[]` |

## Solution

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `agentic-solution-architecture` | [agentic-solution-architecture.md](solution/agentic-solution-architecture.md) | Structural decomposition of agentic solutions into bounded runtime concerns. | `[decision-gates, architecture-decision-rigor]` | `[]` |
| `grounding-and-context-architecture` | [grounding-and-context-architecture.md](solution/grounding-and-context-architecture.md) | Architecture for grounding, retrieval, and context boundaries. | `[decision-gates, architecture-decision-rigor]` | `[]` |
| `model-selection-and-boundary-fit` | [model-selection-and-boundary-fit.md](solution/model-selection-and-boundary-fit.md) | Model-boundary selection aligned to task, control, and fallback needs. | `[decision-gates, strategic-fit]` | `[]` |

## Modeling

_No capabilities yet._

## Governance

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `ai-evaluation-and-control-architecture` | [ai-evaluation-and-control-architecture.md](governance/ai-evaluation-and-control-architecture.md) | Evaluation, oversight, and runtime control architecture for AI systems. | `[decision-gates, architecture-decision-rigor, architecture-compliance-review]` | `[]` |
