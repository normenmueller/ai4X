# Capability Judgment Protocol

Trigger example:
`Please judge <capability> according to @adm/dev/contracts/capability-quality.md and @adm/dev/protocols/capability-judgment.md.`

## Purpose

Provide a reproducible expert judgment for capability quality, placement, and required refactoring action.

## Required Inputs

1. `AGENTS.md`
2. `adm/dev/protocols/workflow.md`
3. `adm/dev/contracts/capability-quality.md`
4. `adm/dev/contracts/capability-discoverability.md`
5. the capability text and metadata under review
6. neighboring capabilities and relevant compose/consumer context if composition is affected

This judgment is governance-valid only after the canonical bootstrap chain was followed explicitly:
`AGENTS.md` -> `adm/dev/protocols/workflow.md` -> this protocol.

## Procedure

1. Capture the current purpose of the capability in one sentence.
2. Judge the capability against all mandatory quality criteria:
   - clarity
   - strictness
   - composability
   - agentic suitability
   - semantic purity
   - discoverability
3. Inspect the canonical selection surface:
   - `Purpose`
   - `Trigger`
   - `do_not_use_when`
   - `requires`
   - `conflicts`
   - `distinguish_from`
4. Judge clause quality for `Purpose`, `Trigger`, `Fallback`, and `Minimal Output Contract`:
   - materially usable, not only present
   - explicit enough for runtime contribution and provisional handling
   - free of placeholder or generic boilerplate wording
   - semantic `Trigger` wording rather than slash commands, UI actions, client commands, or runtime-specific invocation syntax
5. Determine whether the capability can be selected and rejected correctly from that surface without hidden assumptions.
   - if `do_not_use_when` or `distinguish_from` is empty, judge whether that emptiness is actually justified
   - if those fields are broad or crowded, judge whether they reveal an unclear semantic boundary rather than healthy discoverability
6. For every new or materially changed capability, identify the nearest semantic neighbors and explain why the candidate is not only a renamed, repackaged, or artifact-shaped restatement of an existing core.
7. Identify the primary trigger and compare it to neighboring capabilities to determine whether the trigger is distinct, acceptably complementary, or colliding.
8. Inspect terminology and semantic boundary consistency against neighboring capabilities:
   - same semantic core is not silently renamed
   - same term is not reused for different primary roles without an explicit boundary
9. Identify the primary semantic owner of the relevant semantic core and determine whether ownership is duplicated across neighboring capabilities.
10. Make an explicit placement decision:
   - `ccp`
   - `tcp`
   - governance
   - split
11. Make an explicit action decision:
   - `keep`
   - `sharpen`
   - `split`
   - `move`
   - `drop`
12. Record the evidence basis.
13. Record the concrete follow-up needed.

## Mandatory Output

For each judged capability, provide:

- purpose
- discoverability/applicability judgment
- boundary sufficiency judgment for `do_not_use_when` and `distinguish_from`
- criterion-by-criterion judgment
- clause-quality judgment
- semantic-trigger purity judgment
- nearest-neighbor comparison
- trigger-neighbor judgment
- terminology/boundary consistency judgment
- primary semantic owner judgment
- placement decision
- action decision
- evidence basis
- follow-up

## Completion Rule

A capability judgment is incomplete unless all six criteria, the discoverability/applicability judgment, the boundary sufficiency judgment, the clause-quality judgment, the semantic-trigger purity judgment, the nearest-neighbor comparison, the trigger-neighbor judgment, the terminology/boundary consistency judgment, the primary semantic owner judgment, and the explicit placement decision are documented.
