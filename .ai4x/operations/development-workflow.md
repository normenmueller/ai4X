# Deliver an implementation Story

Start with the exact work contract and [work authority](../governance/work-authority.md). Use this workflow for implementation Stories. For direct requests, take only the checks relevant to the authorized change. Select expertise through [team routing](../TEAM.md). One person or agent may perform several tasks where independence is not required.

| When | Action and evidence |
| --- | --- |
| Starting a Story | Read the owning Story and parent intent. Identify acceptance criteria, constraints, affected contracts, authority and required checks. Refine coarse criteria using [requirements](../governance/quality/requirements.md). |
| Boundaries or invariants change | Compare designs using [architecture](../governance/quality/architecture.md). |
| Requirements or design were refined | Critically [review](../governance/quality/review.md) the changed evidence before implementation, including when only the requirements changed. |
| Model behavior, tools, prompts or agent capability selection change | Apply [AI strategy](../governance/quality/ai-strategy.md). |
| A capability is drafted, revised or assessed | Compare it with local team needs, existing capabilities and the selected Corpus revision. For an empty Corpus, record the empty baseline and the first local example. Report coverage, gaps, overlap and semantic fit. Use the [promotion and adoption rules](../context/architecture.md) for any proposed transfer. |
| Before implementing | Check [conformance](development-conformance.md) using the scoped requirements and any design, review, model or capability evidence. Resolve material contradictions first. |
| Implementing and testing | Follow [implementation](../governance/quality/implementation.md), [engineering](../governance/quality/engineering.md) and [testing](../governance/quality/testing.md). For TypeScript files also apply [TypeScript quality](../governance/quality/typescript.md). |
| Before presenting for acceptance | Obtain independent review of implementation and test evidence. Correct material findings, rerun the affected checks and return the changed work to review. Check conformance again. |

For command changes, make arguments, defaults and failure behavior explicit. Update parser tests and command guidance. For configuration changes, check global and project contracts. Runtime links must resolve to the intended project-local generated artifacts. For verification or GitHub automation changes, exercise the current entry points and verify the required structure in a fresh checkout. For repository metadata changes, check the owning policy and authorized provider target.

Use a short-lived topic branch, concise behavior-oriented English commit messages and the delivery rules in [BEHAVIOR.md](../BEHAVIOR.md). Link the owning Issue when present. Use a closing keyword only when closure is intended and authorized. Keep durable evidence with its owner: criteria on the Issue, implementation and tests in the branch, results in verification output, and decisions and review evidence in the PR or referenced records. A review pass establishes technical readiness. The PO decides acceptance and merge.
