# Review a change

Draft for review.

Review refined requirements or architecture before implementation when the workflow calls for it. Before merge, an independent reviewer checks the current implementation, tests and acceptance contract. Name the revision, affected components and evidence inspected.

Rate each finding by its impact and report findings in severity order (high, medium, low). For each, identify the affected artifact, evidence, consequence and corrective action. State open questions, unverified assumptions and residual risk. If no findings or risks were identified, explain what was exercised and the limits of the review.

Return `blocked` while a material finding remains open, including any high-severity finding. Regardless of severity, also return `blocked` if a mandatory acceptance criterion due at this review is unmet or required evidence is missing. Identify the criterion or evidence that blocks progression. Complete the checks in the agreed scope that the available evidence permits. If missing evidence prevents a check, name the evidence and the affected check. Once the scope is accounted for and the verdict is supported, report the verdict and end the search for further findings. Recheck corrections and affected tests on the updated revision. Return `pass` when the criteria due at this review are met, the required evidence supports them and all material findings are resolved. Check the consuming project’s authorization before taking any subsequent action.
