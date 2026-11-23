# Review a change

Review refined requirements or architecture before implementation when the workflow calls for it. Before merge, an independent reviewer checks the current implementation, tests and acceptance contract. Name the revision, affected components and evidence inspected.

Report findings in severity order (high, medium, low). For each, identify the affected artifact, evidence, consequence and corrective action. State open questions, unverified assumptions and residual risk. If no findings or risks were identified, explain what was exercised and the limits of the review.

Return `blocked` for an unresolved material finding, including any high-severity finding. Recheck corrections and affected tests on the updated revision. Return `pass` when required corrections are resolved. Apply [work authority](../work-authority.md) before any subsequent action.
