# AI Architecture Capability Catalog

This index helps compose AI-architecture-focused agent bundles in `kob`.

## Enterprise

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `ai-operating-model-architecture` | `enterprise/ai-operating-model-architecture.md` | AI operating-model architecture across roles, controls, and lifecycle. | `[decision-gates, togaf-adm-discipline, architecture-decision-rigor]` | `[]` |

## Solution

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `agentic-solution-architecture` | `solution/agentic-solution-architecture.md` | Structural decomposition of agentic solutions into bounded runtime concerns. | `[decision-gates, architecture-decision-rigor]` | `[]` |
| `grounding-and-context-architecture` | `solution/grounding-and-context-architecture.md` | Architecture for grounding, retrieval, and context boundaries. | `[decision-gates, architecture-decision-rigor]` | `[]` |
| `model-selection-and-boundary-fit` | `solution/model-selection-and-boundary-fit.md` | Model-boundary selection aligned to task, control, and fallback needs. | `[decision-gates, strategic-fit]` | `[]` |

## Modeling

_No capabilities yet._

## Governance

| ID | File | Purpose | Requires | Conflicts |
| --- | --- | --- | --- | --- |
| `ai-evaluation-and-control-architecture` | `governance/ai-evaluation-and-control-architecture.md` | Evaluation, oversight, and runtime control architecture for AI systems. | `[decision-gates, architecture-decision-rigor, architecture-compliance-review]` | `[]` |
