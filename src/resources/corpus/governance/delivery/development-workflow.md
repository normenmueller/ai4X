# Deliver an implementation Story

Draft for review.

Use for a scoped implementation work item (Story). Identify the acceptance criteria, authorized effects, responsible owner and evidence required by the consuming project. Select expertise by task. Keep review independent where required.

| When | Action and evidence |
| --- | --- |
| Starting a Story | Read the owning Story and parent intent. Identify acceptance criteria, constraints, affected contracts, authority and required checks. Refine coarse criteria using [requirements](../quality/requirements.md). |
| Boundaries or invariants change | Compare designs using [architecture](../quality/architecture.md). |
| Requirements or design were refined | Critically [review](../quality/review.md) the changed evidence before implementation, including when only the requirements changed. |
| Model behavior, tools, prompts or agent capability selection change | Apply [AI strategy](../quality/ai-strategy.md). |
| A capability is drafted, revised or assessed | Compare it with local team needs, existing capabilities and the selected Corpus revision. For an empty Corpus, record the empty baseline and the first local example. Report coverage, gaps, overlap and semantic fit. Use the [capability admission rules](../capability-authoring-governance.md) for any proposed transfer. |
| Before implementing | Check [conformance](development-conformance.md) using the scoped requirements and any design, review, model or capability evidence. Resolve material contradictions first. |
| Implementing and testing | Follow [implementation](../quality/implementation.md), [engineering](../quality/engineering.md) and [testing](../quality/testing.md). For TypeScript files also apply [TypeScript quality](../quality/typescript.md). |
| Before presenting for acceptance | Obtain independent review of implementation and test evidence. Correct material findings, rerun the affected checks and return the changed work to review. Check conformance again. |

For command changes, make arguments, defaults and failure behavior explicit. Update parser tests and command guidance. For configuration changes, identify affected configuration sources, precedence and consumers. If the change creates runtime links, verify that each resolves to the target specified by the consuming project. For verification or delivery automation changes, exercise the current entry points and verify the required structure in a fresh checkout. For repository metadata changes, check the owning policy and authorized provider target.

Use the consuming project's branch, commit, review and integration conventions. Link the owning work item when one exists. Record criteria with the work item, implementation and tests with the change, and results with the reviewed revision. A passing check establishes technical readiness. Verify separate authority before publication, acceptance, merge or closure.
