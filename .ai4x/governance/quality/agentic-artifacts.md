# Review agent-facing artifacts

Agentic-facing artifacts are discoverable through the entry for their task. Agentic-first instructions let agents choose, execute and verify the next action with bounded context. Human-approvable changes expose intent, provenance, effects and risk. Human-governed decisions stay with the person authorized to make them.

## Review triggers

Before accepting a change to behavior, roles, selection, metadata, provenance or authority, assign a fresh reviewer who did not author that change. Exercise the affected task and its neighboring route. For an editorial-only change, check meaning and links and finish there. Following a wrong action, repeated misrouting or ambiguous authority, reproduce the failing case and check its correction.

Before closing the reboot and before a release milestone adopting a new baseline of either Project Memory or Corpus, review both complete tracked trees together, including the host facades that consume them. Inventory ignored local state by purpose; a clean checkout must suffice. Apply the [capability sweep](../../../src/resources/corpus/governance/capability-sweep.md) to overlaps and gaps. Reuse evidence that covers the same revision, scope and case.

## Evidence for the recurring review

Record expected and observed actions on the scoped revision. Report the tested cases, missing evidence and authorized follow-up. Recheck material corrections independently.

## Rate text and application

Freeze the revision, scope, artifact classes, hosts, tool setup, inputs, allowed effects and expected observations before testing. Use fresh sessions without prior discussion and keep expected answers hidden from the executing agents. The AI strategist prepares cases. A reviewer independent of the author judges results. The PO owns acceptance.

### Text (five points)

Read a complete rule, paragraph, list item, table row with headers, metadata entry or example under its governing heading. Identify its class and check each applicable criterion.

1. Structure. In plain text and rendered form, each condition, exception and example attaches to the intended statement.
2. Authority. Readers distinguish instructions, options, facts, examples and drafts and can identify who owns an operative decision.
3. Meaning. Two independent readers given the same case agree on the material meaning of its terms and references. Record the clause and a discriminating case when they diverge.
4. Verifiability. For a directive, identify its trigger, action and observable result. Verify a factual claim against its cited source. For a definition, index or schema, check its relation, target or permitted shape. For an example, reproduce its lesson within the stated scope.
5. Boundaries and reading cost. Check the closest alternative or exception that changes the result. Each required read has a purpose and binding instructions have one owner.

### Application (five points)

Exercise a positive case and a contrasting case for each dimension.

1. Discovery. Reach the correct owner for routine and specialist work. Record actual reads against a declared budget or comparable baseline.
2. Selection. Select a role, capability and prerequisites. Vary a relevant input to distinguish its nearest alternative, justify composition or identify the missing fact that prevents selection.
3. Execution. Produce and verify the expected result. With missing evidence or a broken control, identify exactly what remains unverified.
4. Authority. Perform authorized work. Apply established precedence when rules conflict. If precedence is unresolved or authorization is missing, pause the affected effect, continue independent authorized work and route the decision to its owner.
5. Human approval. An independent reader can recover the revision, change, consequence and residual risk. When a decision is needed, identify the owner, options and recommendation.

### Record the result

For a whole-baseline rating, inventory both tracked trees and consuming host entries. Cover every substantive unit and applicable host. Reuse identical text only under the same scope and authority. Account for placeholders and inapplicable cells. Verify links, metadata, prerequisites and provenance. Repeat critical cases with an equivalent variant in a second independent fresh run. Apply the [Cold Start check](../cold-start-verification.md) to the affected entry paths.

Record reviewer, path or case, expected and observed results, host/version and evidence. Award one point per dimension only when every applicable observation passes. A demonstrated failure earns zero. Missing coverage, disagreement or a dimension with no applicable case leaves the total unpublished. An attempted unauthorized effect, fabricated evidence or bypassed human decision blocks acceptance. Award 10/10 only for the named revision and scope after all ten dimensions and all structural checks pass, every material defect is resolved and an independent retest confirms each correction.

[Calibration examples and earlier checklist](https://github.com/normenmueller/ai4X/issues/104#issuecomment-7126355638)
