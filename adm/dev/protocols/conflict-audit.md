# Conflict Audit Protocol

Trigger example:
`Please run a conflict audit according to @adm/dev/protocols/conflict-audit.md.`

## Purpose

Determine whether real mutual exclusion, semantic overlap, or trigger collision exists in a capability portfolio and whether `conflicts` metadata is correct.

## Scope

This protocol applies to capability portfolios where exclusivity may matter semantically, especially `ccp`.

## Required Inputs

1. `AGENTS.md`
2. `adm/dev/protocols/workflow.md`
3. `adm/dev/contracts/capability-quality.md`
4. `adm/dev/contracts/capability-discoverability.md`
5. the relevant capability set and metadata under review

This audit is governance-valid only after the canonical bootstrap chain was followed explicitly:
`AGENTS.md` -> `adm/dev/protocols/workflow.md` -> this protocol.

## Procedure

1. Inspect the relevant capability set, triggers, selection surfaces, and current metadata.
2. For every new or materially changed capability in scope, identify the nearest semantic neighbors before deciding whether overlap is acceptable.
3. Check whether any pair expresses a true semantic mutual exclusion rather than mere overlap or stylistic tension.
4. Identify trigger neighbors and determine whether the trigger is distinct, acceptably complementary, or colliding.
5. Identify whether `do_not_use_when` and `distinguish_from` are sufficient to reject wrong composition without inventing false `conflicts`.
   - challenge empty values when material misselection or confusion risk still exists
   - challenge broad or crowded boundary lists when they appear to compensate for an unclear semantic split
6. Identify the primary semantic owner where overlap exists and determine whether overlap is only supportive/specialized or duplicates semantic ownership.
7. Treat `conflicts: []` as correct unless real exclusivity is demonstrated.
8. Never invent exclusivity for taxonomy neatness.
9. If a real conflict exists, verify that it is modeled symmetrically and justified clearly.

## Mandatory Output

Provide:

- audit scope
- nearest-neighbor comparison where relevant
- observed conflict candidates
- judgment per candidate (`real conflict|trigger collision|overlap only|no conflict`)
- discoverability boundary judgment where relevant
- boundary sufficiency judgment for `do_not_use_when` and `distinguish_from` where relevant
- trigger-neighbor judgment where relevant
- primary semantic owner judgment where overlap exists
- metadata consequence
- evidence basis

## Completion Rule

A conflict audit is complete only when it states whether the current `conflicts` model is correct, whether trigger collisions remain, why the nearest-neighbor boundaries are acceptable, whether boundary metadata is sufficient without being evasive or oversized, and why.
